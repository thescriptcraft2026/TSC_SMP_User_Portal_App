import { useDispatch, useSelector } from 'react-redux';
import {
  toggleBookmarkLocal,
  wishlistAction,
} from '../redux/slices/actionSlice';

import { useToast } from '../components/Toast/ToastProvider';

export const useHandleBookmark = () => {
  const dispatch = useDispatch<any>();
  const { show } = useToast();

  const { bookmarkedIds } = useSelector(
    (state: any) => state.actions,
  );

  const handleBookmark = async (id: string) => {
    const isAlreadyBookmarked = bookmarkedIds?.includes(id);

    // ✅ instant UI update
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
        // ❌ rollback
        dispatch(toggleBookmarkLocal(id));

        show({
          type: 'error',
          title: res?.payload?.res?.message || 'Something went wrong',
        });
      } else {
        show({
          type: 'success',
          title:
            res?.payload?.res?.message || res?.payload?.message ||
            (isAlreadyBookmarked
              ? 'Removed from bookmarks'
              : 'Added to bookmarks'),
        });
      }
    } catch (error) {
      // ❌ rollback
      dispatch(toggleBookmarkLocal(id));

      show({
        type: 'error',
        title: 'Something went wrong',
      });
    }
  };

  return {
    handleBookmark,
    bookmarkedIds,
  };
};