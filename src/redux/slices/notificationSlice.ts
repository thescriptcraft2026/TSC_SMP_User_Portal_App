import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAllNotification,
  markAsReadNotificationApi,
  notificationDeleteApi,
  markAllAsReadApi,
  notificationCountApi,
} from '../../services/notificationApi';

// ✅ TYPES (optional but recommended)
interface NotificationState {
  notifications: any[];
  loading: boolean;
  error: string | null;
  page: any;
  hasMore: any;
  loadingMore: boolean;
  count: number;
}

const initialState: NotificationState = {
  notifications: [],
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
  loadingMore: false,
  count: 0,
};

// ✅ ASYNC THUNK
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async ({ page = 1 }: any, { rejectWithValue }) => {
    try {
      const res = await getAllNotification(page);
      return {
        data: res?.data || [],
        page,
        hasMore: res?.data?.length > 0,
      };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errors?.[0]?.message ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message,
      );
    }
  },
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notification_id: number, { rejectWithValue }) => {
    try {
      const res = await markAsReadNotificationApi(notification_id);
      return notification_id; // we only need id
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  },
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (notification_id: string, { rejectWithValue }) => {
    try {
      await notificationDeleteApi(notification_id);
      return notification_id; // only id needed
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  },
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await markAllAsReadApi();
      return true; // we can return anything since we will just clear all unread locally
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  },
);

export const notificationCount = createAsyncThunk(
  'notifications/count',
  async (_, { rejectWithValue }) => {
    try {
      const res = await notificationCountApi();
      return res?.data?.unread_count || 0;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  },
);

// ✅ SLICE
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    resetNotifications: state => {
      state.notifications = [];
      state.loading = false;
      state.loadingMore = false;
      state.error = null;
      state.page = 1;
      state.hasMore = true;
      state.count = 0;
    },
    markAsReadLocal: (state, action) => {
      const id = action.payload;

      const item = state.notifications.find(
        (n: any) => n.id.toString() === id.toString(),
      );

      if (item && !item.is_read) {
        item.is_read = true;
        state.count = Math.max(state.count - 1, 0);
      }
    },
    deleteNotificationLocal: (state, action) => {
      const id = action.payload;

      state.notifications = state.notifications.filter(
        (item: any) => item.id.toString() !== id.toString(),
      );
    },
  },
  extraReducers: builder => {
    builder
      // 🔄 FETCH
      .addCase(fetchNotifications.pending, (state, action) => {
        if (action.meta.arg.page === 1) {
          state.loading = true;
          state.notifications = [];
        } else {
          state.loadingMore = true;
        }
      })

      .addCase(fetchNotifications.fulfilled, (state, action) => {
        const { data, page, hasMore } = action.payload;
        state.loading = false;
        state.loadingMore = false;

        if (page === 1) {
          state.notifications = data;
        } else {
          state.notifications = [...state.notifications, ...data];
        }

        state.page = page;
        state.hasMore = hasMore;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Error';
      })

      .addCase(deleteNotification.fulfilled, (state, action) => {
        const id = action.payload;

        state.notifications = state.notifications.filter(
          item => item.id.toString() !== id.toString(),
        );
      })

      .addCase(markAllAsRead.fulfilled, (state, action) => {
        state.notifications = state.notifications.map(item => ({
          ...item,
          is_read: true,
        }));
      })

      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const id = action.payload;

        const notification = state.notifications.find(item => item.id === id);

        if (notification && !notification.is_read) {
          notification.is_read = true;
          state.count = Math.max(state.count - 1, 0);
        }
      })

      .addCase(notificationCount.pending, state => {
        state.loading = true;
      })

      .addCase(notificationCount.fulfilled, (state, action) => {
        state.loading = false;
        state.count = action.payload || 0;
      })

      .addCase(notificationCount.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ✅ EXPORTS
export const { resetNotifications, markAsReadLocal, deleteNotificationLocal } =
  notificationSlice.actions;
export default notificationSlice.reducer;
