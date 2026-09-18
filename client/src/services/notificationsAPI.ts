import axiosInstance from './axios';

const notificationsAPI = {
  list: (params) => axiosInstance.get('/notifications', { params }),
  unreadCount: () => axiosInstance.get('/notifications/unread-count'),
  markRead: (id) => axiosInstance.post(`/notifications/${id}/read`),
  markAllRead: () => axiosInstance.post('/notifications/read-all'),
};

export default notificationsAPI;
