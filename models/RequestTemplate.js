const mongoose = require('mongoose');

const requestTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  system: {
    type: String,
    required: true
  },
  requestType: {
    type: String,
    required: true
  },
  defaultPriority: {
    type: String,
    enum: ['کم', 'متوسط', 'زیاد', 'فوری'],
    default: 'متوسط'
  },
  defaultFields: {
    request: { type: String, default: '' },
    actionDescription: { type: String, default: '' }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String
  },
  usageCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

requestTemplateSchema.index({ system: 1, isActive: 1 });
requestTemplateSchema.index({ name: 1 });

module.exports = mongoose.model('RequestTemplate', requestTemplateSchema);

