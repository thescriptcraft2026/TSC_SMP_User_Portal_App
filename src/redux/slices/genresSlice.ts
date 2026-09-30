import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getGeneresApi } from '../../services/generes';

interface GeneresState {
  generes: any[];
  loading: boolean;
  error: string | null;
}

const initialState: GeneresState = {
  generes: [],
  loading: false,
  error: null,
};

// ✅ Async thunk
export const getGeneres = createAsyncThunk(
  'generes/getGeneres',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();

      // 🔥 STOP duplicate API calls
      if (state.genre.generes?.length > 0) {
        return state.genre.generes; 
      }

      const res = await getGeneresApi();
      return res;
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.errors?.[0]?.message ||
          error?.response?.data?.message ||
          error?.message,
      );
    }
  },
);

// ✅ Slice
const generesSlice = createSlice({
  name: 'generes',
  initialState,
  reducers: {},

  extraReducers: builder => {
    builder
      .addCase(getGeneres.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGeneres.fulfilled, (state, action) => {
        state.loading = false;
        state.generes = action.payload?.data;
      })
      .addCase(getGeneres.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// ✅ Correct export
export default generesSlice.reducer;
