import api from '../../Instance/Instance';

export const getNewsApi = async (page = 1) => {
  const res = await api.get(`/news`, {
    params: { page },
  });
  // console.log('Getting All News:', res);
  return res?.data;
};
