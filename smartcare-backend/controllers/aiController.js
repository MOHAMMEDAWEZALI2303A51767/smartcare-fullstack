const { openai } = require('../config/openai');
const { SymptomCheck, DietPlan, Patient } = require('../models');
const logger = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Start AI symptom check
// @route   POST /api/ai/symptoms/start
// @access  Private (Patient only)
const startSymptomCheck = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return errorResponse(res, 'Patient profile not found', 404);
    }

    // Create new symptom check session
    const symptomCheck = await SymptomCheck.create({
      patient: patient._id,
      conversation: [
        {
          role: 'assistant',
          message:
            "Hello! I'm your AI health assistant. I'll help you assess your symptoms. Please describe what symptoms you're experiencing, when they started, and how severe they are.",
        },
      ],
    });

    logger.info(`Symptom check started: ${symptomCheck._id}`);

    return successResponse(
      res,
      {
        sessionId: symptomCheck._id,
        message: symptomCheck.conversation[0].message,
      },
      'Symptom check session started',
      201
    );
  } catch (error) {
    logger.error(`Start symptom check error: ${error.message}`);
    return errorResponse(res, 'Failed to start symptom check', 500);
  }
};

// @desc    Send message to AI symptom checker
// @route   POST /api/ai/symptoms/:id/message
// @access  Private (Patient only)
const sendSymptomMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return errorResponse(res, 'Patient profile not found', 404);
    }

    const symptomCheck = await SymptomCheck.findOne({
      _id: id,
      patient: patient._id,
    });

    if (!symptomCheck) {
      return errorResponse(res, 'Symptom check session not found', 404);
    }

    if (symptomCheck.isCompleted) {
      return errorResponse(res, 'This session has already been completed', 400);
    }

    // Add user message to conversation
    symptomCheck.addMessage('user', message);

    // Prepare conversation history for OpenAI
    const messages = [
      {
        role: 'system',
        content: `You are a medical AI assistant for a healthcare platform called SmartCare. Your role is to:
1. Conduct a conversational symptom assessment
2. Ask clarifying questions about symptoms (duration, severity, location, associated symptoms)
3. Consider the patient's medical history if relevant
4. Provide possible conditions with probability estimates
5. Recommend appropriate actions (self-care, see a doctor, emergency care)
6. Assign an urgency level (low, medium, high, emergency)

Important guidelines:
- Always include a disclaimer that this is not medical advice
- For high urgency or emergency levels, strongly recommend immediate medical attention
- Never provide definitive diagnoses
- Ask one question at a time for natural conversation
- Be empathetic and professional
- If symptoms suggest a serious condition, prioritize safety over detail

Patient context:
- Age: ${patient.user?.age || 'Unknown'}
- Gender: ${patient.user?.gender || 'Unknown'}
- Known allergies: ${patient.allergies?.map((a) => a.name).join(', ') || 'None recorded'}
- Chronic conditions: ${patient.chronicConditions?.map((c) => c.condition).join(', ') || 'None recorded'}`,
      },
      ...symptomCheck.conversation.map((msg) => ({
        role: msg.role,
        content: msg.message,
      })),
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;

    // Add AI response to conversation
    symptomCheck.addMessage('assistant', aiResponse);

    // Extract symptoms from conversation (simple keyword extraction)
    const commonSymptoms = [
      'fever',
      'cough',
      'headache',
      'pain',
      'nausea',
      'vomiting',
      'diarrhea',
      'fatigue',
      'shortness of breath',
      'chest pain',
      'dizziness',
      'rash',
      'swelling',
      'bleeding',
    ];

    const lowerMessage = message.toLowerCase();
    commonSymptoms.forEach((symptom) => {
      if (lowerMessage.includes(symptom) && !symptomCheck.reportedSymptoms.includes(symptom)) {
        symptomCheck.reportedSymptoms.push(symptom);
      }
    });

    await symptomCheck.save();

    return successResponse(res, {
      sessionId: symptomCheck._id,
      message: aiResponse,
      reportedSymptoms: symptomCheck.reportedSymptoms,
    });
  } catch (error) {
    logger.error(`Send symptom message error: ${error.message}`);
    return errorResponse(res, 'Failed to process message', 500);
  }
};

