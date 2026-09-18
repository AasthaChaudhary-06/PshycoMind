import axiosInstance from './axios';

const documentAPI = {
  upload: (formData, onUploadProgress) =>
    axiosInstance.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    }),
  list: (params) => axiosInstance.get('/documents', { params }),
  get: (id) => axiosInstance.get(`/documents/${id}`),
  getContent: (id) => axiosInstance.get(`/documents/${id}/content`),
  update: (id, payload) => axiosInstance.patch(`/documents/${id}`, payload),
  remove: (id) => axiosInstance.delete(`/documents/${id}`),
  favorite: (id) => axiosInstance.post(`/documents/${id}/favorite`),
  unfavorite: (id) => axiosInstance.delete(`/documents/${id}/favorite`),
};

export default documentAPI;
