const { MedicineReminder, MedicineLog, Patient } = require('../models');
const logger = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Create medicine reminder
// @route   POST /api/medicines/reminders
// @access  Private (Patient only)
const createReminder = async (req, res) => {
  try {
    const {
      medicineName,
      dosage,
      instructions,
      frequency,
      startDate,
      endDate,
      duration,
      reminderMethods,
      emailReminderTime,
      notes,
    } = req.body;

    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return errorResponse(res, 'Patient profile not found', 404);
    }

    const reminder = await MedicineReminder.create({
      patient: patient._id,
      medicineName,
      dosage,
      instructions,
      frequency,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
      duration,
      reminderMethods: reminderMethods || ['email'],
      emailReminderTime: emailReminderTime || 15,
      notes,
    });

    // Generate initial medicine logs
    await generateMedicineLogs(reminder);

    logger.info(`Medicine reminder created: ${reminder._id}`);

    return successResponse(res, reminder, 'Medicine reminder created successfully', 201);
  } catch (error) {
    logger.error(`Create reminder error: ${error.message}`);
    return errorResponse(res, 'Failed to create reminder', 500);
  }
};

// Helper function to generate medicine logs
const generateMedicineLogs = async (reminder) => {
  const logs = [];
  const startDate = new Date(reminder.startDate);
  const endDate = reminder.endDate || new Date(startDate);
  
  if (!reminder.endDate) {
    endDate.setDate(endDate.getDate() + (reminder.duration || 30));
  }

  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);

    // Check if this day should have reminders based on frequency
    const dayOfWeek = currentDate.getDay();
    const shouldRemind =
      reminder.frequency.type === 'daily' ||
      (reminder.frequency.type === 'weekly' && reminder.frequency.daysOfWeek.includes(dayOfWeek)) ||
      reminder.frequency.type === 'custom';

    if (shouldRemind) {
      reminder.frequency.times.forEach((time) => {
        const [hours, minutes] = time.split(':').map(Number);
        const scheduledTime = new Date(currentDate);
        scheduledTime.setHours(hours, minutes, 0, 0);

        logs.push({
          reminder: reminder._id,
          patient: reminder.patient,
          medicineName: reminder.medicineName,
          scheduledTime,
          status: 'pending',
        });
      });
    }
  }

  await MedicineLog.insertMany(logs);
};

// @desc    Get all medicine reminders
// @route   GET /api/medicines/reminders
// @access  Private (Patient only)
const getReminders = async (req, res) => {
  try {
    const { isActive, page = 1, limit = 10 } = req.query;

    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return errorResponse(res, 'Patient profile not found', 404);
    }

    const query = { patient: patient._id };
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const reminders = await MedicineReminder.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await MedicineReminder.countDocuments(query);

    return successResponse(res, {
      reminders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error(`Get reminders error: ${error.message}`);
    return errorResponse(res, 'Failed to get reminders', 500);
  }
};

// @desc    Get reminder by ID
// @route   GET /api/medicines/reminders/:id
// @access  Private (Patient only)
const getReminderById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return errorResponse(res, 'Patient profile not found', 404);
    }

    const reminder = await MedicineReminder.findOne({
      _id: id,
      patient: patient._id,
    });

    if (!reminder) {
      return errorResponse(res, 'Reminder not found', 404);
    }

    // Get recent logs
    const recentLogs = await MedicineLog.find({ reminder: id })
      .sort({ scheduledTime: -1 })
      .limit(30);

    return successResponse(res, {
      reminder,
      recentLogs,
    });
  } catch (error) {
    logger.error(`Get reminder by ID error: ${error.message}`);
    return errorResponse(res, 'Failed to get reminder', 500);
  }
};

// @desc    Update reminder
// @route   PUT /api/medicines/reminders/:id
// @access  Private (Patient only)
const updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return errorResponse(res, 'Patient profile not found', 404);
    }

    const reminder = await MedicineReminder.findOne({
      _id: id,
      patient: patient._id,
    });

    if (!reminder) {
      return errorResponse(res, 'Reminder not found', 404);
    }

    // Update fields
    Object.keys(updateData).forEach((key) => {
      if (key !== 'patient' && key !== '_id') {
        reminder[key] = updateData[key];
      }
    });

    await reminder.save();

    logger.info(`Medicine reminder updated: ${id}`);

    return successResponse(res, reminder, 'Reminder updated successfully');
  } catch (error) {
    logger.error(`Update reminder error: ${error.message}`);
    return errorResponse(res, 'Failed to update reminder', 500);
  }
};

// @desc    Delete reminder
// @route   DELETE /api/medicines/reminders/:id
// @access  Private (Patient only)
const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return errorResponse(res, 'Patient profile not found', 404);
    }

    const reminder = await MedicineReminder.findOneAndDelete({
      _id: id,
      patient: patient._id,
    });

    if (!reminder) {
      return errorResponse(res, 'Reminder not found', 404);
    }

    // Delete associated logs
    await MedicineLog.deleteMany({ reminder: id });

    logger.info(`Medicine reminder deleted: ${id}`);

    return successResponse(res, null, 'Reminder deleted successfully');
  } catch (error) {
    logger.error(`Delete reminder error: ${error.message}`);
    return errorResponse(res, 'Failed to delete reminder', 500);
  }
};

