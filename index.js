const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const moment = require("jalali-moment");

// Import models
const Request = require("./models/Request");
const RequestHistory = require("./models/RequestHistory");
const User = require("./models/User");
const { sendSMSToAllUsers } = require("./sms");

// Load environment variables
dotenv.config({ path: './atlas.env' });
// Also try loading from .env if atlas.env doesn't exist
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Debug: Check environment variables
console.log('Environment check:');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        "http://localhost:3000", 
        "https://ray-sam-bpms.onrender.com",
        "https://ray-sam-bpms.onrender.com/",
        "https://ray-sam-bpms.onrender.com/login.html",
        "https://ray-sam-bpms.onrender.com/index.html"
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
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Set to true in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax',
      httpOnly: true
    },
  })
);

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
    const defaultUsers = [
      { username: "miladi", password: "miladi", name: "Miladi", role: "user" },
      {
        username: "yazdani",
        password: "yazdani",
        name: "Yazdani",
        role: "user",
      },
      {
        username: "ghasemi",
        password: "ghasemi",
        name: "Ghasemi",
        role: "user",
      },
      {
        username: "ahmadvand",
        password: "ahmadvand",
        name: "Ahmadvand",
        role: "user",
      },
      {
        username: "mohades",
        password: "mohades",
        name: "Mohades",
        role: "user",
      },
      {
        username: "admin",
        password: "admin",
        name: "Administrator",
        role: "admin",
      },
    ];

    for (const userData of defaultUsers) {
      const existingUser = await User.findOne({ username: userData.username });
      if (!existingUser) {
        await createUser(userData);
        console.log(`Created user: ${userData.username}`);
      }
    }
  } catch (error) {
    console.error("Error initializing default users:", error);
  }
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: !!process.env.MONGODB_URI
  });
});

// Serve static files
app.use(express.static("public"));

// Protect index.html - redirect to login if not authenticated
app.get("/index.html", (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login.html");
  }
  next();
});

// MongoDB connection and initialize users
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    // Initialize default users
    return initializeDefaultUsers();
  })
  .then(() => {
    console.log("Default users initialized");
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Basic route - redirect to login page
app.get("/", (req, res) => {
  res.redirect("/login.html");
});

// Explicit route for login page
app.get("/login", (req, res) => {
  res.redirect("/login.html");
});

// Authentication routes
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log('Login attempt:', { username: req.body.username, hasPassword: !!req.body.password });
    
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Username and password are required" 
      });
    }
    
    const user = await loginUser(username, password);
    req.session.user = user;
    
    console.log('Login successful for user:', user.name);
    console.log('Session ID:', req.sessionID);

    res.json({ success: true, user });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(401).json({ success: false, message: error.message });
  }
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: "Logged out successfully" });
});

app.get("/api/auth/me", (req, res) => {
  if (req.session.user) {
    res.json({ success: true, user: req.session.user });
  } else {
    res.status(401).json({ success: false, message: "Not authenticated" });
  }
});

// Debug route to check session data
app.get("/api/debug/session", requireAuth, (req, res) => {
  console.log('Session data:', req.session);
  console.log('Session user:', req.session.user);
  res.json({ 
    session: req.session,
    user: req.session.user,
    hasUser: !!req.session.user
  });
});

// Create a new request
app.post("/api/requests", requireAuth, async (req, res) => {
  
  try {
    const {
      date,
      customerName,
      userName,
      system,
      request,
      requestType,
      actionDescription,
      status,
    } = req.body;
    if (
      !date ||
      !customerName ||
      !userName ||
      !system ||
      !request ||
      !requestType ||
      !actionDescription ||
      !status
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }
    // Convert Jalali date to Gregorian before saving
    const gregorianDate = moment
      .from(date, "fa", "YYYY/MM/DD")
      .locale("en")
      .format("YYYY-MM-DD");



    
    // Create request with user tracking
    const newRequest = new Request({
      date: gregorianDate,
      customerName,
      userName,
      system,
      request,
      requestType,
      actionDescription,
      status,
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
      createdByUser: req.session.user.name, // Keep this for testing
    });
    
    const savedRequest = await newRequest.save();
    
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
    const requests = await Request.find().sort({ _id: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Search requests
app.get("/api/requests/search", requireAuth, async (req, res) => {
  try {
    const query = {};
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
