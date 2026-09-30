import { useRef, useCallback } from 'react';

type UseInfiniteScrollParams = {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
};

export function useInfiniteScroll({
  hasMore,
  loading,
  onLoadMore,
}: UseInfiniteScrollParams) {

  const loadingRef = useRef(loading);
  loadingRef.current = loading;

  const duringMomentum = useRef(true);

  const handleEndReached = useCallback(() => {
    if (duringMomentum.current) return;
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    duringMomentum.current = true;
    onLoadMore();
  }, [hasMore, onLoadMore]);

  const handleMomentumScrollBegin = useCallback(() => {
    duringMomentum.current = false;
  }, []);

  return { handleEndReached, handleMomentumScrollBegin };
}