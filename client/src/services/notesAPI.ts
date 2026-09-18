import axiosInstance from './axios';

const notesAPI = {
  create: (payload) => axiosInstance.post('/notes', payload),
  list: (params) => axiosInstance.get('/notes', { params }),
  get: (id) => axiosInstance.get(`/notes/${id}`),
  update: (id, payload) => axiosInstance.patch(`/notes/${id}`, payload),
  remove: (id) => axiosInstance.delete(`/notes/${id}`),
  generateSummary: (payload) => axiosInstance.post('/notes/generate/summary', payload),
};

export default notesAPI;
