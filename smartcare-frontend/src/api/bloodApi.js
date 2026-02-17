import api from './axiosConfig';

export const bloodAPI = {
  // Donor routes
  registerAsDonor: (data) => api.post('/blood-donation/donor/register', data),
  getDonorProfile: () => api.get('/blood-donation/donor/profile'),
  updateDonorProfile: (data) => api.put('/blood-donation/donor/profile', data),
  updateAvailability: (isAvailable) => api.put('/blood-donation/donor/availability', { isAvailable }),
  getDonorHistory: () => api.get('/blood-donation/donor/history'),
  
  // Request routes
  createRequest: (data) => api.post('/blood-donation/requests', data),
  getRequests: (params) => api.get('/blood-donation/requests', { params }),
  getRequestById: (id) => api.get(`/blood-donation/requests/${id}`),
  respondToRequest: (id, response) => api.put(`/blood-donation/requests/${id}/respond`, response),
  fulfillRequest: (id, data) => api.put(`/blood-donation/requests/${id}/fulfill`, data),
  
  // Search routes
  findNearbyDonors: (params) => api.get('/blood-donation/donors/nearby', { params }),
  getBloodCompatibility: () => api.get('/blood-donation/compatibility'),
};
