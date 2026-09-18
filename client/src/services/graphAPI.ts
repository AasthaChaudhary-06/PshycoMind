import axiosInstance from './axios';

const graphAPI = {
  get: (documentId) => axiosInstance.get(`/graph/${documentId}`),
  generate: (documentId) => axiosInstance.post(`/graph/${documentId}/generate`),
};

export default graphAPI;
