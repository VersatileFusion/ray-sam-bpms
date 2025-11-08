const Request = require('../models/Request');
const RequestHistory = require('../models/RequestHistory');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const Customer = require('../models/Customer');
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');
const { jalaliToGregorian } = require('../utils/dateHelper');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, PAGINATION } = require('../config/constants');
const { sendSMSToAllUsers, sendSMSToSingleUser, sendSMSToCustomers } = require('../sms');
const activityLogger = require('../utils/activityLogger');
const { sendAssignmentEmail, sendRequestStatusChangeEmail, sendCommentNotification } = require('../utils/emailService');

// Create request
exports.createRequest = async (req, res) => {
  try {
    const {
      date,
      customerName,
      customerPhone,
      customerId,
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
      customerPhone,
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

    // Attach customer information if provided
    if (customerId) {
      const customer = await Customer.findById(customerId).lean();
      if (customer) {
        requestData.customer = customer._id;
        requestData.customerName = customerName || customer.name;
        requestData.customerSnapshot = {
          name: customer.name,
          code: customer.code,
          tier: customer.tier
        };

        if (!customerPhone) {
          const primaryContact = customer.contacts?.find(contact => contact.isPrimary);
          if (primaryContact?.phone) {
            requestData.customerPhone = primaryContact.phone;
          }
        }
      }
    }

    // Add assignment if provided
    let assignedUser = null;
    if (assignedToId) {
      assignedUser = await User.findById(assignedToId);
      if (assignedUser) {
        requestData.assignedTo = {
          userId: assignedUser._id,
          name: assignedUser.name
        };
      }
    }

    const newRequest = new Request(requestData);
    const savedRequest = await newRequest.save();

    // Send SMS notification to all admins and specialists
    await sendSMSToAllUsers(`درخواست جدید ثبت شد\nمشتری: ${requestData.customerName}\nنوع: ${requestType}\nسیستم: ${system}`);
    await sendSMSToCustomers(`درخواست جدید ثبت شد\nمشتری: ${requestData.customerName}\nنوع: ${requestType}\nسیستم: ${system}`);

    // Create notification and SMS for assigned user
    if (assignedUser) {
      await Notification.create({
        user: { userId: assignedUser._id, name: assignedUser.name },
        type: 'request_assigned',
        title: 'درخواست جدید برای شما',
        message: `درخواست ${request} به شما اختصاص داده شد`,
        relatedRequest: savedRequest._id
      });
      
      // Send SMS to assigned user if they have a phone number
      if (assignedUser.phone) {
        await sendSMSToSingleUser(
          `درخواست جدید به شما اختصاص داده شد\nمشتری: ${requestData.customerName}\nنوع: ${requestType}\nسیستم: ${system}`,
          assignedUser.phone
        );
      }
    }

    // Log activity
    await activityLogger.created(savedRequest, req.session.user);
    
    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('request-created', { request: savedRequest });
      // Also emit to user-specific room if assigned
      if (assignedUser) {
        io.to(`user-${assignedUser._id}`).emit('request-assigned', { request: savedRequest });
      }
    }
    
    // Send email if assigned
    if (assignedUser) {
      await sendAssignmentEmail(savedRequest, assignedUser);
    }

    // Log audit
    await AuditLog.create({
      action: 'create_request',
      user: {
        userId: req.session.user._id,
        username: req.session.user.username,
        name: req.session.user.name
      },
      details: { requestId: savedRequest._id, customerName: requestData.customerName },
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
    const {
      page,
      limit,
      sort = '-createdAt',
      fullText,
      status,
      system,
      priority,
      customerName,
      assignedTo,
      conditions: rawConditions
    } = req.query;

    const buildClause = (condition = {}) => {
      const { field, operator = 'eq', value } = condition;
      if (!field || value === undefined || value === null || value === '') {
        return null;
      }

      const fieldMap = {
        customerName: 'customerName',
        status: 'status',
        system: 'system',
        priority: 'priority',
        assignedTo: 'assignedTo.name',
      };

      const resolvedField = fieldMap[field] || field;
      const escapedValue = typeof value === 'string' ? value.trim() : value;

      switch (operator) {
        case 'eq':
          return { [resolvedField]: escapedValue };
        case 'neq':
          return { [resolvedField]: { $ne: escapedValue } };
        case 'contains':
          return {
            [resolvedField]: {
              $regex: escapedValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
              $options: 'i',
            },
          };
        case 'startsWith':
          return {
            [resolvedField]: {
              $regex: `^${escapedValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
              $options: 'i',
            },
          };
        default:
          return { [resolvedField]: escapedValue };
      }
    };

    const parseSort = (value) => {
      if (!value) return { createdAt: -1 };
      const sortFields = Array.isArray(value) ? value : value.split(',');
      return sortFields.reduce((acc, field) => {
        const trimmed = field.trim();
        if (!trimmed) return acc;
        if (trimmed.startsWith('-')) {
          acc[trimmed.substring(1)] = -1;
        } else if (trimmed.startsWith('+')) {
          acc[trimmed.substring(1)] = 1;
        } else {
          acc[trimmed] = 1;
        }
        return acc;
      }, {});
    };

    const baseClauses = [];

    if (req.session.user.role === 'customer') {
      baseClauses.push({ 'createdBy.userId': req.session.user._id });
    }
    if (status) baseClauses.push({ status });
    if (system) baseClauses.push({ system });
    if (priority) baseClauses.push({ priority });
    if (customerName) {
      baseClauses.push({ customerName: { $regex: customerName, $options: 'i' } });
    }
    if (assignedTo) {
      baseClauses.push({ 'assignedTo.userId': assignedTo });
    }

    let parsedConditions = [];
    if (rawConditions) {
      try {
        parsedConditions = typeof rawConditions === 'string' ? JSON.parse(rawConditions) : rawConditions;
        if (!Array.isArray(parsedConditions)) {
          parsedConditions = [];
        }
      } catch (err) {
        parsedConditions = [];
      }
    }

    if (parsedConditions.length) {
      const groupedClauses = [];
      parsedConditions.forEach((condition, index) => {
        const clause = buildClause(condition);
        if (!clause) return;

        if (index === 0) {
          groupedClauses.push(clause);
        } else {
          const prevLogic = parsedConditions[index - 1]?.logic || 'AND';
          if (prevLogic.toUpperCase() === 'OR' && groupedClauses.length) {
            const previous = groupedClauses.pop();
            groupedClauses.push({ $or: [previous, clause] });
          } else {
            groupedClauses.push(clause);
          }
        }
      });

      if (groupedClauses.length) {
        baseClauses.push(...groupedClauses);
      }
    }

    const mongoQuery = {};
    if (fullText) {
      mongoQuery.$text = { $search: fullText }; // Requires text index
    }
    if (baseClauses.length) {
      mongoQuery.$and = baseClauses;
    }

    const parsedSort = parseSort(sort);
    const projection = fullText ? { score: { $meta: 'textScore' } } : undefined;
    const sortOptions = fullText
      ? { score: { $meta: 'textScore' }, createdAt: -1 }
      : parsedSort && Object.keys(parsedSort).length ? parsedSort : { createdAt: -1 };

    const numericLimit = Math.min(parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    const numericPage = parseInt(page, 10) || PAGINATION.DEFAULT_PAGE;
    const skip = (numericPage - 1) * numericLimit;

    if (!page && !limit) {
      const results = await Request.find(mongoQuery, projection)
        .sort(sortOptions)
        .limit(PAGINATION.MAX_LIMIT);
      return res.json(results);
    }

    const total = await Request.countDocuments(mongoQuery);
    const requests = await Request.find(mongoQuery, projection)
      .sort(sortOptions)
      .skip(skip)
      .limit(numericLimit);

    sendPaginated(res, requests, numericPage, numericLimit, total);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Search requests
exports.searchRequests = async (req, res) => {
  try {
    const query = {};
    const { date, customerName, userName, system, request, requestType, actionDescription, status, priority, assignedTo } = req.query;

    // Apply customer filter
    if (req.session.user.role === 'customer') {
      query['createdBy.userId'] = req.session.user._id;
    }

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

    // Customers are not allowed to edit requests at all
    if (req.session.user.role === 'customer') {
      return sendError(res, 'مشتریان اجازه ویرایش درخواست را ندارند', 403);
    }

    // Handle customer relationship updates
    if (req.body.customerId) {
      const customer = await Customer.findById(req.body.customerId).lean();
      if (customer) {
        req.body.customer = customer._id;
        req.body.customerName = req.body.customerName || customer.name;
        req.body.customerSnapshot = {
          name: customer.name,
          code: customer.code,
          tier: customer.tier
        };

        if (!req.body.customerPhone) {
          const primaryContact = customer.contacts?.find(contact => contact.isPrimary);
          if (primaryContact?.phone) {
            req.body.customerPhone = primaryContact.phone;
          }
        }
      }
      delete req.body.customerId;
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

      // Log activity
      const changesMap = {};
      changedFields.forEach(cf => {
        changesMap[cf.field] = { from: cf.oldValue, to: cf.newValue };
      });
      await activityLogger.updated(updated, req.session.user, changesMap);

      // Log specific activity types
      const statusChange = changedFields.find(cf => cf.field === 'status');
      if (statusChange) {
        await activityLogger.statusChanged(updated, req.session.user, statusChange.oldValue, statusChange.newValue);
      }

      const priorityChange = changedFields.find(cf => cf.field === 'priority');
      if (priorityChange) {
        await activityLogger.priorityChanged(updated, req.session.user, priorityChange.oldValue, priorityChange.newValue);
      }

      const assignmentChange = changedFields.find(cf => cf.field === 'assignedTo');
      if (assignmentChange) {
        if (assignmentChange.newValue && assignmentChange.newValue.userId) {
          const assignedUser = await User.findById(assignmentChange.newValue.userId);
          await activityLogger.assigned(updated, req.session.user, assignedUser);
        } else if (!assignmentChange.newValue && assignmentChange.oldValue) {
          await activityLogger.unassigned(updated, req.session.user);
        }
      }

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

    // Send SMS if status changed to "انجام" (completed)
    const statusChangeForSMS = changedFields.find(cf => cf.field === 'status');
    if (statusChangeForSMS && statusChangeForSMS.newValue === 'انجام' && oldRequest.customerPhone) {
      await sendSMSToSingleUser(
        `درخواست شما انجام شد\nموضوع: ${oldRequest.request}\nشماره پیگیری: ${oldRequest._id.toString().slice(-8)}`,
        oldRequest.customerPhone
      );
    }

    // Send SMS if assignedTo changed
    const assignmentChangeForSMS = changedFields.find(cf => cf.field === 'assignedTo');
    if (assignmentChangeForSMS && assignmentChangeForSMS.newValue) {
      // Get the assigned user's phone number
      const assignedUser = await User.findById(updated.assignedTo?.userId);
      if (assignedUser && assignedUser.phone) {
        await sendSMSToSingleUser(
          `درخواست جدید به شما اختصاص داده شد\nمشتری: ${oldRequest.customerName}\nنوع: ${oldRequest.requestType}\nسیستم: ${oldRequest.system}`,
          assignedUser.phone
        );
      }
    }

    // Emit socket event for update
    const io = req.app.get('io');
    if (io) {
      io.to(`request-${updated._id}`).emit('request-updated', { 
        requestId: updated._id,
        request: updated 
      });
    }

    // Send email if status changed
    const statusChangeForEmail = changedFields.find(cf => cf.field === 'status');
    if (statusChangeForEmail && statusChangeForEmail.oldValue !== statusChangeForEmail.newValue) {
      await sendRequestStatusChangeEmail(updated, req.session.user, statusChangeForEmail.oldValue, statusChangeForEmail.newValue);
    }

    // Return old format for backward compatibility
    res.json(updated);
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get single request by ID
exports.getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return sendError(res, ERROR_MESSAGES.REQUEST_NOT_FOUND, 404);
    }
    
    // Check if customer is trying to access someone else's request
    if (req.session.user.role === 'customer' && 
        request.createdBy.userId.toString() !== req.session.user._id) {
      return sendError(res, 'شما اجازه مشاهده این درخواست را ندارید', 403);
    }
    
    // Return old format for backward compatibility
    res.json(request);
  } catch (error) {
    console.error('Get request error:', error);
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

    // Log activity
    await activityLogger.commentAdded(request, req.session.user, comment);

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`request-${request._id}`).emit('request-comment-added', { 
        requestId: request._id,
        comment: request.comments[request.comments.length - 1]
      });
    }

    // Send email notification
    if (request.createdBy.userId.toString() !== req.session.user._id) {
      await sendCommentNotification(request, comment, req.session.user);
    }

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

    const attachment = {
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
    };

    request.attachments.push(attachment);

    await request.save();

    // Log activity
    await activityLogger.attachmentAdded(request, req.session.user, attachment);

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`request-${request._id}`).emit('request-attachment-added', { 
        requestId: request._id,
        attachment
      });
    }

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

    // Log activity
    await activityLogger.assigned(request, req.session.user, user);

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${user._id}`).emit('request-assigned', { request });
      io.to(`request-${request._id}`).emit('request-updated', { 
        requestId: request._id,
        request 
      });
    }

    // Send email notification
    await sendAssignmentEmail(request, user);

    // Create notification
    await Notification.create({
      user: { userId: user._id, name: user.name },
      type: 'request_assigned',
      title: 'درخواست جدید برای شما',
      message: `درخواست ${request.request} به شما اختصاص داده شد`,
      relatedRequest: request._id
    });

    // Send SMS to assigned user if they have a phone number
    if (user.phone) {
      await sendSMSToSingleUser(
        `درخواست جدید به شما اختصاص داده شد\nمشتری: ${request.customerName}\nنوع: ${request.requestType}\nسیستم: ${request.system}`,
        user.phone
      );
    }

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

