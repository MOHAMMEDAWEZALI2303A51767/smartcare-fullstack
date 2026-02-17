const mongoose = require('mongoose');
const { BLOOD_TYPES } = require('../config/constants');

const bloodDonorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bloodType: {
      type: String,
      enum: BLOOD_TYPES,
      required: [true, 'Blood type is required'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    lastDonationDate: {
      type: Date,
    },
    totalDonations: {
      type: Number,
      default: 0,
    },
    donationHistory: [
      {
        date: {
          type: Date,
          required: true,
        },
        units: {
          type: Number,
          default: 1,
        },
        location: String,
        hospital: String,
        request: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'BloodRequest',
        },
        notes: String,
      },
    ],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: { type: String, default: 'USA' },
      },
    },
    preferredRadius: {
      type: Number,
      default: 10, // km
    },
    canTravel: {
      type: Boolean,
      default: true,
    },
    healthConditions: [
      {
        condition: String,
        diagnosedDate: Date,
        isActive: Boolean,
      },
    ],
    isEligible: {
      type: Boolean,
      default: true,
    },
    ineligibilityReason: {
      type: String,
    },
    nextEligibleDate: {
      type: Date,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    emergencyOnly: {
      type: Boolean,
      default: false,
    },
    weight: {
      type: Number, // in kg, minimum 50kg required
    },
    age: {
      type: Number,
    },
    contactPreference: {
      type: String,
      enum: ['email', 'sms', 'phone', 'any'],
      default: 'any',
    },
  },
  {
    timestamps: true,
  }
);

// Geospatial index
bloodDonorSchema.index({ location: '2dsphere' });
bloodDonorSchema.index({ bloodType: 1, isAvailable: 1 });
bloodDonorSchema.index({ isEligible: 1 });

// Method to check eligibility
bloodDonorSchema.methods.checkEligibility = function () {
  // Check age (18-65)
  if (this.age && (this.age < 18 || this.age > 65)) {
    this.isEligible = false;
    this.ineligibilityReason = 'Age must be between 18 and 65 years';
    return false;
  }

  // Check weight (minimum 50kg)
  if (this.weight && this.weight < 50) {
    this.isEligible = false;
    this.ineligibilityReason = 'Weight must be at least 50kg';
    return false;
  }

  // Check last donation date (minimum 56 days between donations)
  if (this.lastDonationDate) {
    const daysSinceLastDonation = Math.floor(
      (Date.now() - this.lastDonationDate) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLastDonation < 56) {
      this.isEligible = false;
      this.ineligibilityReason = `Must wait ${56 - daysSinceLastDonation} more days before next donation`;
      this.nextEligibleDate = new Date(
        this.lastDonationDate.getTime() + 56 * 24 * 60 * 60 * 1000
      );
      return false;
    }
  }

  // Check active health conditions
  const activeConditions = this.healthConditions.filter((c) => c.isActive);
  if (activeConditions.length > 0) {
    this.isEligible = false;
    this.ineligibilityReason = 'Active health conditions present';
    return false;
  }

  this.isEligible = true;
  this.ineligibilityReason = null;
  return true;
};

// Method to record donation
bloodDonorSchema.methods.recordDonation = async function (donationData) {
  this.donationHistory.push(donationData);
  this.totalDonations += 1;
  this.lastDonationDate = donationData.date;
  this.checkEligibility();
  await this.save();
};

module.exports = mongoose.model('BloodDonor', bloodDonorSchema);
