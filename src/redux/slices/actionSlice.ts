import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  wishlistApi,
  likeApi,
  addCommentApi,
  updateCommentApi,
  deleteCommentApi,
} from '../../services/actions';

export const likeAction = createAsyncThunk(
  'actions/like',
  async ({
    synopsis_id,
    type,
    emoji_type,
  }: {
    synopsis_id: string;
    type: 'create' | 'delete';
    emoji_type?: string;
  }) => {
    return await likeApi(synopsis_id, type, emoji_type);
  },
);

// ⭐ WISHLIST
export const wishlistAction = createAsyncThunk(
  'actions/wishlist',
  async ({
    synopsis_id,
    type,
  }: {
    synopsis_id: string;
    type: 'create' | 'delete';
  }) => {
    return await wishlistApi(synopsis_id, type);
  },
);

// 💬 COMMENTS
export const createComment = createAsyncThunk(
  'actions/comment/create',
  async ({
    synopsis_id,
    comment,
  }: {
    synopsis_id: string;
    comment: string;
  }) => {
    return await addCommentApi(synopsis_id, comment);
  },
);

export const editComment = createAsyncThunk(
  'actions/comment/update',
  async ({ comment_id, comment }: { comment_id: string; comment: string }) => {
    return await updateCommentApi(comment_id, comment);
  },
);

export const removeComment = createAsyncThunk(
  'actions/comment/delete',
  async (comment_id: string) => {
    return await deleteCommentApi(comment_id);
  },
);

const actionsSlice = createSlice({
  name: 'actions',
  initialState: {
    loading: false,
    error: null as string | null,
    likedIds: [] as string[],
    bookmarkedIds: [] as string[],
    likedCommentIds: [] as string[],
    reactionMap: {} as Record<string, string>,
    likeCountMap: {} as Record<string, number>,
  },
  reducers: {
    toggleBookmarkLocal: (state, action) => {
      const id = action.payload;

      if (state.bookmarkedIds.includes(id)) {
        state.bookmarkedIds = state.bookmarkedIds.filter(item => item !== id);
      } else {
        state.bookmarkedIds.push(id);
      }
    },

    // toggleLikeLocal: (state, action) => {
    //   const id = action.payload;

    //   if (state.likedIds.includes(id)) {
    //     state.likedIds = state.likedIds.filter(item => item !== id);
    //   } else {
    //     state.likedIds.push(id);
    //   }
    // },

    toggleLikeLocal: (state, action) => {
      const {
        id,
        emoji_type = 'heart',
        likes_count = 0,
        actionType,
      } = action.payload;

      const alreadyLiked = state.likedIds.includes(id);

      const currentCount = state.likeCountMap[id] ?? likes_count;

      // ✅ UNLIKE
      if (actionType === 'delete') {
        state.likedIds = state.likedIds.filter((item: string) => item !== id);

        state.reactionMap[id] = '';

        state.likeCountMap[id] = Math.max(currentCount - 1, 0);

        return;
      }

      // ✅ FIRST LIKE
      if (!alreadyLiked) {
        state.likedIds.push(id);

        state.likeCountMap[id] = currentCount + 1;
      }

      // ✅ CHANGE EMOJI ONLY
      // count should NOT increase
      state.reactionMap[id] = emoji_type;
    },

    toggleCommentLikeLocal: (state, action) => {
      const id = action.payload;

      if (state.likedCommentIds.includes(id)) {
        state.likedCommentIds = state.likedCommentIds.filter(
          item => item !== id,
        );
      } else {
        state.likedCommentIds.push(id);
      }
    },

    setInitialBookmarks: (state, action) => {
      state.bookmarkedIds = action.payload;
    },

    setInitialLikes: (state, action) => {
      state.likedIds = action.payload;
    },
    setInitialLikeCounts: (state, action) => {
      state.likeCountMap = action.payload;
    },
    setInitialReactions: (state, action) => {
      state.reactionMap = action.payload;
    },
  },
  extraReducers: builder => {
    builder

      // ❤️ LIKE
      .addCase(likeAction.fulfilled, (state, action) => {
        const { synopsis_id, type } = action.meta.arg;

        if (type === 'create') {
          if (!state.likedIds.includes(synopsis_id)) {
            state.likedIds.push(synopsis_id);
          }
        } else {
          state.likedIds = state.likedIds.filter(id => id !== synopsis_id);
        }
      })

      // ⭐ BOOKMARK
      .addCase(wishlistAction.fulfilled, (state, action) => {
        const { synopsis_id, type } = action.meta.arg;

        if (type === 'create') {
          if (!state.bookmarkedIds.includes(synopsis_id)) {
            state.bookmarkedIds.push(synopsis_id);
          }
        } else {
          state.bookmarkedIds = state.bookmarkedIds.filter(
            id => id !== synopsis_id,
          );
        }
      })

      .addMatcher(
        action =>
          action.type.startsWith('actions/') &&
          action.type.endsWith('/pending'),
        state => {
          state.loading = true;
          state.error = null;
        },
      )
      .addMatcher(
        action =>
          action.type.startsWith('actions/') &&
          action.type.endsWith('/fulfilled'),
        state => {
          state.loading = false;
        },
      )
      .addMatcher(
        action =>
          action.type.startsWith('actions/') &&
          action.type.endsWith('/rejected'),
        (state, action: any) => {
          state.loading = false;
          state.error = action.error?.message || 'Something went wrong';
        },
      );
  },
});

export const {
  toggleBookmarkLocal,
  toggleLikeLocal,
  setInitialBookmarks,
  setInitialLikes,
  toggleCommentLikeLocal,
  setInitialLikeCounts,
  setInitialReactions,
} = actionsSlice.actions;
export default actionsSlice.reducer;
