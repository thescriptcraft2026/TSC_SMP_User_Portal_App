import { useCallback } from 'react';

import { useDispatch } from 'react-redux';
import { repostPost } from '../../redux/slices/postSlice';
import { fetchFeed, resetFeed } from '../../redux/slices/feedSlice';

export const useRepostActions = (show: any) => {
  const dispatch = useDispatch<any>();

  const handleInstantRepost = useCallback(
    async (selectedRepostPost: any, onClose?: () => void) => {
      try {
        if (!selectedRepostPost?.id) return;

        const res: any = await dispatch(
          repostPost({
            synopsis_id: selectedRepostPost?.id,
            story: '',
            mentions: [],
            tags: [],
          }),
        );

        if (res?.meta?.requestStatus !== 'fulfilled') {
          show({
            type: 'error',
            title: res?.payload || 'Repost failed',
          });

          return;
        }

        dispatch(resetFeed());

        dispatch(fetchFeed());

        onClose?.();

        show({
          type: 'success',
          title: 'Post reposted successfully',
        });
      } catch (error) {
        show({
          type: 'error',
          title: 'Something went wrong',
        });
      }
    },
    [],
  );

  return {
    handleInstantRepost,
  };
};
