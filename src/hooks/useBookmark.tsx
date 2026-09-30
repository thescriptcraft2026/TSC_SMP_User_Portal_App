import { useState, useCallback } from 'react';

export const useBookmark = () => {
  const [bookmarkMap, setBookmarkMap] = useState<Record<string, boolean>>({});

  const toggleBookmark = useCallback((id: string) => {
    setBookmarkMap(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const isBookmarked = useCallback(
    (id: string) => !!bookmarkMap[id],
    [bookmarkMap],
  );

  return {
    bookmarkMap,
    toggleBookmark,
    isBookmarked,
  };
};
