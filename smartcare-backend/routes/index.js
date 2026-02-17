const express = require('express');
const router = express.Router();

// Import route files
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const doctorRoutes = require('./doctorRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const medicineRoutes = require('./medicineRoutes');
const bloodDonationRoutes = require('./bloodDonationRoutes');
const aiRoutes = require('./aiRoutes');
const prescriptionRoutes = require('./prescriptionRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/medicines', medicineRoutes);
router.use('/blood-donation', bloodDonationRoutes);
router.use('/ai', aiRoutes);
router.use('/prescriptions', prescriptionRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SmartCare API is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
