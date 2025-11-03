const mongoose = require('mongoose');

const requestTagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  color: {
    type: String,
    default: '#3B82F6' // Default blue color
  },
  description: {
    type: String,
    trim: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

requestTagSchema.index({ name: 1 });

module.exports = mongoose.model('RequestTag', requestTagSchema);

