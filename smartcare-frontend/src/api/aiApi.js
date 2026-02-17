import api from './axiosConfig';

export const aiAPI = {
  // Symptom checker
  startSymptomCheck: () => api.post('/ai/symptoms/start'),
  sendSymptomMessage: (id, message) => api.post(`/ai/symptoms/${id}/message`, { message }),
  completeSymptomCheck: (id) => api.post(`/ai/symptoms/${id}/complete`),
  getSymptomCheckHistory: (params) => api.get('/ai/symptoms/history', { params }),
  
  // Diet planner
  generateDietPlan: (data) => api.post('/ai/diet/generate', data),
  getDietPlans: (params) => api.get('/ai/diet/plans', { params }),
  getDietPlanById: (id) => api.get(`/ai/diet/plans/${id}`),
  logDietAdherence: (id, data) => api.post(`/ai/diet/plans/${id}/log`, data),
};
