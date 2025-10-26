const Request = require('../models/Request');
const RequestHistory = require('../models/RequestHistory');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { jalaliToGregorian } = require('../utils/dateHelper');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, PAGINATION } = require('../config/constants');
const { sendSMSToAllUsers } = require('../sms');

// Create request
exports.createRequest = async (req, res) => {
  try {
    const {
      date,
      customerName,
      userName,
      system,
      request,
      requestType,
      actionDescription,
      closeDescription,
      status,
      priority,
      dueDate,
      assignedToId
    } = req.body;

    // Convert Jalali date to Gregorian
    const gregorianDate = jalaliToGregorian(date);

    const requestData = {
      date: gregorianDate,
      customerName,
      userName,
      system,
      request,
      requestType,
      actionDescription,
      closeDescription,
      status,
      priority,
      dueDate,
      createdBy: {
        userId: req.session.user._id,
        name: req.session.user.name,
        timestamp: new Date()
      },
      lastModifiedBy: {
        userId: req.session.user._id,
        name: req.session.user.name,
        timestamp: new Date()
      }
    };

    // Add assignment if provided
    if (assignedToId) {
      const User = require('../models/User');
      const assignedUser = await User.findById(assignedToId);
      if (assignedUser) {
        requestData.assignedTo = {
          userId: assignedUser._id,
          name: assignedUser.name
        };
      }
    }

    const newRequest = new Request(requestData);
    const savedRequest = await newRequest.save();

    // Send SMS notification
    await sendSMSToAllUsers(`درخواست جدید ثبت شد: ${customerName}`);

    // Create notification for assigned user
    if (assignedToId) {
      await Notification.create({
        user: { userId: assignedToId, name: requestData.assignedTo.name },
        type: 'request_assigned',
        title: 'درخواست جدید برای شما',
        message: `درخواست ${request} به شما اختصاص داده شد`,
        relatedRequest: savedRequest._id
      });
    }

    // Log audit
    await AuditLog.create({
      action: 'create_request',
      user: {
        userId: req.session.user._id,
        username: req.session.user.username,
        name: req.session.user.name
      },
      details: { requestId: savedRequest._id, customerName },
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    // Return old format for backward compatibility
    res.status(201).json({ message: SUCCESS_MESSAGES.REQUEST_CREATED });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all requests with pagination
exports.getAllRequests = async (req, res) => {
  try {
    // If no pagination params, return all (backward compatibility)
    if (!req.query.page && !req.query.limit) {
      const requests = await Request.find().sort({ _id: -1 });
      return res.json(requests);
    }

    const page = parseInt(req.query.page) || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    const skip = (page - 1) * limit;

    const total = await Request.countDocuments();
    const requests = await Request.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    sendPaginated(res, requests, page, limit, total);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Search requests
exports.searchRequests = async (req, res) => {
  try {
    const query = {};
    const { date, customerName, userName, system, request, requestType, actionDescription, status, priority, assignedTo } = req.query;

    if (date) query.date = date;
    if (customerName) query.customerName = { $regex: customerName, $options: 'i' };
    if (userName) query.userName = { $regex: userName, $options: 'i' };
    if (system) query.system = system;
    if (request) query.request = { $regex: request, $options: 'i' };
    if (requestType) query.requestType = { $regex: requestType, $options: 'i' };
    if (actionDescription) query.actionDescription = { $regex: actionDescription, $options: 'i' };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query['assignedTo.userId'] = assignedTo;

    const results = await Request.find(query).sort({ _id: -1 });
    // Return old format for backward compatibility
    res.json(results);
  } catch (error) {
    console.error('Search requests error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update request
exports.updateRequest = async (req, res) => {
  try {
    const oldRequest = await Request.findById(req.params.id);
    if (!oldRequest) {
      return sendError(res, ERROR_MESSAGES.REQUEST_NOT_FOUND, 404);
    }

    // Track changes
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

    // Update request
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
      { new: true }
    );

    // Log changes
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

      // Create notification for request creator if someone else updated
      if (oldRequest.createdBy.userId.toString() !== req.session.user._id) {
        await Notification.create({
          user: oldRequest.createdBy,
          type: 'request_updated',
          title: 'درخواست شما ویرایش شد',
          message: `درخواست ${oldRequest.request} توسط ${req.session.user.name} ویرایش شد`,
          relatedRequest: oldRequest._id
        });
      }
    }

    // Log audit
    await AuditLog.create({
      action: 'update_request',
      user: {
        userId: req.session.user._id,
        username: req.session.user.username,
        name: req.session.user.name
      },
      details: { requestId: req.params.id, changedFields },
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    // Return old format for backward compatibility
    res.json(updated);
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get request history
exports.getRequestHistory = async (req, res) => {
  try {
    const history = await RequestHistory.find({
      requestId: req.params.id,
    }).sort({ timestamp: -1 });

    // Return old format for backward compatibility
    res.json(history);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add comment to request
exports.addComment = async (req, res) => {
  try {
    const { comment } = req.body;
    
    const request = await Request.findById(req.params.id);
    if (!request) {
      return sendError(res, ERROR_MESSAGES.REQUEST_NOT_FOUND, 404);
    }

    request.comments.push({
      text: comment,
      createdBy: {
        userId: req.session.user._id,
        name: req.session.user.name
      },
      createdAt: new Date()
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
      });
    }

    sendSuccess(res, { comments: request.comments });
  } catch (error) {
    console.error('Add comment error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Upload attachment
exports.uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'فایلی انتخاب نشده است', 400);
    }

    const request = await Request.findById(req.params.id);
    if (!request) {
      return sendError(res, ERROR_MESSAGES.REQUEST_NOT_FOUND, 404);
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
      },
      uploadedAt: new Date()
    });

    await request.save();

    // Log audit
    await AuditLog.create({
      action: 'upload_file',
      user: {
        userId: req.session.user._id,
        username: req.session.user.username,
        name: req.session.user.name
      },
      details: { requestId: req.params.id, filename: req.file.originalname },
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    sendSuccess(res, { attachments: request.attachments }, 'فایل با موفقیت آپلود شد');
  } catch (error) {
    console.error('Upload attachment error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Assign request to user
exports.assignRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const User = require('../models/User');
    
    const request = await Request.findById(req.params.id);
    if (!request) {
      return sendError(res, ERROR_MESSAGES.REQUEST_NOT_FOUND, 404);
    }

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, ERROR_MESSAGES.USER_NOT_FOUND, 404);
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
    });

    sendSuccess(res, { request }, 'درخواست با موفقیت اختصاص داده شد');
  } catch (error) {
    console.error('Assign request error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Bulk update requests
exports.bulkUpdate = async (req, res) => {
  try {
    const { ids, updates } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return sendError(res, 'شناسه‌های درخواست الزامی است', 400);
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
      user: {
        userId: req.session.user._id,
        username: req.session.user.username,
        name: req.session.user.name
      },
      details: { operation: 'bulk_update', count: result.modifiedCount, updates },
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    sendSuccess(res, { modifiedCount: result.modifiedCount }, `${result.modifiedCount} درخواست به‌روزرسانی شد`);
  } catch (error) {
    console.error('Bulk update error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

module.exports = exports;

