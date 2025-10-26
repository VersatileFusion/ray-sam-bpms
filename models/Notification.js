const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String
  },
  type: {
    type: String,
    enum: ['request_created', 'request_updated', 'request_assigned', 'request_commented', 'mention'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request'
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
notificationSchema.index({ 'user.userId': 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

