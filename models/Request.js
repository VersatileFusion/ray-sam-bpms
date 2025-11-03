const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // تاریخ
    customerName: { type: String, required: true }, // نام مشتری
    customerPhone: { type: String }, // شماره تماس مشتری
    userName: { type: String, required: true }, // نام کاربر
    system: { type: String, required: true }, // سیستم
    request: { type: String, required: true }, // درخواست
    requestType: { type: String, required: true }, // نوع درخواست
    actionDescription: { type: String, default: '' }, // شرح اقدام
    closeDescription: { type: String }, // شرح بستن درخواست (optional)
    status: {
      type: String,
      enum: ["انجام", "باز", "در درست اقدام"],
      required: true,
      default: "باز"
    },
    // NEW FIELDS
    priority: {
      type: String,
      enum: ["کم", "متوسط", "زیاد", "فوری"],
      default: "متوسط"
    },
    dueDate: { type: Date }, // تاریخ سررسید
    assignedTo: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String }
    },
    attachments: [{
      filename: String,
      originalName: String,
      path: String,
      mimetype: String,
      size: Number,
      uploadedBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String
      },
      uploadedAt: { type: Date, default: Date.now }
    }],
    comments: [{
      text: { type: String, required: true },
      createdBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: { type: String }
      },
      createdAt: { type: Date, default: Date.now }
    }],
    // END NEW FIELDS
    createdBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String },
      timestamp: { type: Date, default: Date.now }
    },
    lastModifiedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String },
      timestamp: { type: Date, default: Date.now }
    },
    createdByUser: { type: String }, // Keep this for backwards compatibility
    tags: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RequestTag'
    }],
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RequestTemplate'
    },
    relatedRequests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request'
    }],
    sla: {
      responseTime: Number, // hours
      resolutionTime: Number, // hours
      responseDeadline: Date,
      resolutionDeadline: Date,
      respondedAt: Date,
      resolvedAt: Date
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Indexes for performance
requestSchema.index({ date: -1 });
requestSchema.index({ status: 1 });
requestSchema.index({ priority: 1 });
requestSchema.index({ system: 1 });
requestSchema.index({ customerName: 1 });
requestSchema.index({ 'createdBy.userId': 1 }); // Important for customer filtering
requestSchema.index({ 'assignedTo.userId': 1 });
requestSchema.index({ dueDate: 1 });
requestSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Request", requestSchema);
