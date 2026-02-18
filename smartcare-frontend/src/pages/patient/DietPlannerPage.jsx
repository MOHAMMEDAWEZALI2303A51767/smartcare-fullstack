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
} from 'react-icons/fi';
import { FaUtensils } from 'react-icons/fa';
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="xl" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Diet Planner</h1>
          <p className="text-gray-600">Personalized nutrition plans powered by AI</p>
        </div>
        <Button onClick={() => setShowGenerateModal(true)} leftIcon={<FiPlus />}>
          Generate New Plan
        </Button>
      </div>

      {plans.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <FiHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No diet plans yet</p>
            <Button onClick={() => setShowGenerateModal(true)}>Generate Diet Plan</Button>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan._id}>
              <div className="p-4">
                <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                  <FaUtensils className="w-6 h-6 text-secondary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mt-3">{plan.planName}</h3>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DietPlannerPage;
