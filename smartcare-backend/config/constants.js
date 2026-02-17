module.exports = {
  // User roles
  ROLES: {
    PATIENT: 'patient',
    DOCTOR: 'doctor',
    ADMIN: 'admin',
  },

  // Appointment statuses
  APPOINTMENT_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no-show',
  },

  // Appointment types
  APPOINTMENT_TYPE: {
    IN_PERSON: 'in-person',
    TELEMEDICINE: 'telemedicine',
  },

  // Blood types
  BLOOD_TYPES: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],

  // Blood request urgency
  URGENCY_LEVELS: {
    NORMAL: 'normal',
    URGENT: 'urgent',
    CRITICAL: 'critical',
    EMERGENCY: 'emergency',
  },

  // Medicine reminder frequency
  REMINDER_FREQUENCY: {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    CUSTOM: 'custom',
  },

  // Notification types
  NOTIFICATION_TYPES: {
    APPOINTMENT: 'appointment',
    MEDICINE_REMINDER: 'medicine_reminder',
    BLOOD_REQUEST: 'blood_request',
    SYSTEM: 'system',
    MESSAGE: 'message',
  },

  // Payment statuses
  PAYMENT_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
  },

  // Doctor verification status
  VERIFICATION_STATUS: {
    PENDING: 'pending',
    VERIFIED: 'verified',
    REJECTED: 'rejected',
  },

  // JWT expiration times
  JWT_EXPIRE: '15m',
  JWT_REFRESH_EXPIRE: '7d',

  // File upload limits
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],

  // Pagination defaults
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,

  // Rate limiting
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100, // requests per window

  // AI settings
  AI_MAX_TOKENS: 1000,
  AI_TEMPERATURE: 0.7,

  // Days of week
  DAYS_OF_WEEK: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
};
