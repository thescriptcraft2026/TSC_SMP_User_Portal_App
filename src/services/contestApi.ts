import api from '../../Instance/Instance';

export const getAllContestApi = async (
  page = 1,
  sort_by = 'recent',
  search = '',
  genre_id = '',
) => {
  const params: any = {
    page,
    limit: 10,
    sort_by,
    search,
    genre_id,
  };

  // ✅ optional params
  if (search) {
    params.search = search;
  }

  if (genre_id) {
    params.genre_id = genre_id;
  }

  const res = await api.get(`/contest`, {
    params,
  });
  return res?.data;
};

// ✅ GET BY ID
export const getContestById = async (id: string) => {
  const res = await api.get(`/public/contest/${id}`);
  return res?.data?.data;
};

// Contest Bookmark
export const bookmarkApi = async (contest_id: string, type: string) => {
  const res = await api.post('/contest/wishlist', {
    contest_id,
    type,
  });
  return res?.data;
};

// All Participant of the partcular contest by id
export const getAllParticipantByContestId = async (
  contest_id: any,
  page = 1,
  search = '',
  sort_by = 'rating',
) => {
  const params: any = {
    page,
    sort_by,
  };
  // ✅ optional params
  if (search) {
    params.search = search;
  }
  const res = await api.get(`/contest/${contest_id}/participants`, {
    params,
  });
  return res.data;
};

// Contest participate submissions
export const participateApi = async (formData: any, contest_id: any) => {
  const res = await api.post(`contest/participant/${contest_id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Accept: 'application/json',
    },
  });

  return res.data;
};

// Participant details by id
export const getParticipantDetailsById = async (id: string) => {
  const res = await api.get(`/contest/participant/${id}`);
  return res?.data?.data;
};

// Logged-in user's submissions for a contest
export const getUserSubmissionsByContestId = async (contest_id: string) => {
  const res = await api.get(`/contest/user-submissions/${contest_id}`);
  return res?.data;
};

export const getMyParticipatedContests = async (page = 1, limit = 10) => {
  const res = await api.get(`/contest/participant`, {
    params: { page, limit },
  });
  console.log('getMyParticipatedContests', res?.data);
  return res?.data;
};


export const getContestBannerApi = async () => {
  const res = await api.get('/contest/banners/data');
  console.log('getContestBannerApi', res?.data?.data);
  return res?.data?.data;
};
