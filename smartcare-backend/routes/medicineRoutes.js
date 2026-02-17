const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createMedicineReminderValidation,
  paginationValidation,
  idParamValidation,
} = require('../middleware/validationMiddleware');

// Reminder routes
router.post('/reminders', protect, authorize('patient'), createMedicineReminderValidation, medicineController.createReminder);
router.get('/reminders', protect, authorize('patient'), paginationValidation, medicineController.getReminders);
router.get('/reminders/:id', protect, authorize('patient'), idParamValidation, medicineController.getReminderById);
router.put('/reminders/:id', protect, authorize('patient'), idParamValidation, medicineController.updateReminder);
router.delete('/reminders/:id', protect, authorize('patient'), idParamValidation, medicineController.deleteReminder);
router.put('/reminders/:id/toggle', protect, authorize('patient'), idParamValidation, medicineController.toggleReminderStatus);
router.post('/reminders/:id/log', protect, authorize('patient'), idParamValidation, medicineController.logMedicineIntake);

// Adherence and schedule routes
router.get('/adherence', protect, authorize('patient'), medicineController.getAdherenceReport);
router.get('/today', protect, authorize('patient'), medicineController.getTodaySchedule);

module.exports = router;
