import React, { useEffect, useState } from 'react';
import { aiAPI } from '../../api/aiApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import {
  FiHeart,
  FiPlus,
  FiTarget,
  FiCalendar,
  FiTrendingUp,
  FiCheck,
  FiUtensils,
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const DietPlannerPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [generating, setGenerating] = useState(false);

  const [planConfig, setPlanConfig] = useState({
    goals: [],
    dietaryRestrictions: [],
    allergies: '',
    calorieTarget: '',
    duration: 30,
  });

  const goals = [
    { id: 'weight_loss', label: 'Weight Loss' },
    { id: 'weight_gain', label: 'Weight Gain' },
    { id: 'muscle_gain', label: 'Muscle Gain' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'diabetes_management', label: 'Diabetes Management' },
    { id: 'heart_health', label: 'Heart Health' },
  ];

  const restrictions = [
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'gluten_free', label: 'Gluten Free' },
    { id: 'dairy_free', label: 'Dairy Free' },
    { id: 'keto', label: 'Keto' },
    { id: 'halal', label: 'Halal' },
    { id: 'kosher', label: 'Kosher' },
  ];

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await aiAPI.getDietPlans();
      setPlans(response.data.plans || []);
    } catch (error) {
      toast.error('Failed to load diet plans');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    try {
      setGenerating(true);
      const response = await aiAPI.generateDietPlan({
        goals: planConfig.goals,
        dietaryRestrictions: planConfig.dietaryRestrictions,
        allergies: planConfig.allergies.split(',').map((a) => a.trim()).filter(Boolean),
        calorieTarget: planConfig.calorieTarget ? parseInt(planConfig.calorieTarget) : undefined,
        duration: planConfig.duration,
      });
      toast.success('Diet plan generated successfully!');
      setShowGenerateModal(false);
      setSelectedPlan(response.data);
      fetchPlans();
    } catch (error) {
      toast.error('Failed to generate diet plan');
    } finally {
      setGenerating(false);
    }
  };

  const toggleGoal = (goalId) => {
    setPlanConfig((prev) => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter((g) => g !== goalId)
        : [...prev.goals, goalId],
    }));
  };

  const toggleRestriction = (restrictionId) => {
    setPlanConfig((prev) => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(restrictionId)
        ? prev.dietaryRestrictions.filter((r) => r !== restrictionId)
        : [...prev.dietaryRestrictions, restrictionId],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="xl" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Diet Planner</h1>
          <p className="text-gray-600">Personalized nutrition plans powered by AI</p>
        </div>
        <Button onClick={() => setShowGenerateModal(true)} leftIcon={<FiPlus />}>
          Generate New Plan
        </Button>
      </div>

      {/* Plans List */}
      {plans.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <FiHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No diet plans yet</p>
            <p className="text-sm text-gray-400 mb-4">Generate your first personalized diet plan</p>
            <Button onClick={() => setShowGenerateModal(true)}>Generate Diet Plan</Button>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan._id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedPlan(plan)}>
              <div className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                    <FiUtensils className="w-6 h-6 text-secondary-600" />
                  </div>
                  <Badge variant={plan.isActive ? 'success' : 'default'}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{plan.planName}</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {plan.goals?.slice(0, 2).map((goal, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {goal.replace('_', ' ')}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span><FiTarget className="inline mr-1" />{plan.calorieTarget} cal</span>
                  <span><FiTrendingUp className="inline mr-1" />{plan.adherenceRate}% adherence</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Generate Plan Modal */}
      {showGenerateModal && (
        <Modal
          title="Generate AI Diet Plan"
          onClose={() => setShowGenerateModal(false)}
          footer={
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowGenerateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleGeneratePlan} loading={generating}>
                Generate Plan
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Health Goals</label>
              <div className="flex flex-wrap gap-2">
                {goals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      planConfig.goals.includes(goal.id)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {goal.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Dietary Restrictions</label>
              <div className="flex flex-wrap gap-2">
                {restrictions.map((restriction) => (
                  <button
                    key={restriction.id}
                    onClick={() => toggleRestriction(restriction.id)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      planConfig.dietaryRestrictions.includes(restriction.id)
                        ? 'bg-secondary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {restriction.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Allergies (comma separated)</label>
              <input
                type="text"
                value={planConfig.allergies}
                onChange={(e) => setPlanConfig({ ...planConfig, allergies: e.target.value })}
                placeholder="e.g., peanuts, shellfish, dairy"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Daily Calorie Target</label>
                <input
                  type="number"
                  value={planConfig.calorieTarget}
                  onChange={(e) => setPlanConfig({ ...planConfig, calorieTarget: e.target.value })}
                  placeholder="e.g., 2000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (days)</label>
                <input
                  type="number"
                  value={planConfig.duration}
                  onChange={(e) => setPlanConfig({ ...planConfig, duration: parseInt(e.target.value) })}
                  min="7"
                  max="90"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Plan Details Modal */}
      {selectedPlan && (
        <Modal
          title={selectedPlan.planName}
          onClose={() => setSelectedPlan(null)}
          size="lg"
        >
          <div className="space-y-6">
            {selectedPlan.planDetails?.dailyMeals && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Sample Daily Menu</h4>
                <div className="space-y-3">
                  {selectedPlan.planDetails.dailyMeals.slice(0, 3).map((meal, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-3">
                      <p className="font-medium text-sm capitalize">{meal.mealType}</p>
                      <p className="text-sm text-gray-600">
                        {meal.items?.map((item) => item.foodName).join(', ')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{meal.totalCalories} calories</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedPlan.aiInsights && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">AI Insights</h4>
                <div className="bg-primary-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-2">{selectedPlan.aiInsights.nutritionalAnalysis}</p>
                  {selectedPlan.aiInsights.recommendations?.length > 0 && (
                    <ul className="space-y-1">
                      {selectedPlan.aiInsights.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start">
                          <FiCheck className="w-4 h-4 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DietPlannerPage;
