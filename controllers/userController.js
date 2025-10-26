const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { sendSuccess, sendError } = require('../utils/response');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../config/constants');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }).sort({ name: 1 });
    sendSuccess(res, { users });
  } catch (error) {
    console.error('Get users error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id, { password: 0 });
    if (!user) {
      return sendError(res, ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }
    sendSuccess(res, { user });
  } catch (error) {
    console.error('Get user error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Create user (admin only)
exports.createUser = async (req, res) => {
  try {
    const { username, password, name, role = 'user' } = req.body;

    // Check if username exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return sendError(res, 'نام کاربری از قبل وجود دارد', 400);
    }

    const user = new User({
      username,
      password,
      name,
      role
    });

    await user.save();

    // Log audit
    await AuditLog.create({
      action: 'create_user',
      user: {
        userId: req.session.user._id,
        username: req.session.user.username,
        name: req.session.user.name
      },
      details: { newUserId: user._id, newUsername: username, newUserRole: role },
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    sendSuccess(res, { user: userResponse }, SUCCESS_MESSAGES.USER_CREATED, 201);
  } catch (error) {
    console.error('Create user error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Update user (admin only)
exports.updateUser = async (req, res) => {
  try {
    const { name, role, isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }

    if (name) user.name = name;
    if (role) user.role = role;
    if (typeof isActive !== 'undefined') user.isActive = isActive;

    await user.save();

    // Log audit
    await AuditLog.create({
      action: 'update_user',
      user: {
        userId: req.session.user._id,
        username: req.session.user.username,
        name: req.session.user.name
      },
      details: { updatedUserId: user._id, updatedUsername: user.username, changes: req.body },
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    sendSuccess(res, { user: userResponse }, SUCCESS_MESSAGES.USER_UPDATED);
  } catch (error) {
    console.error('Update user error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Reset user password (admin only)
exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return sendError(res, 'رمز عبور باید حداقل 6 کاراکتر باشد', 400);
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }

    user.password = newPassword;
    await user.save();

    // Log audit
    await AuditLog.create({
      action: 'update_user',
      user: {
        userId: req.session.user._id,
        username: req.session.user.username,
        name: req.session.user.name
      },
      details: { action: 'password_reset', targetUserId: user._id, targetUsername: user.username },
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    sendSuccess(res, {}, 'رمز عبور با موفقیت تغییر کرد');
  } catch (error) {
    console.error('Reset password error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }

    // Don't allow deleting yourself
    if (user._id.toString() === req.session.user._id) {
      return sendError(res, 'شما نمی‌توانید خودتان را حذف کنید', 400);
    }

    await User.findByIdAndDelete(req.params.id);

    // Log audit
    await AuditLog.create({
      action: 'delete_user',
      user: {
        userId: req.session.user._id,
        username: req.session.user.username,
        name: req.session.user.name
      },
      details: { deletedUserId: user._id, deletedUsername: user.username },
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    sendSuccess(res, {}, 'کاربر با موفقیت حذف شد');
  } catch (error) {
    console.error('Delete user error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

module.exports = exports;

