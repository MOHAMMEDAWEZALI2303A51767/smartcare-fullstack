const mongoose = require('mongoose');

const symptomCheckSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    sessionId: {
      type: String,
      unique: true,
    },
    conversation: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant', 'system'],
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    reportedSymptoms: [String],
    aiAssessment: {
      possibleConditions: [
        {
          condition: String,
          probability: Number,
          description: String,
        },
      ],
      recommendedActions: [String],
      urgencyLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'emergency'],
      },
      suggestedSpecialist: String,
      generalAdvice: String,
      disclaimer: {
        type: String,
        default: 'This assessment is for informational purposes only and does not constitute medical advice. Please consult a healthcare professional for proper diagnosis and treatment.',
      },
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    recommendedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    followUpAppointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    userFeedback: {
      wasHelpful: Boolean,
      accuracyRating: Number, // 1-5
      comments: String,
    },
  },
  {
    timestamps: true,
  }
);

// Generate session ID before saving
symptomCheckSchema.pre('save', async function (next) {
  if (!this.sessionId) {
    this.sessionId = `SC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

// Indexes
symptomCheckSchema.index({ patient: 1, createdAt: -1 });
symptomCheckSchema.index({ isCompleted: 1 });

// Method to add message to conversation
symptomCheckSchema.methods.addMessage = function (role, message) {
  this.conversation.push({
    role,
    message,
    timestamp: new Date(),
  });
};

// Method to complete session
symptomCheckSchema.methods.complete = function (assessment) {
  this.aiAssessment = assessment;
  this.isCompleted = true;
  this.completedAt = new Date();
};

module.exports = mongoose.model('SymptomCheck', symptomCheckSchema);
