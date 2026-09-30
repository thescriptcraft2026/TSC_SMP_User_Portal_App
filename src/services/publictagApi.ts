import api from '../../Instance/Instance';

export const getPublicTags = async (query: string) => {
  const res = await api.get(`/public/search-tags?search=${query}`);
  console.log('Fetching Tags:', res?.data);
  return res.data;
};
