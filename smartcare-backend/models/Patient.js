const mongoose = require('mongoose');
const { BLOOD_TYPES } = require('../config/constants');

const patientSchema = new mongoose.Schema(
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
    },
    height: {
      type: Number, // in cm
    },
    weight: {
      type: Number, // in kg
    },
    allergies: [
      {
        name: String,
        severity: {
          type: String,
          enum: ['mild', 'moderate', 'severe'],
        },
        notes: String,
      },
    ],
    chronicConditions: [
      {
        condition: String,
        diagnosedDate: Date,
        status: {
          type: String,
          enum: ['active', 'managed', 'resolved'],
          default: 'active',
        },
        notes: String,
      },
    ],
    currentMedications: [
      {
        name: String,
        dosage: String,
        frequency: String,
        prescribedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Doctor',
        },
        startDate: Date,
        endDate: Date,
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    medicalHistory: [
      {
        condition: String,
        diagnosedDate: Date,
        treatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Doctor',
        },
        treatment: String,
        outcome: String,
      },
    ],
    familyHistory: [
      {
        condition: String,
        relationship: String,
        notes: String,
      },
    ],
    lifestyle: {
      smoking: {
        status: {
          type: String,
          enum: ['never', 'former', 'current'],
          default: 'never',
        },
        frequency: String,
        since: Date,
      },
      alcohol: {
        status: {
          type: String,
          enum: ['never', 'occasional', 'regular'],
          default: 'never',
        },
        frequency: String,
      },
      exercise: {
        frequency: {
          type: String,
          enum: ['never', 'rarely', 'sometimes', 'often', 'daily'],
          default: 'sometimes',
        },
        type: String,
      },
      dietPreference: {
        type: String,
        enum: ['no_restrictions', 'vegetarian', 'vegan', 'halal', 'kosher', 'gluten_free', 'other'],
        default: 'no_restrictions',
      },
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String,
    },
    insuranceInfo: {
      provider: String,
      policyNumber: String,
      groupNumber: String,
      coverageDetails: String,
    },
    preferredDoctors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
      },
    ],
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Virtual for BMI
patientSchema.virtual('bmi').get(function () {
  if (!this.height || !this.weight) return null;
  const heightInMeters = this.height / 100;
  return (this.weight / (heightInMeters * heightInMeters)).toFixed(1);
});

// Index for user
patientSchema.index({ user: 1 });

module.exports = mongoose.model('Patient', patientSchema);
