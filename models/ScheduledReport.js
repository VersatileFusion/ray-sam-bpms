const mongoose = require('mongoose');

const scheduledReportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['excel', 'csv', 'advanced'],
    required: true
  },
  schedule: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      required: true
    },
    day: {
      type: Number, // Day of week (0-6) for weekly, day of month (1-31) for monthly
      min: 0,
      max: 31
    },
    time: {
      type: String, // HH:mm format
      required: true,
      default: '09:00'
    },
    timezone: {
      type: String,
      default: 'Asia/Tehran'
    }
  },
  filters: {
    startDate: String,
    endDate: String,
    status: String,
    system: String,
    priority: String,
    assignedTo: String,
    customerName: String
  },
  recipients: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: String,
    name: String
  }],
  createdBy: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastRun: {
    type: Date
  },
  nextRun: {
    type: Date
  },
  runCount: {
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

// Calculate next run date
scheduledReportSchema.methods.calculateNextRun = function() {
  const now = new Date();
  const [hours, minutes] = this.schedule.time.split(':').map(Number);
  
  let nextRun = new Date();
  nextRun.setHours(hours, minutes, 0, 0);
  
  if (this.schedule.frequency === 'daily') {
    // If time has passed today, schedule for tomorrow
    if (nextRun < now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
  } else if (this.schedule.frequency === 'weekly') {
    const dayOfWeek = this.schedule.day || 0; // Default to Sunday
    const currentDay = nextRun.getDay();
    const daysUntilNext = (dayOfWeek - currentDay + 7) % 7;
    nextRun.setDate(nextRun.getDate() + (daysUntilNext || 7));
    if (nextRun < now) {
      nextRun.setDate(nextRun.getDate() + 7);
    }
  } else if (this.schedule.frequency === 'monthly') {
    const dayOfMonth = this.schedule.day || 1;
    nextRun.setDate(dayOfMonth);
    if (nextRun < now) {
      nextRun.setMonth(nextRun.getMonth() + 1);
    }
  }
  
  return nextRun;
};

scheduledReportSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('schedule')) {
    this.nextRun = this.calculateNextRun();
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('ScheduledReport', scheduledReportSchema);

