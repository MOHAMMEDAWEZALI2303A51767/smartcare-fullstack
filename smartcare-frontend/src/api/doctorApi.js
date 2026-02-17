import api from './axiosConfig';

export const doctorAPI = {
  getAllDoctors: (params) => api.get('/doctors', { params }),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
  getDoctorAvailability: (id, date) => api.get(`/doctors/${id}/availability`, { params: { date } }),
  updateProfile: (data) => api.put('/doctors/profile', data),
  updateAvailability: (data) => api.put('/doctors/availability', data),
  getDashboard: () => api.get('/doctors/dashboard/me'),
  getPatients: (params) => api.get('/doctors/patients/me', { params }),
  
  // Admin only
  getPendingVerifications: (params) => api.get('/doctors/admin/pending-verification', { params }),
  verifyDoctor: (id, data) => api.put(`/doctors/${id}/verify`, data),
};
