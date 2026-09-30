import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  connectApi,
  getMeTabsDataApi,
  getMyOpporunityDataApi,
  getPrimaryRolesApi,
  getProfileApi,
  getSecondaryRolesApi,
  handleExperienceApi,
  handleFollowApi,
  handleUnFollowApi,
  updateCoverPhotoApi,
  updatePrimaryRolesApi,
  updateProfileApi,
  updateProfilePictureApi,
  updateSecondaryRolesApi,
} from '../../services/profileApi';
import { getUser } from '../../services/authApi';
import { getUserThunk } from './authSlice';
interface TabsState {
  data: any[];
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  type: string | null;
}

const initialTabsState: TabsState = {
  data: [],
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
  type: null,
};

interface ProfileState {
  bio: string;
  primaryRoles: any[];
  secondaryRoles: any[];
  loading: boolean;
  error: string | null;
  user: any;
  tabs: any;
  opportunities: {
    data: any[];
    loading: boolean;
    error: string | null;
    page: number;
    hasMore: boolean;
  };
}

const initialState: ProfileState = {
  bio: '',
  primaryRoles: [],
  secondaryRoles: [],
  loading: false,
  error: null,
  user: undefined,
  tabs: initialTabsState,
  opportunities: {
    data: [],
    loading: false,
    error: null,
    page: 1,
    hasMore: true,
  },
};

// 🔥 GET PROFILE
export const getUserProfile = createAsyncThunk(
  'profile/getProfile',
  async (user_name: string, { rejectWithValue }) => {
    try {
      const res = await getProfileApi(user_name);
      console.log('get prifle res', res);
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error?.message);
    }
  },
);

