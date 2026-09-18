import axiosInstance from './axios';

const flashcardAPI = {
  generate: (payload) => axiosInstance.post('/flashcards', payload),
  list: (params) => axiosInstance.get('/flashcards', { params }),
  review: (id, quality) => axiosInstance.post(`/flashcards/${id}/review`, { quality }),
  remove: (id) => axiosInstance.delete(`/flashcards/${id}`),
};

export default flashcardAPI;
