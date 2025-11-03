const mongoose = require('mongoose');

const exportHistorySchema = new mongoose.Schema({
  exportType: {
    type: String,
    enum: ['excel', 'csv', 'advanced'],
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  filters: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  recordCount: {
    type: Number,
    default: 0
  },
  fileSize: {
    type: Number, // Size in bytes
    default: 0
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'processing'],
    default: 'processing'
  },
  error: {
    type: String
  },
  exportedBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    username: String
  },
  downloadUrl: {
    type: String // Temporary URL or path
  },
  expiresAt: {
    type: Date // When the file should be deleted
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
exportHistorySchema.index({ 'exportedBy.userId': 1, createdAt: -1 });
exportHistorySchema.index({ exportType: 1, createdAt: -1 });
exportHistorySchema.index({ createdAt: -1 });

module.exports = mongoose.model('ExportHistory', exportHistorySchema);

