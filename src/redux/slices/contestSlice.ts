import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  bookmarkApi,
  getAllContestApi,
  getAllParticipantByContestId,
  getContestBannerApi,
  getContestById,
  getMyParticipatedContests,
  getParticipantDetailsById,
  participateApi,
} from '../../services/contestApi';
import api from '../../../Instance/Instance';

interface ContestState {
  contest: any;
  loading: boolean;
  page: any;
  selectedContest: any;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  error: string | null;
  user: any;
  hasMore: any;
  bookmarkedIds: string[];
  participants: any[];
  participateLoading: boolean;
  selectedParticipant: any;
  myParticipatedContests: any[];
  myParticipatedLoading: boolean;

  contestPage: number;
  contestHasMore: boolean;

  participantsPage: number;
  participantsHasMore: boolean;
  participantsLoading: boolean;

  myContestPage: number;
  myContestHasMore: boolean;

  contestStatus: any;
  contestStatusLoading: any;
  contestStatusError: any;

  // banner
  bannerData: any;
  bannerLoading: boolean;
  bannerError: string | null;
}

export const getAllContest = createAsyncThunk(
  'contest/getAllContest',
  async (
    {
      page = 1,
      sort_by = 'recent',
      search = '',
      genre_id = '',
    }: {
      page?: number;
      sort_by?: string;
      search?: string;
      genre_id?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await getAllContestApi(page, sort_by, search, genre_id);

      return {
        ...res,
        page,
        sort_by,
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

export const getContestByIdThunk = createAsyncThunk(
  'book/getContestById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await getContestById(id);
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

export const getContestStatusThunk = createAsyncThunk(
  'contest/getContestStatus',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/public/contest-details/${id}/status`);
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

// ✅ Bookmamrk THUNK
export const toggleContestBookmark = createAsyncThunk(
  'contest/toggleBookmark',
  async (
    { contest_id, type }: { contest_id: string; type: 'create' | 'delete' },
    { rejectWithValue },
  ) => {
    try {
      const res = await bookmarkApi(contest_id, type);

      // ✅ SAFE CHECK
      if (!res) {
        throw new Error('Empty response');
      }

      return { contest_id, type, res };
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

export const getParticipantsByContestId = createAsyncThunk(
  'participants/getByContestId',
  async (
    {
      contest_id,
      page = 1,
      search = '',
      sort_by = 'rating',
    }: { contest_id: string; page?: number; search?: string; sort_by?: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await getAllParticipantByContestId(
        contest_id,
        page,
        search,
        sort_by,
      );
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

export const participateContest = createAsyncThunk(
  'contest/participate',
  async (
    { formData, contest_id }: { formData: any; contest_id: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await participateApi(formData, contest_id);
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

export const getParticipantDetails = createAsyncThunk(
  'contest/getParticipantDetails',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await getParticipantDetailsById(id);
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

export const getMyParticipatedContestsThunk = createAsyncThunk(
  'contest/getMyParticipatedContests',
  async ({ page = 1 }: { page?: number }, { rejectWithValue }) => {
    try {
      const res = await getMyParticipatedContests(page);

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

export const getContestBanner = createAsyncThunk(
  'contest/getContestBanner',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getContestBannerApi();
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

const initialState: ContestState = {
  contest: [],
  selectedContest: null,
  loading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  error: null,
  user: undefined,
  page: 1,
  hasMore: true,
  bookmarkedIds: [],
  participants: [],
  participateLoading: false,
  selectedParticipant: null,
  myParticipatedContests: [],
  myParticipatedLoading: false,

  contestPage: 1,
  contestHasMore: true,

  participantsPage: 1,
  participantsHasMore: true,
  participantsLoading: false,

  myContestPage: 1,
  myContestHasMore: true,

  contestStatus: null,
  contestStatusLoading: false,
  contestStatusError: null,

  // banner
  bannerData: [],
  bannerLoading: false,
  bannerError: null,
};

const contestSlice = createSlice({
  name: 'contest',
  initialState,
  reducers: {
    // ✅ instant UI update
    toggleBookmarkLocal: (state, action) => {
      const id = action.payload;

      if (!id) return; // ✅ IMPORTANT

      if (state.bookmarkedIds.includes(id)) {
        state.bookmarkedIds = state.bookmarkedIds.filter(i => i !== id);
      } else {
        state.bookmarkedIds.push(id);
      }
    },
    resetParticipants: state => {
      state.participants = [];
      state.loading = false;
      state.error = null;
    },

    startContestLoading: state => {
      state.loading = true;
    },

    resetContest: state => {
      state.contest = [];
      state.page = 1;
      state.hasMore = true;
    },

    updateLikeCount: (state, action) => {
      const { id, isLiked, emoji_type, isReactionChange } = action.payload;

      // ✅ participants
      state.participants = state.participants.map((item: any) => {
        if (item.id === id) {
          return {
            ...item,
            likes:
              typeof item.likes === 'number'
                ? isLiked
                  ? item.likes + 1
                  : Math.max(0, item.likes - 1)
                : item.likes,

            likes_count:
              typeof item.likes_count === 'number'
                ? isLiked
                  ? item.likes_count + 1
                  : Math.max(0, item.likes_count - 1)
                : item.likes_count,

            is_liked: isLiked ? 1 : 0,

            emoji_type: isLiked ? emoji_type : undefined,
          };
        }

        return item;
      });

      // ✅ selected participant
      if (state.selectedParticipant?.id === id) {
        state.selectedParticipant = {
          ...state.selectedParticipant,

          likes:
            typeof state.selectedParticipant.likes === 'number'
              ? isLiked
                ? state.selectedParticipant.likes + 1
                : Math.max(0, state.selectedParticipant.likes - 1)
              : state.selectedParticipant.likes,

          likes_count:
            typeof state.selectedParticipant.likes_count === 'number'
              ? isLiked
                ? state.selectedParticipant.likes_count + 1
                : Math.max(0, state.selectedParticipant.likes_count - 1)
              : state.selectedParticipant.likes_count,

          is_liked: isLiked ? 1 : 0,

          emoji_type: isLiked ? emoji_type : undefined,
        };
      }
    },

    updateRatingLocal: (state, action) => {
      const { id, rating } = action.payload;

      const book = state.contest.find((b: any) => b.id === id);

      if (book) {
        book.avg_rating = rating; // 🔥 update instantly
      }
    },

    toggleContestWishlistStatus: state => {
      if (state.contestStatus) {
        state.contestStatus.isWishlisted = !state.contestStatus.isWishlisted;
      }
    },
  },
  extraReducers: builder => {
    builder
      // Get All Contest
      .addCase(getAllContest.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllContest.fulfilled, (state, action: any) => {
        state.loading = false;

        const newContest = action.payload?.data || [];
        const page = action.payload.page;

        if (page === 1) {
          state.contest = newContest;

          // ✅ SET INITIAL BOOKMARKS
          state.bookmarkedIds = newContest
            .filter((c: any) => c.isWishlisted === 1)
            .map((c: any) => c.id);
        } else {
          state.contest = [...state.contest, ...newContest];

          const newBookmarked = newContest
            .filter((c: any) => c.isWishlisted === 1)
            .map((c: any) => c.id);

          state.bookmarkedIds = [
            ...new Set([...state.bookmarkedIds, ...newBookmarked]),
          ];
        }

        const totalPages = action.payload?.pagination?.total_pages || 1;
        state.page = page;
        state.hasMore = page < totalPages;
      })
      .addCase(getAllContest.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get By Id
      .addCase(getContestByIdThunk.pending, state => {
        state.loading = true;
        state.error = null;
        state.selectedContest = null;
      })
      .addCase(getContestByIdThunk.fulfilled, (state, action) => {
        state.loading = false;

        state.selectedContest = action.payload;
      })
      .addCase(getContestByIdThunk.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Contest status
      .addCase(getContestStatusThunk.pending, state => {
        state.contestStatusLoading = true;
        state.contestStatusError = null;
      })

      .addCase(getContestStatusThunk.fulfilled, (state, action) => {
        state.contestStatusLoading = false;
        state.contestStatus = action.payload.data;
        state.contestStatusError = null;
      })

      .addCase(getContestStatusThunk.rejected, (state, action) => {
        state.contestStatusLoading = false;
        state.contestStatus = null;
        state.contestStatusError =
          action.payload || action.error?.message || 'Something went wrong';
      })

      // Bookmark
      .addCase(toggleContestBookmark.pending, state => {
        state.loading = true;
      })
      .addCase(toggleContestBookmark.fulfilled, (state, action: any) => {
        state.loading = false;

        const { contest_id, type } = action.payload;
        if (type === 'create') {
          if (!state.bookmarkedIds.includes(contest_id)) {
            state.bookmarkedIds.push(contest_id);
          }
        } else {
          state.bookmarkedIds = state.bookmarkedIds.filter(
            id => id !== contest_id,
          );
        }

        // ✅ Update contest list
        state.contest = state.contest.map((item: any) =>
          item.id === contest_id
            ? {
              ...item,
              isWishlisted: type === 'create' ? 1 : 0,
            }
            : item,
        );

        // ✅ Update selected contest
        if (
          contest_id &&
          state.selectedContest &&
          state.selectedContest.id === contest_id
        ) {
          state.selectedContest.isWishlisted = type === 'create' ? 1 : 0;
        }
        // ✅ Update My Participated Contests
        state.myParticipatedContests = state.myParticipatedContests.map(
          (item: any) =>
            item.contest?.id === contest_id
              ? {
                ...item,
                contest: {
                  ...item.contest,
                  isWishlisted: type === 'create' ? 1 : 0,
                },
              }
              : item,
        );

        // ✅ Keep contestStatus in sync
        if (state.contestStatus) {
          state.contestStatus.isWishlisted = type === 'create';
        }
      })
      .addCase(toggleContestBookmark.rejected, (state, action) => {
        state.loading = false;
        console.log('Bookmark Error:', action.payload);
      })

      // Get All Participant by contest id
      .addCase(getParticipantsByContestId.pending, state => {
        state.participantsLoading = true;
        state.error = null;
      })

      .addCase(getParticipantsByContestId.fulfilled, (state, action: any) => {
        state.participantsLoading = false;

        const newData = action.payload?.data || [];
        const page = action.payload?.page;

        if (page === 1) {
          state.participants = newData;
        } else {
          const merged = [...state.participants, ...newData];

          state.participants = Array.from(
            new Map(merged.map((item: any) => [item.id, item])).values(),
          );
        }

        const totalPages = action.payload?.pagination?.total_pages || 1;

        state.participantsPage = page;
        state.participantsHasMore = page < totalPages;
      })

      .addCase(getParticipantsByContestId.rejected, (state, action: any) => {
        state.participantsLoading = false;
        state.error = action.payload;
      })

      .addCase(participateContest.pending, state => {
        state.participateLoading = true;
      })
      .addCase(participateContest.fulfilled, (state, action) => {
        state.participateLoading = false;

        console.log('Participate success:', action.payload);
      })
      .addCase(participateContest.rejected, (state, action: any) => {
        state.participateLoading = false;
        state.error = action.payload;
      })
      .addCase(getParticipantDetails.pending, state => {
        state.loading = true;
        state.error = null;
        state.selectedParticipant = null;
      })
      .addCase(getParticipantDetails.fulfilled, (state, action) => {
        state.loading = false;

        const updatedParticipant = action.payload;

        // ✅ STORE SINGLE DETAILS
        state.selectedParticipant = updatedParticipant;

        // ✅ UPDATE LIST ALSO
        state.participants = state.participants.map((p: any) =>
          p.id === updatedParticipant.id ? updatedParticipant : p,
        );
      })
      .addCase(getParticipantDetails.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getMyParticipatedContestsThunk.pending, state => {
        state.myParticipatedLoading = true;
        state.error = null;
      })

      .addCase(
        getMyParticipatedContestsThunk.fulfilled,
        (state, action: any) => {
          state.myParticipatedLoading = false;

          const newData = action.payload?.data || [];
          const page = action.payload?.page;

          if (page === 1) {
            state.myParticipatedContests = newData;
          } else {
            state.myParticipatedContests = [
              ...state.myParticipatedContests,
              ...newData,
            ];
          }

          const totalPages = action.payload?.pagination?.total_pages || 1;

          state.page = page;
          state.hasMore = page < totalPages;
        },
      )

      .addCase(
        getMyParticipatedContestsThunk.rejected,
        (state, action: any) => {
          state.myParticipatedLoading = false;
          state.error = action.payload;
        },
      )

      .addCase(getContestBanner.pending, state => {
        state.bannerLoading = true;
        state.bannerError = null;
      })
      .addCase(getContestBanner.fulfilled, (state, action: any) => {
        state.bannerLoading = false;
        state.bannerData = action.payload;
      })
      .addCase(getContestBanner.rejected, (state, action: any) => {
        state.bannerLoading = false;
        state.bannerError = action.payload;
      })
  },
});

export const {
  toggleBookmarkLocal,
  resetParticipants,
  updateLikeCount,
  updateRatingLocal,
  resetContest,
  startContestLoading,
  toggleContestWishlistStatus,
} = contestSlice.actions;
export default contestSlice.reducer;
