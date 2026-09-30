import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from 'react-native';

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import MovieCard from '../../Movie/components/MovieCard';
import MovieCardSkeleton from '../../Movie/components/MovieCardSkeleton';

import api from '../../../../Instance/Instance';
import { useToast } from '../../../components/Toast/ToastProvider';
import {
  toggleBookmarkLocal,
  toggleContestBookmark,
} from '../../../redux/slices/movieSlice';
import { themeColors } from '../../../theme/colors';
import { Fonts } from '../../../constants/Fonts';
import NoBookMark from '../../../assets/SVG/NoBookMark';

const { width } = Dimensions.get('window');

const CARD_MARGIN = 10;
const CARD_WIDTH = (width - CARD_MARGIN * 3) / 2;

const MoviesTab = () => {
  const navigation = useNavigation<any>();

  const dispatch = useDispatch<any>();

  const { show } = useToast();

  const { bookmarkedIds } = useSelector((state: any) => state.movie);

  const [movies, setMovies] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [page, setPage] = useState(1);

  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const onEndReachedCalledDuringMomentum = React.useRef(false);

  // ================= BOOKMARK =================

  const handleBookmark = async (id: string) => {
    if (!id) return;

    const isAlreadyBookmarked = bookmarkedIds?.includes(id);

    // ✅ optimistic UI
    dispatch(toggleBookmarkLocal(id));

    // ✅ instantly update local list
    setMovies(prev =>
      prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            is_wishlisted: isAlreadyBookmarked ? 0 : 1,
          };
        }

        return item;
      }),
    );

    try {
      const res: any = await dispatch(
        toggleContestBookmark({
          content_id: id,
          type: isAlreadyBookmarked ? 'delete' : 'create',
        }),
      );

      const isSuccess = res?.meta?.requestStatus === 'fulfilled';

      if (!isSuccess) {
        // ❌ rollback redux
        dispatch(toggleBookmarkLocal(id));

        // ❌ rollback local list
        setMovies(prev =>
          prev.map(item => {
            if (item.id === id) {
              return {
                ...item,
                is_wishlisted: isAlreadyBookmarked ? 1 : 0,
              };
            }

            return item;
          }),
        );

        show({
          type: 'error',
          title: res?.payload || 'Something went wrong',
        });

        return;
      }

      show({
        type: 'success',
        title: isAlreadyBookmarked
          ? 'Removed from bookmarks'
          : 'Added to bookmarks',
      });

      // ✅ OPTIONAL
      // instantly remove from wishlist tab after unbookmark
      if (isAlreadyBookmarked) {
        setMovies(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      // ❌ rollback redux
      dispatch(toggleBookmarkLocal(id));

      // ❌ rollback local list
      setMovies(prev =>
        prev.map(item => {
          if (item.id === id) {
            return {
              ...item,
              is_wishlisted: isAlreadyBookmarked ? 1 : 0,
            };
          }

          return item;
        }),
      );

      show({
        type: 'error',
        title: 'Something went wrong',
      });
    }
  };

  // ================= API =================

  const getWishlistMovies = async (
    pageNumber = 1,
    isRefresh = false,
  ) => {
    try {
      if (pageNumber === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const res = await api.get('/review-contents/wishlist', {
        params: {
          page: pageNumber,
        },
      });

      const newData = res?.data?.data || [];
      const pagination = res?.data?.pagination;

      setHasMore(pageNumber < pagination.total_pages);

      setMovies(prev =>
        pageNumber === 1 ? newData : [...prev, ...newData],
      );

      setPage(pageNumber);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  // ================= INITIAL =================

  useFocusEffect(
    useCallback(() => {
      getWishlistMovies(1, true);

      return () => { };
    }, []),
  );

  // ================= REFRESH =================

  const handleRefresh = useCallback(() => {
    setRefreshing(true);

    getWishlistMovies(1, true);
  }, []);

  // ================= LOAD MORE =================

  const handleLoadMore = useCallback(() => {
    if (loading) return;
    if (loadingMore) return;
    if (!hasMore) return;

    getWishlistMovies(page + 1);
  }, [loading, loadingMore, hasMore, page]);
  // ================= FOOTER =================

  // const renderFooter = () => {
  //   if (loading && page > 1) {
  //     return (
  //       <View style={{ paddingVertical: 20 }}>
  //         <MovieCardSkeleton height={260} />
  //       </View>
  //     );
  //   }

  //   if (!hasMore && movies.length > 0) {
  //     return (
  //       <Text
  //         style={{
  //           textAlign: 'center',
  //           padding: 20,
  //           opacity: 0.6,
  //           color: '#999',
  //         }}
  //       >
  //         🎉 You’ve reached the end
  //       </Text>
  //     );
  //   }

  //   return null;
  // };

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={{ paddingVertical: 20 }}>
          <MovieCardSkeleton height={260} />
        </View>
      );
    }

    if (!hasMore && movies?.length > 0) {
      return (
        <Text
          style={{
            textAlign: 'center',
            padding: 20,
            opacity: 0.6,
            color: '#999',
          }}
        >
          🎉 You’ve reached the end
        </Text>
      );
    }

    return null;
  };


  // ================= EMPTY =================

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={{ alignItems: 'center', marginTop: 100, flex: 1 }}>
        <NoBookMark width={80} height={80} />
        <Text
          style={{
            color: themeColors.primary,
            marginTop: 15,
            fontFamily: Fonts.Bold,
            fontSize: 18,
          }}
        >
          Oops! No Saved Content Found
        </Text>
        <Text style={{ color: themeColors.gray, fontFamily: Fonts.Regular }}>
          You haven't saved any content yet.
        </Text>
      </View>
    );
  };

  // ================= SKELETON =================

  const skeletonData = Array.from({ length: 6 }, (_, i) => ({
    id: `skeleton-${i}`,
  }));

  // ================= RETURN =================

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={loading && page === 1 ? skeletonData : movies}
        keyExtractor={(item: any, index) => `${item?.id}-${index}`}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onMomentumScrollBegin={() => {
          onEndReachedCalledDuringMomentum.current = false;
        }}

        onEndReached={() => {
          if (!onEndReachedCalledDuringMomentum.current) {
            handleLoadMore();
            onEndReachedCalledDuringMomentum.current = true;
          }
        }}

        onEndReachedThreshold={0.3}
        renderItem={({ item }: any) => {
          return (
            <View style={{ width: CARD_WIDTH }}>
              {loading && page === 1 ? (
                <MovieCardSkeleton height={260} />
              ) : (
                <MovieCard
                  title={item?.title}
                  height={260}
                  rating={item?.avg_rating}
                  width={CARD_WIDTH}
                  image={item?.coverimage}
                  onPress={() =>
                    navigation.navigate('SingleMovieDetails', {
                      id: item?.id,
                    })
                  }
                  bookmarked={
                    bookmarkedIds?.includes(item?.id) ||
                    item?.is_wishlisted === 1
                  }
                  onBookmark={() => handleBookmark(item?.id)}
                />
              )}
            </View>
          );
        }}
      />
    </View>
  );
};

export default MoviesTab;

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: CARD_MARGIN,
    paddingBottom: 30,
    paddingTop: 10,
  },

  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
});
