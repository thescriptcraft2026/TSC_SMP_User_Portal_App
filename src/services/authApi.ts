import api from '../../Instance/Instance';

export const getUser = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

export const signupApi = async (data: any) => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

export const startRegistrationApi = async (data: {
  name: string;
  user_name: string;
}) => {
  const res = await api.post('/newregistration/register/start', data);
  return res.data;
};

export const sendRegistrationEmailOtpApi = async (data: {
  temp_id: number;
  email: string;
}) => {
  const res = await api.post('/newregistration/register/send-email-otp', data);
  return res.data;
};

export const verifyRegistrationEmailOtpApi = async (data: {
  temp_id: number;
  code: string;
}) => {
  const res = await api.post('/newregistration/register/verify-email', data);
  return res.data;
};

export const sendRegistrationPhoneOtpApi = async (data: {
  temp_id: number;
  phone: string;
}) => {
  const res = await api.post('/newregistration/register/send-phone-otp', data);
  return res.data;
};

export const verifyRegistrationPhoneOtpApi = async (data: {
  temp_id: number;
  code: string;
}) => {
  const res = await api.post('/newregistration/register/verify-phone', data);
  return res.data;
};

export const sendLoginPhoneOtpApi = async (data: {
  user_id: number;
  phone: string;
  country_code?: string;
}) => {
  const res = await api.post('/newregistration/login/send-phone-otp', data);
  return res.data;
};

export const verifyLoginPhoneOtpApi = async (data: {
  user_id: number;
  code: string;
}) => {
  const res = await api.post('/newregistration/login/verify-phone', data);
  return res.data;
};

export const createTestRegistrationAccountApi = async (data: {
  temp_id: number;
  password: string;
  confirm_password: string;
}) => {
  const res = await api.post('/newregistration/register/create', data);
  return res.data;
};

export const loginApi = async (data: any) => {
  const res = await api.post('/auth/login', data);
  return res.data;
};

export const verifyOtpApi = async (data: any) => {
  const res = await api.post('/auth/verify-otp', data);
  return res.data;
};

export const forgotPassword = async (data: any) => {
  const res = await api.post('/auth/forgot-password', data);
  return res.data;
};

export const verifyForgotOtpApi = async (data: any) => {
  const res = await api.post('/auth/verify-forgot-otp', data);
  return res.data;
};

export const resetPasswordApi = async (data: any) => {
  const res = await api.post('/auth/reset-password', data);
  return res.data;
};

export const resendOtpApi = async (data: any) => {
  const res = await api.post('/auth/resend-otp', data);
  return res.data;
};

export const logoutApi = async (refreshToken: string) => {
  const res = await api.post('/auth/logout', { refreshToken });
  return res.data;
};

export const updateBioApi = async (data: any) => {
  const res = await api.post('/profile/bio', data);
  return res.data;
};

export const getPrimaryRolesApi = async () => {
  const res = await api.get('/profile/roles/primary/suggested');
  return res.data;
};

export const getSecondaryRolesApi = async () => {
  const res = await api.get('/profile/roles/secondary/suggested');
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

export const googleLoginApi = async (data: any) => {
  const res = await api.post('/auth/google-login', data);
  return res.data;
};

export const appleLoginApi = async (data: {
  identity_token: string;
  authorization_code?: string;
  email?: string | null;
  full_name?: {
    given_name?: string | null;
    family_name?: string | null;
  } | null;
}) => {
  const res = await api.post('/auth/apple-login', data);
  return res.data;
};

export const updateProfileApi = async (payload: any) => {
  const res = await api.put('/profile', payload);
  return res.data;
};

export const getUserNameSuggestionApi = async (user_name: string) => {
  const res = await api.get(`/auth/available-usernames/${user_name}`);
  return res.data;
};

export const authWithGoogleApi = async (id_token: any) => {
  const res = await api.post('/auth/google-login', id_token);
  return res.data;
};
