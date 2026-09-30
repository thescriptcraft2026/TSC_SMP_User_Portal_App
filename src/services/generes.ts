import api from '../../Instance/Instance';

export const getGeneresApi = async () => {
  const res = await api.get('/genre');
  console.log('Genres fetched', res.data);
  return res?.data;
};
