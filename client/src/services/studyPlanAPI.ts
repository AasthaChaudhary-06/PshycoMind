import axiosInstance from './axios';

const studyPlanAPI = {
  list: (params) => axiosInstance.get('/plans', { params }),
  get: (id) => axiosInstance.get(`/plans/${id}`),
  create: (payload) => axiosInstance.post('/plans', payload),
  updateTask: (planId, taskId, completed) =>
    axiosInstance.patch(`/plans/${planId}/tasks/${taskId}`, { completed }),
  remove: (id) => axiosInstance.delete(`/plans/${id}`),
};

export default studyPlanAPI;
