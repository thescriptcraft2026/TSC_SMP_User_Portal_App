import api from '../../Instance/Instance';

export const getVisionXApi = async (
  type: string,
  sort_by = 'recent',
  page = 1,
  search = '',
  category_id = '',
) => {
  const params: any = {
    page,
    limit: 10,
    type,
    sort_by,
  };

  // ✅ optional params
  if (search) {
    params.search = search;
  }

  if (category_id) {
    // Creator Zone uses the dedicated creator_category table. The content
    // endpoint expects this filter as category_id, not genre_id.
    params.category_id = category_id;
  }

  const res = await api.get('/content', { params });
  return res.data;
};

export const getVisionXById = async (id: string) => {
  const res = await api.get(`/content/${id}`);
  console.log('Selected Vision X Id:', res?.data);
  return res.data.data;
};

export const createVisionX = async (data: any) => {
  const res = await api.post('/content', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const updateVisionX = async (id: string, data: any) => {
  const res = await api.put(`/content/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const deleteVisionX = async (id: string) => {
  const res = await api.delete(`/content/${id}`);
  return res.data;
};
