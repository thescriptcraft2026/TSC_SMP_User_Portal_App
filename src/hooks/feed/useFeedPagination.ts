import { useCallback } from 'react';

import { useDispatch } from 'react-redux';
import { fetchFeed, resetFeed } from '../../redux/slices/feedSlice';
import { getAllContest } from '../../redux/slices/contestSlice';
import { getAllMovies } from '../../redux/slices/movieSlice';

export const useFeedPagination = ({
  feedLoading,
  feedHasMore,
  movieLoading,
  hasMore,
  page,
  sortMovieBy,
  movieSearch,
  movieGenre,
  contestLoading,
  contestHasMore,
  contestPage,
  setRefreshing,
  sortBy,
  contestSearch,
}: any) => {
  const dispatch = useDispatch<any>();

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    dispatch(resetFeed());

    dispatch(fetchFeed()).finally(() => setRefreshing(false));
  }, []);

  const onRefreshContest = useCallback(() => {
    setRefreshing(true);

    dispatch(
      getAllContest({
        page: 1,
        sort_by: sortBy,
        search: contestSearch,
      }),
    ).finally(() => setRefreshing(false));
  }, [sortBy, contestSearch]);

  const loadMore = useCallback(() => {
    console.log({
      feedLoading,
      feedHasMore,
    });

    if (feedLoading || !feedHasMore) {
      console.log('Skipped');
      return;
    }

    console.log('Fetching next page');
    dispatch(fetchFeed());
  }, [feedLoading, feedHasMore]);

  const loadMoreMovies = useCallback(() => {
    if (!hasMore || movieLoading) return;

    dispatch(
      getAllMovies({
        page: page + 1,
        sort_by: sortMovieBy,
        search: movieSearch,
        genre_id: movieGenre,
      }),
    );
  }, [hasMore, movieLoading, page, sortMovieBy, movieSearch, movieGenre]);

  const loadMoreContest = useCallback(() => {
    if (!contestHasMore || contestLoading) return;

    dispatch(
      getAllContest({
        page: contestPage + 1,
        sort_by: sortBy,
        search: contestSearch,
      }),
    );
  }, [contestHasMore, contestLoading, contestPage, sortBy, contestSearch]);

  return {
    onRefresh,
    onRefreshContest,
    loadMore,
    loadMoreMovies,
    loadMoreContest,
  };
};
