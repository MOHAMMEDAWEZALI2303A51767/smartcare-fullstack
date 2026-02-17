const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');
const { idParamValidation, paginationValidation } = require('../middleware/validationMiddleware');

// Symptom checker routes
router.post('/symptoms/start', protect, authorize('patient'), aiLimiter, aiController.startSymptomCheck);
router.post('/symptoms/:id/message', protect, authorize('patient'), aiLimiter, aiController.sendSymptomMessage);
router.post('/symptoms/:id/complete', protect, authorize('patient'), aiController.completeSymptomCheck);
router.get('/symptoms/history', protect, authorize('patient'), paginationValidation, aiController.getSymptomCheckHistory);

// Diet planner routes
router.post('/diet/generate', protect, authorize('patient'), aiLimiter, aiController.generateDietPlan);
router.get('/diet/plans', protect, authorize('patient'), paginationValidation, aiController.getDietPlans);
router.get('/diet/plans/:id', protect, authorize('patient'), idParamValidation, aiController.getDietPlanById);
router.post('/diet/plans/:id/log', protect, authorize('patient'), idParamValidation, aiController.logDietAdherence);

module.exports = router;
