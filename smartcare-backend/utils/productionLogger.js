const winston = require('winston');
const path = require('path');

/**
 * Production Logger Configuration
 * Logs to files in production, console in development
 */
const productionLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { 
    service: 'smartcare-api',
    environment: process.env.NODE_ENV 
  },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: path.join('logs', 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({ 
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// If we're not in production, also log to console
if (process.env.NODE_ENV !== 'production') {
  productionLogger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

// Create a stream object for Morgan HTTP logging
productionLogger.stream = {
  write: (message) => {
    productionLogger.info(message.trim());
  },
};

module.exports = productionLogger;
