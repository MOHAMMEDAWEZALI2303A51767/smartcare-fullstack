const OpenAI = require('openai');
const logger = require('../utils/logger');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Test OpenAI connection
const testConnection = async () => {
  try {
    const response = await openai.models.list();
    logger.info('OpenAI API connected successfully');
    return true;
  } catch (error) {
    logger.error(`OpenAI API connection failed: ${error.message}`);
    return false;
  }
};

module.exports = {
  openai,
  testConnection,
};
