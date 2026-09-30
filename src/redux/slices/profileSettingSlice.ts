import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { changePasswordApi } from '../../services/profileSettingApi';

// 🔥 THUNK
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (
    {
      oldPassword,
      newPassword,
      isLogout,
    }: {
      oldPassword: string;
      newPassword: string;
      isLogout: boolean;
    },
    { getState, rejectWithValue },
  ) => {
    try {
      const state: any = getState();
      const email = state.auth?.user?.email;

      const payload = {
        email,
        old_password: oldPassword,
        new_password: newPassword,
        isLogout,
      };

      const res = await changePasswordApi(payload);

      return res;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || 'Something went wrong');
    }
  },
);

// 🔥 STATE
interface ChangePasswordState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: ChangePasswordState = {
  loading: false,
  success: false,
  error: null,
};

// 🔥 SLICE
const profileSetting = createSlice({
  name: 'changePassword',
  initialState,
  reducers: {
    resetChangePassword: state => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(changePassword.pending, state => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(changePassword.fulfilled, state => {
        state.loading = false;
        state.success = true;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetChangePassword } = profileSetting.actions;

export default profileSetting.reducer;