// @desc    Complete symptom check and get assessment
// @route   POST /api/ai/symptoms/:id/complete
// @access  Private (Patient only)
const completeSymptomCheck = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return errorResponse(res, 'Patient profile not found', 404);
    }

    const symptomCheck = await SymptomCheck.findOne({
      _id: id,
      patient: patient._id,
    });

    if (!symptomCheck) {
      return errorResponse(res, 'Symptom check session not found', 404);
    }

    if (symptomCheck.isCompleted) {
      return errorResponse(res, 'This session has already been completed', 400);
    }

    // Generate final assessment using OpenAI
    const assessmentPrompt = {
      role: 'system',
      content: `Based on the following conversation, provide a comprehensive health assessment in JSON format:

{
  "possibleConditions": [
    {
      "condition": "Condition name",
      "probability": 0-100,
      "description": "Brief description"
    }
  ],
  "recommendedActions": ["Action 1", "Action 2"],
  "urgencyLevel": "low|medium|high|emergency",
  "suggestedSpecialist": "Type of specialist if needed",
  "generalAdvice": "General health advice"
}

Conversation history:
${symptomCheck.conversation.map((msg) => `${msg.role}: ${msg.message}`).join('\n')}`,
    };

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [assessmentPrompt],
      max_tokens: 800,
      temperature: 0.5,
    });

    let assessment;
    try {
      assessment = JSON.parse(completion.choices[0].message.content);
    } catch (parseError) {
      // If JSON parsing fails, create a default assessment
      assessment = {
        possibleConditions: [
          {
            condition: 'Unable to determine',
            probability: 0,
            description: 'Please consult a healthcare professional for proper diagnosis.',
          },
        ],
        recommendedActions: ['Consult a healthcare professional'],
        urgencyLevel: 'medium',
        suggestedSpecialist: 'General Practitioner',
        generalAdvice: 'Please consult with a healthcare professional for proper evaluation.',
      };
    }

    // Complete the symptom check
    symptomCheck.complete(assessment);
    await symptomCheck.save();

    logger.info(`Symptom check completed: ${id}`);

    return successResponse(
      res,
      {
        sessionId: symptomCheck._id,
        assessment: symptomCheck.aiAssessment,
        reportedSymptoms: symptomCheck.reportedSymptoms,
        conversation: symptomCheck.conversation,
      },
      'Symptom check completed'
    );
  } catch (error) {
    logger.error(`Complete symptom check error: ${error.message}`);
    return errorResponse(res, 'Failed to complete symptom check', 500);
  }
};