// 🔥 UPDATE PROFILE
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (payload: any, { rejectWithValue, dispatch }) => {
    try {
      await updateProfileApi(payload);
      const updatedUserRes = await getUser();
      dispatch(getUserThunk(updatedUserRes.data));
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

// 🔥 PROFILE PICTURE
export const updateProfilePicture = createAsyncThunk(
  'profile/updateProfilePicture',
  async (file: any, { dispatch, rejectWithValue }) => {
    try {
      await updateProfilePictureApi(file);
      const updatedUser = await getUser();
      dispatch(getUserThunk(updatedUser.data));
      return updatedUser;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

// 🔥 COVER PHOTO
export const updateCoverPhoto = createAsyncThunk(
  'profile/updateCoverPhoto',
  async (file: any, { dispatch, rejectWithValue }) => {
    try {
      await updateCoverPhotoApi(file);
      const updatedUser = await getUser();
      dispatch(getUserThunk(updatedUser.data));
      return updatedUser;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

// 🔥 ROLES FETCH
export const getPrimaryRoles = createAsyncThunk(
  'profile/getPrimaryRoles',
  async (_, { rejectWithValue }) => {
    try {
      return await getPrimaryRolesApi();
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

export const getSecondaryRoles = createAsyncThunk(
  'profile/getSecondaryRoles',
  async (_, { rejectWithValue }) => {
    try {
      return await getSecondaryRolesApi();
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

// 🔥 UPDATE ROLES
export const updatePrimaryRoles = createAsyncThunk(
  'profile/updatePrimaryRoles',
  async (data: any, { rejectWithValue }) => {
    try {
      return await updatePrimaryRolesApi(data);
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
      return await updateSecondaryRolesApi(data);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

// connection
export const connect = createAsyncThunk(
  'profile/connect',
  async (reciverId: number, { rejectWithValue }) => {
    try {
      return await connectApi(reciverId);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

// Follow
export const follow = createAsyncThunk(
  'profile/follow',
  async (following_id: number, { rejectWithValue }) => {
    try {
      return await handleFollowApi(following_id);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

// UnFollow
export const unFollow = createAsyncThunk(
  'profile/unFollow',
  async (following_id: number, { rejectWithValue }) => {
    try {
      return await handleUnFollowApi(following_id);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

// Experience
export const handleExperience = createAsyncThunk(
  'profile/handleExperience',
  async (
    { role_id, data }: { role_id: number; data: any },
    { rejectWithValue },
  ) => {
    try {
      return await handleExperienceApi(role_id, data);
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

export const getMeTabsData = createAsyncThunk(
  'profile/getMeTabsData',
  async (
    { page, type, user_id }: { page: number; type: string; user_id: number },
    { rejectWithValue },
  ) => {
    try {
      const res = await getMeTabsDataApi(page, type, user_id);
      return {
        data: res?.data, // ✅ ALWAYS wrap array properly
        page,
        type,
      };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          'Something went wrong',
      );
    }
  },
);

export const getMyOpportunityData = createAsyncThunk(
  'profile/getMyOpportunityData',
  async (
    { page, username }: { page: number; username: any },
    { rejectWithValue },
  ) => {
    try {
      const LIMIT = 10;
      const res = await getMyOpporunityDataApi(page, username, LIMIT);

      return {
        data: res?.data || [], // ✅ array
        page,
      };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          'Something went wrong',
      );
    }
  },
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},

  extraReducers: builder => {
    builder
      // ✅ GET PROFILE
      .addCase(getUserProfile.pending, state => {
        state.loading = true;
        state.user = undefined; // 🔥 clears old profile instantly
      })
      .addCase(getUserProfile.fulfilled, (state, action: any) => {
        state.loading = false;
        state.user = action.payload;
        // console.log('porile payload', action.payload);
      })
      .addCase(getUserProfile.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ UPDATE PROFILE
      .addCase(updateProfile.pending, state => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action: any) => {
        state.loading = false;
        state.user = action.payload?.data;
      })
      .addCase(updateProfile.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ PROFILE PIC
      .addCase(updateProfilePicture.fulfilled, (state, action: any) => {
        state.user = action.payload?.data;
      })

      // ✅ COVER PHOTO
      .addCase(updateCoverPhoto.fulfilled, (state, action: any) => {
        state.user = action.payload?.data;
      })

      // ✅ ROLES LIST
      .addCase(getPrimaryRoles.fulfilled, (state, action: any) => {
        state.primaryRoles = action.payload?.data || [];
      })
      .addCase(getSecondaryRoles.fulfilled, (state, action: any) => {
        state.secondaryRoles = action.payload?.data || [];
      })

      // 🔥🔥🔥 INSTANT ROLE UPDATE (KEY FIX)

      .addCase(updatePrimaryRoles.fulfilled, (state, action: any) => {
        const primaryIds = action.meta.arg.roles;

        if (!state.user?.roles) return;

        state.user.roles = state.user.roles.map((role: any) => ({
          ...role,
          UserRole: {
            ...role.UserRole,
            isPrimary: primaryIds.includes(role.id),
          },
        }));
      })

      .addCase(updateSecondaryRoles.fulfilled, (state, action: any) => {
        const secondaryIds = action.meta.arg.roles;

        if (!state.user?.roles) return;

        state.user.roles = state.user.roles.map((role: any) => ({
          ...role,
          UserRole: {
            ...role.UserRole,
            isPrimary: !secondaryIds.includes(role.id),
          },
        }));
      })

      .addCase(connect.pending, state => {
        state.loading = true;
      })
      .addCase(connect.fulfilled, (state, action: any) => {
        state.loading = false;
        state.user = action.payload?.data;
        // Optionally, you can update the user's connections here based on the response
      })
      .addCase(connect.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Follow
      .addCase(follow.pending, state => {
        state.loading = true;
      })
      .addCase(follow.fulfilled, (state, action: any) => {
        const userId = action.meta.arg;

        // 🔥 update relationship instantly
        if (state.user?.id === userId) {
          state.user.relationship = {
            ...state.user.relationship,
            isFollowing: true,
          };
        }
      })
      .addCase(follow.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // UnFollow
      .addCase(unFollow.pending, state => {
        state.loading = true;
      })
      .addCase(unFollow.fulfilled, (state, action: any) => {
        const userId = action.meta.arg;

        if (state.user?.id === userId) {
          state.user.relationship = {
            ...state.user.relationship,
            isFollowing: false,
          };
        }
      })
      .addCase(unFollow.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Experience
      .addCase(handleExperience.pending, state => {
        state.loading = true;
      })
      .addCase(handleExperience.fulfilled, (state, action: any) => {
        state.loading = false;
        state.user = action.payload?.data;
        // Optionally, you can update the user's experience here based on the response
      })
      .addCase(handleExperience.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getMeTabsData.pending, state => {
        state.tabs.loading = true;
      })

      .addCase(getMeTabsData.fulfilled, (state, action: any) => {
        const { page, type } = action.payload;
        const newData = action.payload?.data || [];
        if (page === 1 || state.tabs.type !== type) {
          state.tabs.data = newData;
        } else {
          state.tabs.data = [...state.tabs.data, ...newData];
        }

        state.tabs.page = page;
        state.tabs.type = type;
        state.tabs.loading = false;
        state.tabs.hasMore = newData.length > 0;
      })

      .addCase(getMeTabsData.rejected, (state, action: any) => {
        state.tabs.loading = false;
        state.tabs.error = action.payload;
      })

      .addCase(getMyOpportunityData.pending, state => {
        state.opportunities.loading = true;
      })

      .addCase(getMyOpportunityData.fulfilled, (state, action: any) => {
        const { page, data } = action.payload;

        if (page === 1) {
          state.opportunities.data = data;
        } else {
          state.opportunities.data = [...state.opportunities.data, ...data];
        }

        state.opportunities.page = page;
        state.opportunities.loading = false;
        state.opportunities.hasMore = data.length === 10;
      })

      .addCase(getMyOpportunityData.rejected, (state, action: any) => {
        state.opportunities.loading = false;
        state.opportunities.error = action.payload;
      });
  },
});

export default profileSlice.reducer;
