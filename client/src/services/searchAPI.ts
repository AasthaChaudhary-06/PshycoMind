import axiosInstance from './axios';

const searchAPI = {
  search: (params) => axiosInstance.get('/search', { params }),
};

export default searchAPI;
