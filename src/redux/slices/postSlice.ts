import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  deleteOwnPostApi,
  editOwnPostApi,
  postApi,
  repostApi,
} from '../../services/postApi';

interface PostState {
  loading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  error: string | null;
  deleteLoading: boolean;
  repostLoading: boolean;
}

const initialState: PostState = {
  loading: false,
  error: null,
  createLoading: false,
  deleteLoading: false,
  updateLoading: false,
  repostLoading: false,
};

// 🔥 THUNK
export const createPost = createAsyncThunk(
  'post/createPost',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const res = await postApi(formData); // ✅ only pass formData
      return res?.data || res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errors?.[0]?.message ||
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Something went wrong',
      );
    }
  },
);

// Delete own post
export const deletePost = createAsyncThunk(
  'post/deletePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const res = await deleteOwnPostApi(postId);
      return { postId, data: res }; // ✅ return id for UI updates
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Delete failed',
      );
    }
  },
);

// Edit Post
export const editPost = createAsyncThunk(
  'post/editPost',
  async (
    { id, formData }: { id: string; formData: FormData },
    { rejectWithValue },
  ) => {
    try {
      const res = await editOwnPostApi(id, formData);
      return res?.data || res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || error?.message || 'Edit failed',
      );
    }
  },
);

export const repostPost = createAsyncThunk(
  'repost/repostPost',
  async (
    {
      story,
      synopsis_id,
      mentions,
      tags,
    }: {
      story?: string;
      synopsis_id: string;
      mentions?: number[];
      tags?: string[];
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await repostApi({
        story,
        synopsis_id,
        mentions,
        tags,
      });

      return res?.data || res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errors?.[0]?.message ||
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Repost failed',
      );
    }
  },
);

const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    resetPostState: state => {
      state.loading = false;
      state.error = null;
    },
    resetRepostState: state => {
      state.loading = false;
      state.repostLoading = false;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(createPost.pending, state => {
        state.loading = true;
        state.createLoading = true;
      })
      .addCase(createPost.fulfilled, state => {
        state.loading = false;
        state.createLoading = false;
      })
      .addCase(createPost.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
        state.createLoading = false;
      })

      // 🔥 DELETE
      .addCase(deletePost.pending, state => {
        state.deleteLoading = true;
      })
      .addCase(deletePost.fulfilled, state => {
        state.deleteLoading = false;
      })
      .addCase(deletePost.rejected, (state, action: any) => {
        state.deleteLoading = false;
        state.error = action.payload;
      })

      // Edit Post
      .addCase(editPost.pending, state => {
        state.loading = true;
        state.updateLoading = true;
      })
      .addCase(editPost.fulfilled, state => {
        state.loading = false;
        state.updateLoading = false;
      })
      .addCase(editPost.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
        state.updateLoading = false;
      })

      /* ---------------- REPOST ---------------- */
      .addCase(repostPost.pending, state => {
        state.loading = true;
        state.repostLoading = true;
        state.error = null;
      })

      .addCase(repostPost.fulfilled, state => {
        state.loading = false;
        state.repostLoading = false;
      })

      .addCase(repostPost.rejected, (state, action: any) => {
        state.loading = false;
        state.repostLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetPostState } = postSlice.actions;
export default postSlice.reducer;
