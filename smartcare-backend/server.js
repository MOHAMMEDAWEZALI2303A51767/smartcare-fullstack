require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./utils/logger');
const { verifyConnection: verifyEmailConnection } = require('./config/email');
const { testConnection: testOpenAIConnection } = require('./config/openai');
const { startReminderScheduler } = require('./jobs/reminderScheduler');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Verify email service connection
    await verifyEmailConnection();

    // Test OpenAI connection
    await testOpenAIConnection();

    // Start reminder scheduler
    startReminderScheduler();

    // Start server
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
      logger.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle SIGTERM
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Process terminated');
      });
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
