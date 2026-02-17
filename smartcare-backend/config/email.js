const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Verify transporter connection
const verifyConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    logger.info('Email service connected successfully');
    return true;
  } catch (error) {
    logger.error(`Email service connection failed: ${error.message}`);
    return false;
  }
};

module.exports = {
  createTransporter,
  verifyConnection,
};
