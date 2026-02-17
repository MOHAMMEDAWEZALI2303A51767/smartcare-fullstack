const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send email helper
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const message = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(message);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Email send error: ${error.message}`);
    throw error;
  }
};

// Send verification email
const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;

  const message = {
    to: user.email,
    subject: 'Verify Your Email - SmartCare',
    text: `Please verify your email by clicking: ${verificationUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to SmartCare!</h2>
        <p>Hi ${user.firstName},</p>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
        <p>Or copy and paste this link:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">If you didn't create an account, please ignore this email.</p>
      </div>
    `,
  };

  return await sendEmail(message);
};

// Send password reset email
const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

  const message = {
    to: user.email,
    subject: 'Password Reset Request - SmartCare',
    text: `Reset your password by clicking: ${resetUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset</h2>
        <p>Hi ${user.firstName},</p>
        <p>You requested a password reset. Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
        <p>Or copy and paste this link:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  return await sendEmail(message);
};

// Send appointment confirmation
const sendAppointmentConfirmation = async (appointment) => {
  const { patient, doctor, scheduledDate, startTime, type, appointmentNumber } = appointment;

  const formattedDate = new Date(scheduledDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const message = {
    to: patient.user.email,
    subject: 'Appointment Confirmed - SmartCare',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Appointment Confirmed</h2>
        <p>Hi ${patient.user.firstName},</p>
        <p>Your appointment has been confirmed with the following details:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Appointment Number:</strong> ${appointmentNumber}</p>
          <p><strong>Doctor:</strong> Dr. ${doctor.user.firstName} ${doctor.user.lastName}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${startTime}</p>
          <p><strong>Type:</strong> ${type === 'telemedicine' ? 'Video Consultation' : 'In-Person Visit'}</p>
        </div>
        <p>Please arrive 15 minutes early for in-person visits.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">Need to reschedule? Log in to your SmartCare account.</p>
      </div>
    `,
  };

  await sendEmail(message);

  // Also send to doctor
  const doctorMessage = {
    to: doctor.user.email,
    subject: 'New Appointment Booked - SmartCare',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Appointment</h2>
        <p>Hi Dr. ${doctor.user.firstName},</p>
        <p>A new appointment has been booked with you:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Patient:</strong> ${patient.user.firstName} ${patient.user.lastName}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${startTime}</p>
          <p><strong>Type:</strong> ${type === 'telemedicine' ? 'Video Consultation' : 'In-Person Visit'}</p>
        </div>
        <p>Please confirm this appointment in your dashboard.</p>
      </div>
    `,
  };

  await sendEmail(doctorMessage);
};

// Send appointment cancellation
const sendAppointmentCancellation = async (appointment) => {
  const { patient, doctor, scheduledDate, startTime, cancellationReason, cancelledBy } = appointment;

  const formattedDate = new Date(scheduledDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const message = {
    to: patient.user.email,
    subject: 'Appointment Cancelled - SmartCare',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Appointment Cancelled</h2>
        <p>Hi ${patient.user.firstName},</p>
        <p>Your appointment scheduled for ${formattedDate} at ${startTime} has been cancelled.</p>
        ${cancellationReason ? `<p><strong>Reason:</strong> ${cancellationReason}</p>` : ''}
        <p>Cancelled by: ${cancelledBy}</p>
        <p>You can book a new appointment through your SmartCare dashboard.</p>
      </div>
    `,
  };

  await sendEmail(message);

  // Notify doctor if cancelled by patient
  if (cancelledBy === 'patient') {
    const doctorMessage = {
      to: doctor.user.email,
      subject: 'Appointment Cancelled by Patient - SmartCare',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Appointment Cancelled</h2>
          <p>Hi Dr. ${doctor.user.firstName},</p>
          <p>An appointment has been cancelled by the patient:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Patient:</strong> ${patient.user.firstName} ${patient.user.lastName}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Time:</strong> ${startTime}</p>
          </div>
        </div>
      `,
    };

    await sendEmail(doctorMessage);
  }
};

// Send appointment rescheduled notification
const sendAppointmentRescheduled = async (appointment) => {
  const { patient, doctor, scheduledDate, startTime } = appointment;

  const formattedDate = new Date(scheduledDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const message = {
    to: patient.user.email,
    subject: 'Appointment Rescheduled - SmartCare',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Appointment Rescheduled</h2>
        <p>Hi ${patient.user.firstName},</p>
        <p>Your appointment has been rescheduled to:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>New Date:</strong> ${formattedDate}</p>
          <p><strong>New Time:</strong> ${startTime}</p>
          <p><strong>Doctor:</strong> Dr. ${doctor.user.firstName} ${doctor.user.lastName}</p>
        </div>
      </div>
    `,
  };

  await sendEmail(message);
};

// Send medicine reminder email
const sendMedicineReminder = async (user, reminder, log) => {
  const message = {
    to: user.email,
    subject: `Medicine Reminder: ${reminder.medicineName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Time to Take Your Medicine</h2>
        <p>Hi ${user.firstName},</p>
        <p>It's time to take your medication:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Medicine:</strong> ${reminder.medicineName}</p>
          <p><strong>Dosage:</strong> ${reminder.dosage}</p>
          <p><strong>Scheduled Time:</strong> ${new Date(log.scheduledTime).toLocaleTimeString()}</p>
          ${reminder.instructions ? `<p><strong>Instructions:</strong> ${reminder.instructions}</p>` : ''}
        </div>
        <a href="${process.env.CLIENT_URL}/medicine-reminders" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 5px;">Mark as Taken</a>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">Stay healthy and follow your prescribed schedule.</p>
      </div>
    `,
  };

  return await sendEmail(message);
};

// Send blood request notification to donor
const sendBloodRequestNotification = async (user, request) => {
  const urgencyColor = {
    normal: '#10b981',
    urgent: '#f59e0b',
    critical: '#ef4444',
    emergency: '#dc2626',
  };

  const message = {
    to: user.email,
    subject: `Urgent: Blood Donation Needed - ${request.bloodType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${urgencyColor[request.urgency]};">Blood Donation Request</h2>
        <p>Hi ${user.firstName},</p>
        <p>Someone in your area needs blood donation:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Blood Type:</strong> ${request.bloodType}</p>
          <p><strong>Units Needed:</strong> ${request.unitsNeeded}</p>
          <p><strong>Urgency:</strong> ${request.urgency.toUpperCase()}</p>
          <p><strong>Hospital:</strong> ${request.hospitalName}</p>
          <p><strong>Location:</strong> ${request.hospitalAddress.city}, ${request.hospitalAddress.state}</p>
          <p><strong>Required By:</strong> ${new Date(request.requiredBy).toLocaleDateString()}</p>
          <p><strong>Reason:</strong> ${request.reason}</p>
        </div>
        <a href="${process.env.CLIENT_URL}/blood-donation/requests/${request._id}" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 5px;">Respond to Request</a>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">Thank you for being a lifesaver!</p>
      </div>
    `,
  };

  return await sendEmail(message);
};

// Send donor response notification to requester
const sendDonorResponseNotification = async (requester, donor, request, response) => {
  const donorUser = await User.findById(donor.user);

  const message = {
    to: requester.email,
    subject: `Donor ${response === 'accepted' ? 'Accepted' : 'Declined'} Your Request`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${response === 'accepted' ? '#10b981' : '#6b7280'};">
          Donor ${response === 'accepted' ? 'Accepted' : 'Declined'} Your Request
        </h2>
        <p>Hi ${requester.firstName},</p>
        <p>A donor has ${response} your blood request:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Donor:</strong> ${donorUser.firstName} ${donorUser.lastName}</p>
          <p><strong>Blood Type:</strong> ${donor.bloodType}</p>
          <p><strong>Response:</strong> ${response.toUpperCase()}</p>
          ${response === 'accepted' ? `<p><strong>Contact:</strong> ${donorUser.phoneNumber || 'Available in dashboard'}</p>` : ''}
        </div>
        ${response === 'accepted' ? '<p>The donor will contact you soon to coordinate the donation.</p>' : '<p>We are notifying other matching donors.</p>'}
      </div>
    `,
  };

  return await sendEmail(message);
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAppointmentConfirmation,
  sendAppointmentCancellation,
  sendAppointmentRescheduled,
  sendMedicineReminder,
  sendBloodRequestNotification,
  sendDonorResponseNotification,
};
