import api from '../../Instance/Instance';

export const changePasswordApi = async (data: any) => {
  const res = await api.post('/auth/change-password', data);
  console.log('chnage password api res', res);
  return res?.data;
};

export const privacySettingApi = async (data: any) => {
  const res = await api.post('/profile/privacy-settings', data);
  console.log('chnage password api res', res);
  return res?.data;
};
