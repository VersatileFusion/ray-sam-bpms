const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES, SPECIALIST_STATUS } = require('../config/constants');

const specialistProfileSchema = new mongoose.Schema(
  {
    expertiseAreas: [{ type: String, trim: true }],
    systems: [{ type: String, trim: true }],
    languages: [{ type: String, trim: true }],
    certifications: [{ type: String, trim: true }],
    experienceYears: { type: Number, min: 0, max: 60 },
    capacity: { type: Number, min: 0, max: 100, default: 5 },
    workload: { type: Number, min: 0, max: 200, default: 0 },
    status: {
      type: String,
      enum: Object.values(SPECIALIST_STATUS),
      default: SPECIALIST_STATUS.AVAILABLE
    },
    availability: {
      timezone: { type: String, trim: true },
      days: [{ type: String, trim: true }],
      startHour: { type: Number, min: 0, max: 23 },
      endHour: { type: Number, min: 0, max: 23 }
    },
    notes: { type: String, trim: true }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      index: true
    },
    phone: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER
    },
    jobTitle: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      trim: true
    },
    avatarUrl: {
      type: String,
      trim: true
    },
    bio: {
      type: String,
      trim: true
    },
    tags: [{
      type: String,
      trim: true
    }],
    skills: [{
      type: String,
      trim: true
    }],
    specialistProfile: specialistProfileSchema,
    assignedCustomers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date
    },
    lastActivityAt: {
      type: Date
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ name: 1 });
userSchema.index({ tags: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ 'specialistProfile.status': 1 });
userSchema.index({ 'specialistProfile.systems': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 