import axiosInstance from './axios';

const chatAPI = {
  create: (payload) => axiosInstance.post('/chat', payload),
  list: (params) => axiosInstance.get('/chat', { params }),
  get: (id) => axiosInstance.get(`/chat/${id}`),
  sendMessage: (id, payload) => axiosInstance.post(`/chat/${id}/messages`, payload),
  rename: (id, title) => axiosInstance.patch(`/chat/${id}/title`, { title }),
  bookmark: (id) => axiosInstance.post(`/chat/${id}/bookmark`),
  pin: (id) => axiosInstance.post(`/chat/${id}/pin`),
  remove: (id) => axiosInstance.delete(`/chat/${id}`),
};

export default chatAPI;
