const { Appointment } = require('../models');

const createAppointment = async (req, res) => {
  res.json({ message: "Create appointment working" });
};

const getAppointments = async (req, res) => {
  res.json({ message: "Get appointments working" });
};

const getAppointmentById = async (req, res) => {
  res.json({ message: "Get appointment by ID working" });
};

const updateAppointment = async (req, res) => {
  res.json({ message: "Update appointment working" });
};

const cancelAppointment = async (req, res) => {
  res.json({ message: "Cancel appointment working" });
};

const confirmAppointment = async (req, res) => {
  res.json({ message: "Confirm appointment working" });
};

const completeAppointment = async (req, res) => {
  res.json({ message: "Complete appointment working" });
};

const rescheduleAppointment = async (req, res) => {
  res.json({ message: "Reschedule appointment working" });
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
