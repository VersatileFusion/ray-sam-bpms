const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const moment = require("jalali-moment");
const path = require("path");

// Load environment variables FIRST before any other imports
dotenv.config({ path: './atlas.envv' });
// Also try loading from .env if atlas.envv doesn't exist
dotenv.config();

// Import models
const Request = require("./models/Request");
const RequestHistory = require("./models/RequestHistory");
const User = require("./models/User");
const Notification = require("./models/Notification");
const AuditLog = require("./models/AuditLog");
const { sendSMSToAllUsers } = require("./sms");

// Import middleware
const { apiLimiter, loginLimiter } = require("./middleware/rateLimiter");
const upload = require("./middleware/upload");

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for Render (required for sessions with reverse proxy)
app.set('trust proxy', 1);

// Debug: Check environment variables
console.log('Environment check:');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());

// Logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:5000", // Vite dev server
        "https://ray-sam-bpms.onrender.com",
        "https://ray-sam-bpms.onrender.com/",
        "https://ray-sam-bpms.onrender.com/login.html",
        "https://ray-sam-bpms.onrender.com/index.html",
        "https://ray-sam.onrender.com",
        "https://ray-sam.onrender.com/"
      ];
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(null, true); // Allow all origins for now
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
// Use in-memory session store for now
// MongoDB session store causes issues in development
let sessionStore = undefined;
console.log('Using in-memory session store');

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: sessionStore || undefined,
    cookie: {
      secure: false, // Use false for development
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax',
      httpOnly: true
    },
  })
);

console.log('Session middleware configured. Store: In-Memory');

// Request logging middleware to debug sessions
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - Session ID: ${req.sessionID} - Has User: ${!!req.session.user}`);
  next();
});

// Database connection check middleware
const checkDatabase = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      message: "Database connection not available",
      error: "DATABASE_UNAVAILABLE"
    });
  }
  next();
};

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ message: "Authentication required" });
  }
};

// User authentication functions
async function loginUser(username, password) {
  try {
    const user = await User.findOne({ username, isActive: true });
    if (!user) {
      throw new Error("Invalid username or password");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error("Invalid username or password");
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return {
      _id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
    };
  } catch (error) {
    throw error;
  }
}

async function createUser(userData) {
  try {
    const { username, password, name, role = "user" } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new Error("Username already exists");
    }

    const user = new User({
      username,
      password,
      name,
      role,
    });

    await user.save();
    return {
      _id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
    };
  } catch (error) {
    throw error;
  }
}

async function getAllUsers() {
  try {
    const users = await User.find({}, { password: 0 });
    return users;
  } catch (error) {
    throw error;
  }
}

// Initialize default users
async function initializeDefaultUsers() {
  try {
    // Check if users already exist
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      console.log("⚠️  No users found in database!");
      console.log("📋 Please run the seed script to initialize users:");
      console.log("   npm run seed");
      console.log("   OR");
      console.log("   node seed-users.js");
    } else {
      console.log(`✅ Database initialized with ${userCount} users`);
    }
  } catch (error) {
    console.error("Error checking users:", error);
  }
}

// Health check endpoint
app.get("/api/health", async (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  let userCount = 0;
  
  try {
    userCount = await User.countDocuments();
  } catch (error) {
    console.error('Error counting users:', error);
  }
  
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb_uri_exists: !!process.env.MONGODB_URI,
    mongodb_connected: dbConnected,
    mongodb_state: mongoose.connection.readyState,
    user_count: userCount
  });
});

// Serve static files
app.use(express.static("public"));
app.use('/uploads', express.static("uploads"));

// MongoDB connection and initialize users
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI environment variable is not set!");
      console.log("Starting server without database connection...");
    } else {
      await mongoose.connect(process.env.MONGODB_URI, {
        dbName: 'ray-sam'
      });
      console.log("MongoDB connected to database 'ray-sam'");
      
      // Initialize default users
      await initializeDefaultUsers();
      console.log("Default users initialized");
      
      // Initialize scheduled reports scheduler
      const { initializeScheduler } = require('./services/schedulerService');
      initializeScheduler();
      console.log("Scheduled reports scheduler initialized");
    }
    
    // Initialize email service
    const { initEmailService } = require('./utils/emailService');
    initEmailService();
    
    // Create HTTP server for Socket.io
    const httpServer = require('http').createServer(app);
    
    // Initialize Socket.io
    const { initializeSocket } = require('./socket/socketHandler');
    const io = initializeSocket(httpServer);
    
    // Make io available globally
    app.set('io', io);
    
    // Start the server
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`MongoDB URI exists: ${!!process.env.MONGODB_URI}`);
      console.log(`Socket.io initialized`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    console.log("Starting server without database connection...");
    
    // Initialize email service even if DB fails
    const { initEmailService } = require('./utils/emailService');
    initEmailService();
    
    // Create HTTP server for Socket.io
    const httpServer = require('http').createServer(app);
    const { initializeSocket } = require('./socket/socketHandler');
    initializeSocket(httpServer);
    
    // Start the server even if MongoDB fails
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (without database)`);
    });
  }
}

