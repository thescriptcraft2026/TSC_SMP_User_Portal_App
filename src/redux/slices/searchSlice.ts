import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getSearchApi } from '../../services/searchApi';

// 🔥 THUNK
export const fetchSearch = createAsyncThunk(
  'search/fetchSearch',
  async (
    {
      query,
      type = 'posts',
      cursor = null,
    }: { query: string; type?: string; cursor?: string | null },
    { rejectWithValue },
  ) => {
    try {
      const response = await getSearchApi({ query, type, cursor });
      return { ...response, type, cursor };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || 'Something went wrong');
    }
  },
);

interface SearchState {
  loading: boolean;
  results: {
    [key: string]: any[];
  };
  cursor: {
    [key: string]: string | null;
  };
  error: string | null;
}

const initialState: SearchState = {
  loading: false,
  results: {},
  cursor: {},
  error: null,
};

// 🧠 SLICE
const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    clearSearch: state => {
      state.results = {};
      state.cursor = {};
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchSearch.pending, state => {
        state.loading = true;
      })
      .addCase(fetchSearch.fulfilled, (state, action) => {
        state.loading = false;

        const { type, cursor } = action.payload;
        const newData = action.payload?.data || [];
        const nextCursor = action.payload?.pageInfo?.nextCursor || null;

        if (!cursor) {
          state.results[type] = newData;
        } else {
          const existing = state.results[type] || [];

          const merged = [...existing, ...newData];

          state.results[type] = Array.from(
            new Map(merged.map(item => [item.id, item])).values(),
          );
        }

        state.cursor[type] = nextCursor;
      })
      .addCase(fetchSearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSearch } = searchSlice.actions;
export default searchSlice.reducer;
