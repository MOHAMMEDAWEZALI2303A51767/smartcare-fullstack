const crypto = require('crypto');

// Generate random token
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate OTP
const generateOTP = (length = 6) => {
  return Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, '0');
};

// Format date
const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day);
};

// Calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Generate unique ID
const generateUniqueId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}${timestamp}${random}`.toUpperCase();
};

// Parse time string to minutes
const timeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

// Format minutes to time string
const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

// Check if time slot is available
const isTimeSlotAvailable = (startTime, endTime, bookedSlots) => {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  
  for (const slot of bookedSlots) {
    const slotStart = timeToMinutes(slot.start);
    const slotEnd = timeToMinutes(slot.end);
    
    if ((start >= slotStart && start < slotEnd) || 
        (end > slotStart && end <= slotEnd) ||
        (start <= slotStart && end >= slotEnd)) {
      return false;
    }
  }
  
  return true;
};

// Sanitize user object for response
const sanitizeUser = (user) => {
  const sanitized = user.toObject ? user.toObject() : { ...user };
  delete sanitized.password;
  delete sanitized.__v;
  return sanitized;
};

// Paginate results
const paginate = (array, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  return {
    data: array.slice(startIndex, endIndex),
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(array.length / limit),
      totalItems: array.length,
      itemsPerPage: limit,
      hasNextPage: endIndex < array.length,
      hasPrevPage: startIndex > 0,
    },
  };
};

// Get start and end of day
const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

module.exports = {
  generateToken,
  generateOTP,
  formatDate,
  calculateAge,
  generateUniqueId,
  timeToMinutes,
  minutesToTime,
  isTimeSlotAvailable,
  sanitizeUser,
  paginate,
  getStartOfDay,
  getEndOfDay,
};
