const mongoose = require('mongoose');
const { BLOOD_TYPES, URGENCY_LEVELS } = require('../config/constants');
const { generateUniqueId } = require('../utils/helpers');

const bloodRequestSchema = new mongoose.Schema(
  {
    requestNumber: {
      type: String,
      unique: true,
    },
    requester: {
      type: {
        type: String,
        enum: ['patient', 'hospital', 'organization', 'individual'],
        required: true,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      contactName: {
        type: String,
        required: true,
      },
      contactPhone: {
        type: String,
        required: true,
      },
      contactEmail: String,
    },
    patientName: {
      type: String,
      required: true,
    },
    bloodType: {
      type: String,
      enum: BLOOD_TYPES,
      required: true,
    },
    unitsNeeded: {
      type: Number,
      required: true,
      min: 1,
    },
    unitsReceived: {
      type: Number,
      default: 0,
    },
    urgency: {
      type: String,
      enum: Object.values(URGENCY_LEVELS),
      default: URGENCY_LEVELS.NORMAL,
    },
    hospitalName: {
      type: String,
      required: true,
    },
    hospitalAddress: {
      street: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: String,
      country: { type: String, default: 'USA' },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    reason: {
      type: String,
      required: true,
    },
    requiredBy: {
      type: Date,
      required: true,
    },
    // Matching
    matchedDonors: [
      {
        donor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'BloodDonor',
        },
        status: {
          type: String,
          enum: ['invited', 'accepted', 'declined', 'donated', 'not_responded'],
          default: 'invited',
        },
        invitedAt: {
          type: Date,
          default: Date.now,
        },
        respondedAt: Date,
        notes: String,
      },
    ],
    // Status
    status: {
      type: String,
      enum: ['active', 'fulfilled', 'partially_fulfilled', 'expired', 'cancelled'],
      default: 'active',
    },
    notes: String,
    isEmergency: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    shareCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Generate request number before saving
bloodRequestSchema.pre('save', async function (next) {
  if (!this.requestNumber) {
    this.requestNumber = generateUniqueId('BR-');
  }
  next();
});

// Geospatial index
bloodRequestSchema.index({ location: '2dsphere' });
bloodRequestSchema.index({ bloodType: 1, status: 1 });
bloodRequestSchema.index({ urgency: 1, createdAt: -1 });
bloodRequestSchema.index({ status: 1, createdAt: -1 });

// Method to check if fulfilled
bloodRequestSchema.methods.checkFulfilled = function () {
  if (this.unitsReceived >= this.unitsNeeded) {
    this.status = 'fulfilled';
  } else if (this.unitsReceived > 0) {
    this.status = 'partially_fulfilled';
  }
  return this.status;
};

// Method to find compatible blood types
bloodRequestSchema.statics.getCompatibleBloodTypes = function (bloodType) {
  const compatibility = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal recipient
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-'], // Universal donor
  };
  return compatibility[bloodType] || [bloodType];
};

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
