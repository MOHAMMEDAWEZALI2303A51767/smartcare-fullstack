const express = require('express');
const router = express.Router();
const bloodController = require('../controllers/bloodController');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createBloodRequestValidation,
  paginationValidation,
  idParamValidation,
} = require('../middleware/validationMiddleware');

// Donor routes
router.post('/donor/register', protect, bloodController.registerAsDonor);
router.get('/donor/profile', protect, bloodController.getDonorProfile);
router.put('/donor/profile', protect, bloodController.updateDonorProfile);
router.put('/donor/availability', protect, bloodController.updateAvailability);
router.get('/donor/history', protect, bloodController.getDonorHistory);

// Blood request routes
router.post('/requests', protect, createBloodRequestValidation, bloodController.createBloodRequest);
router.get('/requests', paginationValidation, bloodController.getBloodRequests);
router.get('/requests/:id', idParamValidation, bloodController.getBloodRequestById);
router.put('/requests/:id/respond', protect, idParamValidation, bloodController.respondToRequest);
router.put('/requests/:id/fulfill', protect, idParamValidation, bloodController.fulfillRequest);

// Search routes
router.get('/donors/nearby', protect, bloodController.findNearbyDonors);
router.get('/compatibility', bloodController.getBloodCompatibility);

module.exports = router;
