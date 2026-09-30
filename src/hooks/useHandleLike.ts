import { useDispatch, useSelector } from 'react-redux';

import { likeAction, toggleLikeLocal } from '../redux/slices/actionSlice';

type HandleLikeProps = {
  id: string;
  emoji_type?: string;
  likes_count?: number;
  isReactionPress?: boolean;
};

export const useHandleLike = () => {
  const dispatch = useDispatch<any>();

  const { likedIds, reactionMap, likeCountMap } = useSelector(
    (state: any) => state.actions,
  );

  const handleLike = async ({
    id,
    emoji_type = 'heart',
    likes_count = 0,
    isReactionPress = false,
  }: HandleLikeProps) => {
    const alreadyLiked = likedIds.includes(id);

    // ✅ USER TAPPED MAIN LIKE BUTTON
    // always unlike regardless of previous emoji
    if (alreadyLiked && !isReactionPress) {
      dispatch(
        toggleLikeLocal({
          id,
          likes_count,
          actionType: 'delete',
        }),
      );

      try {
        await dispatch(
          likeAction({
            synopsis_id: id,
            type: 'delete',
          }),
        );
      } catch (error) {
        dispatch(
          toggleLikeLocal({
            id,
            emoji_type: reactionMap[id] || 'Heart',
            likes_count,
            actionType: 'create',
          }),
        );
      }

      return;
    }

    // ✅ CHANGE EMOJI OR FIRST LIKE
    dispatch(
      toggleLikeLocal({
        id,
        emoji_type,
        likes_count,
        actionType: 'create',
      }),
    );

    try {
      await dispatch(
        likeAction({
          synopsis_id: id,
          emoji_type,
          type: 'create',
        }),
      );
    } catch (error) {
      if (!alreadyLiked) {
        dispatch(
          toggleLikeLocal({
            id,
            likes_count,
            actionType: 'delete',
          }),
        );
      }
    }
  };

  return {
    handleLike,
    likedIds,
    reactionMap,
    likeCountMap,
  };
};
