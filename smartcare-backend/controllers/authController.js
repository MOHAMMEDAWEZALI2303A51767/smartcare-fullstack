const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Patient, Doctor } = require('../models');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { ROLES } = require('../config/constants');

// Generate JWT tokens
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  });

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });

  return { accessToken, refreshToken };
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, phoneNumber, ...additionalData } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'User already exists with this email', 400);
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: role || ROLES.PATIENT,
      phoneNumber,
    });

    // Create role-specific profile
    if (user.role === ROLES.PATIENT) {
      await Patient.create({
        user: user._id,
        ...additionalData,
      });
    } else if (user.role === ROLES.DOCTOR) {
      await Doctor.create({
        user: user._id,
        ...additionalData,
      });
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    // Send verification email
    try {
      await emailService.sendVerificationEmail(user, verificationToken);
    } catch (emailError) {
      logger.error(`Failed to send verification email: ${emailError.message}`);
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    logger.info(`New user registered: ${user.email}`);

    return successResponse(
      res,
      {
        user: user.toPublicProfile(),
        accessToken,
        refreshToken,
      },
      'Registration successful. Please verify your email.',
      201
    );
  } catch (error) {
    logger.error(`Registration error: ${error.message}`);
    return errorResponse(res, 'Registration failed', 500);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      return errorResponse(res, 'Account is deactivated', 401);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Update last login
    user.lastLogin = new Date();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    logger.info(`User logged in: ${user.email}`);

    return successResponse(res, {
      user: user.toPublicProfile(),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    return errorResponse(res, 'Login failed', 500);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // Clear refresh token
    if (req.user) {
      req.user.refreshToken = null;
      await req.user.save();
    }

    return successResponse(res, null, 'Logged out successfully');
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    return errorResponse(res, 'Logout failed', 500);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, 'Refresh token is required', 400);
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user with matching refresh token
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) {
      return errorResponse(res, 'Invalid refresh token', 401);
    }

    // Generate new tokens
    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return successResponse(res, tokens);
  } catch (error) {
    logger.error(`Token refresh error: ${error.message}`);
    return errorResponse(res, 'Invalid refresh token', 401);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists
      return successResponse(res, null, 'If an account exists, a reset email has been sent');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Send reset email
    try {
      await emailService.sendPasswordResetEmail(user, resetToken);
    } catch (emailError) {
      logger.error(`Failed to send password reset email: ${emailError.message}`);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      return errorResponse(res, 'Failed to send reset email', 500);
    }

    return successResponse(res, null, 'If an account exists, a reset email has been sent');
  } catch (error) {
    logger.error(`Forgot password error: ${error.message}`);
    return errorResponse(res, 'Failed to process request', 500);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash token and find user
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return errorResponse(res, 'Invalid or expired reset token', 400);
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken = null;
    await user.save();

    logger.info(`Password reset successful for: ${user.email}`);

    return successResponse(res, null, 'Password reset successful');
  } catch (error) {
    logger.error(`Reset password error: ${error.message}`);
    return errorResponse(res, 'Failed to reset password', 500);
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash token and find user
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return errorResponse(res, 'Invalid or expired verification token', 400);
    }

    // Update user
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    logger.info(`Email verified for: ${user.email}`);

    return successResponse(res, null, 'Email verified successfully');
  } catch (error) {
    logger.error(`Email verification error: ${error.message}`);
    return errorResponse(res, 'Failed to verify email', 500);
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Private
const resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.isVerified) {
      return errorResponse(res, 'Email is already verified', 400);
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    // Send verification email
    try {
      await emailService.sendVerificationEmail(user, verificationToken);
    } catch (emailError) {
      logger.error(`Failed to send verification email: ${emailError.message}`);
      return errorResponse(res, 'Failed to send verification email', 500);
    }

    return successResponse(res, null, 'Verification email sent');
  } catch (error) {
    logger.error(`Resend verification error: ${error.message}`);
    return errorResponse(res, 'Failed to resend verification', 500);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    let profile = null;
    if (user.role === ROLES.PATIENT) {
      profile = await Patient.findOne({ user: user._id });
    } else if (user.role === ROLES.DOCTOR) {
      profile = await Doctor.findOne({ user: user._id });
    }

    return successResponse(res, {
      user: user.toPublicProfile(),
      profile,
    });
  } catch (error) {
    logger.error(`Get me error: ${error.message}`);
    return errorResponse(res, 'Failed to get user data', 500);
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  getMe,
};
