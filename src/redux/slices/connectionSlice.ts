import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getConnections,
  getFollowers,
  getFollowings,
  getSuggestedProfileApi,
  handleConnectionAccept,
  handleConnectionReject,
  handleConnectionRequest,
} from '../../services/connectionApi';
import api from '../../../Instance/Instance';

// Get All Connections
export const getConnectionsThunk = createAsyncThunk(
  'connection/getConnections',
  async (
    {
      user_name,
      page,
    }: {
      user_name: string;
      page: number;
    },
    { rejectWithValue },
  ) => {
    try {
      return await getConnections(user_name, page);
    } catch (error: any) {
      return rejectWithValue(error?.message);
    }
  },
);

// Pending Requests
export const getPendingConnections = createAsyncThunk(
  'connection/getPendingConnections',
  async (_, { rejectWithValue }) => {
    try {
      const res = await handleConnectionRequest();
      return res;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Something went wrong');
    }
  },
);

// ✅ ACCEPT
export const acceptConnection = createAsyncThunk(
  'connection/acceptConnection',
  async (connection_id: number, { rejectWithValue }) => {
    try {
      const res = await handleConnectionAccept(connection_id);
      return { connection_id, data: res };
    } catch (error: any) {
      return rejectWithValue(error?.message);
    }
  },
);

// ✅ REJECT
export const rejectConnection = createAsyncThunk(
  'connection/rejectConnection',
  async (connection_id: number, { rejectWithValue }) => {
    try {
      const res = await handleConnectionReject(connection_id);
      return { connection_id, data: res };
    } catch (error: any) {
      return rejectWithValue(error?.message);
    }
  },
);

// 👥 GET FOLLOWERS
export const getFollowersThunk = createAsyncThunk(
  'connection/getFollowers',
  async (
    {
      user_name,
      page,
    }: {
      user_name: string;
      page: number;
    },
    { rejectWithValue },
  ) => {
    try {
      return await getFollowers(user_name, page);
    } catch (error: any) {
      return rejectWithValue(error?.message);
    }
  },
);

// ➡️ GET FOLLOWINGS
export const getFollowingsThunk = createAsyncThunk(
  'connection/getFollowings',
  async (
    {
      user_name,
      page,
    }: {
      user_name: string;
      page: number;
    },
    { rejectWithValue },
  ) => {
    try {
      return await getFollowings(user_name, page);
    } catch (error: any) {
      return rejectWithValue(error?.message);
    }
  },
);

export const getSuggestedProfiles = createAsyncThunk(
  'suggested/getSuggestedProfiles',
  async (page: number, { rejectWithValue }) => {
    try {
      const res = await getSuggestedProfileApi(page);
      return { ...res, page };
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Something went wrong');
    }
  },
);

export const searchConnectionsThunk = createAsyncThunk(
  'connection/searchConnections',
  async (
    {
      user_name,
      page = 1,
      search,
    }: {
      user_name: string;
      page?: number;
      search: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.get(
        `/connection/friends/${user_name}?page=${page}&limit=10&search=${encodeURIComponent(
          search,
        )}`,
      );

      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || 'Something went wrong',
      );
    }
  },
);

// ✅ INITIAL STATE
type ConnectionState = {
  loading: boolean;
  loadingMore: boolean;
  pendingRequests: any[];
  connections: any[]; // ✅ ADD THIS
  followers: any[]; // ✅ ADD
  followings: any[]; // ✅ ADD
  error: string | null;
  message: string;
  page: any;
  totalPages: any;
  hasMore: any;
  suggestedUsers: any[];
  loadingSuggestions: boolean;
  searchedConnections: any[];
};

const initialState: ConnectionState = {
  loading: false,
  loadingMore: false,
  pendingRequests: [],
  connections: [], // ✅ ADD THIS
  followers: [], // ✅ ADD
  followings: [], // ✅ ADD
  error: null,
  message: '',
  page: 1,
  totalPages: 1,
  hasMore: true,
  suggestedUsers: [],
  loadingSuggestions: false,
  searchedConnections: [],
};

