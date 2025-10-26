const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { sendSuccess, sendError } = require('../utils/response');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../config/constants');

// Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username, isActive: true });
    if (!user) {
      // Log failed login
      await AuditLog.create({
        action: 'failed_login',
        user: { username },
        details: { reason: 'User not found or inactive' },
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
      
      return sendError(res, ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Log failed login
      await AuditLog.create({
        action: 'failed_login',
        user: { userId: user._id, username: user.username, name: user.name },
        details: { reason: 'Invalid password' },
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
      
      return sendError(res, ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Set session
    req.session.user = {
      _id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
    };

    // Log successful login
    await AuditLog.create({
      action: 'login',
      user: { userId: user._id, username: user.username, name: user.name },
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    // Use old response format for backward compatibility
    res.json({ success: true, user: req.session.user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ success: false, message: error.message });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    if (req.session.user) {
      // Log logout
      await AuditLog.create({
        action: 'logout',
        user: {
          userId: req.session.user._id,
          username: req.session.user.username,
          name: req.session.user.name
        },
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
    }

    req.session.destroy();
    res.json({ success: true, message: SUCCESS_MESSAGES.LOGOUT_SUCCESS });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

// Get current user
exports.getMe = (req, res) => {
  if (req.session.user) {
    res.json({ success: true, user: req.session.user });
  } else {
    res.status(401).json({ success: false, message: ERROR_MESSAGES.AUTHENTICATION_REQUIRED });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.session.user._id);
    if (!user) {
      return sendError(res, ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 'رمز عبور فعلی اشتباه است', 400);
    }

    user.password = newPassword;
    await user.save();

    // Log password change
    await AuditLog.create({
      action: 'update_user',
      user: {
        userId: user._id,
        username: user.username,
        name: user.name
      },
      details: { action: 'password_change' },
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    sendSuccess(res, {}, SUCCESS_MESSAGES.PASSWORD_CHANGED);
  } catch (error) {
    console.error('Change password error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

