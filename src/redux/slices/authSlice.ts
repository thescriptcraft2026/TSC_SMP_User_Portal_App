import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  authWithGoogleApi,
  createTestRegistrationAccountApi,
  forgotPassword,
  getPrimaryRolesApi,
  getSecondaryRolesApi,
  getUser,
  getUserNameSuggestionApi,
  googleLoginApi,
  loginApi,
  logoutApi,
  resendOtpApi,
  resetPasswordApi,
  sendLoginPhoneOtpApi,
  sendRegistrationEmailOtpApi,
  sendRegistrationPhoneOtpApi,
  signupApi,
  startRegistrationApi,
  updateBioApi,
  updatePrimaryRolesApi,
  updateProfileApi,
  updateSecondaryRolesApi,
  verifyForgotOtpApi,
  verifyLoginPhoneOtpApi,
  verifyOtpApi,
  verifyRegistrationEmailOtpApi,
  verifyRegistrationPhoneOtpApi,
} from '../../services/authApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: any;
  token: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  bio: string | null;
  primaryRoles: any;
  suggestedPrimary: any;
  secondaryRoles: any;
  suggestedSecondary: any;
}

const initialState: AuthState = {
  user: null,
  token: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
  bio: '',
  primaryRoles: [],
  suggestedPrimary: [],
  secondaryRoles: [],
  suggestedSecondary: [],
};

