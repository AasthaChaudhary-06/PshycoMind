import axiosInstance from './axios';

const analyticsAPI = {
  getDashboard: () => axiosInstance.get('/progress/me'),
  trackReading: (payload) => axiosInstance.post('/progress/reading', payload),
  trackTime: (payload) => axiosInstance.post('/progress/time', payload),
  trackQuiz: () => axiosInstance.post('/progress/quiz'),
  getLeaderboard: (params) => axiosInstance.get('/progress/leaderboard', { params }),
  getUserProgress: (userId) => axiosInstance.get(`/progress/users/${userId}`),
  getPlatformAnalytics: () => axiosInstance.get('/users/me/analytics'),
  getReadiness: () => axiosInstance.get('/analytics/readiness'),
  getTrends: () => axiosInstance.get('/analytics/trends'),
  getTopics: () => axiosInstance.get('/analytics/topics'),
};

export default analyticsAPI;
