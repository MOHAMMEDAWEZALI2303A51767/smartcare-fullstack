const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { paginationValidation, idParamValidation } = require('../middleware/validationMiddleware');

// Public routes
router.get('/', paginationValidation, doctorController.getAllDoctors);
router.get('/:id', idParamValidation, doctorController.getDoctorById);
router.get('/:id/availability', idParamValidation, doctorController.getDoctorAvailability);

// Protected doctor routes
router.get('/dashboard/me', protect, authorize('doctor'), doctorController.getDoctorDashboard);
router.get('/patients/me', protect, authorize('doctor'), doctorController.getDoctorPatients);
router.put('/profile', protect, authorize('doctor'), doctorController.updateDoctorProfile);
router.put('/availability', protect, authorize('doctor'), doctorController.updateAvailability);

// Admin routes
router.get('/admin/pending-verification', protect, authorize('admin'), doctorController.getPendingVerifications);
router.put('/:id/verify', protect, authorize('admin'), idParamValidation, doctorController.verifyDoctor);

module.exports = router;
