#!/usr/bin/env node

/**
 * Health Check Script
 * Run this to verify all services are working
 */

const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const { OpenAI } = require('openai');
const cloudinary = require('cloudinary').v2;

require('dotenv').config();

const checkDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connection: OK');
    await mongoose.connection.close();
    return true;
  } catch (error) {
    console.log('❌ Database connection: FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
};

const checkEmail = async () => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.verify();
    console.log('✅ Email service: OK');
    return true;
  } catch (error) {
    console.log('❌ Email service: FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
};

const checkOpenAI = async () => {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    await openai.models.list();
    console.log('✅ OpenAI API: OK');
    return true;
  } catch (error) {
    console.log('❌ OpenAI API: FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
};

const checkCloudinary = async () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    await cloudinary.api.ping();
    console.log('✅ Cloudinary: OK');
    return true;
  } catch (error) {
    console.log('❌ Cloudinary: FAILED');
    console.log(`   Error: ${error.message}`);
    return false;
  }
};

const runChecks = async () => {
  console.log('🏥 SmartCare Health Check\n');
  console.log('Checking services...\n');

  const results = await Promise.all([
    checkDatabase(),
    checkEmail(),
    checkOpenAI(),
    checkCloudinary(),
  ]);

  const allPassed = results.every(r => r);

  console.log('\n' + (allPassed ? '✅ All checks passed!' : '❌ Some checks failed'));
  
  process.exit(allPassed ? 0 : 1);
};

runChecks();
