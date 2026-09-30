import { Platform } from 'react-native';
import api from '../../Instance/Instance';

export const getProfileApi = async (user_name: string) => {
  const res = await api.get(`/profile/${user_name}`);
  return res.data;
};

export const updateProfileApi = async (payload: any) => {
  const res = await api.put('/profile', payload);
  return res.data;
};

export const updateBioApi = async (data: any) => {
  const res = await api.post('/profile/bio', data);
  return res.data;
};

export const getPrimaryRolesApi = async () => {
  const res = await api.get('/profile/roles/primary/suggested');
  console.log('primary roles fetched', res.data);
  return res.data;
};

export const getSecondaryRolesApi = async () => {
  const res = await api.get('/profile/roles/secondary/suggested');
  console.log('secondary roles fetched', res.data);
  return res.data;
};

export const updatePrimaryRolesApi = async (data: any) => {
  const res = await api.post('/profile/roles/primary', data);
  return res.data;
};

export const updateSecondaryRolesApi = async (data: any) => {
  const res = await api.post('/profile/roles/secondary', data);
  return res.data;
};

export const updateProfilePictureApi = async (image: any) => {
  console.log('PROFILE IMAGE >>>', image);

  const formData = new FormData();

  // ✅ REMOVE IMAGE
  if (image === null) {
    formData.append('remove_image', '1');
  }

  // ✅ UPLOAD IMAGE
  else {
    formData.append('image', {
      uri:
        Platform.OS === 'android'
          ? image?.uri
          : image?.uri?.replace('file://', ''),

      name: image?.fileName || `profile_${Date.now()}.jpg`,

      type: image?.type || 'image/jpeg',
    } as any);
  }

  const res = await api.post('/profile/picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  console.log('PROFILE UPLOAD RES >>>', res?.data);

  return res.data;
};

export const updateCoverPhotoApi = async (image: any) => {
  console.log('cover image >>>', image);

  const formData = new FormData();

  // ✅ REMOVE IMAGE
  if (image === null) {
    formData.append('remove_image', '1');
  }

  // ✅ UPLOAD IMAGE
  else {
    formData.append('image', {
      uri:
        Platform.OS === 'android'
          ? image?.uri
          : image?.uri?.replace('file://', ''),

      name: image?.fileName || `cover_${Date.now()}.jpg`,

      type: image?.type || 'image/jpeg',
    } as any);
  }

  const res = await api.post('/profile/cover-photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
};

export const connectApi = async (reciverId: number) => {
  const res = await api.post('/connection', { receiver_id: reciverId });
  console.log('connection res', res);
  return res.data;
};

export const handleFollowApi = async (following_id: number) => {
  const res = await api.post('/follow', { following_id });
  console.log('follow res', res);
  return res.data;
};

export const handleUnFollowApi = async (other_user_id: number) => {
  const res = await api.post('/follow/unfollow', { other_user_id });
  console.log('unfollow res', res);
  return res.data;
};

export const handleExperienceApi = async (role_id: number, data: any) => {
  const res = await api.post(`/profile/role-experience/${role_id}`, data);
  console.log('handle experience api res', res);
  return res.data;
};

export const getMeTabsDataApi = async (
  page: number,
  type: any,
  user_id: any,
) => {
  const res = await api.get(`/content?user_id=${user_id}`, {
    params: {
      type,
      page,
    },
  });
  // console.log('get me data api res', res);
  return res?.data;
};

export const getMyOpporunityDataApi = async (page: number, username: any, limit=10) => {
  const res = await api.get(`/opportunity?username=${username}&page=${page}&limit=${limit}`);
  console.log('get my opp data api res', res);
  return res?.data;
};
