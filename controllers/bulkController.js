const Request = require('../models/Request');
const User = require('../models/User');
const Notification = require('../models/Notification');
const activityLogger = require('../utils/activityLogger');
const { sendSuccess, sendError } = require('../utils/response');
const { ERROR_MESSAGES } = require('../config/constants');

// Bulk assign
exports.bulkAssign = async (req, res) => {
  try {
    const { requestIds, userId } = req.body;

    if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
      return sendError(res, 'فهرست درخواست‌ها الزامی است', 400);
    }

    if (!userId) {
      return sendError(res, 'کاربر الزامی است', 400);
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 'کاربر یافت نشد', 404);
    }

    // Update all requests
    const result = await Request.updateMany(
      { _id: { $in: requestIds } },
      {
        $set: {
          assignedTo: {
            userId: user._id,
            name: user.name
          },
          lastModifiedBy: {
            userId: req.session.user._id,
            name: req.session.user.name,
            timestamp: new Date()
          }
        }
      }
    );

    // Log activities
    const requests = await Request.find({ _id: { $in: requestIds } });
    for (const request of requests) {
      await activityLogger.assigned(request, req.session.user, user);
      
      // Create notification
      await Notification.create({
        user: { userId: user._id, name: user.name },
        type: 'request_assigned',
        title: 'درخواست جدید برای شما',
        message: `درخواست ${request.request.substring(0, 50)}... به شما اختصاص داده شد`,
        relatedRequest: request._id
      });
    }

    sendSuccess(res, { 
      updated: result.modifiedCount,
      total: requestIds.length
    }, `${result.modifiedCount} درخواست با موفقیت اختصاص داده شد`);
  } catch (error) {
    console.error('Bulk assign error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Bulk status change
exports.bulkStatusChange = async (req, res) => {
  try {
    const { requestIds, status } = req.body;

    if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
      return sendError(res, 'فهرست درخواست‌ها الزامی است', 400);
    }

    if (!status || !['باز', 'در درست اقدام', 'انجام'].includes(status)) {
      return sendError(res, 'وضعیت نامعتبر است', 400);
    }

    // Get old requests to log changes
    const oldRequests = await Request.find({ _id: { $in: requestIds } });

    // Update all requests
    const result = await Request.updateMany(
      { _id: { $in: requestIds } },
      {
        $set: {
          status,
          lastModifiedBy: {
            userId: req.session.user._id,
            name: req.session.user.name,
            timestamp: new Date()
          }
        }
      }
    );

    // Log activities
    for (const request of oldRequests) {
      await activityLogger.statusChanged(request, req.session.user, request.status, status);
    }

    sendSuccess(res, { 
      updated: result.modifiedCount,
      total: requestIds.length
    }, `${result.modifiedCount} درخواست با موفقیت به‌روزرسانی شد`);
  } catch (error) {
    console.error('Bulk status change error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Bulk priority change
exports.bulkPriorityChange = async (req, res) => {
  try {
    const { requestIds, priority } = req.body;

    if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
      return sendError(res, 'فهرست درخواست‌ها الزامی است', 400);
    }

    if (!priority || !['کم', 'متوسط', 'زیاد', 'فوری'].includes(priority)) {
      return sendError(res, 'اولویت نامعتبر است', 400);
    }

    // Get old requests to log changes
    const oldRequests = await Request.find({ _id: { $in: requestIds } });

    // Update all requests
    const result = await Request.updateMany(
      { _id: { $in: requestIds } },
      {
        $set: {
          priority,
          lastModifiedBy: {
            userId: req.session.user._id,
            name: req.session.user.name,
            timestamp: new Date()
          }
        }
      }
    );

    // Log activities
    for (const request of oldRequests) {
      await activityLogger.priorityChanged(request, req.session.user, request.priority, priority);
    }

    sendSuccess(res, { 
      updated: result.modifiedCount,
      total: requestIds.length
    }, `${result.modifiedCount} درخواست با موفقیت به‌روزرسانی شد`);
  } catch (error) {
    console.error('Bulk priority change error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

module.exports = exports;

