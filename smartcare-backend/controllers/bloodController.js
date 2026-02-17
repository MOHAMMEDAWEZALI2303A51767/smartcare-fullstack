const { BloodDonor, BloodRequest, User, Patient } = require('../models');
const logger = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { BLOOD_TYPES, URGENCY_LEVELS } = require('../config/constants');
const emailService = require('../services/emailService');

// @desc    Register as blood donor
// @route   POST /api/blood-donation/donor/register
// @access  Private
const registerAsDonor = async (req, res) => {
  try {
    const {
      bloodType,
      location,
      preferredRadius,
      canTravel,
      healthConditions,
      weight,
      age,
      contactPreference,
      emergencyOnly,
    } = req.body;

    // Check if already registered as donor
    const existingDonor = await BloodDonor.findOne({ user: req.user._id });
    if (existingDonor) {
      return errorResponse(res, 'You are already registered as a donor', 400);
    }

    const donor = await BloodDonor.create({
      user: req.user._id,
      bloodType,
      location,
      preferredRadius: preferredRadius || 10,
      canTravel: canTravel !== undefined ? canTravel : true,
      healthConditions: healthConditions || [],
      weight,
      age,
      contactPreference: contactPreference || 'any',
      emergencyOnly: emergencyOnly || false,
    });

    // Check eligibility
    donor.checkEligibility();
    await donor.save();

    logger.info(`New blood donor registered: ${req.user._id}`);

    return successResponse(res, donor, 'Registered as blood donor successfully', 201);
  } catch (error) {
    logger.error(`Register as donor error: ${error.message}`);
    return errorResponse(res, 'Failed to register as donor', 500);
  }
};

// @desc    Get donor profile
// @route   GET /api/blood-donation/donor/profile
// @access  Private (Donor only)
const getDonorProfile = async (req, res) => {
  try {
    const donor = await BloodDonor.findOne({ user: req.user._id }).populate(
      'user',
      'firstName lastName email phoneNumber'
    );

    if (!donor) {
      return errorResponse(res, 'Donor profile not found', 404);
    }

    return successResponse(res, donor);
  } catch (error) {
    logger.error(`Get donor profile error: ${error.message}`);
    return errorResponse(res, 'Failed to get donor profile', 500);
  }
};

// @desc    Update donor profile
// @route   PUT /api/blood-donation/donor/profile
// @access  Private (Donor only)
const updateDonorProfile = async (req, res) => {
  try {
    const donor = await BloodDonor.findOne({ user: req.user._id });

    if (!donor) {
      return errorResponse(res, 'Donor profile not found', 404);
    }

    const updateFields = [
      'bloodType',
      'location',
      'preferredRadius',
      'canTravel',
      'healthConditions',
      'weight',
      'age',
      'contactPreference',
      'emergencyOnly',
      'notificationsEnabled',
    ];

    updateFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        donor[field] = req.body[field];
      }
    });

    // Recheck eligibility
    donor.checkEligibility();
    await donor.save();

    logger.info(`Donor profile updated: ${donor._id}`);

    return successResponse(res, donor, 'Donor profile updated successfully');
  } catch (error) {
    logger.error(`Update donor profile error: ${error.message}`);
    return errorResponse(res, 'Failed to update donor profile', 500);
  }
};

// @desc    Update donor availability
// @route   PUT /api/blood-donation/donor/availability
// @access  Private (Donor only)
const updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;

    const donor = await BloodDonor.findOne({ user: req.user._id });

    if (!donor) {
      return errorResponse(res, 'Donor profile not found', 404);
    }

    donor.isAvailable = isAvailable;
    await donor.save();

    return successResponse(
      res,
      donor,
      `You are now ${isAvailable ? 'available' : 'unavailable'} for donations`
    );
  } catch (error) {
    logger.error(`Update availability error: ${error.message}`);
    return errorResponse(res, 'Failed to update availability', 500);
  }
};

// @desc    Get donor donation history
// @route   GET /api/blood-donation/donor/history
// @access  Private (Donor only)
const getDonorHistory = async (req, res) => {
  try {
    const donor = await BloodDonor.findOne({ user: req.user._id });

    if (!donor) {
      return errorResponse(res, 'Donor profile not found', 404);
    }

    return successResponse(res, {
      totalDonations: donor.totalDonations,
      lastDonationDate: donor.lastDonationDate,
      donationHistory: donor.donationHistory,
    });
  } catch (error) {
    logger.error(`Get donor history error: ${error.message}`);
    return errorResponse(res, 'Failed to get donation history', 500);
  }
};

