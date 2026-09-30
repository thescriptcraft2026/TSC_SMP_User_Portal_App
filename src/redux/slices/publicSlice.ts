import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getPublicTags } from '../../services/publictagApi';

interface TagsState {
  tags: any[];
  loading: boolean;
  error: string | null;
}

const initialState: TagsState = {
  tags: [],
  loading: false,
  error: null,
};


export const searchTags = createAsyncThunk(
  'tags/searchTags',
  async (query: string, { rejectWithValue }) => {
    try {
      const res = await getPublicTags(query);
      return res?.data;
    } catch (error: any) {
      return rejectWithValue(error?.message);
    }
  },
);

const tagsSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    clearTags: state => {
      state.tags = [];
    },
  },
  extraReducers: builder => {
    builder
      .addCase(searchTags.pending, state => {
        state.loading = true;
      })
      .addCase(searchTags.fulfilled, (state, action) => {
        state.loading = false;
        state.tags = action.payload;
      })
      .addCase(searchTags.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTags } = tagsSlice.actions;
export default tagsSlice.reducer;