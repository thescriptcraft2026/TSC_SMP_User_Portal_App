import api from '../../Instance/Instance';

export const handleConnectionRequest = async () => {
  const res = await api.get('/connection/pending');
  // console.log('connection request res', res);
  return res.data;
};

export const handleConnectionAccept = async (connection_id: number) => {
  const res = await api.put('/connection/accept', { connection_id });
  // console.log('connection accept res', res);
  return res.data;
};
export const handleConnectionReject = async (connection_id: number) => {
  const res = await api.put('/connection/reject', { connection_id });
  // console.log('connection reject res', res);
  return res.data;
};

export const getConnections = async (user_name: string, page: number = 1) => {
  const res = await api.get(`/connection/friends/${user_name}`, {
    params: {
      page,
    },
  });

  return res.data;
};

export const getFollowers = async (user_name: string, page: number = 1) => {
  const res = await api.get(`/follow/followers/${user_name}`, {
    params: {
      page,
    },
  });

  return res.data;
};

export const getFollowings = async (user_name: string, page: number = 1) => {
  const res = await api.get(`/follow/following/${user_name}`, {
    params: {
      page,
    },
  });

  return res.data;
};

export const connectApi = async (reciverId: number) => {
  const res = await api.post('/connection', { receiver_id: reciverId });
  // console.log('connection res', res);
  return res.data;
};

export const handleFollowApi = async (following_id: number) => {
  const res = await api.post('/follow', { following_id });
  // console.log('follow res', res);
  return res.data;
};

export const handleUnFollowApi = async (other_user_id: number) => {
  const res = await api.post('/follow/unfollow', { other_user_id });
  // console.log('unfollow res', res);
  return res.data;
};

export const getSuggestedProfileApi = async (page: number) => {
  const res = await api.get('/connection/suggestions/users', {
    params: { page },
  });
  // console.log('Get all suggection user profile api res', res);
  return res.data;
};
