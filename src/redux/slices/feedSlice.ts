import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { feedApi, getPostById, postCommentApi } from '../../services/feedApi';

interface FeedState {
  feed: any[];
  selectedPost: any;
  loading: boolean;
  error: string | null;
  nextCursor: string | null;
  hasMore: boolean;
  isFetchingMore: boolean; // ✅ NEW
  commentsByPost: Record<string, any[]>;
  commentsPageByPost: Record<string, number>;
  commentsHasMore: Record<string, boolean>;
  commentsLoadingMore: Record<string, boolean>;
}

const initialState: FeedState = {
  feed: [],
  loading: false,
  error: null,
  nextCursor: null,
  hasMore: true,
  isFetchingMore: false,
  commentsByPost: {},
  selectedPost: null,
  commentsPageByPost: {},
  commentsHasMore: {},
  commentsLoadingMore: {},
};

export const fetchFeed = createAsyncThunk(
  'feed/fetchFeed',
  async (_, { getState, rejectWithValue }) => {
    const state: any = getState();
    console.log("NEXT CURSOR:", state.feed.nextCursor);
    const { nextCursor, isFetchingMore } = state.feed;

    if (isFetchingMore) return rejectWithValue('Already fetching');

    const response = await feedApi(10, nextCursor);
    console.log("API RESPONSE:", response);
    return response;
  },
);

// Get comments
export const fetchCommentsByPost = createAsyncThunk(
  'comments/fetchByPost',
  async (
    { postId, page = 1 }: { postId: string; page?: number },
    { rejectWithValue },
  ) => {
    try {
      const res = await postCommentApi(postId, page);
      return {
        postId,
        page,
        data: res?.data?.comments || [],
        hasMore:
          (res?.data?.pagination?.page || 1) <
          (res?.data?.pagination?.totalPages || 1),
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

// Get Post By Id
export const getPostByIdThunk = createAsyncThunk(
  'feed/getPostById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await getPostById(id);
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

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    toggleLikeCountLocal: (state, action) => {
      const id = action.payload;

      const post = state.feed.find((item: any) => item.id === id);

      if (!post) return;

      if (post.isLiked === 1) {
        post.likes_count = Math.max(0, post.likes_count - 1);
        post.isLiked = 0;
      } else {
        post.likes_count += 1;
        post.isLiked = 1;
      }
    },

    clearSelectedPost: state => {
      state.selectedPost = null;
    },

    addCommentLocal: (state, action) => {
      const { postId, comment } = action.payload;

      if (!state.commentsByPost[postId]) {
        state.commentsByPost[postId] = [];
      }

      state.commentsByPost[postId].unshift(comment);
    },

    toggleCommentLikeLocal: (state, action) => {
      const { commentId } = action.payload;

      Object.values(state.commentsByPost).forEach((comments: any) => {
        const comment = comments?.find((c: any) => c.id === commentId);

        if (comment) {
          const isCurrentlyLiked = !!comment.isLiked;

          // ✅ toggle
          comment.isLiked = !isCurrentlyLiked;

          // ✅ update count properly
          if (isCurrentlyLiked) {
            comment.likes_count = Math.max(0, comment.likes_count - 1);
          } else {
            comment.likes_count += 1;
          }
        }
      });
    },
    toggleBookmarkLocalInFeed: (state, action) => {
      const id = action.payload;

      const post = state.feed.find((item: any) => item.id === id);

      if (!post) return;

      if (post.isWishlisted === 1) {
        post.isWishlisted = 0;
      } else {
        post.isWishlisted = 1;
      }
    },

    incrementCommentCountLocal: (state, action) => {
      const postId = action.payload;

      // ✅ update selectedPost
      if (state.selectedPost?.data?.id === postId) {
        state.selectedPost.data.comments_count += 1;
      }

      // ✅ update feed list (IMPORTANT)
      const post = state.feed.find((p: any) => p.id === postId);
      if (post) {
        post.comments_count += 1;
      }
    },

    updatePostReactionLocal: (state, action) => {
      const { postId, emoji_type, isLiked } = action.payload;

      state.feed = state.feed.map(post => {
        if (post.id !== postId) return post;

        let likes_count = post.likes_count;

        // First Like
        if (!post.isLiked && isLiked) {
          likes_count += 1;
        }

        // Unlike
        if (post.isLiked && !isLiked) {
          likes_count = Math.max(0, likes_count - 1);
        }

        return {
          ...post,
          emoji_type,
          isLiked: isLiked ? 1 : 0,
          likes_count,
        };
      });
    },
    updateReportedPostLocal: (state, action) => {
      const postId = action.payload;

      const post = state.feed.find((item: any) => item.id === postId);

      if (post) {
        post.isReported = 1;
      }

      // If SinglePost screen is open
      if (state.selectedPost?.data?.id === postId) {
        state.selectedPost.data.isReported = 1;
      }
    },
    resetFeed: state => {
      state.feed = [];
      state.nextCursor = null;
      state.hasMore = true;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchFeed.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.loading = false;

        const posts = Array.isArray(action.payload?.data?.feed)
          ? action.payload.data.feed
          : [];

        console.log("NEW POSTS:", posts.length);
        console.log("FIRST ID:", posts[0]?.id);
        console.log("LAST ID:", posts[posts.length - 1]?.id);

        state.feed = [...state.feed, ...posts];
          console.log("TOTAL POSTS:", state.feed.length);

        // ✅ FIX THIS PART
        const pageInfo = action.payload?.data?.pageInfo;

        state.nextCursor = pageInfo?.nextCursor || null;
        state.hasMore = pageInfo?.hasNextPage || false;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Something went wrong';
      })

      // Get Comments
      .addCase(fetchCommentsByPost.pending, (state, action: any) => {
        const { postId, page } = action.meta.arg;

        if (page === 1) {
          state.loading = true;
        } else {
          state.commentsLoadingMore[postId] = true;
        }
      })
      .addCase(fetchCommentsByPost.fulfilled, (state, action) => {
        const { postId, data, page, hasMore } = action.payload;

        if (page === 1) {
          state.commentsByPost[postId] = data;
          state.loading = false; // ✅ IMPORTANT
        } else {
          state.commentsByPost[postId] = [
            ...(state.commentsByPost[postId] || []),
            ...data,
          ];
        }

        state.commentsPageByPost[postId] = page;
        state.commentsHasMore[postId] = hasMore;
        state.commentsLoadingMore[postId] = false;
      })
      .addCase(fetchCommentsByPost.rejected, (state, action: any) => {
        const { postId, page } = action.meta.arg || {};

        if (page === 1) {
          state.loading = false;
        } else {
          state.commentsLoadingMore[postId] = false;
        }

        state.error = action.payload as string;
      })

      .addCase(getPostByIdThunk.pending, state => {
        state.loading = true;
        state.error = null;

        // Clear old post immediately
        state.selectedPost = null;
      })
      .addCase(getPostByIdThunk.fulfilled, (state, action) => {
        state.loading = false;

        state.selectedPost = action.payload;
      })
      .addCase(getPostByIdThunk.rejected, (state, action: any) => {
        state.loading = false;
        state.selectedPost = null;
        state.error = action.payload;
      });
  },
});

export const {
  resetFeed,
  toggleLikeCountLocal,
  addCommentLocal,
  toggleCommentLikeLocal,
  incrementCommentCountLocal,
  toggleBookmarkLocalInFeed,
  updatePostReactionLocal,
  clearSelectedPost,
  updateReportedPostLocal,
} = feedSlice.actions;
export default feedSlice.reducer;
