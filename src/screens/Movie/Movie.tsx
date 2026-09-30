import {
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { themeColors } from '../../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthHeader from '../../components/Header/AuthHeader';
import MovieCard from './components/MovieCard';
import MovieCardSkeleton from './components/MovieCardSkeleton';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllMovies,
  toggleBookmarkLocal,
  toggleContestBookmark,
} from '../../redux/slices/movieSlice';
import Tabs from '../../components/Tabs/Tabs';
import { useToast } from '../../components/Toast/ToastProvider';
import { ActivityIndicator } from 'react-native-paper';
import { Fonts } from '../../constants/Fonts';
import api from '../../../Instance/Instance';
import StarBanner from '../../assets/SVG/StarBanner';

const { width } = Dimensions.get('window');

const CARD_MARGIN = 10;
const CARD_WIDTH = (width - CARD_MARGIN * 2.5) / 2;

const Movie = () => {
  const navigation = useNavigation<any>();
  const isDark = true;
  const dispatch = useDispatch<any>();
  const [sortBy, setSortBy] = useState('new');
  const [activeTab, setActiveTab] = useState('New');
  const { show } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [genreId, setGenreId] = useState('');
  const [showSortTabs, setShowSortTabs] = useState(false);
  const [showGenre, setShowGenre] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [reviewCategoryId, setReviewCategoryId] = useState('');

  const TABS = ['New', 'Top Rated'];

  const backgroundColor = useMemo(
    () => (isDark ? themeColors.black : themeColors.appBackground),
    [isDark],
  );

  const skeletonData = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: `skeleton-${i}`,
      })),
    [],
  );
  const handleBack = () => navigation.goBack();

  const { movies, loading, page, hasMore, loadingMore } = useSelector(
    (state: any) => state.movie,
  );
  const { bookmarkedIds } = useSelector((state: any) => state.movie);

  useEffect(() => {
    dispatch(
      getAllMovies({
        page: 1,
        sort_by: sortBy,
        search: search,
        genre_id: genreId,
      }),
    );
  }, []);

  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      dispatch(
        getAllMovies({
          page: page + 1,
          sort_by: sortBy,
          search,
          genre_id: genreId,
          reviewcategory_id: reviewCategoryId,
        }),
      );
    }
  };

  const handleBookmark = async (id: string) => {
    if (!id) return;

    const isAlreadyBookmarked = bookmarkedIds?.includes(id);

    // ✅ Optimistic UI
    dispatch(toggleBookmarkLocal(id));

    try {
      const res: any = await dispatch(
        toggleContestBookmark({
          content_id: id,
          type: isAlreadyBookmarked ? 'delete' : 'create',
        }),
      );

      console.log('bookmarkRes', res);

      const isSuccess = res?.meta?.requestStatus === 'fulfilled';

      if (!isSuccess) {
        // ❌ rollback
        dispatch(toggleBookmarkLocal(id));

        show({
          type: 'error',
          title: res?.payload?.res?.message || 'Something went wrong',
        });

        return;
      }

      // ✅ SUCCESS TOAST
      show({
        type: 'success',
        title: res?.payload?.res?.message,
      });
    } catch (error) {
      // ❌ rollback
      dispatch(toggleBookmarkLocal(id));

      show({
        type: 'error',
        title: 'Something went wrong',
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await dispatch(getAllMovies({ page: 1, sort_by: sortBy }));
    } finally {
      setRefreshing(false);
    }
  };
const hideHeader =
  showSearch &&
  search.trim().length > 0 &&
  movies.length === 0 &&
  !loading;

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 120,
        }}
      >
        <StarBanner />
        <Text
          style={{
            color: themeColors.primary,
            fontSize: 16,
            fontFamily: Fonts.Medium,
          }}
        >
          Oops! No Content Found
        </Text>
      </View>
    );
  };

  const getCategories = async () => {
    try {
      const res = await api.get('/review-contents/category/dropdown');

      console.log('categoryData', res?.data?.data?.categories);

      setCategories(res?.data?.data?.categories);
      setActiveCategory('');
    } catch (error) {
      console.log('error', error);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        translucent
        barStyle={'light-content'}
      />

      <AuthHeader
        showBack
        title="Unfiltered"
        onBack={handleBack}
        showSearchIcon
        search={search}
        setSearch={setSearch}
        showSearchOpen={showSearch}
        onSearchToggle={() => {
          setShowSearch(prev => {
            const next = !prev;

            // Search opening
            if (next) {
              setShowGenre(false);
              setShowSortTabs(false);
            }

            // Search closing
            if (!next) {
              setSearch('');

              dispatch(
                getAllMovies({
                  page: 1,
                  sort_by: sortBy,
                  search: '',
                  genre_id: genreId,
                }),
              );
            }

            return next;
          });
        }}
        genre={genreId}
        setGenre={setGenreId}
        onSearch={(text: string) => {
          setSearch(text);

          dispatch(
            getAllMovies({
              page: 1,
              sort_by: sortBy,
              search: text,
              genre_id: genreId,
            }),
          );
        }}
        onGenreChange={(value: string) => {
          setGenreId(value);

          dispatch(
            getAllMovies({
              page: 1,
              sort_by: sortBy,
              search,
              genre_id: value,
            }),
          );
        }}
        showSortIcon
        showSortTabsOpen={showSortTabs}
        showSortTabs={() => {
          setShowSortTabs(prev => !prev);
          setShowGenre(false);
          setShowSearch(false); // close search
        }}
        showGenreIcon
        showGenreDropdown={showGenre}
        handleGenre={() => {
          setShowGenre(prev => {
            const next = !prev;

            // close sort when opening genre
            setShowSortTabs(false);

            // reset genre when closing dropdown
            if (!next) {
              setGenreId('');

              dispatch(
                getAllMovies({
                  page: 1,
                  sort_by: sortBy,
                  search,
                  genre_id: '',
                }),
              );
            }

            return next;
          });
        }}
      />

      <FlatList
        ListHeaderComponent={
          !hideHeader ? (
            <>

              {/* Sort Tabs */}
              {showSortTabs && (
                <Tabs
                  tabs={TABS}
                  activeTab={activeTab}
                  showCloseIcon={!!activeTab}
                  onClosePress={() => {
                    setActiveTab('');
                    setSortBy('');

                    dispatch(
                      getAllMovies({
                        page: 1,
                        sort_by: '',
                        search,
                        genre_id: genreId,
                        reviewcategory_id: reviewCategoryId,
                      }),
                    );
                  }}
                  onChange={tab => {
                    setActiveTab(tab);

                    let newSort = 'new';

                    if (tab === 'New') newSort = 'new';
                    if (tab === 'Top Rated') newSort = 'top_rated';

                    setSortBy(newSort);

                    dispatch(
                      getAllMovies({
                        page: 1,
                        sort_by: newSort,
                        search,
                        genre_id: genreId,
                        reviewcategory_id: reviewCategoryId,
                      }),
                    );
                  }}
                />
              )}

              <View style={{ marginBottom: 6 }}>
                <Tabs
                  tabs={categories.map(item => item.name)}
                  activeTab={activeCategory}
                  marginVertical={5}
                  showCloseIcon={!!activeCategory}
                  onClosePress={() => {
                    setActiveCategory('');
                    setReviewCategoryId('');

                    dispatch(
                      getAllMovies({
                        page: 1,
                        sort_by: sortBy,
                        search,
                        genre_id: genreId,
                        reviewcategory_id: '',
                      }),
                    );
                  }}
                  onChange={tab => {
                    const selectedCategory = categories.find(
                      item => item.name === tab,
                    );

                    const categoryId = selectedCategory?.id || '';

                    setActiveCategory(tab);
                    setReviewCategoryId(categoryId);

                    dispatch(
                      getAllMovies({
                        page: 1,
                        sort_by: sortBy,
                        search,
                        genre_id: genreId,
                        reviewcategory_id: categoryId,
                      }),
                    );
                  }}
                />
              </View>
            </>
          ) : null
        }
        data={loading && page === 1 ? skeletonData : movies}
        keyExtractor={(item: any) => item?.id?.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        onEndReached={handleLoadMore}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={renderEmpty}
        onEndReachedThreshold={0.5}
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
                  image={item?.bannerimage}
                  onPress={() =>
                    navigation.navigate('SingleMovieDetails', {
                      id: item.id,
                    })
                  }
                  bookmarked={
                    bookmarkedIds?.includes(item?.id) ||
                    item?.is_wishlisted === 1
                  }
                  onBookmark={() => handleBookmark(item?.id)}
                  // type={item?.genres?.name}
                />
              )}
            </View>
          );
        }}
        ListFooterComponent={
          loadingMore ? (
            <View style={{ paddingVertical: 20 }}>
              <ActivityIndicator size="small" />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default Movie;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  list: {
    paddingHorizontal: CARD_MARGIN,
    // paddingTop: 10,
  },

  row: {
    justifyContent: 'space-between', // ✅ IMPORTANT
    marginBottom: 6,
  },
});
