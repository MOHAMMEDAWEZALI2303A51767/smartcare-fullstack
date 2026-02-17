import api from './axiosConfig';

export const medicineAPI = {
  createReminder: (data) => api.post('/medicines/reminders', data),
  getReminders: (params) => api.get('/medicines/reminders', { params }),
  getReminderById: (id) => api.get(`/medicines/reminders/${id}`),
  updateReminder: (id, data) => api.put(`/medicines/reminders/${id}`, data),
  deleteReminder: (id) => api.delete(`/medicines/reminders/${id}`),
  toggleReminderStatus: (id) => api.put(`/medicines/reminders/${id}/toggle`),
  logMedicineIntake: (id, data) => api.post(`/medicines/reminders/${id}/log`, data),
  getAdherenceReport: (params) => api.get('/medicines/adherence', { params }),
  getTodaySchedule: () => api.get('/medicines/today'),
};
