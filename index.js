const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const Request = require("./models/Request");
const RequestHistory = require("./models/RequestHistory");
const { sendSMSToAllUsers } = require("./sms");
const moment = require("jalali-moment");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Auth Middleware
app.use((req, res, next) => {
  const auth = req.headers["authorization"];
  if (!auth) {
    res.set("WWW-Authenticate", 'Basic realm="Protected"');
    return res.status(401).send("Authentication required.");
  }
  // Decode base64
  const [scheme, encoded] = auth.split(" ");
  if (scheme !== "Basic" || !encoded) {
    return res.status(401).send("Invalid authentication scheme.");
  }
  const decoded = Buffer.from(encoded, "base64").toString();
  const [user, pass] = decoded.split(":");
  if (user === "admin" && pass === "admin") {
    return next();
  }
  res.set("WWW-Authenticate", 'Basic realm="Protected"');
  return res.status(401).send("Invalid credentials.");
});

// Serve static files (now protected)
app.use(express.static("public"));

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Basic route
app.get("/", (req, res) => {
  res.send("Express server is running");
});

// Create a new request
app.post("/api/requests", async (req, res) => {
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
    const newRequest = new Request({
      date: gregorianDate,
      customerName,
      userName,
      system,
      request,
      requestType,
      actionDescription,
      status,
    });
    await newRequest.save();
    await sendSMSToAllUsers("درخواستی ثبت شده");
    res.status(201).json({ message: "Request created successfully." });
  } catch (error) {
    console.error(error.stack || error);
    res.status(500).json({ message: "Server error", error });
  }
});

// Get all requests
app.get("/api/requests", async (req, res) => {
  try {
    const requests = await Request.find().sort({ _id: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Search requests
app.get("/api/requests/search", async (req, res) => {
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
    res.status(500).json({ message: "Server error", error });
  }
});

// Update a request by ID
app.put("/api/requests/:id", async (req, res) => {
  try {
    const oldRequest = await Request.findById(req.params.id);
    if (!oldRequest) return res.status(404).json({ message: "Not found" });
    const updated = await Request.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
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
      });
    }
    res.json(updated);
  } catch (error) {
    console.error(error.stack || error);
    res.status(500).json({ message: "Server error", error });
  }
});

// Get request history
app.get("/api/requests/:id/history", async (req, res) => {
  try {
    const history = await RequestHistory.find({
      requestId: req.params.id,
    }).sort({ timestamp: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
