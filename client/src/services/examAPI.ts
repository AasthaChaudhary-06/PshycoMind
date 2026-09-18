import axiosInstance from './axios';

const examAPI = {
  list: (params) => axiosInstance.get('/exams', { params }),
  get: (id) => axiosInstance.get(`/exams/${id}`),
  create: (payload) => axiosInstance.post('/exams', payload),
  start: (id) => axiosInstance.get(`/exams/${id}/start`),
  submit: (id, payload) => axiosInstance.post(`/exams/${id}/submit`, payload),
  remove: (id) => axiosInstance.delete(`/exams/${id}`),
};

export default examAPI;
