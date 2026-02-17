#!/usr/bin/env node

/**
 * Production Setup Script
 * Run this before deploying to production
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🚀 SmartCare Production Setup\n');

// Generate secure random secrets
const generateSecret = (length = 64) => {
  return crypto.randomBytes(length).toString('hex');
};

// Check if .env.production exists
const envPath = path.join(__dirname, '..', '.env.production');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.production not found!');
  console.log('Creating from template...\n');
  
  const template = `# ============================================
# SmartCare Production Environment Variables
# ============================================

NODE_ENV=production
PORT=10000
API_URL=https://your-app.onrender.com
CLIENT_URL=https://your-app.vercel.app

# Database - MongoDB Atlas (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartcare?retryWrites=true&w=majority

# JWT Secrets (AUTO-GENERATED BELOW)
JWT_SECRET=${generateSecret()}
JWT_REFRESH_SECRET=${generateSecret()}
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Email - Gmail SMTP (REQUIRED)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@smartcare.com
FROM_NAME=SmartCare Health

# OpenAI (REQUIRED for AI features)
OPENAI_API_KEY=sk-your-openai-api-key

# Cloudinary (REQUIRED for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
`;

  fs.writeFileSync(envPath, template);
  console.log('✅ Created .env.production with auto-generated secrets\n');
}

// Create logs directory
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log('✅ Created logs directory');
}

// Create uploads directory
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
}

console.log('\n📋 Next Steps:');
console.log('1. Update MONGODB_URI with your MongoDB Atlas connection string');
console.log('2. Update SMTP_USER and SMTP_PASS with your Gmail credentials');
console.log('3. Update OPENAI_API_KEY with your OpenAI API key');
console.log('4. Update CLOUDINARY_* variables with your Cloudinary credentials');
console.log('5. Update API_URL and CLIENT_URL with your deployed URLs\n');

console.log('🔐 Security Tips:');
console.log('- Keep your .env.production file secure and never commit it');
console.log('- Use strong, unique passwords for all services');
console.log('- Enable 2FA on all accounts (MongoDB, Gmail, Cloudinary)');
console.log('- Regularly rotate API keys and secrets\n');
