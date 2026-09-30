import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  getVisionXApi,
  getVisionXById,
  createVisionX,
  updateVisionX,
  deleteVisionX,
} from '../../services/visionXApi';

// Types

interface VisionXItem {
  id: string;
  [key: string]: any;
}

interface VisionXState {
  visionX: VisionXItem[];
  pagination: any;
  selectedVisionX: VisionXItem | null;
  loading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  loadingMore: boolean;
}

// Intial State

const initialState: VisionXState = {
  visionX: [],
  selectedVisionX: null,
  pagination: null,
  loading: false,
  loadingMore: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,

  error: null,

  page: 1,
  hasMore: true,
};

// Get Vision Thunk
export const getVisionXThunk = createAsyncThunk(
  'visionx/getVisionX',
  async (
    {
      page = 1,
      sort_by = 'recent',
      type = 'visionx',
      search = '',
      genre_id = '',
    }: {
      page?: number;
      sort_by?: string;
      type?: string;
      search?: string;
      genre_id?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await getVisionXApi(type, sort_by, page, search, genre_id);
      return { ...res, page };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  },
);

/**
 * Fetch VisionX item by ID
 */
export const getVisionXByIdThunk = createAsyncThunk(
  'visionx/getVisionXById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await getVisionXById(id);
      return res;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  },
);

/**
 * Create VisionX item
 */
export const createVisionXThunk = createAsyncThunk(
  'visionx/createVisionX',
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await createVisionX(data);
      return res;
    } catch (error: any) {
      return rejectWithValue(error?.message);
    }
  },
);

/**
 * Update VisionX item
 */
export const updateVisionXThunk = createAsyncThunk(
  'visionx/updateVisionX',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await updateVisionX(id, data);
      return res;
    } catch (error: any) {
      return rejectWithValue(error?.message);
    }
  },
);

/**
 * Delete VisionX item
 */
export const deleteVisionXThunk = createAsyncThunk(
  'visionx/deleteVisionX',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteVisionX(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error?.message);
    }
  },
);

// Slice

const visionXSlice = createSlice({
  name: 'visionx',
  initialState,
  reducers: {
    updateVisionXLikeLocal: (
      state,
      action: PayloadAction<{
        id: string;
        isLiked: boolean;
        emoji_type: string | null;
      }>,
    ) => {
      const { id, isLiked, emoji_type } = action.payload;

      // 🔥 LIST
      const item = state.visionX.find(v => v.id === id);

      if (item) {
        const wasLiked = item.isLiked === 1;

        item.isLiked = isLiked ? 1 : 0;

        // ✅ only increase/decrease when actual like/unlike
        if (!wasLiked && isLiked) {
          item.likes_count = (item.likes_count || 0) + 1;
        }

        if (wasLiked && !isLiked) {
          item.likes_count = Math.max((item.likes_count || 1) - 1, 0);
        }

        // ✅ always update emoji
        item.emoji_type = emoji_type;
      }

      // 🔥 DETAILS
      const selectedItem = state.selectedVisionX;

      if (selectedItem && selectedItem.id === id) {
        const wasLiked = selectedItem.isLiked === 1;

        selectedItem.isLiked = isLiked ? 1 : 0;

        if (!wasLiked && isLiked) {
          selectedItem.likes_count = (selectedItem.likes_count || 0) + 1;
        }

        if (wasLiked && !isLiked) {
          selectedItem.likes_count = Math.max(
            (selectedItem.likes_count || 1) - 1,
            0,
          );
        }

        selectedItem.emoji_type = emoji_type;
      }
    },
  },

  extraReducers: builder => {
    builder
      .addCase(getVisionXThunk.pending, (state, action: any) => {
        const page = action.meta.arg.page || 1;

        state.error = null;

        if (page === 1) {
          state.loading = true;
        } else {
          state.loadingMore = true;
        }
      })
      .addCase(getVisionXThunk.fulfilled, (state, action: any) => {
        state.loading = false;
        state.loadingMore = false;

        const newData = Array.isArray(action.payload?.data)
          ? action.payload.data
          : [];

        const page = action.payload.page;
        if (page === 1) {
          state.visionX = newData;
        } else {
          // state.visionX = [...state.visionX, ...newData];
          const mergedData = [...state.visionX, ...newData];

          state.visionX = mergedData.filter(
            (item, index, self) =>
              index === self.findIndex(t => t.id === item.id),
          );
        }
        state.pagination = action.payload?.pagination;
        const totalPages = action.payload?.pagination?.total_pages || 1;

        state.page = page;
        state.hasMore = page < totalPages;
      })
      .addCase(getVisionXThunk.rejected, (state, action: any) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload;
      })

      // Get By VisionX By Id

      .addCase(getVisionXByIdThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVisionXByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedVisionX = action.payload;
      })
      .addCase(getVisionXByIdThunk.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Vision X

      .addCase(createVisionXThunk.pending, state => {
        state.createLoading = true;
      })
      .addCase(createVisionXThunk.fulfilled, (state, action) => {
        state.createLoading = false;

        // Add new item at top
        state.visionX = [action.payload, ...state.visionX];
      })
      .addCase(createVisionXThunk.rejected, (state, action: any) => {
        state.createLoading = false;
        state.error = action.payload;
      })

      // Update Vision X

      .addCase(updateVisionXThunk.pending, state => {
        state.updateLoading = true;
      })
      .addCase(updateVisionXThunk.fulfilled, (state, action: any) => {
        state.updateLoading = false;

        const index = state.visionX.findIndex(
          item => item.id === action.payload.id,
        );

        if (index !== -1) {
          state.visionX[index] = action.payload;
        }

        // Update selected item also
        if (state.selectedVisionX?.id === action.payload.id) {
          state.selectedVisionX = action.payload;
        }
      })
      .addCase(updateVisionXThunk.rejected, (state, action: any) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

      // Delete Vision X

      .addCase(deleteVisionXThunk.pending, state => {
        state.deleteLoading = true;
      })
      .addCase(deleteVisionXThunk.fulfilled, (state, action) => {
        state.deleteLoading = false;

        state.visionX = state.visionX.filter(
          item => item.id !== action.payload,
        );

        if (state.selectedVisionX?.id === action.payload) {
          state.selectedVisionX = null;
        }
      })
      .addCase(deleteVisionXThunk.rejected, (state, action: any) => {
        state.deleteLoading = false;
        state.error = action.payload;
      });
  },
});

/* ============================================================
   EXPORT
   ============================================================ */
export const { updateVisionXLikeLocal } = visionXSlice.actions;
export default visionXSlice.reducer;
