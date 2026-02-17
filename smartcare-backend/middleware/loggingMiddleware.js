const logger = require('../utils/logger');

// Request logger middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request
  logger.info({
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user ? req.user._id : null,
  });

  // Capture response finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userId: req.user ? req.user._id : null,
    };

    if (res.statusCode >= 400) {
      logger.warn(logData);
    } else {
      logger.info(logData);
    }
  });

  next();
};

// Error logger middleware
const errorLogger = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user ? req.user._id : null,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  next(err);
};

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log slow requests (over 1 second)
    if (duration > 1000) {
      logger.warn({
        message: 'Slow request detected',
        method: req.method,
        url: req.originalUrl,
        duration: `${duration}ms`,
        threshold: '1000ms',
      });
    }
  });

  next();
};

module.exports = {
  requestLogger,
  errorLogger,
  performanceMonitor,
};