// @desc    Create blood request
// @route   POST /api/blood-donation/requests
// @access  Private
const createBloodRequest = async (req, res) => {
  try {
    const {
      patientName,
      bloodType,
      unitsNeeded,
      urgency,
      hospitalName,
      hospitalAddress,
      location,
      reason,
      requiredBy,
    } = req.body;

    const request = await BloodRequest.create({
      requester: {
        type: 'individual',
        user: req.user._id,
        contactName: req.user.fullName || req.user.firstName + ' ' + req.user.lastName,
        contactPhone: req.user.phoneNumber,
        contactEmail: req.user.email,
      },
      patientName,
      bloodType,
      unitsNeeded,
      urgency: urgency || URGENCY_LEVELS.NORMAL,
      hospitalName,
      hospitalAddress,
      location,
      reason,
      requiredBy: new Date(requiredBy),
      isEmergency: urgency === URGENCY_LEVELS.EMERGENCY,
    });

    // Find and notify matching donors
    await notifyMatchingDonors(request);

    logger.info(`Blood request created: ${request.requestNumber}`);

    return successResponse(res, request, 'Blood request created successfully', 201);
  } catch (error) {
    logger.error(`Create blood request error: ${error.message}`);
    return errorResponse(res, 'Failed to create blood request', 500);
  }
};

// Helper function to notify matching donors
const notifyMatchingDonors = async (request) => {
  try {
    const compatibleTypes = BloodRequest.getCompatibleBloodTypes(request.bloodType);

    const matchingDonors = await BloodDonor.find({
      bloodType: { $in: compatibleTypes },
      isAvailable: true,
      isEligible: true,
      notificationsEnabled: true,
      $or: [
        { emergencyOnly: false },
        { emergencyOnly: true, isEmergency: request.isEmergency },
      ],
      location: {
        $near: {
          $geometry: request.location,
          $maxDistance: 50000, // 50km
        },
      },
    }).limit(20);

    // Add donors to matched list
    for (const donor of matchingDonors) {
      request.matchedDonors.push({
        donor: donor._id,
        status: 'invited',
      });

      // Send notification email
      try {
        const user = await User.findById(donor.user);
        await emailService.sendBloodRequestNotification(user, request);
      } catch (emailError) {
        logger.error(`Failed to send blood request notification: ${emailError.message}`);
      }
    }

    await request.save();
  } catch (error) {
    logger.error(`Notify matching donors error: ${error.message}`);
  }
};

// @desc    Get all blood requests
// @route   GET /api/blood-donation/requests
// @access  Public
const getBloodRequests = async (req, res) => {
  try {
    const { status, bloodType, urgency, page = 1, limit = 10, myRequests } = req.query;

    const query = {};

    if (status) query.status = status;
    if (bloodType) query.bloodType = bloodType;
    if (urgency) query.urgency = urgency;

    // Filter for user's own requests
    if (myRequests === 'true') {
      query['requester.user'] = req.user._id;
    }

    const requests = await BloodRequest.find(query)
      .populate('matchedDonors.donor', 'user bloodType')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await BloodRequest.countDocuments(query);

    return successResponse(res, {
      requests,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error(`Get blood requests error: ${error.message}`);
    return errorResponse(res, 'Failed to get blood requests', 500);
  }
};

// @desc    Get blood request by ID
// @route   GET /api/blood-donation/requests/:id
// @access  Public
const getBloodRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await BloodRequest.findById(id).populate({
      path: 'matchedDonors.donor',
      populate: {
        path: 'user',
        select: 'firstName lastName phoneNumber',
      },
    });

    if (!request) {
      return errorResponse(res, 'Blood request not found', 404);
    }

    // Increment views
    request.views += 1;
    await request.save();

    return successResponse(res, request);
  } catch (error) {
    logger.error(`Get blood request by ID error: ${error.message}`);
    return errorResponse(res, 'Failed to get blood request', 500);
  }
};

// @desc    Respond to blood request (Donor)
// @route   PUT /api/blood-donation/requests/:id/respond
// @access  Private (Donor only)
const respondToRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { response, notes } = req.body; // 'accepted' or 'declined'

    const donor = await BloodDonor.findOne({ user: req.user._id });
    if (!donor) {
      return errorResponse(res, 'Donor profile not found', 404);
    }

    const request = await BloodRequest.findById(id);
    if (!request) {
      return errorResponse(res, 'Blood request not found', 404);
    }

    // Find donor in matched list
    const matchedDonor = request.matchedDonors.find(
      (md) => md.donor.toString() === donor._id.toString()
    );

    if (!matchedDonor) {
      return errorResponse(res, 'You were not invited to this request', 403);
    }

    matchedDonor.status = response;
    matchedDonor.respondedAt = new Date();
    matchedDonor.notes = notes;

    await request.save();

    // Notify requester
    try {
      const requester = await User.findById(request.requester.user);
      await emailService.sendDonorResponseNotification(requester, donor, request, response);
    } catch (emailError) {
      logger.error(`Failed to send donor response notification: ${emailError.message}`);
    }

    logger.info(`Donor ${donor._id} ${response} request ${id}`);

    return successResponse(res, request, `Request ${response} successfully`);
  } catch (error) {
    logger.error(`Respond to request error: ${error.message}`);
    return errorResponse(res, 'Failed to respond to request', 500);
  }
};

