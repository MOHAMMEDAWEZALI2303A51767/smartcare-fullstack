const mongoose = require('mongoose');
const { APPOINTMENT_STATUS, APPOINTMENT_TYPE } = require('../config/constants');
const { generateUniqueId } = require('../utils/helpers');

const appointmentSchema = new mongoose.Schema(
  {
    appointmentNumber: {
      type: String,
      unique: true,
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
    type: {
      type: String,
      enum: Object.values(APPOINTMENT_TYPE),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(APPOINTMENT_STATUS),
      default: APPOINTMENT_STATUS.PENDING,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      default: 30, // minutes
    },
    reasonForVisit: {
      type: String,
      required: true,
    },
    symptoms: [String],
    notes: String,
    // For telemedicine
    videoCallLink: String,
    videoCallRoomId: String,
    // Payment info
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'not_required'],
      default: 'pending',
    },
    paymentAmount: {
      type: Number,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    // Outcome
    diagnosis: String,
    prescription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
    },
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpDate: Date,
    doctorNotes: String,
    // Cancellation
    cancelledBy: {
      type: String,
      enum: ['patient', 'doctor', 'system'],
    },
    cancellationReason: String,
    cancelledAt: Date,
    // Reminders sent
    remindersSent: {
      email24h: { type: Boolean, default: false },
      email1h: { type: Boolean, default: false },
      sms24h: { type: Boolean, default: false },
      sms1h: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

// Generate appointment number before saving
appointmentSchema.pre('save', async function (next) {
  if (!this.appointmentNumber) {
    this.appointmentNumber = generateUniqueId('APT-');
  }
  next();
});

// Indexes
appointmentSchema.index({ patient: 1, scheduledDate: -1 });
appointmentSchema.index({ doctor: 1, scheduledDate: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ scheduledDate: 1 });

// Method to check if appointment is upcoming
appointmentSchema.methods.isUpcoming = function () {
  return new Date(this.scheduledDate) > new Date() && 
         this.status !== APPOINTMENT_STATUS.CANCELLED &&
         this.status !== APPOINTMENT_STATUS.COMPLETED;
};

// Method to check if can be cancelled
appointmentSchema.methods.canBeCancelled = function () {
  const appointmentTime = new Date(this.scheduledDate);
  const now = new Date();
  const hoursUntilAppointment = (appointmentTime - now) / (1000 * 60 * 60);
  
  return hoursUntilAppointment > 24 && 
         this.status !== APPOINTMENT_STATUS.CANCELLED &&
         this.status !== APPOINTMENT_STATUS.COMPLETED;
};

module.exports = mongoose.model('Appointment', appointmentSchema);
