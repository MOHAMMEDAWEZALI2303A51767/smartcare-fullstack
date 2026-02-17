const { Prescription, Appointment, Patient, Doctor } = require('../models');
const logger = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Create prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor only)
const createPrescription = async (req, res) => {
  try {
    const { appointment: appointmentId, diagnosis, medications, additionalInstructions, followUpAdvice, labTests, validUntil } = req.body;

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return errorResponse(res, 'Doctor profile not found', 404);
    }

    // Get appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return errorResponse(res, 'Appointment not found', 404);
    }

    // Verify doctor owns this appointment
    if (appointment.doctor.toString() !== doctor._id.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }

    // Create prescription
    const prescription = await Prescription.create({
      appointment: appointmentId,
      patient: appointment.patient,
      doctor: doctor._id,
      diagnosis,
      medications,
      additionalInstructions,
      followUpAdvice,
      labTests: labTests || [],
      validUntil: new Date(validUntil),
      createdBy: req.user._id,
    });

    // Update appointment with prescription reference
    appointment.prescription = prescription._id;
    await appointment.save();

    // Populate prescription
    await prescription.populate([
      { path: 'patient', populate: { path: 'user', select: 'firstName lastName' } },
      { path: 'doctor', populate: { path: 'user', select: 'firstName lastName' } },
    ]);

    logger.info(`Prescription created: ${prescription.prescriptionNumber}`);

    return successResponse(res, prescription, 'Prescription created successfully', 201);
  } catch (error) {
    logger.error(`Create prescription error: ${error.message}`);
    return errorResponse(res, 'Failed to create prescription', 500);
  }
};

// @desc    Get all prescriptions
// @route   GET /api/prescriptions
// @access  Private
const getPrescriptions = async (req, res) => {
  try {
    const { isActive, page = 1, limit = 10 } = req.query;

    let query = {};

    // Filter based on user role
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user._id });
      if (!patient) {
        return errorResponse(res, 'Patient profile not found', 404);
      }
      query.patient = patient._id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor) {
        return errorResponse(res, 'Doctor profile not found', 404);
      }
      query.doctor = doctor._id;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const prescriptions = await Prescription.find(query)
      .populate([
        { path: 'patient', populate: { path: 'user', select: 'firstName lastName' } },
        { path: 'doctor', populate: { path: 'user', select: 'firstName lastName' } },
        { path: 'appointment', select: 'appointmentNumber scheduledDate' },
      ])
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Prescription.countDocuments(query);

    return successResponse(res, {
      prescriptions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error(`Get prescriptions error: ${error.message}`);
    return errorResponse(res, 'Failed to get prescriptions', 500);
  }
};

// @desc    Get prescription by ID
// @route   GET /api/prescriptions/:id
// @access  Private
const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(id).populate([
      { path: 'patient', populate: { path: 'user', select: 'firstName lastName email phoneNumber' } },
      { path: 'doctor', populate: { path: 'user', select: 'firstName lastName email' } },
      { path: 'appointment' },
    ]);

    if (!prescription) {
      return errorResponse(res, 'Prescription not found', 404);
    }

    // Check access
    const patient = await Patient.findOne({ user: req.user._id });
    const doctor = await Doctor.findOne({ user: req.user._id });

    const hasAccess =
      req.user.role === 'admin' ||
      (patient && prescription.patient._id.toString() === patient._id.toString()) ||
      (doctor && prescription.doctor._id.toString() === doctor._id.toString());

    if (!hasAccess) {
      return errorResponse(res, 'Access denied', 403);
    }

    return successResponse(res, prescription);
  } catch (error) {
    logger.error(`Get prescription by ID error: ${error.message}`);
    return errorResponse(res, 'Failed to get prescription', 500);
  }
};

// @desc    Update prescription
// @route   PUT /api/prescriptions/:id
// @access  Private (Doctor only)
const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnosis, medications, additionalInstructions, followUpAdvice, labTests, validUntil } = req.body;

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return errorResponse(res, 'Doctor profile not found', 404);
    }

    const prescription = await Prescription.findOne({
      _id: id,
      doctor: doctor._id,
    });

    if (!prescription) {
      return errorResponse(res, 'Prescription not found', 404);
    }

    // Update fields
    if (diagnosis) prescription.diagnosis = diagnosis;
    if (medications) prescription.medications = medications;
    if (additionalInstructions) prescription.additionalInstructions = additionalInstructions;
    if (followUpAdvice) prescription.followUpAdvice = followUpAdvice;
    if (labTests) prescription.labTests = labTests;
    if (validUntil) prescription.validUntil = new Date(validUntil);

    await prescription.save();

    logger.info(`Prescription updated: ${id}`);

    return successResponse(res, prescription, 'Prescription updated successfully');
  } catch (error) {
    logger.error(`Update prescription error: ${error.message}`);
    return errorResponse(res, 'Failed to update prescription', 500);
  }
};

// @desc    Renew prescription
// @route   PUT /api/prescriptions/:id/renew
// @access  Private (Doctor only)
const renewPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { validUntil, modifications } = req.body;

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return errorResponse(res, 'Doctor profile not found', 404);
    }

    const originalPrescription = await Prescription.findOne({
      _id: id,
      doctor: doctor._id,
    });

    if (!originalPrescription) {
      return errorResponse(res, 'Prescription not found', 404);
    }

    // Create new prescription based on original
    const renewedPrescription = await Prescription.create({
      patient: originalPrescription.patient,
      doctor: doctor._id,
      diagnosis: originalPrescription.diagnosis,
      medications: modifications?.medications || originalPrescription.medications,
      additionalInstructions: modifications?.additionalInstructions || originalPrescription.additionalInstructions,
      followUpAdvice: modifications?.followUpAdvice || originalPrescription.followUpAdvice,
      labTests: modifications?.labTests || originalPrescription.labTests,
      validUntil: new Date(validUntil),
      createdBy: req.user._id,
    });

    // Deactivate original prescription
    originalPrescription.isActive = false;
    await originalPrescription.save();

    logger.info(`Prescription renewed: ${id} -> ${renewedPrescription._id}`);

    return successResponse(res, renewedPrescription, 'Prescription renewed successfully');
  } catch (error) {
    logger.error(`Renew prescription error: ${error.message}`);
    return errorResponse(res, 'Failed to renew prescription', 500);
  }
};

// @desc    Deactivate prescription
// @route   PUT /api/prescriptions/:id/deactivate
// @access  Private (Doctor only)
const deactivatePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return errorResponse(res, 'Doctor profile not found', 404);
    }

    const prescription = await Prescription.findOne({
      _id: id,
      doctor: doctor._id,
    });

    if (!prescription) {
      return errorResponse(res, 'Prescription not found', 404);
    }

    prescription.isActive = false;
    await prescription.save();

    return successResponse(res, prescription, 'Prescription deactivated successfully');
  } catch (error) {
    logger.error(`Deactivate prescription error: ${error.message}`);
    return errorResponse(res, 'Failed to deactivate prescription', 500);
  }
};

module.exports = {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  updatePrescription,
  renewPrescription,
  deactivatePrescription,
};