// Authentication routes
app.post("/api/auth/login", loginLimiter, async (req, res) => {
  try {
    console.log('Login attempt:', { username: req.body.username, hasPassword: !!req.body.password });
    console.log('Database connected:', mongoose.connection.readyState === 1);
    
    const { username, password } = req.body;
    
    if (!username || !password) {
      console.log('Login failed: Missing username or password');
      return res.status(400).json({ 
        success: false, 
        message: "Username and password are required" 
      });
    }
    
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.error('Login failed: Database not connected');
      return res.status(503).json({ 
        success: false, 
        message: "Database connection unavailable. Please try again later." 
      });
    }
    
    const user = await loginUser(username, password);
    
    // Save user to session
    req.session.user = user;
    
    console.log('Login successful for user:', user.name);
    console.log('Session ID:', req.sessionID);

    res.json({ success: true, user });
  } catch (error) {
    console.error('Login error:', error.message);
    console.error('Full error:', error);
    res.status(401).json({ success: false, message: error.message });
  }
});

app.post("/api/auth/logout", async (req, res) => {
  if (req.session.user) {
    // Log logout
    await AuditLog.create({
      action: 'logout',
      user: { userId: req.session.user._id, username: req.session.user.username, name: req.session.user.name },
      ip: req.ip,
      userAgent: req.get('user-agent')
    }).catch(err => console.error('Audit log error:', err));
  }
  req.session.destroy();
  res.json({ success: true, message: "Logged out successfully" });
});

// Removed duplicate route - now handled by routes/auth.js
// app.get("/api/auth/me", (req, res) => { ... });



