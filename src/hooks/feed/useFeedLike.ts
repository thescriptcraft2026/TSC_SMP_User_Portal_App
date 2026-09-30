import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { likeAction, toggleLikeLocal } from '../../redux/slices/actionSlice';

import { updatePostReactionLocal } from '../../redux/slices/feedSlice';
import { store } from '../../redux/store';

export const useFeedLike = () => {
  const dispatch = useDispatch<any>();

  const handleFeedLike = useCallback(async (post: any, emoji_type?: string) => {
    const id = post?.id;

    if (!id) return;

    const state = store.getState();

    const { likedIds, reactionMap, likeCountMap } = state.actions;

    const alreadyLiked = likedIds.includes(id);

    const currentReaction = reactionMap?.[id] || post?.emoji_type;

    const currentCount = likeCountMap?.[id] ?? post?.likeCount ?? 0;

    const sameReaction = alreadyLiked && currentReaction === emoji_type;

    // =========================
    // UNLIKE
    // =========================
    if (sameReaction) {
      dispatch(
        toggleLikeLocal({
          id,
          likes_count: currentCount,
          actionType: 'delete',
        }),
      );

      dispatch(
        updatePostReactionLocal({
          postId: id,
          emoji_type: null,
          isLiked: false,
        }),
      );

      const res: any = await dispatch(
        likeAction({
          synopsis_id: id,
          type: 'delete',
        }),
      );

      if (res?.meta?.requestStatus !== 'fulfilled') {
        dispatch(
          toggleLikeLocal({
            id,
            emoji_type: currentReaction,
            likes_count: currentCount - 1,
            actionType: 'create',
          }),
        );

        dispatch(
          updatePostReactionLocal({
            postId: id,
            emoji_type: currentReaction,
            isLiked: true,
          }),
        );
      }

      return;
    }

    // =========================
    // LIKE / CHANGE REACTION
    // =========================

    dispatch(
      toggleLikeLocal({
        id,
        emoji_type,
        likes_count: currentCount,
        actionType: 'create',
      }),
    );

    dispatch(
      updatePostReactionLocal({
        postId: id,
        emoji_type,
        isLiked: true,
      }),
    );

    const res: any = await dispatch(
      likeAction({
        synopsis_id: id,
        type: 'create',
        emoji_type,
      }),
    );

    if (res?.meta?.requestStatus !== 'fulfilled') {
      dispatch(
        toggleLikeLocal({
          id,
          likes_count: currentCount + 1,
          actionType: 'delete',
        }),
      );

      dispatch(
        updatePostReactionLocal({
          postId: id,
          emoji_type: currentReaction,
          isLiked: alreadyLiked,
        }),
      );
    }
  }, []);

  return {
    handleFeedLike,
  };
};
