import api from '../../Instance/Instance';

export const getAllBooks = async (
  type: string,
  page = 1,
  sort_by = 'recent',
  search = '',
  genre_id = '',
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

  if (genre_id) {
    params.genre_id = genre_id;
  }

  const res = await api.get(`/content`, {
    params,
  });

  return res?.data;
};

// ✅ GET BY ID
export const getBookById = async (id: string) => {
  const res = await api.get(`/content/${id}`);
  return res?.data?.data;
};

// ✅ CREATE
export const createBookApi = async (data: any) => {
  const res = await api.post('/content', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Accept: 'application/json',
    },
    transformRequest: data => data,
  });
  return res.data;
};

// ✅ UPDATE
export const updateBookApi = async (id: string, data: FormData) => {
  const res = await api.put(`/content/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Accept: 'application/json',
    },
    transformRequest: d => d,
  });

  return res.data;
};

// ✅ DELETE
export const deleteBookApi = async (id: string) => {
  const res = await api.delete(`/content/${id}`);
  return res.data;
};

// Rating
export const ratingApi = async (synopsis_id: string, rating: number) => {
  try {
    const res = await api.post(`/actions/rate/${synopsis_id}`, { rating });
    console.log('rating success', res?.data);
    return res?.data;
  } catch (error: any) {
    console.log('❌ RATING ERROR FULL:', error?.response?.data);
    console.log('❌ STATUS:', error?.response?.status);
    throw error;
  }
};

// Suggested Books Api
export const suggestedBookApi = async (book_id: string) => {
  const res = await api.get(`/content/suggestion/${book_id}`);
  console.log('suggestion books api res', res);
  return res.data;
};
