import { useDispatch, useSelector } from 'react-redux';
import {
  likeAction,
  wishlistAction,
  toggleLikeLocal,
  toggleBookmarkLocal,
} from '../redux/slices/actionSlice';

import {
  toggleLikeCountLocal,
  toggleBookmarkLocalInFeed,
} from '../redux/slices/feedSlice';

import { toggleBookmarkInList } from '../redux/slices/bookmarkSlice';

type Params = {
  data?: any[];
  setData?: React.Dispatch<React.SetStateAction<any[]>>;
};

export const usePostActions = (params?: Params) => {
  const dispatch = useDispatch<any>();

  const { likedIds, feedBookMark } = useSelector((state: any) => state.actions);

  const data = params?.data;
  const setData = params?.setData;

  // 🔍 helper → handle both structures
  const getPost = (item: any) => item?.synopsis || item;

  // ================= LIKE =================

  const handleLike = async (id: string, post?: any, emoji_type?: string) => {
    if (!id) return;

    const currentPost = getPost(post);

    // ✅ current state
    const alreadyLiked = currentPost?.isLiked === 1;

    const currentReaction = currentPost?.emoji_type;

    // ✅ same emoji clicked again
    const isSameReaction = currentReaction === emoji_type;

    // ================= LOCAL UPDATE =================

    if (data && setData) {
      setData(prev =>
        prev.map(item => {
          // =========================
          // DIRECT / SYNOPSIS POST
          // =========================

          const p = getPost(item);

          if (p?.id === id) {
            const isCurrentlyLiked = p?.isLiked === 1;

            const sameReaction = p?.emoji_type === emoji_type;

            const updatedPost = {
              ...p,

              isLiked: isCurrentlyLiked && sameReaction ? 0 : 1,

              likes_count:
                isCurrentlyLiked && sameReaction
                  ? Math.max(0, (p.likes_count || 0) - 1)
                  : isCurrentlyLiked
                  ? p.likes_count || 0
                  : (p.likes_count || 0) + 1,

              emoji_type: isCurrentlyLiked && sameReaction ? null : emoji_type,
            };

            return item?.synopsis
              ? { ...item, synopsis: updatedPost }
              : updatedPost;
          }

          // =========================
          // REPOST ORIGINAL POST
          // =========================

          if (item?.original_post?.id === id) {
            const original = item.original_post;

            const isCurrentlyLiked = original?.isLiked === 1;

            const sameReaction = original?.emoji_type === emoji_type;

            return {
              ...item,

              original_post: {
                ...original,

                isLiked: isCurrentlyLiked && sameReaction ? 0 : 1,

                likes_count:
                  isCurrentlyLiked && sameReaction
                    ? Math.max(0, (original.likes_count || 0) - 1)
                    : isCurrentlyLiked
                    ? original.likes_count || 0
                    : (original.likes_count || 0) + 1,

                emoji_type:
                  isCurrentlyLiked && sameReaction ? null : emoji_type,
              },
            };
          }

          return item;
        }),
      );
    }

    try {
      const res: any = await dispatch(
        likeAction({
          synopsis_id: id,

          // ✅ API TYPE
          type: alreadyLiked && isSameReaction ? 'delete' : 'create',

          emoji_type,
        }),
      );

      if (res?.meta?.requestStatus !== 'fulfilled') {
        throw new Error();
      }
    } catch {
      // ================= ROLLBACK =================

      if (data && setData) {
        setData(prev =>
          prev.map(item => {
            const p = getPost(item);

            // DIRECT POST
            if (p?.id === id) {
              const updatedPost = {
                ...p,
                isLiked: currentPost?.isLiked,
                likes_count: currentPost?.likes_count,
                emoji_type: currentPost?.emoji_type,
              };

              return item?.synopsis
                ? { ...item, synopsis: updatedPost }
                : updatedPost;
            }

            // REPOST
            if (item?.original_post?.id === id) {
              return {
                ...item,

                original_post: {
                  ...item.original_post,

                  isLiked: currentPost?.isLiked,
                  likes_count: currentPost?.likes_count,
                  emoji_type: currentPost?.emoji_type,
                },
              };
            }

            return item;
          }),
        );
      }
    }
  };

  // ================= BOOKMARK =================

  const handleBookmark = async (post: any) => {
    const id = post?.id;
    if (!id) return;

    const isBookmarked = feedBookMark?.includes(id) || post?.isWishlisted === 1;

    // ✅ LOCAL UI UPDATE
    if (data && setData) {
      setData(prev =>
        prev.map(item => {
          const p = getPost(item);

          if (p?.id !== id) return item;

          const updatedPost = {
            ...p,
            isWishlisted: p.isWishlisted === 1 ? 0 : 1,
          };

          return item?.synopsis
            ? { ...item, synopsis: updatedPost }
            : updatedPost;
        }),
      );
    }

    // ✅ GLOBAL REDUX UPDATE
    dispatch(toggleBookmarkLocal(id));
    dispatch(toggleBookmarkLocalInFeed(id));

    // ✅ remove instantly from bookmark list
    if (isBookmarked) {
      dispatch(toggleBookmarkInList(id));
    }

    try {
      const res: any = await dispatch(
        wishlistAction({
          synopsis_id: id,
          type: isBookmarked ? 'delete' : 'create',
        }),
      );

      if (res?.meta?.requestStatus !== 'fulfilled') {
        throw new Error();
      }
    } catch {
      // ❌ rollback
      if (data && setData) {
        setData(prev =>
          prev.map(item => {
            const p = getPost(item);

            if (p?.id !== id) return item;

            const updatedPost = {
              ...p,
              isWishlisted: isBookmarked ? 1 : 0,
            };

            return item?.synopsis
              ? { ...item, synopsis: updatedPost }
              : updatedPost;
          }),
        );
      }

      dispatch(toggleBookmarkLocal(id));
      dispatch(toggleBookmarkLocalInFeed(id));
    }
  };

  return {
    handleLike,
    handleBookmark,
  };
};
