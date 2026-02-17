const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require('../middleware/validationMiddleware');

// Public routes with rate limiting
router.post('/register', authLimiter, registerValidation, authController.register);
router.post('/login', authLimiter, loginValidation, authController.login);
router.post('/forgot-password', authLimiter, forgotPasswordValidation, authController.forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPasswordValidation, authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);

// Protected routes
router.post('/logout', protect, authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/resend-verification', protect, authController.resendVerification);
router.get('/me', protect, authController.getMe);

module.exports = router;
