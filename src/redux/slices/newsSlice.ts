import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getNewsApi } from '../../services/newsApi';

interface NewsState {
  news: any;
  loading: boolean;
  page: any;
  hasMore: any;
  error: string | null;
}

export const getNews = createAsyncThunk(
  'news/getNews',
  async (
    {
      page = 1,
    }: {
      page?: number;
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await getNewsApi(page);
      return { ...res, page };
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

const initialState: NewsState = {
  news: [],
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
};

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      // Get News
      .addCase(getNews.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNews.fulfilled, (state, action: any) => {
        // console.log('news payload', action.payload);
        state.loading = false;

        const newNews = action.payload?.data || []; // ✅ FIXED
        const page = action.payload.page;

        if (page === 1) {
          state.news = newNews;
        } else {
          state.news = [...state.news, ...newNews];
        }

        const totalPages = action.payload?.data?.total_pages || 1; // ✅ FIXED

        state.page = page;
        state.hasMore = page < totalPages;
      })
      .addCase(getNews.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default newsSlice.reducer;
