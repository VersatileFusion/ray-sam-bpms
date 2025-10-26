const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/response');
const { ERROR_MESSAGES } = require('../config/constants');

// Get user notifications
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      'user.userId': req.session.user._id
    })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      'user.userId': req.session.user._id,
      read: false
    });

    sendSuccess(res, { notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        'user.userId': req.session.user._id
      },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return sendError(res, 'اعلان یافت نشد', 404);
    }

    sendSuccess(res, { notification });
  } catch (error) {
    console.error('Mark as read error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        'user.userId': req.session.user._id,
        read: false
      },
      { read: true }
    );

    sendSuccess(res, {}, 'همه اعلان‌ها به عنوان خوانده شده علامت‌گذاری شدند');
  } catch (error) {
    console.error('Mark all as read error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      'user.userId': req.session.user._id
    });

    sendSuccess(res, {}, 'اعلان حذف شد');
  } catch (error) {
    console.error('Delete notification error:', error);
    sendError(res, ERROR_MESSAGES.SERVER_ERROR);
  }
};

module.exports = exports;