// @desc    Toggle reminder active status
// @route   PUT /api/medicines/reminders/:id/toggle
// @access  Private (Patient only)
const toggleReminderStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return errorResponse(res, 'Patient profile not found', 404);
    }

    const reminder = await MedicineReminder.findOne({
      _id: id,
      patient: patient._id,
    });

    if (!reminder) {
      return errorResponse(res, 'Reminder not found', 404);
    }

    reminder.isActive = !reminder.isActive;
    await reminder.save();

    return successResponse(
      res,
      reminder,
      `Reminder ${reminder.isActive ? 'activated' : 'deactivated'} successfully`
    );
  } catch (error) {
    logger.error(`Toggle reminder status error: ${error.message}`);
    return errorResponse(res, 'Failed to toggle reminder status', 500);
  }
};

// @desc    Log medicine intake
// @route   POST /api/medicines/reminders/:id/log
// @access  Private (Patient only)
const logMedicineIntake = async (req, res) => {
  try {
    const { id } = req.params;
    const { logId, status, notes } = req.body;

    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return errorResponse(res, 'Patient profile not found', 404);
    }

    const reminder = await MedicineReminder.findOne({
      _id: id,
      patient: patient._id,
    });

    if (!reminder) {
      return errorResponse(res, 'Reminder not found', 404);
    }

    // Find the log entry
    const log = await MedicineLog.findOne({
      _id: logId,
      reminder: id,
      patient: patient._id,
    });

    if (!log) {
      return errorResponse(res, 'Log entry not found', 404);
    }

    // Update log
    log.status = status;
    log.takenTime = status === 'taken' ? new Date() : null;
    log.notes = notes;
    await log.save();

    // Update reminder stats
    if (status === 'taken') {
      reminder.completedDoses += 1;
    } else if (status === 'missed') {
      reminder.missedDoses += 1;
    }

    // Recalculate adherence rate
    const totalDoses = reminder.completedDoses + reminder.missedDoses;
    reminder.adherenceRate = totalDoses > 0 ? Math.round((reminder.completedDoses / totalDoses) * 100) : 100;

    await reminder.save();

    logger.info(`Medicine intake logged: ${logId} - Status: ${status}`);

    return successResponse(res, { log, reminder }, 'Medicine intake logged successfully');
  } catch (error) {
    logger.error(`Log medicine intake error: ${error.message}`);
    return errorResponse(res, 'Failed to log medicine intake', 500);
  }
};

// @desc    Get adherence report
// @route   GET /api/medicines/adherence
// @access  Private (Patient only)
const getAdherenceReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return errorResponse(res, 'Patient profile not found', 404);
    }

    // Get all reminders with adherence data
    const reminders = await MedicineReminder.find({ patient: patient._id });

    // Get logs for date range
    const dateQuery = { patient: patient._id };
    if (startDate) dateQuery.scheduledTime = { $gte: new Date(startDate) };
    if (endDate) {
      dateQuery.scheduledTime = dateQuery.scheduledTime || {};
      dateQuery.scheduledTime.$lte = new Date(endDate);
    }

    const logs = await MedicineLog.find(dateQuery).sort({ scheduledTime: -1 });

    // Calculate overall adherence
    const totalLogs = logs.length;
    const takenLogs = logs.filter((log) => log.status === 'taken').length;
    const overallAdherence = totalLogs > 0 ? Math.round((takenLogs / totalLogs) * 100) : 0;

    // Daily adherence breakdown
    const dailyAdherence = {};
    logs.forEach((log) => {
      const date = log.scheduledTime.toISOString().split('T')[0];
      if (!dailyAdherence[date]) {
        dailyAdherence[date] = { total: 0, taken: 0 };
      }
      dailyAdherence[date].total += 1;
      if (log.status === 'taken') {
        dailyAdherence[date].taken += 1;
      }
    });

    // Calculate daily percentages
    Object.keys(dailyAdherence).forEach((date) => {
      const day = dailyAdherence[date];
      day.adherence = Math.round((day.taken / day.total) * 100);
    });

    return successResponse(res, {
      overallAdherence,
      totalReminders: reminders.length,
      activeReminders: reminders.filter((r) => r.isActive).length,
      totalDoses: totalLogs,
      takenDoses: takenLogs,
      missedDoses: logs.filter((log) => log.status === 'missed').length,
      skippedDoses: logs.filter((log) => log.status === 'skipped').length,
      dailyAdherence,
      reminders: reminders.map((r) => ({
        id: r._id,
        medicineName: r.medicineName,
        adherenceRate: r.adherenceRate,
        completedDoses: r.completedDoses,
        missedDoses: r.missedDoses,
      })),
    });
  } catch (error) {
    logger.error(`Get adherence report error: ${error.message}`);
    return errorResponse(res, 'Failed to get adherence report', 500);
  }
};

// @desc    Get today's medicine schedule
// @route   GET /api/medicines/today
// @access  Private (Patient only)
const getTodaySchedule = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return errorResponse(res, 'Patient profile not found', 404);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const logs = await MedicineLog.find({
      patient: patient._id,
      scheduledTime: { $gte: today, $lt: tomorrow },
    }).populate('reminder', 'medicineName dosage instructions');

    // Group by status
    const pending = logs.filter((log) => log.status === 'pending');
    const taken = logs.filter((log) => log.status === 'taken');
    const missed = logs.filter((log) => log.status === 'missed');

    return successResponse(res, {
      date: today,
      total: logs.length,
      pending,
      taken,
      missed,
      completed: taken.length,
      completionRate: logs.length > 0 ? Math.round((taken.length / logs.length) * 100) : 0,
    });
  } catch (error) {
    logger.error(`Get today schedule error: ${error.message}`);
    return errorResponse(res, 'Failed to get today schedule', 500);
  }
};

module.exports = {
  createReminder,
  getReminders,
  getReminderById,
  updateReminder,
  deleteReminder,
  toggleReminderStatus,
  logMedicineIntake,
  getAdherenceReport,
  getTodaySchedule,
};
