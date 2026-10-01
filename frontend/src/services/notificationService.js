import api from './api';

export const getNotifications = async () => {
  const res = await api.get('/notifications');
  return res.data.notifications;
};

export const markAsRead = async (id) => {
  const res = await api.put(`/notifications/${id}/read`);
  return res.data.notification;
};

export const markAllRead = async () => {
  await api.put('/notifications/read-all');
};