// @desc    Get symptom check history
// @route   GET /api/ai/symptoms/history
// @access  Private (Patient only)
const getSymptomCheckHistory = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return errorResponse(res, 'Patient profile not found', 404);
    }

    const { page = 1, limit = 10 } = req.query;

    const history = await SymptomCheck.find({ patient: patient._id })
      .select('sessionId reportedSymptoms aiAssessment isCompleted createdAt completedAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await SymptomCheck.countDocuments({ patient: patient._id });

    return successResponse(res, {
      history,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error(`Get symptom check history error: ${error.message}`);
    return errorResponse(res, 'Failed to get history', 500);
  }
};

// @desc    Generate AI diet plan
// @route   POST /api/ai/diet/generate
// @access  Private (Patient only)
const generateDietPlan = async (req, res) => {
  try {
    const {
      goals,
      dietaryRestrictions,
      allergies,
      dislikedFoods,
      calorieTarget,
      macroTargets,
      duration,
    } = req.body;

    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return errorResponse(res, 'Patient profile not found', 404);
    }

    // Get patient info for context
    const patientInfo = {
      age: req.user.age,
      gender: req.user.gender,
      weight: patient.weight,
      height: patient.height,
      bmi: patient.bmi,
      activityLevel: patient.lifestyle?.exercise?.frequency || 'sometimes',
      existingConditions: patient.chronicConditions?.map((c) => c.condition) || [],
    };

    // Generate diet plan using OpenAI
    const prompt = `Create a personalized 7-day diet plan for a ${patientInfo.age}-year-old ${patientInfo.gender} with the following parameters:

Goals: ${goals?.join(', ') || 'general wellness'}
Dietary Restrictions: ${dietaryRestrictions?.join(', ') || 'none'}
Allergies: ${allergies?.join(', ') || 'none'}
Disliked Foods: ${dislikedFoods?.join(', ') || 'none'}
Calorie Target: ${calorieTarget || 'calculate based on goals'}
Macro Targets: ${JSON.stringify(macroTargets) || 'balanced'}
Duration: ${duration || 30} days

Patient Info:
- Weight: ${patientInfo.weight}kg
- Height: ${patientInfo.height}cm
- BMI: ${patientInfo.bmi}
- Activity Level: ${patientInfo.activityLevel}
- Existing Conditions: ${patientInfo.existingConditions.join(', ') || 'none'}

Please provide the response in JSON format with the following structure:
{
  "planName": "Name of the plan",
  "dailyMeals": [
    {
      "mealType": "breakfast|morning_snack|lunch|afternoon_snack|dinner",
      "time": "suggested time",
      "items": [
        {
          "foodName": "name",
          "quantity": "portion size",
          "calories": number,
          "protein": number,
          "carbs": number,
          "fats": number
        }
      ],
      "totalCalories": number
    }
  ],
  "dailyTotalNutrition": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fats": number
  },
  "shoppingList": [
    {
      "category": "category name",
      "items": ["item 1", "item 2"]
    }
  ],
  "preparationTips": ["tip 1", "tip 2"],
  "hydrationGuidelines": "hydration advice",
  "nutritionalAnalysis": "analysis of the plan",
  "recommendations": ["recommendation 1"],
  "warnings": ["warning 1 if any"],
  "expectedOutcomes": "what to expect",
  "timeline": "expected timeline for results"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional nutritionist AI. Create detailed, balanced, and practical diet plans. Ensure all recommendations are safe and consider any health conditions.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 2500,
      temperature: 0.7,
    });

    let planData;
    try {
      planData = JSON.parse(completion.choices[0].message.content);
    } catch (parseError) {
      logger.error(`Failed to parse AI diet plan: ${parseError.message}`);
      return errorResponse(res, 'Failed to generate diet plan. Please try again.', 500);
    }

    // Create diet plan in database
    const dietPlan = await DietPlan.create({
      patient: patient._id,
      planName: planData.planName,
      goals: goals || ['general_wellness'],
      dietaryRestrictions: dietaryRestrictions || [],
      allergies: allergies || [],
      dislikedFoods: dislikedFoods || [],
      calorieTarget: calorieTarget || planData.dailyTotalNutrition.calories,
      macroTargets: macroTargets || {
        protein: planData.dailyTotalNutrition.protein,
        carbs: planData.dailyTotalNutrition.carbs,
        fats: planData.dailyTotalNutrition.fats,
      },
      duration: duration || 30,
      planDetails: {
        dailyMeals: planData.dailyMeals,
        dailyTotalNutrition: planData.dailyTotalNutrition,
        shoppingList: planData.shoppingList,
        preparationTips: planData.preparationTips,
        hydrationGuidelines: planData.hydrationGuidelines,
      },
      aiInsights: {
        nutritionalAnalysis: planData.nutritionalAnalysis,
        recommendations: planData.recommendations,
        warnings: planData.warnings,
        expectedOutcomes: planData.expectedOutcomes,
        timeline: planData.timeline,
      },
      generatedBy: 'ai',
    });

    logger.info(`Diet plan generated: ${dietPlan._id}`);

    return successResponse(res, dietPlan, 'Diet plan generated successfully', 201);
  } catch (error) {
    logger.error(`Generate diet plan error: ${error.message}`);
    return errorResponse(res, 'Failed to generate diet plan', 500);
  }
};

// @desc    Get user's diet plans
// @route   GET /api/ai/diet/plans
// @access  Private (Patient only)
const getDietPlans = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return errorResponse(res, 'Patient profile not found', 404);
    }

    const { isActive, page = 1, limit = 10 } = req.query;

    const query = { patient: patient._id };
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const plans = await DietPlan.find(query)
      .select('planName goals isActive startDate endDate adherenceRate createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await DietPlan.countDocuments(query);

    return successResponse(res, {
      plans,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    logger.error(`Get diet plans error: ${error.message}`);
    return errorResponse(res, 'Failed to get diet plans', 500);
  }
};

// @desc    Get diet plan by ID
// @route   GET /api/ai/diet/plans/:id
// @access  Private (Patient only)
const getDietPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return errorResponse(res, 'Patient profile not found', 404);
    }

    const plan = await DietPlan.findOne({
      _id: id,
      patient: patient._id,
    });

    if (!plan) {
      return errorResponse(res, 'Diet plan not found', 404);
    }

    return successResponse(res, plan);
  } catch (error) {
    logger.error(`Get diet plan by ID error: ${error.message}`);
    return errorResponse(res, 'Failed to get diet plan', 500);
  }
};

// @desc    Log daily diet adherence
// @route   POST /api/ai/diet/plans/:id/log
// @access  Private (Patient only)
const logDietAdherence = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, mealsFollowed, waterIntake, weight, energyLevel, notes } = req.body;

    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return errorResponse(res, 'Patient profile not found', 404);
    }

    const plan = await DietPlan.findOne({
      _id: id,
      patient: patient._id,
    });

    if (!plan) {
      return errorResponse(res, 'Diet plan not found', 404);
    }

    plan.addDailyLog({
      date: new Date(date),
      mealsFollowed,
      waterIntake,
      weight,
      energyLevel,
      notes,
    });

    await plan.save();

    return successResponse(res, plan, 'Daily log added successfully');
  } catch (error) {
    logger.error(`Log diet adherence error: ${error.message}`);
    return errorResponse(res, 'Failed to log diet adherence', 500);
  }
};

module.exports = {
  startSymptomCheck,
  sendSymptomMessage,
  completeSymptomCheck,
  getSymptomCheckHistory,
  generateDietPlan,
  getDietPlans,
  getDietPlanById,
  logDietAdherence,
};
