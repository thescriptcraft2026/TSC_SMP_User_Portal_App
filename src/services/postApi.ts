import api from '../../Instance/Instance';

export const postApi = async (data: any) => {
  const res = await api.post('/content', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Accept: 'application/json',
    },
  });

  return res.data;
};

export const deleteOwnPostApi = async (id: any) => {
  const res = await api.delete(`/content/${id}`);
  // console.log('delete own post api res', res);
  return res?.data;
};

export const editOwnPostApi = async (id: any, data: any) => {
  const res = await api.put(`/content/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Accept: 'application/json',
    },
  });
  // console.log('Edit post api res', res);
  return res?.data;
};

export const repostApi = async ({
  story,
  synopsis_id,
  mentions,
  tags,
}: any) => {
  const res = await api.post('/content/repost-content', {
    story,
    synopsis_id,
    mentions,
    tags,
  });
  console.log('repost api res', res);
  return res?.data;
};
