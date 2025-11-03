const ActivityLog = require('../models/ActivityLog');
const { sendSuccess, sendError } = require('../utils/response');
const { ERROR_MESSAGES } = require('../config/constants');

// Get activities for a request
exports.getRequestActivities = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify request exists and user has access
    const Request = require('../models/Request');
    const request = await Request.findById(id);
    
    if (!request) {
      return sendError(res, 'درخواست یافت نشد', 404);
    }
    
    // Check permission for customers
    if (req.session.user.role === 'customer' &&
        request.createdBy.userId.toString() !== req.session.user._id) {
      return sendError(res, ERROR_MESSAGES.FORBIDDEN, 403);
    }
    
    const activities = await ActivityLog.find({ requestId: id })
      .sort({ createdAt: -1 })
      .populate('performedBy.userId', 'name username');
    
    sendSuccess(res, { data: activities });
  } catch (error) {
    console.error('Get activities error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

module.exports = exports;

