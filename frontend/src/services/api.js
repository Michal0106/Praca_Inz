import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true
});

export const authAPI = {
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
};

export const activitiesAPI = {
  getActivities: (params) => api.get('/activities', { params }),
  getActivityById: (id) => api.get(`/activities/${id}`),
  getActivityTypes: () => api.get('/activities/types'),
  syncActivities: () => api.post('/activities/sync')
};

export const analyticsAPI = {
  getDistribution: () => api.get('/analytics/distribution'),
  getWeeklyStats: (params) => api.get('/analytics/weekly-stats', { params }),
  getMonthlyTrends: (params) => api.get('/analytics/monthly-trends', { params }),
  getIntensityDistribution: () => api.get('/analytics/intensity-distribution'),
  getProgress: (metric, period) => api.get('/analytics/progress', { params: { metric, period } })
};

export const dataAPI = {
  getUserStats: () => api.get('/data/stats'),
  getLongestActivity: (metric) => api.get('/data/longest-activity', { params: { metric } }),
  getHardestActivity: () => api.get('/data/hardest-activity'),
  getRecords: () => api.get('/data/records'),
  getAverages: (groupBy) => api.get('/data/averages', { params: { groupBy } })
};

export const trainingPlanAPI = {
  getRecommended: () => api.get('/training-plan/recommend'),
  getTemplates: (params) => api.get('/training-plan/templates', { params }),
  getPlanById: (id) => api.get(`/training-plan/${id}`),
  getSessionById: (id) => api.get(`/training-plan/session/${id}`)
};

export default api;
