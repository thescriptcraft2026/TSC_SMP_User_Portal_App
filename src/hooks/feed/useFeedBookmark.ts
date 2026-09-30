import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  wishlistAction,
  toggleBookmarkLocal,
} from '../../redux/slices/actionSlice';
import { useToast } from '../../components/Toast/ToastProvider';

export const useFeedBookmark = () => {
  const dispatch = useDispatch<any>();
  const { show } = useToast();

  const { bookmarkedIds } = useSelector((state: any) => state.actions);

  const handleFeedBookmark = useCallback(
    async (post: any) => {
      const id = post?.id;

      if (!id) return;

      const alreadyBookmarked = bookmarkedIds.includes(id);

      dispatch(toggleBookmarkLocal(id));

      const res: any = await dispatch(
        wishlistAction({
          synopsis_id: id,
          type: alreadyBookmarked ? 'delete' : 'create',
        }),
      );

      // rollback
      if (res?.meta?.requestStatus !== 'fulfilled') {
        dispatch(toggleBookmarkLocal(id));
      }

      if (res?.meta?.requestStatus === 'fulfilled') {
        show({
          type: 'success',
          title:
            res?.payload?.res?.message || res?.payload?.message ||
            (alreadyBookmarked
              ? 'Removed from bookmarks'
              : 'Added to bookmarks'),
        });
      } else {
        show({
          type: 'error',
          title: res?.payload?.res?.message || 'Something went wrong',
        });
      }
    },
    [dispatch, bookmarkedIds],
  );

  return {
    handleFeedBookmark,
  };
};