const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    clearPendingRequests: state => {
      state.pendingRequests = [];
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getPendingConnections.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingConnections.fulfilled, (state, action: any) => {
        state.loading = false;

        state.pendingRequests = action.payload?.data?.pending_connections || [];
      })
      .addCase(getPendingConnections.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ ACCEPT
      .addCase(acceptConnection.fulfilled, (state, action: any) => {
        const id = action.payload.connection_id;

        // 🔥 remove from pending list
        state.pendingRequests = state.pendingRequests.filter(
          item => item.id !== id,
        );
      })

      // ❌ REJECT
      .addCase(rejectConnection.fulfilled, (state, action: any) => {
        const id = action.payload.connection_id;

        // 🔥 remove from pending list
        state.pendingRequests = state.pendingRequests.filter(
          item => item.id !== id,
        );
      })

      //   Get All Connections
      .addCase(getConnectionsThunk.pending, (state, action) => {
        state.message = '';
        if (action.meta.arg.page === 1) {
          state.loading = true;
        } else {
          state.loadingMore = true;
        }
      })

      .addCase(getConnectionsThunk.fulfilled, (state, action: any) => {
        const page = action.meta.arg.page;
        const data = action.payload.data;

        state.loading = false;
        state.loadingMore = false;

        state.message = action.payload.message || '';

        state.page = data.page;
        state.totalPages = data.total_pages;
        state.hasMore = data.page < data.total_pages;

        if (page === 1) {
          state.connections = data.friends;
        } else {
          state.connections = [...state.connections, ...data.friends];
        }
      })

      .addCase(getConnectionsThunk.rejected, state => {
        state.loading = false;
        state.loadingMore = false;
      })

      // 👥 FOLLOWERS
      .addCase(getFollowersThunk.pending, (state, action: any) => {
        if (action.meta.arg.page === 1) {
          state.loading = true;
        } else {
          state.loadingMore = true;
        }
      })

      .addCase(getFollowersThunk.fulfilled, (state, action: any) => {
        state.loading = false;
        state.loadingMore = false;

        const page = action.meta.arg.page;
        const data = action.payload?.data;

        state.page = data?.page || 1;
        state.totalPages = data?.total_pages || 1;
        state.hasMore = state.page < state.totalPages;

        if (page === 1) {
          state.followers = data?.followers || [];
        } else {
          state.followers = [...state.followers, ...(data?.followers || [])];
        }
      })

      .addCase(getFollowersThunk.rejected, (state, action: any) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload;
      })

      // ➡️ FOLLOWINGS
      .addCase(getFollowingsThunk.pending, (state, action: any) => {
        if (action.meta.arg.page === 1) {
          state.loading = true;
        } else {
          state.loadingMore = true;
        }
      })

      .addCase(getFollowingsThunk.fulfilled, (state, action: any) => {
        state.loading = false;
        state.loadingMore = false;

        const page = action.meta.arg.page;
        const data = action.payload?.data;

        state.page = data?.page || 1;
        state.totalPages = data?.total_pages || 1;
        state.hasMore = state.page < state.totalPages;

        if (page === 1) {
          state.followings = data?.following || [];
        } else {
          state.followings = [...state.followings, ...(data?.following || [])];
        }
      })

      .addCase(getFollowingsThunk.rejected, (state, action: any) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload;
      })

      // Suggested user profile
      .addCase(getSuggestedProfiles.pending, state => {
        state.loading = true;
        state.error = null;
        state.loadingSuggestions = true;
      })

      .addCase(getSuggestedProfiles.fulfilled, (state, action: any) => {
        state.loading = false;
        state.loadingSuggestions = false;

        const newUsers = action.payload?.data || [];
        // console.log('suggested profile payload', newUsers);

        // 🔥 PAGINATION LOGIC
        if (action.payload.page === 1) {
          state.suggestedUsers = newUsers;
        } else {
          state.suggestedUsers = [...state.suggestedUsers, ...newUsers];
        }

        // 🔥 HAS MORE
        state.hasMore = newUsers.length > 0;
        state.page = action.payload.page + 1;
      })

      .addCase(getSuggestedProfiles.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
        state.loadingSuggestions = false;
      })

      .addCase(searchConnectionsThunk.pending, state => {
        state.loading = true;
      })
      .addCase(searchConnectionsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.searchedConnections = action.payload.data || [];
      })
      .addCase(searchConnectionsThunk.rejected, state => {
        state.loading = false;
      });
  },
});

export const { clearPendingRequests } = connectionSlice.actions;
export default connectionSlice.reducer;
