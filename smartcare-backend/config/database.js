const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    console.log("✅ MongoDB Connected");

  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    console.log("⚠️ MongoDB failed but server will continue");
    // DO NOT exit in production
  }
};

module.exports = connectDB;
