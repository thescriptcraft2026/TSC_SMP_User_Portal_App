import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAllBookMarksApi,
  getAllContestBookmarkApi,
  getAllOpporunityBookmarkApi,
} from '../../services/bookMarkApi';

interface BookmarkState {
  books: any[];
  visionx: any[];
  synopses: any[];
  contests: any[];
  opportunities: any[];
  posts: any[];
  movies: any[];

  loading: boolean;
  error: string | null;

  page: {
    book: number;
    visionx: number;
    script: number;
    contest: number;
    opportunity: number;
    post: number;
    movie: number;
  };

  hasMore: {
    book: boolean;
    visionx: boolean;
    script: boolean;
    contest: boolean;
    opportunity: boolean;
    post: boolean;
    movie: boolean;
  };
}

const initialState: BookmarkState = {
  books: [],
  visionx: [],
  synopses: [],
  contests: [],
  opportunities: [],
  posts: [],
  movies: [],

  loading: false,
  error: null,

  page: {
    book: 1,
    visionx: 1,
    script: 1,
    contest: 1,
    opportunity: 1,
    post: 1,
    movie: 1,
  },

  hasMore: {
    book: true,
    visionx: true,
    script: true,
    contest: true,
    opportunity: true,
    post: true,
    movie: true,
  },
};

// 🔥 COMMON BOOKMARKS
export const fetchBookmarks = createAsyncThunk(
  'bookmarks/fetchBookmarks',
  async (
    { type, page = 1 }: { type: string; page?: number },
    { rejectWithValue },
  ) => {
    try {
      const res = await getAllBookMarksApi(type, page);
      return { ...res, page, type };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || 'Something went wrong');
    }
  },
);

// 🔥 CONTEST BOOKMARKS
export const fetchContestBookmarks = createAsyncThunk(
  'bookmarks/fetchContestBookmarks',
  async (page: number = 1, { rejectWithValue }) => {
    try {
      const res = await getAllContestBookmarkApi(page);

      return {
        data: res?.data || [],
        page,
      };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || 'Something went wrong');
    }
  },
);

// 🔥 opportunity BOOKMARKS
export const fetchOpporunityBookmarks = createAsyncThunk(
  'bookmarks/fetchOpporunityBookmarks',
  async (page: number = 1, { rejectWithValue }) => {
    try {
      const res = await getAllOpporunityBookmarkApi(page);
      // console.log('dfsbvhjklsdfv', res);
      return {
        data: res?.data || [], // ✅ FIXED
        page,
      };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || 'Something went wrong');
    }
  },
);

const bookmarkSlice = createSlice({
  name: 'bookmarks',
  initialState,
  reducers: {
    resetBookmarksByType: (state, action) => {
      const type = action.payload;

      if (type === 'post') {
        state.posts = [];
        state.page.post = 1;
        state.hasMore.post = true;
      }
      if (type === 'book') {
        state.books = [];
        state.page.book = 1;
        state.hasMore.book = true;
      }

      if (type === 'visionx') {
        state.visionx = [];
        state.page.visionx = 1;
        state.hasMore.visionx = true;
      }

      if (type === 'script') {
        state.synopses = [];
        state.page.script = 1;
        state.hasMore.script = true;
      }

      if (type === 'contest') {
        state.contests = [];
        state.page.contest = 1;
        state.hasMore.contest = true;
      }
      if (type === 'opportunity') {
        state.opportunities = [];
        state.page.opportunity = 1;
        state.hasMore.opportunity = true;
      }
      if (type === 'movie') {
        state.movies = [];
        state.page.movie = 1;
        state.hasMore.movie = true;
      }
    },
    toggleBookmarkInList: (state, action) => {
      const id = action.payload;
      state.posts = state.posts.filter((item: any) => item.synopsis?.id !== id);
    },

    removeContestBookmarkLocal: (state, action) => {
      const id = action.payload;

      state.contests = state.contests.filter(
        (item: any) => item?.contest?.id !== id,
      );
    },

    removeOpportunityBookmarkLocal: (state, action) => {
      const id = action.payload;

      state.opportunities = state.opportunities.filter(
        (item: any) => item?.opportunity?.id !== id,
      );
    },

    removeBookBookmarkLocal: (state, action) => {
      const id = action.payload;

      state.books = state.books.filter((item: any) => item?.book?.id !== id);
    },

    removeVisionXBookmarkLocal: (state, action) => {
      const id = action.payload;

      state.visionx = state.visionx.filter(
        (item: any) => item?.visionx?.id !== id,
      );
    },

    removeSynopsisBookmarkLocal: (state, action) => {
      const id = action.payload;

      state.synopses = state.synopses.filter(
        (item: any) => item?.synopsis?.id !== id,
      );
    },

    removeMovieBookmarkLocal: (state, action) => {
      const id = action.payload;

      state.movies = state.movies.filter((item: any) => item?.movie?.id !== id);
    },
  },

  extraReducers: builder => {
    builder
      // 🔹 COMMON
      .addCase(fetchBookmarks.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookmarks.fulfilled, (state, action) => {
        state.loading = false;

        const { page, type } = action.payload;

        // 🔥 FIX DATA EXTRACTION
        const data =
          action.payload?.data?.data || // nested
          action.payload?.data || // fallback
          [];
        console.log('data', data);

        if (type === 'post') {
          state.posts = page === 1 ? data : [...state.posts, ...data];
          state.page.post = page;
          state.hasMore.post = data.length > 0;
          console.log('state post', state.posts);
        }
        if (type === 'book') {
          state.books = page === 1 ? data : [...state.books, ...data];
          state.page.book = page;
          state.hasMore.book = data.length > 0;
        }

        if (type === 'visionx') {
          state.visionx = page === 1 ? data : [...state.visionx, ...data];
          state.page.visionx = page;
          state.hasMore.visionx = data.length > 0;
        }

        if (type === 'script') {
          state.synopses = page === 1 ? data : [...state.synopses, ...data];
          state.page.script = page;
          state.hasMore.script = data.length > 0;
        }
      })
      .addCase(fetchBookmarks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 🔹 CONTEST
      .addCase(fetchContestBookmarks.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContestBookmarks.fulfilled, (state, action) => {
        state.loading = false;

        const { data, page } = action.payload;

        state.contests = page === 1 ? data : [...state.contests, ...data];

        state.page.contest = page; // ✅ FIXED
        state.hasMore.contest = data.length > 0; // ✅ FIXED
      })
      .addCase(fetchContestBookmarks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 🔹 Opporunity
      .addCase(fetchOpporunityBookmarks.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOpporunityBookmarks.fulfilled, (state, action) => {
        state.loading = false;

        const { data, page } = action.payload;

        state.opportunities =
          page === 1 ? data : [...state.opportunities, ...data];

        state.page.opportunity = page; // ✅ FIXED
        state.hasMore.opportunity = data.length > 0; // ✅ FIXED
      })
      .addCase(fetchOpporunityBookmarks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  resetBookmarksByType,
  toggleBookmarkInList,
  removeContestBookmarkLocal,
  removeOpportunityBookmarkLocal,
  removeBookBookmarkLocal,
  removeVisionXBookmarkLocal,
  removeSynopsisBookmarkLocal,
  removeMovieBookmarkLocal,
} = bookmarkSlice.actions;
export default bookmarkSlice.reducer;
