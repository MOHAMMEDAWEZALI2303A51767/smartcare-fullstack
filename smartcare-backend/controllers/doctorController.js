const { Doctor, User, Appointment, Review } = require('../models');
const logger = require('../utils/logger');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');
const { VERIFICATION_STATUS } = require('../config/constants');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
const getAllDoctors = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      specialization,
      search,
      minRating,
      maxFee,
      availableForTelemedicine,
      isAcceptingPatients,
      sortBy = 'rating',
    } = req.query;

    const query = {
      verificationStatus: VERIFICATION_STATUS.VERIFIED,
    };

    if (specialization) query.specialization = specialization;
    if (minRating) query.rating = { $gte: parseFloat(minRating) };
    if (maxFee) query.consultationFee = { $lte: parseFloat(maxFee) };
    if (availableForTelemedicine !== undefined)
      query.isAvailableForTelemedicine = availableForTelemedicine === 'true';
    if (isAcceptingPatients !== undefined)
      query.isAcceptingPatients = isAcceptingPatients === 'true';

    // Search by name or about
    let userQuery = {};
    if (search) {
      const users = await User.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
        ],
        role: 'doctor',
      }).select('_id');

      const userIds = users.map((u) => u._id);
      query.$or = [{ user: { $in: userIds } }, { about: { $regex: search, $options: 'i' } }];
    }

    // Sort options
    const sortOptions = {};
    if (sortBy === 'rating') sortOptions.rating = -1;
    else if (sortBy === 'experience') sortOptions.experience = -1;
    else if (sortBy === 'fee_low') sortOptions.consultationFee = 1;
    else if (sortBy === 'fee_high') sortOptions.consultationFee = -1;

    const doctors = await Doctor.find(query)
      .populate('user', 'firstName lastName email profilePicture phoneNumber')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOptions);

    const count = await Doctor.countDocuments(query);

    return successResponse(res, {
      doctors,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error(`Get all doctors error: ${error.message}`);
    return errorResponse(res, 'Failed to get doctors', 500);
  }
};

// @desc    Get doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id).populate(
      'user',
      'firstName lastName email profilePicture phoneNumber'
    );

    if (!doctor) {
      return errorResponse(res, 'Doctor not found', 404);
    }

    return successResponse(res, doctor);
  } catch (error) {
    logger.error(`Get doctor by ID error: ${error.message}`);
    return errorResponse(res, 'Failed to get doctor', 500);
  }
};

// @desc    Get doctor availability
// @route   GET /api/doctors/:id/availability
// @access  Public
const getDoctorAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return errorResponse(res, 'Doctor not found', 404);
    }

    // Get day of week
    const queryDate = date ? new Date(date) : new Date();
    const dayOfWeek = queryDate.toLocaleDateString('en-US', { weekday: 'lowercase' });

    // Get doctor's availability for that day
    const availability = doctor.availability[dayOfWeek] || [];

    // Get booked appointments for that date
    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      doctor: id,
      scheduledDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['pending', 'confirmed'] },
    }).select('startTime endTime');

    const bookedSlots = bookedAppointments.map((apt) => ({
      start: apt.startTime,
      end: apt.endTime,
    }));

    // Calculate available slots
    const availableSlots = [];
    const duration = doctor.consultationDuration || 30;

    availability.forEach((slot) => {
      const start = new Date(`2000-01-01T${slot.start}`);
      const end = new Date(`2000-01-01T${slot.end}`);

      while (start < end) {
        const slotStart = start.toTimeString().slice(0, 5);
        const slotEnd = new Date(start.getTime() + duration * 60000)
          .toTimeString()
          .slice(0, 5);

        // Check if slot is booked
        const isBooked = bookedSlots.some(
          (booked) => slotStart >= booked.start && slotStart < booked.end
        );

        if (!isBooked) {
          availableSlots.push({
            start: slotStart,
            end: slotEnd,
          });
        }

        start.setMinutes(start.getMinutes() + duration);
      }
    });

    return successResponse(res, {
      date: queryDate,
      dayOfWeek,
      availableSlots,
      bookedSlots,
    });
  } catch (error) {
    logger.error(`Get doctor availability error: ${error.message}`);
    return errorResponse(res, 'Failed to get availability', 500);
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
// @access  Private (Doctor only)
const updateDoctorProfile = async (req, res) => {
  try {
    const {
      specialization,
      subSpecializations,
      qualifications,
      experience,
      about,
      languages,
      consultationFee,
      followUpFee,
      hospitalAffiliations,
      education,
      awards,
    } = req.body;

    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
      return errorResponse(res, 'Doctor profile not found', 404);
    }

    // Update fields
    if (specialization) doctor.specialization = specialization;
    if (subSpecializations) doctor.subSpecializations = subSpecializations;
    if (qualifications) doctor.qualifications = qualifications;
    if (experience) doctor.experience = experience;
    if (about) doctor.about = about;
    if (languages) doctor.languages = languages;
    if (consultationFee) doctor.consultationFee = consultationFee;
    if (followUpFee) doctor.followUpFee = followUpFee;
    if (hospitalAffiliations) doctor.hospitalAffiliations = hospitalAffiliations;
    if (education) doctor.education = education;
    if (awards) doctor.awards = awards;

    await doctor.save();

    logger.info(`Doctor profile updated: ${req.user._id}`);

    return successResponse(res, doctor, 'Doctor profile updated successfully');
  } catch (error) {
    logger.error(`Update doctor profile error: ${error.message}`);
    return errorResponse(res, 'Failed to update doctor profile', 500);
  }
};

