import api from '../../Instance/Instance';

export const getBanners = async () => {
  const res = await api.get('/public/rows-with-banners');
  return res.data;
};
