const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createAppointmentValidation,
  paginationValidation,
  idParamValidation,
} = require('../middleware/validationMiddleware');

router.post('/', protect, authorize('patient'), createAppointmentValidation, appointmentController.createAppointment);
router.get('/', protect, paginationValidation, appointmentController.getAppointments);
router.get('/:id', protect, idParamValidation, appointmentController.getAppointmentById);
router.put('/:id', protect, idParamValidation, appointmentController.updateAppointment);
router.put('/:id/cancel', protect, idParamValidation, appointmentController.cancelAppointment);
router.put('/:id/confirm', protect, authorize('doctor'), idParamValidation, appointmentController.confirmAppointment);
router.put('/:id/complete', protect, authorize('doctor'), idParamValidation, appointmentController.completeAppointment);
router.post('/:id/reschedule', protect, idParamValidation, appointmentController.rescheduleAppointment);

module.exports = router;
