const cron = require('node-cron');
const { MedicineReminder, MedicineLog, User } = require('../models');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

// Start the reminder scheduler
const startReminderScheduler = () => {
  // Run every minute to check for reminders
  cron.schedule('* * * * *', async () => {
    try {
      await checkAndSendReminders();
    } catch (error) {
      logger.error(`Reminder scheduler error: ${error.message}`);
    }
  });

  logger.info('Medicine reminder scheduler started');
};

// Check and send reminders
const checkAndSendReminders = async () => {
  const now = new Date();
  const reminderWindow = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes ahead

  // Find pending medicine logs that need reminders
  const pendingLogs = await MedicineLog.find({
    status: 'pending',
    scheduledTime: { $lte: reminderWindow, $gte: now },
    reminderSent: false,
  }).populate([
    { path: 'reminder', select: 'medicineName dosage instructions reminderMethods emailReminderTime' },
    { path: 'patient', populate: { path: 'user', select: 'firstName lastName email' } },
  ]);

  for (const log of pendingLogs) {
    try {
      const reminder = log.reminder;
      const user = log.patient.user;

      // Check if email reminder is enabled
      if (reminder.reminderMethods.includes('email')) {
        await emailService.sendMedicineReminder(user, reminder, log);
        logger.info(`Medicine reminder sent to ${user.email} for ${reminder.medicineName}`);
      }

      // Mark reminder as sent
      log.reminderSent = true;
      log.reminderSentAt = new Date();
      await log.save();
    } catch (error) {
      logger.error(`Failed to send reminder for log ${log._id}: ${error.message}`);
    }
  }
};

// Check for missed doses and mark them
const checkMissedDoses = async () => {
  const now = new Date();
  const gracePeriod = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes grace period

  // Find logs that are still pending and past the grace period
  const missedLogs = await MedicineLog.find({
    status: 'pending',
    scheduledTime: { $lt: gracePeriod },
  }).populate('reminder');

  for (const log of missedLogs) {
    try {
      log.status = 'missed';
      await log.save();

      // Update reminder stats
      if (log.reminder) {
        log.reminder.missedDoses += 1;
        await log.reminder.save();
      }

      logger.info(`Marked dose as missed: ${log._id}`);
    } catch (error) {
      logger.error(`Failed to mark missed dose ${log._id}: ${error.message}`);
    }
  }
};

// Schedule missed dose checker (run every 15 minutes)
cron.schedule('*/15 * * * *', async () => {
  try {
    await checkMissedDoses();
  } catch (error) {
    logger.error(`Missed dose checker error: ${error.message}`);
  }
});

module.exports = {
  startReminderScheduler,
  checkAndSendReminders,
  checkMissedDoses,
};
