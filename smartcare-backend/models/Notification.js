const mongoose = require('mongoose');
const { NOTIFICATION_TYPES } = require('../config/constants');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Delivery
    channels: [
      {
        type: String,
        enum: ['in_app', 'email', 'sms', 'push'],
        default: 'in_app',
      },
    ],
    delivered: {
      inApp: { type: Boolean, default: false },
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: false },
    },
    deliveredAt: {
      inApp: Date,
      email: Date,
      sms: Date,
      push: Date,
    },
    // Status
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    // Action
    actionUrl: {
      type: String,
    },
    actionTaken: {
      type: Boolean,
      default: false,
    },
    actionTakenAt: {
      type: Date,
    },
    // Related entities
    relatedEntity: {
      model: String,
      id: mongoose.Schema.Types.ObjectId,
    },
    // Priority
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to mark as read
notificationSchema.methods.markAsRead = function () {
  this.isRead = true;
  this.readAt = new Date();
};

// Method to mark as delivered
notificationSchema.methods.markAsDelivered = function (channel) {
  if (this.delivered[channel] !== undefined) {
    this.delivered[channel] = true;
    this.deliveredAt[channel] = new Date();
  }
};

module.exports = mongoose.model('Notification', notificationSchema);
