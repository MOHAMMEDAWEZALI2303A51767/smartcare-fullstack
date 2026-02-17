const mongoose = require('mongoose');

const dietPlanSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    planName: {
      type: String,
      required: true,
    },
    generatedBy: {
      type: String,
      enum: ['ai', 'nutritionist'],
      default: 'ai',
    },
    nutritionist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    // Input parameters
    goals: [
      {
        type: String,
        enum: [
          'weight_loss',
          'weight_gain',
          'muscle_gain',
          'maintenance',
          'diabetes_management',
          'heart_health',
          'digestive_health',
          'energy_boost',
          'general_wellness',
        ],
      },
    ],
    dietaryRestrictions: [
      {
        type: String,
        enum: [
          'vegetarian',
          'vegan',
          'halal',
          'kosher',
          'gluten_free',
          'dairy_free',
          'nut_free',
          'low_sodium',
          'low_sugar',
          'keto',
          'paleo',
        ],
      },
    ],
    allergies: [String],
    dislikedFoods: [String],
    calorieTarget: {
      type: Number,
    },
    macroTargets: {
      protein: Number, // grams
      carbs: Number, // grams
      fats: Number, // grams
      fiber: Number, // grams
    },
    // Generated plan
    planDetails: {
      dailyMeals: [
        {
          mealType: {
            type: String,
            enum: ['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'evening_snack'],
          },
          time: String,
          items: [
            {
              foodName: String,
              quantity: String,
              calories: Number,
              protein: Number,
              carbs: Number,
              fats: Number,
              fiber: Number,
              preparation: String,
            },
          ],
          totalCalories: Number,
          totalProtein: Number,
          totalCarbs: Number,
          totalFats: Number,
        },
      ],
      dailyTotalNutrition: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fats: Number,
        fiber: Number,
      },
      weeklyPlan: [
        {
          day: String,
          meals: [Object],
        },
      ],
      shoppingList: [
        {
          category: String,
          items: [
            {
              name: String,
              quantity: String,
              estimatedPrice: Number,
            },
          ],
        },
      ],
      preparationTips: [String],
      mealPrepSuggestions: [String],
      hydrationGuidelines: String,
      supplementRecommendations: [String],
    },
    // AI-generated insights
    aiInsights: {
      nutritionalAnalysis: String,
      recommendations: [String],
      warnings: [String],
      expectedOutcomes: String,
      timeline: String,
    },
    // Tracking
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    duration: {
      type: Number, // in days
      default: 30,
    },
    adherenceRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    dailyLogs: [
      {
        date: Date,
        mealsFollowed: [
          {
            mealType: String,
            followed: Boolean,
            substitutions: [String],
            notes: String,
          },
        ],
        waterIntake: Number, // in ml
        weight: Number,
        energyLevel: Number, // 1-10
        notes: String,
      },
    ],
    progress: {
      startingWeight: Number,
      currentWeight: Number,
      weightChange: Number,
      measurements: {
        chest: Number,
        waist: Number,
        hips: Number,
        arms: Number,
        thighs: Number,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
dietPlanSchema.index({ patient: 1, isActive: 1 });
dietPlanSchema.index({ createdAt: -1 });

// Method to calculate adherence rate
dietPlanSchema.methods.calculateAdherence = function () {
  if (this.dailyLogs.length === 0) return 0;
  
  const totalMeals = this.dailyLogs.length * this.planDetails.dailyMeals.length;
  const followedMeals = this.dailyLogs.reduce((acc, log) => {
    return acc + log.mealsFollowed.filter((m) => m.followed).length;
  }, 0);
  
  this.adherenceRate = Math.round((followedMeals / totalMeals) * 100);
  return this.adherenceRate;
};

// Method to add daily log
dietPlanSchema.methods.addDailyLog = function (logData) {
  this.dailyLogs.push(logData);
  this.calculateAdherence();
};

module.exports = mongoose.model('DietPlan', dietPlanSchema);
