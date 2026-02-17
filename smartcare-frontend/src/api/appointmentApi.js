import api from './axiosConfig';

export const appointmentAPI = {
  createAppointment: (data) => api.post('/appointments', data),
  getAppointments: (params) => api.get('/appointments', { params }),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),
  cancelAppointment: (id, reason) => api.put(`/appointments/${id}/cancel`, { reason }),
  confirmAppointment: (id) => api.put(`/appointments/${id}/confirm`),
  completeAppointment: (id, data) => api.put(`/appointments/${id}/complete`, data),
  rescheduleAppointment: (id, data) => api.post(`/appointments/${id}/reschedule`, data),
};
