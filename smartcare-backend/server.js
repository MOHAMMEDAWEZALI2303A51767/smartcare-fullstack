require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/database');
const logger = require('./utils/logger');
const { startReminderScheduler } = require('./jobs/reminderScheduler');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

const startServer = async () => {
  try {
    // Connect MongoDB
    await connectDB();

    // 🔥 SKIP optional services in production
    if (process.env.NODE_ENV !== 'production') {
      try {
        const { verifyConnection } = require('./config/email');
        const { testConnection } = require('./config/openai');
        await verifyConnection();
        await testConnection();
      } catch (err) {
        logger.warn('Optional services skipped in production');
      }
    }

    // Start scheduler
    startReminderScheduler();

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      console.log(`🚀 Server running on port ${PORT}`);
    });

    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION! 💥');
      logger.error(err.name, err.message);
      server.close(() => process.exit(1));
    });

  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
