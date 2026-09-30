import { useState, useCallback } from 'react';

export const useLike = () => {
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  const toggleLike = useCallback((id: string) => {
    setLikedMap(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const isLiked = useCallback(
    (id: string) => !!likedMap[id],
    [likedMap],
  );

  return { likedMap, toggleLike, isLiked };
};