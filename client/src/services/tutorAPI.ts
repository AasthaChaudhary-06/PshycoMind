import axiosInstance from './axios';

const tutorAPI = {
  quickActions: () => axiosInstance.get('/tutor/quick-actions'),
  intent: (payload) => axiosInstance.post('/tutor/intent', payload),
};

export default tutorAPI;