// Create a new request
app.post("/api/requests", requireAuth, async (req, res) => {
  
  try {
    const {
      date,
      customerName,
      customerPhone,
      userName,
      system,
      request,
      requestType,
      actionDescription,
      status,
      closeDescription,
      priority,
      dueDate,
      assignedToId
    } = req.body;
    if (
      !date ||
      !customerName ||
      !userName ||
      !system ||
      !request ||
      !requestType ||
      !status
    ) {
      return res.status(400).json({ message: "All required fields are missing." });
    }
    // Convert Jalali date to Gregorian before saving
    const gregorianDate = moment
      .from(date, "fa", "YYYY/MM/DD")
      .locale("en")
      .format("YYYY-MM-DD");



    
    // Create request with user tracking
    // Enforce 'باز' status for customer role
    const finalStatus = req.session.user.role === 'customer' ? 'باز' : status;
    
    const requestData = {
      date: gregorianDate,
      customerName,
      customerPhone,
      userName,
      system,
      request,
      requestType,
      actionDescription: actionDescription || '',
      closeDescription: closeDescription || '',
      status: finalStatus,
      priority: priority || 'متوسط',
      dueDate: dueDate || null,
      createdBy: {
        userId: req.session.user._id,
        name: req.session.user.name,
        timestamp: new Date()
      },
      lastModifiedBy: {
        userId: req.session.user._id,
        name: req.session.user.name,
        timestamp: new Date()
      },
      createdByUser: req.session.user.name, // Keep this for backwards compatibility
    };

    // Add assignment if provided
    if (assignedToId) {
      const assignedUser = await User.findById(assignedToId);
      if (assignedUser) {
        requestData.assignedTo = {
          userId: assignedUser._id,
          name: assignedUser.name
        };
        
        // Create notification for assigned user
        await Notification.create({
          user: { userId: assignedUser._id, name: assignedUser.name },
          type: 'request_assigned',
          title: 'درخواست جدید برای شما',
          message: `درخواست ${request} به شما اختصاص داده شد`,
          relatedRequest: null // will be set after save
        }).catch(err => console.error('Notification error:', err));
      }
    }
    
    const newRequest = new Request(requestData);
    
    const savedRequest = await newRequest.save();
    
    // Log audit
    await AuditLog.create({
      action: 'create_request',
      user: { userId: req.session.user._id, username: req.session.user.username, name: req.session.user.name },
      details: { requestId: savedRequest._id, customerName },
      ip: req.ip,
      userAgent: req.get('user-agent')
    }).catch(err => console.error('Audit log error:', err));
    
    await sendSMSToAllUsers("درخواستی ثبت شده");

    res.status(201).json({ message: "Request created successfully." });
  } catch (error) {
    console.error(error.stack || error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all requests
app.get("/api/requests", requireAuth, async (req, res) => {
  try {
    // Build query based on user role
    const query = {};
    if (req.session.user.role === 'customer') {
      // Customers can only see their own requests
      query['createdBy.userId'] = req.session.user._id;
    }
    
    const requests = await Request.find(query).sort({ _id: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Search requests
app.get("/api/requests/search", requireAuth, async (req, res) => {
  try {
    const query = {};
    
    // Apply customer filter
    if (req.session.user.role === 'customer') {
      query['createdBy.userId'] = req.session.user._id;
    }
    
    // For each possible field, add to query if present
    const fields = [
      "date",
      "customerName",
      "userName",
      "system",
      "request",
      "requestType",
      "actionDescription",
      "status",
    ];
    fields.forEach((field) => {
      if (req.query[field]) {
        if (field === "date") {
          // Date: exact match (should be in YYYY-MM-DD)
          query.date = req.query.date;
        } else if (field === "status" || field === "system") {
          // Status/system: exact match
          query[field] = req.query[field];
        } else {
          // Other string fields: case-insensitive partial match
          query[field] = { $regex: req.query[field], $options: "i" };
        }
      }
    });
    const results = await Request.find(query).sort({ _id: -1 });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update a request by ID
app.put("/api/requests/:id", requireAuth, async (req, res) => {
  try {
    const oldRequest = await Request.findById(req.params.id);
    if (!oldRequest) return res.status(404).json({ message: "Not found" });
    
    // Customers are not allowed to edit requests at all
    if (req.session.user.role === 'customer') {
      return res.status(403).json({ message: "مشتریان اجازه ویرایش درخواست را ندارند" });
    }
    
    const updated = await Request.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        lastModifiedBy: {
          userId: req.session.user._id,
          name: req.session.user.name,
          timestamp: new Date()
        },
      },
      {
        new: true,
      }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    // Compare fields and log changes
    const changedFields = [];
    Object.keys(req.body).forEach((field) => {
      if (oldRequest[field] !== req.body[field]) {
        changedFields.push({
          field,
          oldValue: oldRequest[field],
          newValue: req.body[field],
        });
      }
    });
    if (changedFields.length > 0) {
      await RequestHistory.create({
        requestId: req.params.id,
        changedFields,
        modifiedBy: {
          userId: req.session.user._id,
          name: req.session.user.name,
          timestamp: new Date()
        },
      });
    }

    res.json(updated);
  } catch (error) {
    console.error(error.stack || error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get a single request by ID
app.get("/api/requests/:id", requireAuth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: "درخواست یافت نشد" });
    }
    
    // Check if customer is trying to access someone else's request
    if (req.session.user.role === 'customer' && 
        request.createdBy.userId.toString() !== req.session.user._id) {
      return res.status(403).json({ message: "شما اجازه مشاهده این درخواست را ندارید" });
    }
    
    res.json(request);
  } catch (error) {
    console.error(error.stack || error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get request history
app.get("/api/requests/:id/history", requireAuth, async (req, res) => {
  try {
    const history = await RequestHistory.find({
      requestId: req.params.id,
    }).sort({ timestamp: -1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ========== NEW ENDPOINTS ==========

// Import route modules
const authRoutes = require('./routes/auth');
const requestRoutes = require('./routes/requests');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const dashboardRoutes = require('./routes/dashboard');
const reportRoutes = require('./routes/reports');
const scheduledReportRoutes = require('./routes/scheduledReports');
const exportHistoryRoutes = require('./routes/exportHistory');
const requestTemplateRoutes = require('./routes/requestTemplates');

// Use route modules
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/scheduled-reports', scheduledReportRoutes);
app.use('/api/export-history', exportHistoryRoutes);
app.use('/api/request-templates', requestTemplateRoutes);

// ========== LEGACY INLINE ROUTES (kept for backward compatibility) ==========

// Get all users
app.get("/api/users", requireAuth, async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }).sort({ name: 1 });
    res.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get user by ID
app.get("/api/users/:id", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id, { password: 0 });
    if (!user) {
      return res.status(404).json({ success: false, message: 'کاربر یافت نشد' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get user notifications
app.get("/api/notifications", requireAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      'user.userId': req.session.user._id
    }).sort({ createdAt: -1 }).limit(50);
    
    const unreadCount = await Notification.countDocuments({
      'user.userId': req.session.user._id,
      read: false
    });
    
    res.json({ success: true, data: { notifications, unreadCount } });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Mark notification as read
app.put("/api/notifications/:id/read", requireAuth, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, 'user.userId': req.session.user._id },
      { read: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Mark all notifications as read
app.post("/api/notifications/read-all", requireAuth, async (req, res) => {
  try {
    await Notification.updateMany(
      { 'user.userId': req.session.user._id, read: false },
      { read: true }
    );
    res.json({ success: true, message: "همه اعلان‌ها خوانده شد" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Add comment to request
app.post("/api/requests/:id/comments", requireAuth, async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: "متن نظر الزامی است" });
    }
    
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: "درخواست یافت نشد" });
    }

    request.comments.push({
      text: comment,
      createdBy: {
        userId: req.session.user._id,
        name: req.session.user.name
      }
    });
    await request.save();

    // Notify request creator
    if (request.createdBy.userId.toString() !== req.session.user._id) {
      await Notification.create({
        user: request.createdBy,
        type: 'request_commented',
        title: 'نظر جدید',
        message: `${req.session.user.name} نظری در درخواست شما ثبت کرد`,
        relatedRequest: request._id
      }).catch(err => console.error('Notification error:', err));
    }

    res.json({ success: true, comments: request.comments });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Upload attachment to request
app.post("/api/requests/:id/attachments", requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "فایلی انتخاب نشده است" });
    }

    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: "درخواست یافت نشد" });
    }

    request.attachments.push({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedBy: {
        userId: req.session.user._id,
        name: req.session.user.name
      }
    });
    await request.save();

    // Log audit
    await AuditLog.create({
      action: 'upload_file',
      user: { userId: req.session.user._id, username: req.session.user.username, name: req.session.user.name },
      details: { requestId: req.params.id, filename: req.file.originalname },
      ip: req.ip,
      userAgent: req.get('user-agent')
    }).catch(err => console.error('Audit log error:', err));

    res.json({ success: true, message: 'فایل با موفقیت آپلود شد', attachments: request.attachments });
  } catch (error) {
    console.error('Upload attachment error:', error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Assign request to user
app.post("/api/requests/:id/assign", requireAuth, async (req, res) => {
  try {
    const { userId } = req.body;
    
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: "درخواست یافت نشد" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "کاربر یافت نشد" });
    }

    request.assignedTo = {
      userId: user._id,
      name: user.name
    };
    await request.save();

    // Create notification
    await Notification.create({
      user: { userId: user._id, name: user.name },
      type: 'request_assigned',
      title: 'درخواست جدید برای شما',
      message: `درخواست ${request.request} به شما اختصاص داده شد`,
      relatedRequest: request._id
    }).catch(err => console.error('Notification error:', err));

    res.json({ success: true, message: 'درخواست با موفقیت اختصاص داده شد', request });
  } catch (error) {
    console.error('Assign request error:', error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Bulk update requests
app.post("/api/requests/bulk/update", requireAuth, async (req, res) => {
  try {
    const { ids, updates } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'شناسه‌های درخواست الزامی است' });
    }

    const result = await Request.updateMany(
      { _id: { $in: ids } },
      {
        ...updates,
        lastModifiedBy: {
          userId: req.session.user._id,
          name: req.session.user.name,
          timestamp: new Date()
        }
      }
    );

    // Log audit
    await AuditLog.create({
      action: 'bulk_operation',
      user: { userId: req.session.user._id, username: req.session.user.username, name: req.session.user.name },
      details: { operation: 'bulk_update', count: result.modifiedCount, updates },
      ip: req.ip,
      userAgent: req.get('user-agent')
    }).catch(err => console.error('Audit log error:', err));

    res.json({ success: true, message: `${result.modifiedCount} درخواست به‌روزرسانی شد`, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get audit logs (admin only)
app.get("/api/admin/audit-logs", requireAuth, async (req, res) => {
  try {
    if (req.session.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'عدم دسترسی' });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const skip = (page - 1) * limit;
    
    const total = await AuditLog.countDocuments();
    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({ 
      success: true, 
      logs, 
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// User management (admin only)
app.post("/api/admin/users", requireAuth, async (req, res) => {
  try {
    if (req.session.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'عدم دسترسی' });
    }
    
    const { username, password, name, role = 'user' } = req.body;
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'نام کاربری از قبل وجود دارد' });
    }
    
    const user = new User({ username, password, name, role });
    await user.save();
    
    await AuditLog.create({
      action: 'create_user',
      user: { userId: req.session.user._id, username: req.session.user.username, name: req.session.user.name },
      details: { newUserId: user._id, newUsername: username, newUserRole: role },
      ip: req.ip,
      userAgent: req.get('user-agent')
    }).catch(err => console.error('Audit log error:', err));
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({ success: true, message: 'کاربر با موفقیت ایجاد شد', user: userResponse });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.put("/api/admin/users/:id", requireAuth, async (req, res) => {
  try {
    if (req.session.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'عدم دسترسی' });
    }
    
    const { name, role, isActive } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'کاربر یافت نشد' });
    }
    
    if (name) user.name = name;
    if (role) user.role = role;
    if (typeof isActive !== 'undefined') user.isActive = isActive;
    
    await user.save();
    
    await AuditLog.create({
      action: 'update_user',
      user: { userId: req.session.user._id, username: req.session.user.username, name: req.session.user.name },
      details: { updatedUserId: user._id, updatedUsername: user.username, changes: req.body },
      ip: req.ip,
      userAgent: req.get('user-agent')
    }).catch(err => console.error('Audit log error:', err));
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({ success: true, message: 'کاربر با موفقیت ویرایش شد', user: userResponse });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.delete("/api/admin/users/:id", requireAuth, async (req, res) => {
  try {
    if (req.session.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'عدم دسترسی' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'کاربر یافت نشد' });
    }

    // Don't allow deleting yourself
    if (user._id.toString() === req.session.user._id) {
      return res.status(400).json({ success: false, message: 'شما نمی‌توانید خودتان را حذف کنید' });
    }

    await User.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      action: 'delete_user',
      user: { userId: req.session.user._id, username: req.session.user.username, name: req.session.user.name },
      details: { deletedUserId: user._id, deletedUsername: user.username },
      ip: req.ip,
      userAgent: req.get('user-agent')
    }).catch(err => console.error('Audit log error:', err));

    res.json({ success: true, message: 'کاربر با موفقیت حذف شد' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/api/admin/users/:id/reset-password", requireAuth, async (req, res) => {
  try {
    if (req.session.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'عدم دسترسی' });
    }
    
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'رمز عبور باید حداقل 6 کاراکتر باشد' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'کاربر یافت نشد' });
    }

    user.password = newPassword;
    await user.save();

    await AuditLog.create({
      action: 'update_user',
      user: { userId: req.session.user._id, username: req.session.user.username, name: req.session.user.name },
      details: { action: 'password_reset', targetUserId: user._id, targetUsername: user.username },
      ip: req.ip,
      userAgent: req.get('user-agent')
    }).catch(err => console.error('Audit log error:', err));

    res.json({ success: true, message: 'رمز عبور با موفقیت تغییر کرد' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ========== END NEW ENDPOINTS ==========

// Seed sample data endpoint (for testing)
app.post("/api/seed-sample-data", requireAuth, async (req, res) => {
  try {
    // Get all users for assigning requests
    const users = await User.find();
    if (users.length === 0) {
      return res.status(400).json({ message: "No users found. Initialize users first." });
    }

    const customers = [
      "دریانورد", "رادین پارسه اروند", "محمد مهدی خجسته", "آرون صنعت شیمی",
      "زهرا اسماعیلی", "امان اله رییسی", "شرکت ویرا مهر", "کوزو پارس",
      "ماموت تلکا", "نماد داریس", "زرین کوه", "فرصت آینده پارس"
    ];

    const systems = ["مالی", "انبار", "فروش", "دریافت و پرداخت", "سامیار", "حقوق و دستمزد", "اموال و دارایی های ثابت"];
    const statuses = ["انجام", "باز", "در درست اقدام"];
    const priorities = ["کم", "متوسط", "زیاد", "فوری"];
    
    const requestTypes = [
      "رفع باگ", "گزارش جدید", "تغییر فرآیند", "بهبود عملکرد", 
      "اضافه کردن فیلد", "تغییر محاسبات", "آموزش کاربر"
    ];

    const sampleRequests = [];
    
    // Generate 30 sample requests
    for (let i = 0; i < 30; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
      const randomSystem = systems[Math.floor(Math.random() * systems.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
      const randomType = requestTypes[Math.floor(Math.random() * requestTypes.length)];
      
      // Random date in last 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      const date = moment().subtract(daysAgo, 'days').format('YYYY-MM-DD');

      sampleRequests.push({
        date: date,
        customerName: randomCustomer,
        userName: `کاربر ${randomCustomer}`,
        system: randomSystem,
        request: `درخواست ${randomType} در سیستم ${randomSystem}`,
        requestType: randomType,
        actionDescription: `انجام ${randomType} و بررسی مسائل مرتبط`,
        closeDescription: randomStatus === "انجام" ? "درخواست با موفقیت انجام شد" : "",
        status: randomStatus,
        priority: randomPriority,
        dueDate: moment().add(Math.floor(Math.random() * 30), 'days').toDate(),
        createdBy: {
          userId: randomUser._id,
          name: randomUser.name,
          timestamp: moment().subtract(daysAgo, 'days').toDate()
        },
        lastModifiedBy: {
          userId: randomUser._id,
          name: randomUser.name,
          timestamp: moment().subtract(daysAgo, 'days').toDate()
        }
      });
    }

    // Insert sample data
    await Request.insertMany(sampleRequests);

    res.json({ 
      message: "Sample data created successfully", 
      count: sampleRequests.length 
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: "Error creating sample data", error: error.message });
  }
});

// Clear all requests (for testing)
app.delete("/api/clear-requests", requireAuth, async (req, res) => {
  try {
    await Request.deleteMany({});
    await RequestHistory.deleteMany({});
    res.json({ message: "All requests cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error clearing requests", error: error.message });
  }
});

// Serve Vue.js SPA - all non-API routes should serve index.html
// Vue Router will handle client-side routing
// This must be the LAST middleware, after all API routes
app.use((req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return next();
  }
  // Skip static assets (these are already handled by express.static)
  if (req.path.startsWith('/assets') || req.path.startsWith('/uploads')) {
    return next();
  }
  // Serve index.html for all other routes (Vue Router will handle routing)
  const indexPath = path.join(__dirname, 'public', 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      next(err);
    }
  });
});

// Start the server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

// Export app for testing
module.exports = app;

