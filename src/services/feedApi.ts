import api from '../../Instance/Instance';

export const feedApi = async (limit = 10, cursor?: string) => {
  const params: any = { limit };
  if (cursor) {
    params.cursor = cursor;
  }
  const res = await api.get('/content/feed', { params });
  // console.log('feed api res', res.data);
  return res.data;
};

export const postCommentApi = async (id: any, page: any) => {
  const res = await api.get(`/content/${id}/comments`, { params: { page } });
  console.log('get comment by id', res);
  return res.data;
};

export const getPostById = async (id: any) => {
  const res = await api.get(`/content/${id}`);
  console.log('get post id', res);
  return res?.data;
};
