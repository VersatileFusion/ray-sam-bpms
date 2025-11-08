const mongoose = require('mongoose');
const { CUSTOMER_STATUS, CUSTOMER_TIERS } = require('../config/constants');

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    position: { type: String, trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isPrimary: { type: Boolean, default: false },
    notes: { type: String, trim: true }
  },
  { _id: true, timestamps: true }
);

const slaSchema = new mongoose.Schema(
  {
    responseHours: { type: Number, min: 0, default: 4 },
    resolutionHours: { type: Number, min: 0, default: 24 },
    escalationContacts: [{ type: String, trim: true }],
    active: { type: Boolean, default: true },
    notes: { type: String, trim: true }
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    province: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, trim: true }
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    companyName: { type: String, trim: true },
    industry: { type: String, trim: true },
    code: { type: String, trim: true, unique: true, sparse: true },
    status: {
      type: String,
      enum: Object.values(CUSTOMER_STATUS),
      default: CUSTOMER_STATUS.ACTIVE
    },
    tier: {
      type: String,
      enum: CUSTOMER_TIERS,
      default: CUSTOMER_TIERS[0]
    },
    tags: [{ type: String, trim: true }],
    notes: { type: String, trim: true },
    address: addressSchema,
    contacts: [contactSchema],
    assignedSpecialists: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    assignedManager: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, trim: true }
    },
    systems: [{ type: String, trim: true }],
    metadata: {
      website: { type: String, trim: true },
      taxId: { type: String, trim: true },
      registrationNumber: { type: String, trim: true },
      contractNumber: { type: String, trim: true },
      contractExpiry: { type: Date }
    },
    sla: slaSchema,
    lastInteractionAt: { type: Date },
    createdBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, trim: true }
    },
    updatedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: { type: String, trim: true }
    }
  },
  {
    timestamps: true
  }
);

customerSchema.index({ name: 1 });
customerSchema.index({ status: 1 });
customerSchema.index({ tier: 1 });
customerSchema.index({ tags: 1 });
customerSchema.index({ 'contacts.email': 1 });
customerSchema.index({ assignedSpecialists: 1 });

module.exports = mongoose.model('Customer', customerSchema);

