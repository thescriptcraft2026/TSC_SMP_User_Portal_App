import api from '../../Instance/Instance';

export const reportApi = async () => {
  const res = await api.get('/report'); // 🔥 fix endpoint if needed
  return res?.data;
};

export const reportPostApi = async (data: {
  report_id: string;
  description?: string;
  synopses_id?: string;
  reported_user_id?: string;
  chat_id?: string;
  message_id?: string;
}) => {
  const res = await api.post('/user-report', data);
  return res?.data;
};
