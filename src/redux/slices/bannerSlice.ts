// redux/slices/bannerSlice.ts

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getBanners } from '../../services/bannersApi';

type BannerImage = {
  id: number;
  image: string;
  link: string | null;
  position: number;
};

type BannerRow = {
  id: number;
  title: string;
  description: string;
  row_type: string;
  position: number;
  status: string;
  images: BannerImage[];
};

type BannerState = {
  loading: boolean;
  rows: BannerRow[];
  error: string | null;
};

const initialState: BannerState = {
  loading: false,
  rows: [],
  error: null,
};

export const fetchBanners = createAsyncThunk(
  'banners/fetchBanners',
  async (_, thunkAPI) => {
    try {
      const res = await getBanners();

      // sort rows by position
      const sortedRows = (res?.data || []).sort(
        (a: BannerRow, b: BannerRow) => a.position - b.position,
      );

      return sortedRows;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || 'Something went wrong',
      );
    }
  },
);

const bannerSlice = createSlice({
  name: 'banners',
  initialState,

  reducers: {},

  extraReducers: builder => {
    builder
      .addCase(fetchBanners.pending, state => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.rows = action.payload;
      })

      .addCase(fetchBanners.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default bannerSlice.reducer;
