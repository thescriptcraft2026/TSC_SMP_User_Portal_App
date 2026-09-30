import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  createBookApi,
  deleteBookApi,
  getAllBooks,
  updateBookApi,
  getBookById,
  ratingApi,
  suggestedBookApi,
} from '../../services/bookApi';
import { getProfileApi } from '../../services/profileApi';

interface BookState {
  books: any;
  pagination: any;
  selectedBook: any;
  loading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  error: string | null;
  user: any;
  page: any;
  hasMore: any;
  suggestedBooks: [];
  suggestedLoading: boolean;
}

export const getBooks = createAsyncThunk(
  'book/getBooks',
  async (
    {
      page = 1,
      sort_by = 'recent',
      type = 'book',
      search = '',
      genre_id = '',
    }: {
      page?: number;
      sort_by?: string;
      type?: 'book' | 'script';
      search?: string;
      genre_id?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await getAllBooks(type, page, sort_by, search, genre_id);

      return {
        ...res,
        page,
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

export const getBookByIdThunk = createAsyncThunk(
  'book/getBookById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await getBookById(id);
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

export const createBook = createAsyncThunk(
  'book/createBook',
  async (bookData: any, { rejectWithValue }) => {
    try {
      const res = await createBookApi(bookData);
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

export const updateBook = createAsyncThunk(
  'book/updateBook',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await updateBookApi(id, data);
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

// 🗑 DELETE BOOK
export const deleteBook = createAsyncThunk(
  'book/deleteBook',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteBookApi(id);
      return id;
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

export const getUserProfile = createAsyncThunk(
  'profile/getProfile',
  async (user_name: string, { rejectWithValue }) => {
    try {
      const res = await getProfileApi(user_name);
      // console.log('get prifle res', res);
      return res.data;
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

// Rating
export const ratingAction = createAsyncThunk(
  'book/rating',
  async (
    { synopsis_id, rating }: { synopsis_id: string; rating: number },
    { rejectWithValue },
  ) => {
    try {
      const res = await ratingApi(synopsis_id, rating);

      return {
        ...res,
        synopsis_id,
        rating,
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

export const getSuggestedBooks = createAsyncThunk(
  'book/getSuggestedBooks',
  async (book_id: string, { rejectWithValue }) => {
    try {
      const res = await suggestedBookApi(book_id);

      console.log('🔥 FINAL RES:', res);

      return res?.data?.suggestions || []; // ✅ CORRECT PATH
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  },
);

const initialState: BookState = {
  books: [],
  pagination: null,
  selectedBook: null,
  loading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  error: null,
  user: undefined,
  page: 1,
  hasMore: true,
  suggestedBooks: [],
  suggestedLoading: false,
};

const bookSlice = createSlice({
  name: 'book',
  initialState,
  reducers: {
    updateLikeCount: (state, action) => {
      const { id, isLiked, emoji_type } = action.payload;

      const book = state.books.find((b: any) => b.id === id);

      if (book) {
        // ✅ update like count
        book.likes_count = isLiked
          ? book.likes_count + 1
          : Math.max(book.likes_count - 1, 0);

        // ✅ update liked state
        book.isLiked = isLiked ? 1 : 0;

        // ✅ update emoji type
        book.emoji_type = emoji_type;
      }

      // ✅ details page also
      if (state.selectedBook?.id === id) {
        state.selectedBook.likes_count = isLiked
          ? state.selectedBook.likes_count + 1
          : Math.max(state.selectedBook.likes_count - 1, 0);

        state.selectedBook.isLiked = isLiked ? 1 : 0;

        state.selectedBook.emoji_type = emoji_type;
      }
    },
    updateRatingLocal: (state, action) => {
      const { id, rating } = action.payload;

      const book = state.books.find((b: any) => b.id === id);

      if (book) {
        book.avg_rating = rating; // 🔥 update instantly
      }
    },
  },
  extraReducers: builder => {
    builder
      // Get Books
      .addCase(getBooks.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBooks.fulfilled, (state, action: any) => {
        state.loading = false;

        const newBooks = action.payload?.data || [];
        const page = action.payload.page;

        console.log({
          page,
          newBooks: newBooks.length,
          totalBefore: state.books.length,
        });

        if (page === 1) {
          state.books = newBooks;
        } else {
          state.books = [...state.books, ...newBooks];
        }

        console.log({
          totalAfter: state.books.length,
        });

        state.pagination = action.payload?.pagination;
        const totalPages = action.payload?.pagination?.total_pages || 1;

        state.page = page;
        state.hasMore = page < totalPages;
      })
      .addCase(getBooks.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Book
      .addCase(createBook.pending, state => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createBook.fulfilled, (state, action) => {
        state.createLoading = false;

        const newBook = action.payload?.data;
        if (newBook) {
          state.books.unshift(newBook);
        }
      })
      .addCase(createBook.rejected, (state, action: any) => {
        state.createLoading = false;
        state.error = action.payload;
      })

      // Get By Id
      .addCase(getBookByIdThunk.pending, state => {
        state.loading = true;
        state.error = null;

        // 🔥 CLEAR OLD BOOK
        state.selectedBook = null;

        // 🔥 OPTIONAL
        state.suggestedBooks = [];
      })

      .addCase(getBookByIdThunk.fulfilled, (state, action) => {
        state.loading = false;

        state.selectedBook = action.payload;
      })
      .addCase(getBookByIdThunk.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Updating Book By Id
      .addCase(updateBook.pending, state => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        state.updateLoading = false;

        const updatedBook = action.payload?.data;

        const index = state.books.findIndex(
          (b: any) => b.id === updatedBook.id,
        );

        if (index !== -1) {
          state.books[index] = updatedBook;
        }
      })
      .addCase(updateBook.rejected, (state, action: any) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

      // Deleting Book By Id
      .addCase(deleteBook.pending, state => {
        state.deleteLoading = true;
        state.error = null;
      })

      .addCase(deleteBook.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.books = state.books.filter((b: any) => b.id !== action.payload);
      })
      .addCase(deleteBook.rejected, (state, action: any) => {
        state.deleteLoading = false;
        state.error = action.payload;
      })

      // Get User
      .addCase(getUserProfile.pending, state => {
        state.loading = true;
        state.user = undefined; // 🔥 clears old profile instantly
      })
      .addCase(getUserProfile.fulfilled, (state, action: any) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getUserProfile.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ⭐ Rating
      .addCase(ratingAction.pending, state => {
        state.loading = true;
      })

      .addCase(ratingAction.fulfilled, (state, action: any) => {
        state.loading = false;

        const { synopsis_id, rating } = action.payload;

        // ✅ details screen
        if (state.selectedBook?.id === synopsis_id) {
          state.selectedBook.avg_rating = action.payload?.avg_rating || rating;
        }

        // ✅ list screen
        const book = state.books.find((b: any) => b.id === synopsis_id);

        if (book) {
          book.avg_rating = action.payload?.avg_rating || rating;
        }
      })

      .addCase(ratingAction.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 📚 Suggested Books
      .addCase(getSuggestedBooks.pending, state => {
        state.suggestedLoading = true;
      })

      .addCase(getSuggestedBooks.fulfilled, (state, action: any) => {
        console.log('suggested synopses payload', action.payload);
        state.suggestedLoading = false;
        state.suggestedBooks = action.payload || [];
      })

      .addCase(getSuggestedBooks.rejected, (state, action: any) => {
        state.suggestedLoading = false;
        state.error = action.payload;
      });
  },
});

export const { updateLikeCount, updateRatingLocal } = bookSlice.actions;
export default bookSlice.reducer;
