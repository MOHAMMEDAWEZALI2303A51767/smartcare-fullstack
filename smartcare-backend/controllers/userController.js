const { User, Patient, Doctor } = require('../models');
const { cloudinary } = require('../config/cloudinary');
const logger = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { ROLES } = require('../config/constants');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    let profile = null;
    if (user.role === ROLES.PATIENT) {
      profile = await Patient.findOne({ user: user._id });
    } else if (user.role === ROLES.DOCTOR) {
      profile = await Doctor.findOne({ user: user._id });
    }

    return successResponse(res, {
      user: user.toPublicProfile(),
      profile,
    });
  } catch (error) {
    logger.error(`Get profile error: ${error.message}`);
    return errorResponse(res, 'Failed to get profile', 500);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, dateOfBirth, gender, address } = req.body;

    const user = await User.findById(req.user._id);

    // Update user fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;
    if (address) user.address = address;

    await user.save();

    logger.info(`Profile updated for user: ${user.email}`);

    return successResponse(res, user.toPublicProfile(), 'Profile updated successfully');
  } catch (error) {
    logger.error(`Update profile error: ${error.message}`);
    return errorResponse(res, 'Failed to update profile', 500);
  }
};

// @desc    Update profile picture
// @route   PUT /api/users/profile-picture
// @access  Private
const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'Please upload an image', 400);
    }

    const user = await User.findById(req.user._id);

    // Delete old image from Cloudinary if exists
    if (user.profilePicture) {
      const publicId = user.profilePicture.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`smartcare/profiles/${publicId}`);
    }

    // Upload new image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'smartcare/profiles',
      width: 400,
      height: 400,
      crop: 'fill',
    });

    user.profilePicture = result.secure_url;
    await user.save();

    logger.info(`Profile picture updated for user: ${user.email}`);

    return successResponse(res, { profilePicture: user.profilePicture }, 'Profile picture updated');
  } catch (error) {
    logger.error(`Update profile picture error: ${error.message}`);
    return errorResponse(res, 'Failed to update profile picture', 500);
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, 'Current password is incorrect', 400);
    }

    // Update password
    user.password = newPassword;
    user.refreshToken = null; // Invalidate all sessions
    await user.save();

    logger.info(`Password changed for user: ${user.email}`);

    return successResponse(res, null, 'Password changed successfully');
  } catch (error) {
    logger.error(`Change password error: ${error.message}`);
    return errorResponse(res, 'Failed to change password', 500);
  }
};

// @desc    Delete account
// @route   DELETE /api/users/profile
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Password is incorrect', 400);
    }

    // Soft delete - deactivate account
    user.isActive = false;
    user.email = `${user.email}.inactive.${Date.now()}`;
    await user.save();

    logger.info(`Account deleted for user: ${user._id}`);

    return successResponse(res, null, 'Account deleted successfully');
  } catch (error) {
    logger.error(`Delete account error: ${error.message}`);
    return errorResponse(res, 'Failed to delete account', 500);
  }
};

// @desc    Update patient medical profile
// @route   PUT /api/users/patient-profile
// @access  Private (Patient only)
const updatePatientProfile = async (req, res) => {
  try {
    const {
      bloodType,
      height,
      weight,
      allergies,
      chronicConditions,
      lifestyle,
      emergencyContact,
      insuranceInfo,
    } = req.body;

    let patient = await Patient.findOne({ user: req.user._id });

    if (!patient) {
      patient = new Patient({ user: req.user._id });
    }

    // Update fields
    if (bloodType) patient.bloodType = bloodType;
    if (height) patient.height = height;
    if (weight) patient.weight = weight;
    if (allergies) patient.allergies = allergies;
    if (chronicConditions) patient.chronicConditions = chronicConditions;
    if (lifestyle) patient.lifestyle = { ...patient.lifestyle, ...lifestyle };
    if (emergencyContact) patient.emergencyContact = emergencyContact;
    if (insuranceInfo) patient.insuranceInfo = insuranceInfo;

    await patient.save();

    logger.info(`Patient profile updated for user: ${req.user._id}`);

    return successResponse(res, patient, 'Patient profile updated successfully');
  } catch (error) {
    logger.error(`Update patient profile error: ${error.message}`);
    return errorResponse(res, 'Failed to update patient profile', 500);
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search, isActive } = req.query;

    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    return successResponse(
      res,
      {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
      'Users retrieved successfully'
    );
  } catch (error) {
    logger.error(`Get all users error: ${error.message}`);
    return errorResponse(res, 'Failed to get users', 500);
  }
};

// @desc    Toggle user status (Admin only)
// @route   PUT /api/users/:id/status
// @access  Private (Admin only)
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    user.isActive = !user.isActive;
    await user.save();

    logger.info(`User status toggled: ${user.email} - Active: ${user.isActive}`);

    return successResponse(
      res,
      { isActive: user.isActive },
      `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
    );
  } catch (error) {
    logger.error(`Toggle user status error: ${error.message}`);
    return errorResponse(res, 'Failed to toggle user status', 500);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateProfilePicture,
  changePassword,
  deleteAccount,
  updatePatientProfile,
  getAllUsers,
  toggleUserStatus,
};
