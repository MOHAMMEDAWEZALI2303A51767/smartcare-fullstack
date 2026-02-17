const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { paginationValidation, idParamValidation } = require('../middleware/validationMiddleware');

router.post('/', protect, authorize('doctor'), prescriptionController.createPrescription);
router.get('/', protect, paginationValidation, prescriptionController.getPrescriptions);
router.get('/:id', protect, idParamValidation, prescriptionController.getPrescriptionById);
router.put('/:id', protect, authorize('doctor'), idParamValidation, prescriptionController.updatePrescription);
router.put('/:id/renew', protect, authorize('doctor'), idParamValidation, prescriptionController.renewPrescription);
router.put('/:id/deactivate', protect, authorize('doctor'), idParamValidation, prescriptionController.deactivatePrescription);

module.exports = router;
