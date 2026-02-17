const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadImageMemory } = require('../middleware/uploadMiddleware');
const { updateProfileValidation } = require('../middleware/validationMiddleware');

// Profile routes
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, updateProfileValidation, userController.updateProfile);
router.put('/profile-picture', protect, uploadImageMemory.single('image'), userController.updateProfilePicture);
router.put('/change-password', protect, userController.changePassword);
router.delete('/profile', protect, userController.deleteAccount);

// Patient profile
router.put('/patient-profile', protect, authorize('patient'), userController.updatePatientProfile);

// Admin routes
router.get('/', protect, authorize('admin'), userController.getAllUsers);
router.put('/:id/status', protect, authorize('admin'), userController.toggleUserStatus);

module.exports = router;
