import axiosInstance from './axios';

const authAPI = {
  register: (payload) => axiosInstance.post('/auth/register', payload),
  login: (payload) => axiosInstance.post('/auth/login', payload),
  refresh: () => axiosInstance.post('/auth/refresh'),
  logout: () => axiosInstance.post('/auth/logout'),
  me: () => axiosInstance.get('/auth/me'),
  changePassword: (payload) => axiosInstance.post('/users/me/change-password', payload),
  updateProfile: (payload) => axiosInstance.patch('/users/me', payload),
  getAnalytics: () => axiosInstance.get('/users/me/analytics'),
};

export default authAPI;
