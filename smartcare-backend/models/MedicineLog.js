const mongoose = require('mongoose');

const medicineLogSchema = new mongoose.Schema(
  {
    reminder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicineReminder',
      required: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    medicineName: {
      type: String,
      required: true,
    },
    scheduledTime: {
      type: Date,
      required: true,
    },
    takenTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['taken', 'missed', 'skipped', 'pending'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    reminderSentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
medicineLogSchema.index({ reminder: 1, scheduledTime: 1 });
medicineLogSchema.index({ patient: 1, scheduledTime: -1 });
medicineLogSchema.index({ status: 1 });
medicineLogSchema.index({ scheduledTime: 1, status: 1 }); // For finding pending reminders

module.exports = mongoose.model('MedicineLog', medicineLogSchema);
