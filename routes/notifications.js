const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/auth');

// Get my notifications
router.get('/', requireAuth, notificationController.getMyNotifications);

// Mark as read
router.put('/:id/read', requireAuth, notificationController.markAsRead);

// Mark all as read
router.post('/read-all', requireAuth, notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', requireAuth, notificationController.deleteNotification);

module.exports = router;

