const express = require('express');
const router = express.Router();

const appointmentController = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Create appointment
router.post('/', protect, authorize('patient'), appointmentController.createAppointment);

// Get all appointments
router.get('/', protect, appointmentController.getAppointments);

// Get single appointment
router.get('/:id', protect, appointmentController.getAppointmentById);

// Update appointment
router.put('/:id', protect, appointmentController.updateAppointment);

// Cancel appointment
router.put('/:id/cancel', protect, appointmentController.cancelAppointment);

// Confirm appointment
router.put('/:id/confirm', protect, authorize('doctor'), appointmentController.confirmAppointment);

// Complete appointment
router.put('/:id/complete', protect, authorize('doctor'), appointmentController.completeAppointment);

// Reschedule appointment
router.post('/:id/reschedule', protect, appointmentController.rescheduleAppointment);

module.exports = router;
