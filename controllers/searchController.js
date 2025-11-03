const Request = require('../models/Request');
const { sendSuccess, sendError } = require('../utils/response');
const { ERROR_MESSAGES } = require('../config/constants');

// Search requests
exports.searchRequests = async (req, res) => {
  try {
    const { q, limit = 10, status, system, priority } = req.query;

    if (!q || q.trim().length < 2) {
      return sendSuccess(res, { data: [] });
    }

    const query = {
      $or: [
        { customerName: { $regex: q, $options: 'i' } },
        { userName: { $regex: q, $options: 'i' } },
        { request: { $regex: q, $options: 'i' } },
        { system: { $regex: q, $options: 'i' } },
        { customerPhone: { $regex: q, $options: 'i' } },
        { actionDescription: { $regex: q, $options: 'i' } }
      ]
    };

    // Apply customer filter
    if (req.session.user.role === 'customer') {
      query['createdBy.userId'] = req.session.user._id;
    }

    // Apply additional filters
    if (status) query.status = status;
    if (system) query.system = system;
    if (priority) query.priority = priority;

    const requests = await Request.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('customerName customerPhone system request status priority date _id');

    sendSuccess(res, { data: requests });
  } catch (error) {
    console.error('Search error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

module.exports = exports;

