const { Appointment, Doctor, Patient } = require('../models');
const logger = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { APPOINTMENT_STATUS } = require('../config/constants');

// CREATE APPOINTMENT
const createAppointment = async (req, res) => {
  try {
    const { doctor: doctorId, scheduledDate, startTime } = req.body;

    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) return errorResponse(res, 'Patient profile not found', 404);

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return errorResponse(res, 'Doctor not found', 404);

    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctorId,
      scheduledDate,
      startTime,
      status: APPOINTMENT_STATUS.PENDING,
    });

    return successResponse(res, appointment, 'Appointment created', 201);
  } catch (err) {
    logger.error(err);
    return errorResponse(res, 'Failed to create appointment');
  }
};

// GET ALL APPOINTMENTS
const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('doctor')
      .populate('patient');

    return successResponse(res, appointments);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch appointments');
  }
};

// GET SINGLE APPOINTMENT
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return errorResponse(res, 'Appointment not found', 404);
    return successResponse(res, appointment);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch appointment');
  }
};

// UPDATE APPOINTMENT
const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return successResponse(res, appointment, 'Updated successfully');
  } catch (err) {
    return errorResponse(res, 'Update failed');
  }
};

// CANCEL APPOINTMENT
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    appointment.status = APPOINTMENT_STATUS.CANCELLED;
    await appointment.save();
    return successResponse(res, appointment, 'Cancelled');
  } catch (err) {
    return errorResponse(res, 'Cancel failed');
  }
};

// CONFIRM APPOINTMENT
const confirmAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    appointment.status = APPOINTMENT_STATUS.CONFIRMED;
    await appointment.save();
    return successResponse(res, appointment, 'Confirmed');
  } catch (err) {
    return errorResponse(res, 'Confirm failed');
  }
};

// COMPLETE APPOINTMENT
const completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    appointment.status = APPOINTMENT_STATUS.COMPLETED;
    await appointment.save();
    return successResponse(res, appointment, 'Completed');
  } catch (err) {
    return errorResponse(res, 'Complete failed');
  }
};

// RESCHEDULE APPOINTMENT
const rescheduleAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    appointment.scheduledDate = req.body.scheduledDate;
    appointment.startTime = req.body.startTime;
    await appointment.save();
    return successResponse(res, appointment, 'Rescheduled');
  } catch (err) {
    return errorResponse(res, 'Reschedule failed');
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
