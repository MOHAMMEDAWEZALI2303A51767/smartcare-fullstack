const mongoose = require('mongoose');
const { REMINDER_FREQUENCY } = require('../config/constants');

const medicineReminderSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    medicineName: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required'],
    },
    instructions: {
      type: String,
      trim: true,
    },
    frequency: {
      type: {
        type: String,
        enum: Object.values(REMINDER_FREQUENCY),
        default: REMINDER_FREQUENCY.DAILY,
      },
      times: [
        {
          type: String,
          required: true,
        },
      ],
      daysOfWeek: [
        {
          type: Number,
          min: 0,
          max: 6,
        },
      ],
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    duration: {
      type: Number, // in days
    },
    prescribedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    relatedAppointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    relatedPrescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
    },
    // Reminder settings
    reminderMethods: [
      {
        type: String,
        enum: ['email', 'sms', 'push'],
        default: 'email',
      },
    ],
    emailReminderTime: {
      type: Number,
      default: 15, // minutes before
    },
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    totalDoses: {
      type: Number,
    },
    completedDoses: {
      type: Number,
      default: 0,
    },
    missedDoses: {
      type: Number,
      default: 0,
    },
    adherenceRate: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
medicineReminderSchema.index({ patient: 1, isActive: 1 });
medicineReminderSchema.index({ 'frequency.times': 1 });

// Method to calculate adherence rate
medicineReminderSchema.methods.calculateAdherence = function () {
  const total = this.completedDoses + this.missedDoses;
  if (total === 0) return 100;
  return Math.round((this.completedDoses / total) * 100);
};

// Pre-save hook to calculate total doses
medicineReminderSchema.pre('save', function (next) {
  if (this.isModified('frequency') || this.isModified('duration')) {
    // Calculate total doses based on frequency and duration
    const timesPerDay = this.frequency.times.length;
    const days = this.duration || 30; // default 30 days
    this.totalDoses = timesPerDay * days;
  }
  next();
});

module.exports = mongoose.model('MedicineReminder', medicineReminderSchema);
