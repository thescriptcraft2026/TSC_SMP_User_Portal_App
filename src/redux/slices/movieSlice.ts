import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  getAllMoviesApi,
  getMoviesDetailsByIdApi,
  movieBookmarkApi,
  movieLikeApi,
  movieRatingApi,
} from '../../services/movieApi';

// 🔥 Types
interface MoviesState {
  movies: any[];
  selectedMovies: any;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  // 👇 NEW
  detailsLoading: boolean;
  bookmarkedIds: string[];
  bookmarkLoading: boolean;
}

// 🔥 Async Thunk
export const getAllMovies = createAsyncThunk(
  'movies/getAll',
  async (
    {
      page = 1,
      sort_by = '',
      search = '',
      genre_id = '',
      reviewcategory_id = '',
    }: {
      page?: number;
      sort_by?: string;
      search?: string;
      genre_id?: string;
      reviewcategory_id?: any;
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await getAllMoviesApi(
        page,
        sort_by,
        search,
        genre_id,
        reviewcategory_id,
      );
      console.log('movies res', res);
      return { ...res, page }; // 👈 keep page info
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

// Get Movie Details By id
export const getMovieById = createAsyncThunk(
  'movies/getById',
  async (id: string | number, { rejectWithValue }) => {
    try {
      const res = await getMoviesDetailsByIdApi(id);
      return res;
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

// Movie Bookmark
export const toggleContestBookmark = createAsyncThunk(
  'movies/toggleBookmark',
  async (
    {
      content_id,
      type,
    }: {
      content_id: string;
      type: 'create' | 'delete';
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await movieBookmarkApi({
        content_id,
        type,
      });

      // ✅ SAFE CHECK
      if (!res) {
        throw new Error('Empty response');
      }

      return { content_id, res };
    } catch (error: any) {
      console.log('THUNK ERROR FULL:', error); // 👈 ADD THIS
      return rejectWithValue(
        error?.response?.data?.errors?.[0]?.message ||
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message,
      );
    }
  },
);

// Movie Like
export const toggleMovieLike = createAsyncThunk(
  'movies/toggleLike',
  async (
    {
      content_id,
      type,
      emoji_type,
    }: { content_id: string; type: 'create' | 'delete'; emoji_type?: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await movieLikeApi({
        content_id,
        type,
        emoji_type,
      });

      if (!res) {
        throw new Error('Empty response');
      }

      return { content_id, res };
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

// Movie Rating
export const submitMovieRating = createAsyncThunk(
  'movies/submitRating',
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await movieRatingApi(payload);
      return { ...payload, res };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  },
);

// 🔥 Initial State
const initialState: MoviesState = {
  movies: [],
  selectedMovies: null,
  page: 1,
  hasMore: true,
  loading: false,
  loadingMore: false,
  error: null,
  detailsLoading: false,
  bookmarkedIds: [],
  bookmarkLoading: false,
};

// 🔥 Slice
const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    // 🔄 Reset (for filter/sort change)
    resetMovies: state => {
      state.movies = [];
      state.page = 1;
      state.hasMore = true;
      state.error = null;
    },
    toggleBookmarkLocal: (state, action) => {
      const id = action.payload;

      if (!id) return;

      const alreadyBookmarked = state.bookmarkedIds.includes(id);

      // ✅ ids sync
      if (alreadyBookmarked) {
        state.bookmarkedIds = state.bookmarkedIds.filter(i => i !== id);
      } else {
        state.bookmarkedIds.push(id);
      }

      // ✅ details sync
      if (state.selectedMovies?.id === id) {
        state.selectedMovies.is_wishlisted = alreadyBookmarked ? 0 : 1;
      }

      // ✅ movies list sync
      state.movies = state.movies.map((item: any) => {
        if (item.id === id) {
          return {
            ...item,

            is_wishlisted: alreadyBookmarked ? 0 : 1,
          };
        }

        return item;
      });
    },

    toggleLikeLocal: (
      state,
      action: PayloadAction<{
        id: string;
        emoji_type?: string | null;
      }>,
    ) => {
      const { id, emoji_type } = action.payload;

      if (!id) return;

      const updateMovie = (movie: any) => {
        if (!movie || movie.id !== id) return movie;

        const alreadyLiked = movie?.is_liked === 1;

        // ✅ UNLIKE
        if (emoji_type === null) {
          return {
            ...movie,

            is_liked: 0,

            is_like: Math.max(0, Number(movie.is_like || 0) - 1),

            emoji_type: null,
          };
        }

        // ✅ CHANGE EMOJI
        if (alreadyLiked) {
          return {
            ...movie,

            is_liked: 1,

            // ✅ KEEP SAME COUNT
            is_like: Number(movie.is_like || 0),

            emoji_type,
          };
        }

        // ✅ NEW LIKE
        return {
          ...movie,

          is_liked: 1,

          is_like: Number(movie.is_like || 0) + 1,

          emoji_type,
        };
      };

      // DETAILS
      if (state.selectedMovies?.id === id) {
        state.selectedMovies = updateMovie(state.selectedMovies);
      }

      // LIST
      state.movies = state.movies.map((item: any) => updateMovie(item));
    },

    updateLikeCount: (state, action) => {
      const { id, isLiked } = action.payload;

      // ✅ update participants (THIS SCREEN USES THIS)
      state.movies = state.movies.map((item: any) => {
        if (item.id === id) {
          return {
            ...item,
            likes_count: isLiked ? item.likes_count + 1 : item.likes_count - 1,
          };
        }
        return item;
      });
    },
    updateRatingLocal: (state, action) => {
      const { id, rating } = action.payload;

      const movie = state.movies.find((b: any) => b.id === id);

      if (movie) {
        movie.avg_rating = rating; // 🔥 update instantly
      }
    },
    updateRatingLocalDetails: (state, action) => {
      const { id, rating } = action.payload;

      // 👉 update details screen
      if (state.selectedMovies?.id === id) {
        state.selectedMovies.avg_rating = rating;
      }

      // 👉 update list screen
      state.movies = state.movies.map((item: any) => {
        if (item.id === id) {
          return {
            ...item,
            avg_rating: rating,
          };
        }
        return item;
      });
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getAllMovies.pending, (state, action: any) => {
        const page = action.meta.arg.page || 1;

        state.error = null;

        if (page === 1) {
          state.loading = true;
        } else {
          state.loadingMore = true;
        }
      })
      // In getAllMovies.fulfilled case
      .addCase(getAllMovies.fulfilled, (state, action: any) => {
        state.loading = false;
        state.loadingMore = false;

        const newMovies = action.payload?.data || [];

        if (action.payload.page === 1) {
          state.movies = [...newMovies]; // ✅ Create new array reference
        } else {
          state.movies = [...state.movies, ...newMovies]; // ✅ Create new array reference
        }

        state.page = action.payload.page;
        const pagination = action.payload?.pagination;
        state.hasMore = pagination?.page < pagination?.total_pages;
      })
      .addCase(getAllMovies.rejected, (state, action: any) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload as string;
      })

      // 🔥 Get Movie Details
      .addCase(getMovieById.pending, state => {
        state.detailsLoading = true;
        state.error = null;
      })

      .addCase(getMovieById.fulfilled, (state, action: any) => {
        state.detailsLoading = false;

        const movie = action.payload?.data || action.payload;

        state.selectedMovies = movie;

        // ✅ SYNC BOOKMARK STATE FROM API
        if (movie?.is_wishlisted === 1) {
          if (!state.bookmarkedIds.includes(movie.id)) {
            state.bookmarkedIds.push(movie.id);
          }
        } else {
          state.bookmarkedIds = state.bookmarkedIds.filter(i => i !== movie.id);
        }
      })

      .addCase(getMovieById.rejected, (state, action: any) => {
        state.detailsLoading = false;
        state.error = action.payload as string;
      })

      // Bookmark
      .addCase(toggleContestBookmark.pending, state => {
        state.bookmarkLoading = true;
      })

      .addCase(toggleContestBookmark.fulfilled, state => {
        state.bookmarkLoading = false;
      })

      .addCase(toggleContestBookmark.rejected, (state, action) => {
        state.bookmarkLoading = false;

        console.log('Bookmark Error:', action.payload);
      })

      //   Like
      .addCase(toggleMovieLike.pending, state => {
        state.loading = true;
      })
      .addCase(toggleMovieLike.fulfilled, state => {
        state.loading = false;
      })
      .addCase(toggleMovieLike.rejected, (state, action) => {
        state.loading = false;
        console.log('Like Error:', action.payload);
      })

      // Rating
      .addCase(submitMovieRating.pending, state => {
        state.loading = true;
      })
      .addCase(submitMovieRating.fulfilled, state => {
        state.loading = false;
      })
      .addCase(submitMovieRating.rejected, (state, action) => {
        state.loading = false;
        console.log('Rating Error:', action.payload);
      });
  },
});

export const {
  resetMovies,
  toggleBookmarkLocal,
  updateLikeCount,
  updateRatingLocal,
  toggleLikeLocal,
  updateRatingLocalDetails,
} = moviesSlice.actions;
export default moviesSlice.reducer;