// get user
export const getUserThunk = createAsyncThunk(
  'auth/me',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getUser();
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errors?.message ||
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

// Sign Up
export const signup = createAsyncThunk(
  'auth/register',
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await signupApi(data);
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errors?.message ||
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

// Register email OTP
export const sendRegistrationEmailOtp = createAsyncThunk(
  'auth/sendRegistrationEmailOtp',
  async (data: { temp_id: number; email: string }, { rejectWithValue }) => {
    try {
      const res = await sendRegistrationEmailOtpApi(data);
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errors?.[0]?.message ||
          error?.response?.data?.errors?.message ||
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

// Start test registration session
export const startRegistration = createAsyncThunk(
  'auth/startRegistration',
  async (data: { name: string; user_name: string }, { rejectWithValue }) => {
    try {
      const res = await startRegistrationApi(data);
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errors?.[0]?.message ||
          error?.response?.data?.errors?.message ||
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

// Verify test registration email OTP
export const verifyRegistrationEmailOtp = createAsyncThunk(
  'auth/verifyRegistrationEmailOtp',
  async (data: { temp_id: number; code: string }, { rejectWithValue }) => {
    try {
      const res = await verifyRegistrationEmailOtpApi(data);
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errors?.[0]?.message ||
          error?.response?.data?.errors?.message ||
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

// Send test registration mobile OTP
export const sendRegistrationPhoneOtp = createAsyncThunk(
  'auth/sendRegistrationPhoneOtp',
  async (data: { temp_id: number; phone: string }, { rejectWithValue }) => {
    try {
      const res = await sendRegistrationPhoneOtpApi(data);
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errors?.[0]?.message ||
          error?.response?.data?.errors?.message ||
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

// Verify test registration mobile OTP
export const verifyRegistrationPhoneOtp = createAsyncThunk(
  'auth/verifyRegistrationPhoneOtp',
  async (data: { temp_id: number; code: string }, { rejectWithValue }) => {
    try {
      const res = await verifyRegistrationPhoneOtpApi(data);
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errors?.[0]?.message ||
          error?.response?.data?.errors?.message ||
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

// Create account after test registration verification
export const createTestRegistrationAccount = createAsyncThunk(
  'auth/createTestRegistrationAccount',
  async (
    data: {
      temp_id: number;
      password: string;
      confirm_password: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await createTestRegistrationAccountApi(data);
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errors?.[0]?.message ||
          error?.response?.data?.errors?.message ||
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

// Existing user mobile OTP after login
export const sendLoginPhoneOtp = createAsyncThunk(
  'auth/sendLoginPhoneOtp',
  async (
    data: { user_id: number; phone: string; country_code?: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await sendLoginPhoneOtpApi(data);
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errors?.[0]?.message ||
          error?.response?.data?.errors?.message ||
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

export const verifyLoginPhoneOtp = createAsyncThunk(
  'auth/verifyLoginPhoneOtp',
  async (data: { user_id: number; code: string }, { rejectWithValue }) => {
    try {
      const res = await verifyLoginPhoneOtpApi(data);
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errors?.[0]?.message ||
          error?.response?.data?.errors?.message ||
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

// Login
export const login = createAsyncThunk(
  'auth/login',
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await loginApi(data);
      return res;
    } catch (error: any) {
      console.log('LOGIN ERROR =>', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });
      if (error?.response?.data?.data?.requires_phone_verification) {
        return rejectWithValue({
          message:
            error?.response?.data?.message ||
            'Please verify your mobile number to continue',
          status: error?.response?.status,
          data: error?.response?.data?.data,
        });
      }

      return rejectWithValue(
        error?.response?.data?.errors?.[0]?.message ||
          error?.response?.data?.errors?.message ||
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

// Sign up verify otp
export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await verifyOtpApi(data);
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errors?.message ||
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

// Forgot Passowrd
export const forgotPasswordThunk = createAsyncThunk(
  'auth/forgotPassword',
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await forgotPassword(data);
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errors?.message ||
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

// forgot password verify otp
export const verifyForgotOtp = createAsyncThunk(
  'auth/verifyForgotOtp',
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await verifyForgotOtpApi(data);
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errors?.message ||
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

// reset password
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await resetPasswordApi(data);
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errors?.message ||
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

// Resend OTP
export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await resendOtpApi(data);
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errors?.message ||
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

// Logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = await AsyncStorage.getItem('userRefreshToken');

      if (refreshToken) {
        await logoutApi(refreshToken);
      }

      await AsyncStorage.multiRemove(['userAccessToken', 'userRefreshToken']);

      return true;
    } catch (error: any) {
      const message =
        error?.response?.data?.errors?.message ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message;

      if (
        error?.response?.status === 401 &&
        String(message || '').toLowerCase().includes('refresh token')
      ) {
        await AsyncStorage.multiRemove(['userAccessToken', 'userRefreshToken']);
        return true;
      }

      return rejectWithValue(
        message,
      );
    }
  },
);

// Login or Signup with Google
export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await googleLoginApi(data);
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errors?.message ||
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

// Bio Update
export const updateBio = createAsyncThunk(
  'profile/updateBio',
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await updateBioApi(data);
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

// Primary Roles
export const getPrimaryRoles = createAsyncThunk(
  'profile/getPrimaryRoles',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getPrimaryRolesApi();
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

// Secondary Roles
export const getSecondaryRoles = createAsyncThunk(
  'profile/getSecondaryRoles',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getSecondaryRolesApi();
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

export const updatePrimaryRoles = createAsyncThunk(
  'profile/updatePrimaryRoles',
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await updatePrimaryRolesApi(data);
      console.log('primary rolkes rws', res);
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

export const updateSecondaryRoles = createAsyncThunk(
  'profile/updateSecondaryRoles',
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await updateSecondaryRolesApi(data);
      console.log('secondary role', res);
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (payload: any, { rejectWithValue }) => {
    try {
      await updateProfileApi(payload);

      // 🔥 always fetch fresh user
      const updatedUserRes = await getUser();

      return updatedUserRes;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

// Username suggestion
export const getUserNameSuggestion = createAsyncThunk(
  'auth/getUserNameSuggestion',
  async (user_name: string, { rejectWithValue }) => {
    try {
      const res = await getUserNameSuggestionApi(user_name);
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errors?.message ||
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

export const authWithGoogle = createAsyncThunk(
  'auth/authWithGoogle',
  async (id_token: any, { rejectWithValue }) => {
    try {
      const res = await authWithGoogleApi(id_token);
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errors?.message ||
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth: state => {
      state.user = null;
      state.token = null;
      state.error = null;
    },
  },

  extraReducers: builder => {
    builder

      // signup
      .addCase(signup.pending, state => {
        state.loading = true;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(signup.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login
      .addCase(login.pending, state => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // verify otp for sign up
      .addCase(verifyOtp.pending, state => {
        state.loading = true;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(verifyOtp.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // forgot password
      .addCase(forgotPasswordThunk.pending, state => {
        state.loading = true;
        state.error = null; // 🔥 reset old error
      })
      .addCase(forgotPasswordThunk.fulfilled, state => {
        state.loading = false;
      })
      .addCase(forgotPasswordThunk.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // verify otp for forgot password
      .addCase(verifyForgotOtp.pending, state => {
        state.loading = true;
      })
      .addCase(verifyForgotOtp.fulfilled, state => {
        state.loading = false;
      })
      .addCase(verifyForgotOtp.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Reset password
      .addCase(resetPassword.pending, state => {
        state.loading = true;
      })
      .addCase(resetPassword.fulfilled, state => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // resend otp for signup / forgot password
      .addCase(resendOtp.pending, state => {
        state.loading = true;
      })
      .addCase(resendOtp.fulfilled, state => {
        state.loading = false;
      })
      .addCase(resendOtp.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getUserThunk.pending, state => {
        state.loading = true;
      })
      .addCase(getUserThunk.fulfilled, (state, action: any) => {
        state.loading = false;

        const user = action.payload?.data;

        state.user = user;

        state.bio = user?.bio || '';
      })
      .addCase(getUserThunk.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // LOGOUT
      .addCase(logoutUser.fulfilled, state => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.error = null;
      })

      // 🔥 GOOGLE LOGIN
      .addCase(googleLogin.pending, state => {
        state.loading = true;
      })
      .addCase(googleLogin.fulfilled, (state, action: any) => {
        state.loading = false;

        const data = action.payload?.data;

        state.accessToken = data?.accessToken;
        state.refreshToken = data?.refreshToken;

        console.log('google login success', data);
      })
      .addCase(googleLogin.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Bio Update
      .addCase(updateBio.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBio.fulfilled, (state, action: any) => {
        state.loading = false;
        state.bio = action.payload?.bio || ''; // adjust based on API
      })
      .addCase(updateBio.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Primary Roles
      .addCase(getPrimaryRoles.pending, state => {
        state.loading = true;
      })
      .addCase(getPrimaryRoles.fulfilled, (state, action: any) => {
        state.loading = false;

        const data = action.payload?.data;

        state.primaryRoles = data?.all_roles || []; // 👈 UI list
        state.suggestedPrimary = data?.primary_roles || []; // 👈 default select
      })
      .addCase(getPrimaryRoles.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Secondary Roles
      .addCase(getSecondaryRoles.pending, state => {
        state.loading = true;
      })
      .addCase(getSecondaryRoles.fulfilled, (state, action: any) => {
        state.loading = false;

        const data = action.payload?.data;

        state.secondaryRoles = data?.all_roles || []; // 👈 UI list
        state.suggestedSecondary = data?.secondary_roles || []; // optional
      })
      .addCase(getSecondaryRoles.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Primary Roles Save
      .addCase(updatePrimaryRoles.pending, state => {
        state.loading = true;
      })
      .addCase(updatePrimaryRoles.fulfilled, state => {
        state.loading = false;
      })
      .addCase(updatePrimaryRoles.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Secondary Roles Save
      .addCase(updateSecondaryRoles.pending, state => {
        state.loading = true;
      })
      .addCase(updateSecondaryRoles.fulfilled, state => {
        state.loading = false;
      })
      .addCase(updateSecondaryRoles.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Profile
      .addCase(updateProfile.pending, state => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action: any) => {
        state.loading = false;

        const updatedUser = action.payload?.data;

        state.user = {
          ...state.user,
          ...updatedUser,
        };
      })
      .addCase(updateProfile.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Username suggestion
      .addCase(getUserNameSuggestion.pending, state => {
        state.loading = true;
      })
      .addCase(getUserNameSuggestion.fulfilled, (state, action: any) => {
        state.loading = false;
        // you can store the suggestion in state if needed
      })
      .addCase(getUserNameSuggestion.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 🔥 AUTH WITH GOOGLE (ID TOKEN FLOW)
      .addCase(authWithGoogle.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(authWithGoogle.fulfilled, (state, action: any) => {
        state.loading = false;

        const data = action.payload?.data;

        state.accessToken = data?.accessToken;
        state.refreshToken = data?.refreshToken;
        state.user = data?.user || null;

        console.log('authWithGoogle success', data);
      })
      .addCase(authWithGoogle.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAuth } = authSlice.actions;
export default authSlice.reducer;
