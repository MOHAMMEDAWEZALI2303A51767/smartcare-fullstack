const mongoose = require('mongoose');
const { VERIFICATION_STATUS } = require('../config/constants');

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
    },
    subSpecializations: [String],
    qualifications: [
      {
        degree: {
          type: String,
          required: true,
        },
        institution: {
          type: String,
          required: true,
        },
        year: {
          type: Number,
          required: true,
        },
        certificateUrl: String,
      },
    ],
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      unique: true,
    },
    licenseVerified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: Object.values(VERIFICATION_STATUS),
      default: VERIFICATION_STATUS.PENDING,
    },
    verificationDocuments: [String],
    experience: {
      type: Number,
      default: 0,
    },
    about: {
      type: String,
      maxlength: 2000,
    },
    languages: [String],
    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: 0,
    },
    followUpFee: {
      type: Number,
      min: 0,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    availability: {
      monday: [{ start: String, end: String }],
      tuesday: [{ start: String, end: String }],
      wednesday: [{ start: String, end: String }],
      thursday: [{ start: String, end: String }],
      friday: [{ start: String, end: String }],
      saturday: [{ start: String, end: String }],
      sunday: [{ start: String, end: String }],
    },
    consultationDuration: {
      type: Number,
      default: 30, // minutes
    },
    hospitalAffiliations: [
      {
        name: String,
        address: String,
        department: String,
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalPatients: {
      type: Number,
      default: 0,
    },
    isAvailableForTelemedicine: {
      type: Boolean,
      default: true,
    },
    isAcceptingPatients: {
      type: Boolean,
      default: true,
    },
    education: [
      {
        degree: String,
        institution: String,
        year: Number,
      },
    ],
    awards: [
      {
        title: String,
        year: Number,
        organization: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for full profile
// doctorSchema.virtual('fullProfile').get(function () {
//   return {
//     ...this.toObject(),
//     user: this.user,
//   };
// });

// Index for specialization and rating
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ rating: -1 });
doctorSchema.index({ verificationStatus: 1 });
doctorSchema.index({ isAcceptingPatients: 1 });

// Method to update rating
doctorSchema.methods.updateRating = async function (newRating) {
  const newTotalReviews = this.totalReviews + 1;
  const newAverageRating = ((this.rating * this.totalReviews) + newRating) / newTotalReviews;
  
  this.rating = Math.round(newAverageRating * 10) / 10;
  this.totalReviews = newTotalReviews;
  
  await this.save();
};

module.exports = mongoose.model('Doctor', doctorSchema);
