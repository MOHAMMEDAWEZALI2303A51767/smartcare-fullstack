import api from './axiosConfig';

export const prescriptionAPI = {
  createPrescription: (data) => api.post('/prescriptions', data),
  getPrescriptions: (params) => api.get('/prescriptions', { params }),
  getPrescriptionById: (id) => api.get(`/prescriptions/${id}`),
  updatePrescription: (id, data) => api.put(`/prescriptions/${id}`, data),
  renewPrescription: (id, data) => api.put(`/prescriptions/${id}/renew`, data),
  deactivatePrescription: (id) => api.put(`/prescriptions/${id}/deactivate`),
};