// @desc    Mark blood request as fulfilled
// @route   PUT /api/blood-donation/requests/:id/fulfill
// @access  Private
const fulfillRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { unitsReceived } = req.body;

    const request = await BloodRequest.findById(id);
    if (!request) {
      return errorResponse(res, 'Blood request not found', 404);
    }

    // Check if user is the requester
    if (request.requester.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }

    request.unitsReceived = unitsReceived || request.unitsNeeded;
    request.status = request.unitsReceived >= request.unitsNeeded ? 'fulfilled' : 'partially_fulfilled';

    await request.save();

    // Update donor histories for accepted donors
    const acceptedDonors = request.matchedDonors.filter((md) => md.status === 'accepted');
    for (const matchedDonor of acceptedDonors) {
      const donor = await BloodDonor.findById(matchedDonor.donor);
      if (donor) {
        await donor.recordDonation({
          date: new Date(),
          units: 1,
          location: request.hospitalName,
          request: request._id,
        });

        matchedDonor.status = 'donated';
      }
    }

    await request.save();

    logger.info(`Blood request fulfilled: ${id}`);

    return successResponse(res, request, 'Blood request marked as fulfilled');
  } catch (error) {
    logger.error(`Fulfill request error: ${error.message}`);
    return errorResponse(res, 'Failed to fulfill request', 500);
  }
};

// @desc    Find nearby donors
// @route   GET /api/blood-donation/donors/nearby
// @access  Private
const findNearbyDonors = async (req, res) => {
  try {
    const { longitude, latitude, radius = 10, bloodType } = req.query;

    if (!longitude || !latitude) {
      return errorResponse(res, 'Longitude and latitude are required', 400);
    }

    const query = {
      isAvailable: true,
      isEligible: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: radius * 1000, // Convert km to meters
        },
      },
    };

    if (bloodType) {
      query.bloodType = bloodType;
    }

    const donors = await BloodDonor.find(query).populate(
      'user',
      'firstName lastName phoneNumber'
    );

    return successResponse(res, { donors, count: donors.length });
  } catch (error) {
    logger.error(`Find nearby donors error: ${error.message}`);
    return errorResponse(res, 'Failed to find nearby donors', 500);
  }
};

// @desc    Get blood compatibility info
// @route   GET /api/blood-donation/compatibility
// @access  Public
const getBloodCompatibility = async (req, res) => {
  try {
    const compatibility = {
      'A+': { canReceiveFrom: ['A+', 'A-', 'O+', 'O-'], canDonateTo: ['A+', 'AB+'] },
      'A-': { canReceiveFrom: ['A-', 'O-'], canDonateTo: ['A+', 'A-', 'AB+', 'AB-'] },
      'B+': { canReceiveFrom: ['B+', 'B-', 'O+', 'O-'], canDonateTo: ['B+', 'AB+'] },
      'B-': { canReceiveFrom: ['B-', 'O-'], canDonateTo: ['B+', 'B-', 'AB+', 'AB-'] },
      'AB+': {
        canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        canDonateTo: ['AB+'],
      },
      'AB-': { canReceiveFrom: ['A-', 'B-', 'AB-', 'O-'], canDonateTo: ['AB+', 'AB-'] },
      'O+': { canReceiveFrom: ['O+', 'O-'], canDonateTo: ['A+', 'B+', 'AB+', 'O+'] },
      'O-': { canReceiveFrom: ['O-'], canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    };

    return successResponse(res, { compatibility, bloodTypes: BLOOD_TYPES });
  } catch (error) {
    logger.error(`Get blood compatibility error: ${error.message}`);
    return errorResponse(res, 'Failed to get blood compatibility info', 500);
  }
};

module.exports = {
  registerAsDonor,
  getDonorProfile,
  updateDonorProfile,
  updateAvailability,
  getDonorHistory,
  createBloodRequest,
  getBloodRequests,
  getBloodRequestById,
  respondToRequest,
  fulfillRequest,
  findNearbyDonors,
  getBloodCompatibility,
};
