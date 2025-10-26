const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: [
      'login', 'logout', 'failed_login',
      'create_request', 'update_request', 'delete_request',
      'create_user', 'update_user', 'delete_user',
      'upload_file', 'download_file', 'delete_file',
      'export_data', 'bulk_operation'
    ],
    required: true
  },
  user: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    username: String
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ip: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Indexes
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ 'user.userId': 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

