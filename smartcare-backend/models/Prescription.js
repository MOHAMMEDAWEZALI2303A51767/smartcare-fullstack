const mongoose = require('mongoose');
const { generateUniqueId } = require('../utils/helpers');

const prescriptionSchema = new mongoose.Schema(
  {
    prescriptionNumber: {
      type: String,
      unique: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    diagnosis: {
      type: String,
      required: true,
    },
    medications: [
      {
        name: {
          type: String,
          required: true,
        },
        dosage: {
          type: String,
          required: true,
        },
        frequency: {
          type: String,
          required: true,
        },
        duration: {
          type: String,
          required: true,
        },
        instructions: String,
        isPRN: {
          type: Boolean,
          default: false,
        },
      },
    ],
    additionalInstructions: String,
    followUpAdvice: String,
    labTests: [
      {
        testName: String,
        instructions: String,
      },
    ],
    validUntil: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate prescription number before saving
prescriptionSchema.pre('save', async function (next) {
  if (!this.prescriptionNumber) {
    this.prescriptionNumber = generateUniqueId('RX-');
  }
  next();
});

// Indexes
prescriptionSchema.index({ patient: 1, createdAt: -1 });
prescriptionSchema.index({ doctor: 1, createdAt: -1 });
prescriptionSchema.index({ isActive: 1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);
