import axiosInstance from './axios';

const gamificationAPI = {
  me: () => axiosInstance.get('/gamification/me'),
  leaderboard: (params) => axiosInstance.get('/gamification/leaderboard', { params }),
};

export default gamificationAPI;
