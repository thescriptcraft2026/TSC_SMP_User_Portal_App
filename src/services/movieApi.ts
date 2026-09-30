import api from '../../Instance/Instance';

// Get All Movies
export const getAllMoviesApi = async (
  page = 1,
  sort_by = '',
  search = '',
  genre_id = '',
  reviewcategory_id = '',
) => {
  const params: any = {
    page
  };

  // ✅ optional params
  if (search) {
    params.search = search;
  }
  // ✅ optional params
  if (sort_by) {
    params.sort_by = sort_by;
  }

  if (genre_id) {
    params.genre_id = genre_id;
  }
  if (reviewcategory_id) {
    params.reviewcategory_id = reviewcategory_id;
  }

  const res = await api.get('/review-contents', {
    params,
  });
  console.log('Getting All movies:', res);
  return res?.data;
};

// Get Movie details By Id
export const getMoviesDetailsByIdApi = async (id: any) => {
  const res = await api.get(`/review-contents/${id}`);
  console.log('get movies details by id api res', res);
  return res.data;
};

// Movie Bookmark
export const movieBookmarkApi = async ({
  content_id,
  type,
}: {
  content_id: string;
  type: 'create' | 'delete';
}) => {
  const res = await api.post('/review-contents/wishlist', {
    content_id,
    type,
  });

  return res?.data;
};
// Movie Like
export const movieLikeApi = async ({
  content_id,
  type,
  emoji_type,
}: {
  content_id: string;
  type: 'create' | 'delete';
  emoji_type?: string;
}) => {
  const res = await api.post('/review-contents/like', {
    content_id,
    type,
    emoji_type,
  });

  return res?.data;
};

// Movie Rating submit
export const movieRatingApi = async (formData: any) => {
  const res = await api.post('/review-contents/review', formData);
  console.log('submit movie rating api res', res);
  return res?.data;
};
