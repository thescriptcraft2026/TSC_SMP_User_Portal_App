import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { privacySettingApi } from '../../services/profileSettingApi';

// 🔥 THUNK
export const updatePrivacySettings = createAsyncThunk(
  'profile/updatePrivacySettings',
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await privacySettingApi(data);
      return res;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || 'Something went wrong');
    }
  },
);

interface PrivacyState {
  saving: boolean;
  data: {
    profile_visibility: string;
    connections_visibility: string;
    content_visibility: string;
  };
  error: string | null;
}

const initialState: PrivacyState = {
  saving: false,
  data: {
    profile_visibility: 'public',
    connections_visibility: 'connections',
    content_visibility: 'followers',
  },
  error: null,
};

const privacySettingSlice = createSlice({
  name: 'privacySetting',
  initialState,
  reducers: {
    // 🔥 sync from auth OR optimistic update
    setLocalPrivacy: (state, action) => {
      state.data = { ...state.data, ...action.payload };
    },
  },
  extraReducers: builder => {
    builder
      .addCase(updatePrivacySettings.pending, state => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updatePrivacySettings.fulfilled, state => {
        state.saving = false;
      })
      .addCase(updatePrivacySettings.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

export const { setLocalPrivacy } = privacySettingSlice.actions;
export default privacySettingSlice.reducer;
