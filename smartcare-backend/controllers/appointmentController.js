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

    // 🔥 FIXED PART (renamed variable)
    const doctorData = await Doctor.findById(appointment.doctor);

    const duration = doctorData.consultationDuration || 30;
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
