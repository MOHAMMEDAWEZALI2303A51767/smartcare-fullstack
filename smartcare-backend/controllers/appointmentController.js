const { Appointment, Doctor, Patient, User, Prescription } = require('../models');
const logger = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { APPOINTMENT_STATUS, APPOINTMENT_TYPE } = require('../config/constants');
const emailService = require('../services/emailService');

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private (Patient only)
const createAppointment = async (req, res) => {
  try {
    const { doctor: doctorId, type, scheduledDate, startTime, reasonForVisit, symptoms, notes } = req.body;

    // Get patient
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return errorResponse(res, 'Patient profile not found', 404);
    }

    // Get doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return errorResponse(res, 'Doctor not found', 404);
    }

    // Check if doctor is accepting patients
    if (!doctor.isAcceptingPatients) {
      return errorResponse(res, 'Doctor is not accepting new patients', 400);
    }

    // Check if telemedicine is available
    if (type === APPOINTMENT_TYPE.TELEMEDICINE && !doctor.isAvailableForTelemedicine) {
      return errorResponse(res, 'Doctor does not offer telemedicine', 400);
    }

    // Calculate end time
    const duration = doctor.consultationDuration || 30;
    const [hours, minutes] = startTime.split(':').map(Number);
    const endDate = new Date(2000, 0, 1, hours, minutes + duration);
    const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(
      endDate.getMinutes()
    ).padStart(2, '0')}`;

    // Check for conflicting appointments
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      scheduledDate: new Date(scheduledDate),
      $or: [
        { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
        { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
      ],
      status: { $in: [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED] },
    });

    if (existingAppointment) {
      return errorResponse(res, 'This time slot is already booked', 400);
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctorId,
      type,
      scheduledDate: new Date(scheduledDate),
      startTime,
      endTime,
      duration,
      reasonForVisit,
      symptoms: symptoms || [],
      notes,
      paymentAmount: doctor.consultationFee,
    });

    // Populate appointment
    await appointment.populate([
      { path: 'patient', populate: { path: 'user', select: 'firstName lastName email' } },
      { path: 'doctor', populate: { path: 'user', select: 'firstName lastName email' } },
    ]);

    // Send confirmation emails
    try {
      await emailService.sendAppointmentConfirmation(appointment);
    } catch (emailError) {
      logger.error(`Failed to send appointment confirmation: ${emailError.message}`);
    }

    logger.info(`Appointment created: ${appointment.appointmentNumber}`);

    return successResponse(res, appointment, 'Appointment booked successfully', 201);
  } catch (error) {
    logger.error(`Create appointment error: ${error.message}`);
    return errorResponse(res, 'Failed to book appointment', 500);
  }
};

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10, upcoming } = req.query;

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

    if (status) query.status = status;
    if (type) query.type = type;

    // Filter for upcoming appointments
    if (upcoming === 'true') {
      query.scheduledDate = { $gte: new Date() };
      query.status = { $in: [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED] };
    }

    const appointments = await Appointment.find(query)
      .populate([
        { path: 'patient', populate: { path: 'user', select: 'firstName lastName profilePicture' } },
        { path: 'doctor', populate: { path: 'user', select: 'firstName lastName profilePicture' } },
        { path: 'prescription', select: 'prescriptionNumber' },
      ])
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ scheduledDate: -1, startTime: -1 });

    const count = await Appointment.countDocuments(query);

    return successResponse(res, {
      appointments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error(`Get appointments error: ${error.message}`);
    return errorResponse(res, 'Failed to get appointments', 500);
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id).populate([
      { path: 'patient', populate: { path: 'user', select: 'firstName lastName email phoneNumber profilePicture' } },
      { path: 'doctor', populate: { path: 'user', select: 'firstName lastName email phoneNumber profilePicture' } },
      { path: 'prescription' },
    ]);

    if (!appointment) {
      return errorResponse(res, 'Appointment not found', 404);
    }

    // Check if user has access to this appointment
    const patient = await Patient.findOne({ user: req.user._id });
    const doctor = await Doctor.findOne({ user: req.user._id });

    const hasAccess =
      req.user.role === 'admin' ||
      (patient && appointment.patient._id.toString() === patient._id.toString()) ||
      (doctor && appointment.doctor._id.toString() === doctor._id.toString());

    if (!hasAccess) {
      return errorResponse(res, 'Access denied', 403);
    }

    return successResponse(res, appointment);
  } catch (error) {
    logger.error(`Get appointment by ID error: ${error.message}`);
    return errorResponse(res, 'Failed to get appointment', 500);
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reasonForVisit, symptoms, notes } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return errorResponse(res, 'Appointment not found', 404);
    }

    // Only patient can update their own appointment
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient || appointment.patient.toString() !== patient._id.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }

    // Can only update pending appointments
    if (appointment.status !== APPOINTMENT_STATUS.PENDING) {
      return errorResponse(res, 'Cannot update confirmed or completed appointments', 400);
    }

    if (reasonForVisit) appointment.reasonForVisit = reasonForVisit;
    if (symptoms) appointment.symptoms = symptoms;
    if (notes) appointment.notes = notes;

    await appointment.save();

    logger.info(`Appointment updated: ${id}`);

    return successResponse(res, appointment, 'Appointment updated successfully');
  } catch (error) {
    logger.error(`Update appointment error: ${error.message}`);
    return errorResponse(res, 'Failed to update appointment', 500);
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return errorResponse(res, 'Appointment not found', 404);
    }

    // Check access
    const patient = await Patient.findOne({ user: req.user._id });
    const doctor = await Doctor.findOne({ user: req.user._id });

    const isPatient = patient && appointment.patient.toString() === patient._id.toString();
    const isDoctor = doctor && appointment.doctor.toString() === doctor._id.toString();

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied', 403);
    }

    // Can only cancel pending or confirmed appointments
    if (![APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED].includes(appointment.status)) {
      return errorResponse(res, 'Cannot cancel this appointment', 400);
    }

    appointment.status = APPOINTMENT_STATUS.CANCELLED;
    appointment.cancelledBy = isPatient ? 'patient' : isDoctor ? 'doctor' : 'system';
    appointment.cancellationReason = reason;
    appointment.cancelledAt = new Date();

    await appointment.save();

    // Send cancellation email
    try {
      await emailService.sendAppointmentCancellation(appointment);
    } catch (emailError) {
      logger.error(`Failed to send cancellation email: ${emailError.message}`);
    }

    logger.info(`Appointment cancelled: ${id}`);

    return successResponse(res, appointment, 'Appointment cancelled successfully');
  } catch (error) {
    logger.error(`Cancel appointment error: ${error.message}`);
    return errorResponse(res, 'Failed to cancel appointment', 500);
  }
};

// @desc    Confirm appointment (Doctor only)
// @route   PUT /api/appointments/:id/confirm
// @access  Private (Doctor only)
const confirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return errorResponse(res, 'Doctor profile not found', 404);
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return errorResponse(res, 'Appointment not found', 404);
    }

    // Check if doctor owns this appointment
    if (appointment.doctor.toString() !== doctor._id.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }

    if (appointment.status !== APPOINTMENT_STATUS.PENDING) {
      return errorResponse(res, 'Appointment is not pending', 400);
    }

    appointment.status = APPOINTMENT_STATUS.CONFIRMED;
    await appointment.save();

    // Generate video call link for telemedicine
    if (appointment.type === APPOINTMENT_TYPE.TELEMEDICINE) {
      appointment.videoCallRoomId = `room-${appointment.appointmentNumber}`;
      appointment.videoCallLink = `${process.env.CLIENT_URL}/consultation/${appointment.videoCallRoomId}`;
      await appointment.save();
    }

    // Send confirmation email
    try {
      await emailService.sendAppointmentConfirmation(appointment);
    } catch (emailError) {
      logger.error(`Failed to send confirmation email: ${emailError.message}`);
    }

    logger.info(`Appointment confirmed: ${id}`);

    return successResponse(res, appointment, 'Appointment confirmed successfully');
  } catch (error) {
    logger.error(`Confirm appointment error: ${error.message}`);
    return errorResponse(res, 'Failed to confirm appointment', 500);
  }
};

// @desc    Complete appointment (Doctor only)
// @route   PUT /api/appointments/:id/complete
// @access  Private (Doctor only)
const completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnosis, followUpRequired, followUpDate, doctorNotes } = req.body;

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return errorResponse(res, 'Doctor profile not found', 404);
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return errorResponse(res, 'Appointment not found', 404);
    }

    // Check if doctor owns this appointment
    if (appointment.doctor.toString() !== doctor._id.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }

    if (appointment.status !== APPOINTMENT_STATUS.CONFIRMED) {
      return errorResponse(res, 'Appointment must be confirmed first', 400);
    }

    appointment.status = APPOINTMENT_STATUS.COMPLETED;
    appointment.diagnosis = diagnosis;
    appointment.followUpRequired = followUpRequired;
    appointment.followUpDate = followUpDate;
    appointment.doctorNotes = doctorNotes;

    await appointment.save();

    // Update doctor stats
    doctor.totalPatients += 1;
    await doctor.save();

    logger.info(`Appointment completed: ${id}`);

    return successResponse(res, appointment, 'Appointment completed successfully');
  } catch (error) {
    logger.error(`Complete appointment error: ${error.message}`);
    return errorResponse(res, 'Failed to complete appointment', 500);
  }
};

// @desc    Reschedule appointment
// @route   POST /api/appointments/:id/reschedule
// @access  Private
const rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledDate, startTime } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return errorResponse(res, 'Appointment not found', 404);
    }

    // Check access
    const patient = await Patient.findOne({ user: req.user._id });
    const doctor = await Doctor.findOne({ user: req.user._id });

    const isPatient = patient && appointment.patient.toString() === patient._id.toString();
    const isDoctor = doctor && appointment.doctor.toString() === doctor._id.toString();

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied', 403);
    }

    // Can only reschedule pending or confirmed appointments
    if (![APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED].includes(appointment.status)) {
      return errorResponse(res, 'Cannot reschedule this appointment', 400);
    }

    // Calculate new end time
    const doctor = await Doctor.findById(appointment.doctor);
    const duration = doctor.consultationDuration || 30;
    const [hours, minutes] = startTime.split(':').map(Number);
    const endDate = new Date(2000, 0, 1, hours, minutes + duration);
    const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(
      endDate.getMinutes()
    ).padStart(2, '0')}`;

    // Check for conflicts
    const existingAppointment = await Appointment.findOne({
      doctor: appointment.doctor,
      scheduledDate: new Date(scheduledDate),
      _id: { $ne: id },
      $or: [
        { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
        { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
      ],
      status: { $in: [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.CONFIRMED] },
    });

    if (existingAppointment) {
      return errorResponse(res, 'This time slot is already booked', 400);
    }

    appointment.scheduledDate = new Date(scheduledDate);
    appointment.startTime = startTime;
    appointment.endTime = endTime;

    await appointment.save();

    // Send reschedule notification
    try {
      await emailService.sendAppointmentRescheduled(appointment);
    } catch (emailError) {
      logger.error(`Failed to send reschedule email: ${emailError.message}`);
    }

    logger.info(`Appointment rescheduled: ${id}`);

    return successResponse(res, appointment, 'Appointment rescheduled successfully');
  } catch (error) {
    logger.error(`Reschedule appointment error: ${error.message}`);
    return errorResponse(res, 'Failed to reschedule appointment', 500);
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  confirmAppointment,
  completeAppointment,
  rescheduleAppointment,
};
