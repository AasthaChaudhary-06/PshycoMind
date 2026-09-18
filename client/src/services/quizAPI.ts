import axiosInstance from './axios';

const quizAPI = {
  generate: (payload) => axiosInstance.post('/quiz', payload),
  list: (params) => axiosInstance.get('/quiz', { params }),
  get: (id) => axiosInstance.get(`/quiz/${id}`),
  start: (id) => axiosInstance.get(`/quiz/${id}/start`),
  submit: (id, payload) => axiosInstance.post(`/quiz/${id}/submit`, payload),
  remove: (id) => axiosInstance.delete(`/quiz/${id}`),
};

export default quizAPI;
