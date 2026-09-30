import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  likeAction,
  setInitialBookmarks,
  setInitialLikes,
  toggleBookmarkLocal,
  toggleLikeLocal,
  wishlistAction,
} from '../redux/slices/actionSlice';

import { updateLikeCount } from '../redux/slices/bookSlice';

import { useToast } from '../components/Toast/ToastProvider';

const useSynopsisActions = (data: any[] = []) => {
  const dispatch = useDispatch<any>();
  const { show } = useToast();

  const { bookmarkedIds, likedIds, reactionMap, likeCountMap } = useSelector(
    (state: any) => state.actions,
  );

  // ================= INITIAL SETUP =================

  useEffect(() => {
    if (data?.length) {
      const bookmarked = data
        .filter(
          (item: any) =>
            (item?.synopsis?.isWishlisted ?? item?.isWishlisted) === 1,
        )
        .map((item: any) => item?.synopsis?.id ?? item?.id);

      dispatch(setInitialBookmarks(bookmarked));

      const liked = data
        .filter((item: any) => (item?.synopsis?.isLiked ?? item?.isLiked) === 1)
        .map((item: any) => item?.synopsis?.id ?? item?.id);

      dispatch(setInitialLikes(liked));
    }
  }, [data]);

  // ================= BOOKMARK =================

  const handleBookmark = async (id: string) => {
    const isAlreadyBookmarked = bookmarkedIds?.includes(id);

    // optimistic update
    dispatch(toggleBookmarkLocal(id));

    try {
      const res: any = await dispatch(
        wishlistAction({
          synopsis_id: id,
          type: isAlreadyBookmarked ? 'delete' : 'create',
        }),
      );

      const isSuccess = res?.meta?.requestStatus === 'fulfilled';

      if (!isSuccess) {
        dispatch(toggleBookmarkLocal(id));

        show({
          type: 'error',
          title: res?.payload?.message || 'Something went wrong',
        });
      } else {
        show({
          type: 'success',
          title:
            res?.payload?.message ||
            (isAlreadyBookmarked
              ? 'Removed from bookmarks'
              : 'Added to bookmarks'),
        });
      }
    } catch (error) {
      dispatch(toggleBookmarkLocal(id));

      show({
        type: 'error',
        title: 'Something went wrong',
      });
    }
  };

  // ================= LIKE =================

  const handleLike = async (
    id: string,
    reaction: string = 'heart',
    isAlreadyLikedFromUI: boolean,
    currentLikesCount: number,
  ) => {
    // optimistic update
    dispatch(
      toggleLikeLocal({
        id,
        emoji_type: reaction,
        likes_count: currentLikesCount,
      }),
    );

    dispatch(
      updateLikeCount({
        id,
        isLiked: !isAlreadyLikedFromUI,
        emoji_type: reaction,
      }),
    );

    try {
      const res: any = await dispatch(
        likeAction({
          synopsis_id: id,
          type: isAlreadyLikedFromUI ? 'delete' : 'create',
          emoji_type: reaction,
        }),
      );

      if (res?.meta?.requestStatus !== 'fulfilled') {
        // rollback
        dispatch(
          toggleLikeLocal({
            id,
            emoji_type: reaction,
            likes_count: currentLikesCount,
          }),
        );

        dispatch(
          updateLikeCount({
            id,
            isLiked: isAlreadyLikedFromUI,
            emoji_type: reaction,
          }),
        );
      }
    } catch {
      // rollback
      dispatch(
        toggleLikeLocal({
          id,
          emoji_type: reaction,
          likes_count: currentLikesCount,
        }),
      );

      dispatch(
        updateLikeCount({
          id,
          isLiked: isAlreadyLikedFromUI,
          emoji_type: reaction,
        }),
      );
    }
  };

  // ================= HELPERS =================

  const getItemState = (item: any) => {
    const synopsisId = item?.synopsis?.id;

    const isLiked = likedIds.includes(synopsisId);

    const currentReaction =
      reactionMap[synopsisId] || item?.synopsis?.emoji_type || 'heart';

    const currentLikes =
      likeCountMap[synopsisId] ?? item?.synopsis?.likes_count ?? 0;

    const isBookmarked =
      bookmarkedIds.includes(synopsisId) || item?.synopsis?.isWishlisted === 1;

    return {
      isLiked,
      currentReaction,
      currentLikes,
      isBookmarked,
    };
  };

  return {
    handleBookmark,
    handleLike,
    getItemState,
  };
};

export default useSynopsisActions;
