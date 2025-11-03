const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'created',
      'updated',
      'status_changed',
      'assigned',
      'unassigned',
      'comment_added',
      'attachment_added',
      'attachment_deleted',
      'priority_changed',
      'closed',
      'reopened'
    ]
  },
  description: {
    type: String,
    required: true
  },
  changes: {
    type: mongoose.Schema.Types.Mixed, // Store the changed fields
    default: {}
  },
  performedBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    username: String
  },
  oldValue: mongoose.Schema.Types.Mixed,
  newValue: mongoose.Schema.Types.Mixed,
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Indexes for performance
activityLogSchema.index({ requestId: 1, createdAt: -1 });
activityLogSchema.index({ 'performedBy.userId': 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);

