import api from '../../Instance/Instance';

export const getAllNotification = async (page: number) => {
  const res = await api.get(`/notification`, { params: { page } });
  // console.log('get all notification api res', res);
  return res?.data;
};

export const markAsReadNotificationApi = async (notification_id: any) => {
  const res = await api.put(`/notification/${notification_id}/read`);
  // console.log('mark as read api res', res);
  return res?.data;
};

export const notificationDeleteApi = async (notification_id: any) => {
  const res = await api.delete(`/notification/${notification_id}`);
  // console.log('delete notification api res', res);
  return res?.data;
};

export const markAllAsReadApi = async () => {
  const res = await api.put(`/notification/mark-all-as-read`);
  // console.log('mark all as read api res', res);
  return res?.data;
};

export const notificationCountApi = async () => {
  const res = await api.get(`/notification/unread/count`);
  // console.log('notification count api res', res);
  return res?.data;
};
