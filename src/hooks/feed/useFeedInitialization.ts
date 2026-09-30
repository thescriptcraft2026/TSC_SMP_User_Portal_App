import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  setInitialBookmarks,
  setInitialLikeCounts,
  setInitialLikes,
  setInitialReactions,
} from '../../redux/slices/actionSlice';

export const useFeedInitialization = (feed: any[]) => {
  const dispatch = useDispatch<any>();

  useEffect(() => {
    if (!feed?.length) return;

    // -------------------------
    // Bookmarks
    // -------------------------
    const bookmarkIds = feed
      .filter((item: any) => item.isWishlisted === 1)
      .map((item: any) => item.id);

    dispatch(setInitialBookmarks(bookmarkIds));

    // -------------------------
    // Likes
    // -------------------------
    const likeIds = feed
      .filter((item: any) => item.isLiked === 1)
      .map((item: any) => item.id);

    dispatch(setInitialLikes(likeIds));

    // -------------------------
    // Like Counts
    // -------------------------
    const likeCounts: Record<string, number> = {};

    // -------------------------
    // Reactions
    // -------------------------
    const reactions: Record<string, string> = {};

    feed.forEach((item: any) => {
      likeCounts[item.id] = Number(item.likes_count || 0);

      if (item.emoji_type) {
        reactions[item.id] = item.emoji_type;
      }
    });

    dispatch(setInitialLikeCounts(likeCounts));
    dispatch(setInitialReactions(reactions));
  }, [feed, dispatch]);
};
