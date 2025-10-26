const { ERROR_MESSAGES } = require('../config/constants');
const { sendError } = require('../utils/response');

// Require authentication
const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  return sendError(res, ERROR_MESSAGES.AUTHENTICATION_REQUIRED, 401);
};

// Require admin role
const requireAdmin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return sendError(res, ERROR_MESSAGES.AUTHENTICATION_REQUIRED, 401);
  }
  
  if (req.session.user.role !== 'admin') {
    return sendError(res, ERROR_MESSAGES.FORBIDDEN, 403);
  }
  
  next();
};

// Check if user owns the resource or is admin
const requireOwnerOrAdmin = (resourceUserIdGetter) => {
  return async (req, res, next) => {
    if (!req.session || !req.session.user) {
      return sendError(res, ERROR_MESSAGES.AUTHENTICATION_REQUIRED, 401);
    }
    
    // Admins can access everything
    if (req.session.user.role === 'admin') {
      return next();
    }
    
    // Check ownership
    try {
      const resourceUserId = await resourceUserIdGetter(req);
      if (resourceUserId && resourceUserId.toString() === req.session.user._id) {
        return next();
      }
      return sendError(res, ERROR_MESSAGES.FORBIDDEN, 403);
    } catch (error) {
      return sendError(res, ERROR_MESSAGES.SERVER_ERROR, 500);
    }
  };
};

module.exports = {
  requireAuth,
  requireAdmin,
  requireOwnerOrAdmin
};

