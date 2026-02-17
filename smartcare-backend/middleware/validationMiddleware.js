const { validationResult, body, param, query } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

// Auth validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name must be less than 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  body('role')
    .optional()
    .isIn(['patient', 'doctor'])
    .withMessage('Role must be patient or doctor'),
  handleValidationErrors,
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  handleValidationErrors,
];

const resetPasswordValidation = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  handleValidationErrors,
];

// User validation rules
const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name must be less than 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  body('phoneNumber')
    .optional()
    .trim()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Please provide a valid phone number'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  handleValidationErrors,
];

// Appointment validation rules
const createAppointmentValidation = [
  body('doctor')
    .notEmpty()
    .withMessage('Doctor ID is required')
    .isMongoId()
    .withMessage('Invalid doctor ID'),
  body('type')
    .notEmpty()
    .withMessage('Appointment type is required')
    .isIn(['in-person', 'telemedicine'])
    .withMessage('Type must be in-person or telemedicine'),
  body('scheduledDate')
    .notEmpty()
    .withMessage('Scheduled date is required')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid time (HH:MM)'),
  body('reasonForVisit')
    .notEmpty()
    .withMessage('Reason for visit is required')
    .isLength({ max: 500 })
    .withMessage('Reason must be less than 500 characters'),
  handleValidationErrors,
];

// Medicine reminder validation rules
const createMedicineReminderValidation = [
  body('medicineName')
    .notEmpty()
    .withMessage('Medicine name is required')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Medicine name must be less than 100 characters'),
  body('dosage')
    .notEmpty()
    .withMessage('Dosage is required')
    .trim(),
  body('frequency.times')
    .isArray({ min: 1 })
    .withMessage('At least one time is required'),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  handleValidationErrors,
];

// Blood request validation rules
const createBloodRequestValidation = [
  body('patientName')
    .notEmpty()
    .withMessage('Patient name is required'),
  body('bloodType')
    .notEmpty()
    .withMessage('Blood type is required')
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood type'),
  body('unitsNeeded')
    .notEmpty()
    .withMessage('Units needed is required')
    .isInt({ min: 1 })
    .withMessage('Units must be at least 1'),
  body('hospitalName')
    .notEmpty()
    .withMessage('Hospital name is required'),
  body('hospitalAddress.city')
    .notEmpty()
    .withMessage('City is required'),
  body('hospitalAddress.state')
    .notEmpty()
    .withMessage('State is required'),
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be [longitude, latitude]'),
  body('reason')
    .notEmpty()
    .withMessage('Reason is required'),
  body('requiredBy')
    .notEmpty()
    .withMessage('Required by date is required')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  handleValidationErrors,
];

// Pagination validation
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort')
    .optional()
    .isString()
    .withMessage('Sort must be a string'),
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string'),
  handleValidationErrors,
];

// ID parameter validation
const idParamValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateProfileValidation,
  createAppointmentValidation,
  createMedicineReminderValidation,
  createBloodRequestValidation,
  paginationValidation,
  idParamValidation,
};
