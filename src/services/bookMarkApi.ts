import api from '../../Instance/Instance';

export const getAllBookMarksApi = async (type: string, page: number) => {
  const res = await api.get('/actions/wishlist', { params: { type, page } });
  // console.log('get all bookmarks by type res', res);
  return res.data;
};

export const getAllContestBookmarkApi = async (page: number) => {
  const res = await api.get('/contest/wishlist', { params: { page } });
  // console.log('get all contest bookmark', res);
  return res?.data;
};

export const getAllOpporunityBookmarkApi = async (page: number) => {
  const res = await api.get('/oppourtunity-wishlist', { params: { page } });
  // console.log('get all opporunity bookmark', res);
  return res.data;
};
