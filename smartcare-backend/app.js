const express = require('express');
const path = require('path');
const { setupSecurityMiddleware } = require('./middleware/securityMiddleware');
const { requestLogger, errorLogger } = require('./middleware/loggingMiddleware');
const { globalErrorHandler, notFoundHandler } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimiter');

// Initialize Express app
const app = express();

// Security middleware
setupSecurityMiddleware(app);

// Request logging
app.use(requestLogger);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', apiLimiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Import routes ONLY ONCE here
const routes = require('./routes');
app.use('/api', routes);

// Error logging
app.use(errorLogger);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

module.exports = app;
