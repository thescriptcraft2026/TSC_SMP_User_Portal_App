import api from '../../Instance/Instance';

export const getSearchApi = async ({
  query,
  type = 'posts',
  limit = 10,
  cursor = null,
}: {
  query: string;
  type?: string;
  limit?: number;
  cursor?: string | null;
}) => {
  const res = await api.get('/content/search', {
    params: {
      type,
      search: query,
      limit,
      cursor,
    },
  });
  // console.log('search api res', res);
  return res?.data;
};