// @desc    Update doctor availability
// @route   PUT /api/doctors/availability
// @access  Private (Doctor only)
const updateAvailability = async (req, res) => {
  try {
    const { availability, consultationDuration, isAvailableForTelemedicine, isAcceptingPatients } = req.body;

    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
      return errorResponse(res, 'Doctor profile not found', 404);
    }

    if (availability) doctor.availability = availability;
    if (consultationDuration) doctor.consultationDuration = consultationDuration;
    if (isAvailableForTelemedicine !== undefined)
      doctor.isAvailableForTelemedicine = isAvailableForTelemedicine;
    if (isAcceptingPatients !== undefined) doctor.isAcceptingPatients = isAcceptingPatients;

    await doctor.save();

    logger.info(`Doctor availability updated: ${req.user._id}`);

    return successResponse(res, doctor.availability, 'Availability updated successfully');
  } catch (error) {
    logger.error(`Update availability error: ${error.message}`);
    return errorResponse(res, 'Failed to update availability', 500);
  }
};

// @desc    Get doctor dashboard
// @route   GET /api/doctors/dashboard
// @access  Private (Doctor only)
const getDoctorDashboard = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
      return errorResponse(res, 'Doctor profile not found', 404);
    }

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await Appointment.find({
      doctor: doctor._id,
      scheduledDate: { $gte: today, $lt: tomorrow },
      status: { $in: ['pending', 'confirmed'] },
    }).populate('patient', 'user');

    // Get upcoming appointments
    const upcomingAppointments = await Appointment.find({
      doctor: doctor._id,
      scheduledDate: { $gte: new Date() },
      status: { $in: ['pending', 'confirmed'] },
    })
      .populate('patient', 'user')
      .sort({ scheduledDate: 1 })
      .limit(5);

    // Get total patients
    const totalPatients = await Appointment.distinct('patient', {
      doctor: doctor._id,
      status: 'completed',
    });

    // Get monthly earnings
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyAppointments = await Appointment.find({
      doctor: doctor._id,
      status: 'completed',
      scheduledDate: { $gte: startOfMonth },
    });

    const monthlyEarnings = monthlyAppointments.reduce((sum, apt) => sum + (apt.paymentAmount || 0), 0);

    return successResponse(res, {
      stats: {
        totalPatients: totalPatients.length,
        totalAppointments: doctor.totalPatients,
        rating: doctor.rating,
        totalReviews: doctor.totalReviews,
        monthlyEarnings,
      },
      todayAppointments,
      upcomingAppointments,
    });
  } catch (error) {
    logger.error(`Get doctor dashboard error: ${error.message}`);
    return errorResponse(res, 'Failed to get dashboard', 500);
  }
};

// @desc    Get doctor's patients
// @route   GET /api/doctors/patients
// @access  Private (Doctor only)
const getDoctorPatients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
      return errorResponse(res, 'Doctor profile not found', 404);
    }

    // Get distinct patients who had appointments with this doctor
    const patientQuery = { doctor: doctor._id, status: 'completed' };

    const patientAppointments = await Appointment.find(patientQuery)
      .populate({
        path: 'patient',
        populate: {
          path: 'user',
          select: 'firstName lastName email profilePicture phoneNumber',
        },
      })
      .sort({ scheduledDate: -1 });

    // Get unique patients
    const uniquePatients = [];
    const patientIds = new Set();

    patientAppointments.forEach((apt) => {
      if (!patientIds.has(apt.patient._id.toString())) {
        patientIds.add(apt.patient._id.toString());
        uniquePatients.push({
          patient: apt.patient,
          lastVisit: apt.scheduledDate,
          totalVisits: 1,
        });
      } else {
        const existing = uniquePatients.find((p) => p.patient._id.toString() === apt.patient._id.toString());
        if (existing) {
          existing.totalVisits++;
        }
      }
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedPatients = uniquePatients.slice(startIndex, startIndex + parseInt(limit));

    return successResponse(res, {
      patients: paginatedPatients,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(uniquePatients.length / limit),
        totalItems: uniquePatients.length,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error(`Get doctor patients error: ${error.message}`);
    return errorResponse(res, 'Failed to get patients', 500);
  }
};

// @desc    Get pending doctor verifications (Admin only)
// @route   GET /api/doctors/pending-verification
// @access  Private (Admin only)
const getPendingVerifications = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const doctors = await Doctor.find({
      verificationStatus: VERIFICATION_STATUS.PENDING,
    })
      .populate('user', 'firstName lastName email phoneNumber')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Doctor.countDocuments({
      verificationStatus: VERIFICATION_STATUS.PENDING,
    });

    return successResponse(res, {
      doctors,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error(`Get pending verifications error: ${error.message}`);
    return errorResponse(res, 'Failed to get pending verifications', 500);
  }
};

// @desc    Verify doctor (Admin only)
// @route   PUT /api/doctors/:id/verify
// @access  Private (Admin only)
const verifyDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const doctor = await Doctor.findById(id);

    if (!doctor) {
      return errorResponse(res, 'Doctor not found', 404);
    }

    doctor.verificationStatus = status;
    doctor.licenseVerified = status === VERIFICATION_STATUS.VERIFIED;

    await doctor.save();

    // Send notification to doctor
    // TODO: Implement notification

    logger.info(`Doctor verification updated: ${id} - Status: ${status}`);

    return successResponse(res, doctor, `Doctor ${status} successfully`);
  } catch (error) {
    logger.error(`Verify doctor error: ${error.message}`);
    return errorResponse(res, 'Failed to verify doctor', 500);
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  getDoctorAvailability,
  updateDoctorProfile,
  updateAvailability,
  getDoctorDashboard,
  getDoctorPatients,
  getPendingVerifications,
  verifyDoctor,
};
