import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  FlatList,
  Text,
  TouchableOpacity,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import AuthHeader from '../../components/Header/AuthHeader';
import { themeColors } from '../../theme/colors';
import BookCard from './components/cards/BookCard';
import CardSkeleton from '../../components/Cards/CardSkeleton';
import Tabs from '../../components/Tabs/Tabs';

import {
  setInitialBookmarks,
  setInitialLikeCounts,
  setInitialLikes,
  setInitialReactions,
} from '../../redux/slices/actionSlice';

import { getBooks } from '../../redux/slices/bookSlice';

import { useHandleLike } from '../../hooks/useHandleLike';
import { useHandleBookmark } from '../../hooks/useHandleBookmark';
import { ReactionType } from '../../hooks/useEmojiReaction';
import Plus from '../../assets/SVG/Plus';
import StarBanner from '../../assets/SVG/StarBanner';
import { Fonts } from '../../constants/Fonts';

const { width } = Dimensions.get('window');

const CARD_MARGIN = 10;
const CARD_WIDTH = (width - CARD_MARGIN * 2.5) / 2;

const AllBooks = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();

  const isDark = true;

  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [activeTab, setActiveTab] = useState('Recent');
  const [search, setSearch] = useState('');
  const [genreId, setGenreId] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [activeReactionBookId, setActiveReactionBookId] = useState<string | null>(null);

  const TABS = ['Recent', 'Most Rated', 'Most Viewed'];

  const { books, loading, page, hasMore, pagination } = useSelector(
    (state: any) => state.book,
  );

  // ✅ custom hooks
  const { handleLike, likedIds, reactionMap, likeCountMap } = useHandleLike();

  const { handleBookmark, bookmarkedIds } = useHandleBookmark();

  const handleBack = () => navigation.goBack();

  const backgroundColor = useMemo(
    () => (isDark ? themeColors.black : themeColors.appBackground),
    [isDark],
  );

  // ✅ Fetch function to avoid code duplication
  const fetchBooks = useCallback(
    (params: {
      page: number;
      sort_by?: string;
      search?: string;
      genre_id?: string;
    }) => {
      dispatch(
        getBooks({
          page: params.page,
          sort_by: params.sort_by !== undefined ? params.sort_by : sortBy,
          search: params.search !== undefined ? params.search : search,
          genre_id: params.genre_id !== undefined ? params.genre_id : genreId,
        }),
      );
    },
    [dispatch, sortBy, search, genreId],
  );

  // ✅ initial fetch
  useEffect(() => {
    fetchBooks({
      page: 1,
      sort_by: sortBy,
      search: search,
      genre_id: genreId,
    });
  }, []);

  // ✅ set initial bookmark + likes
  useEffect(() => {
    if (!books?.length) return;

    const bookmarked = books
      .filter((item: any) => item.isWishlisted === 1)
      .map((item: any) => item.id);

    dispatch(setInitialBookmarks(bookmarked));

    const liked = books
      .filter((item: any) => item.isLiked === 1)
      .map((item: any) => item.id);

    dispatch(setInitialLikes(liked));

    const reactions: Record<string, string> = {};
    const likeCounts: Record<string, number> = {};

    books.forEach((item: any) => {
      likeCounts[item.id] = item.likes_count || 0;

      if (item.emoji_type) {
        reactions[item.id] = item.emoji_type;
      }
    });

    dispatch(setInitialReactions(reactions));
    dispatch(setInitialLikeCounts(likeCounts));
  }, [books]);

  // ✅ pagination
  const isFetchingMore = useRef(false);

  const handleScroll = () => {
    // Close reaction popup when scrolling
    if (activeReactionBookId) {
      setActiveReactionBookId(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      return () => {
        setActiveReactionBookId(null);
      };
    }, [])
  );



  const loadMore = useCallback(() => {
    if (loading || isFetchingMore.current || !hasMore) {
      return;
    }

    isFetchingMore.current = true;

    dispatch(
      getBooks({
        page: page + 1,
        sort_by: sortBy,
        search,
        genre_id: genreId,
      }),
    ).finally(() => {
      isFetchingMore.current = false;
    });
  }, [page, hasMore, loading, sortBy, search, genreId]);

  // ✅ refresh
  const onRefresh = async () => {
    setRefreshing(true);

    await dispatch(
      getBooks({
        page: 1,
        sort_by: sortBy,
        search: search,
        genre_id: genreId,
      }),
    );

    setRefreshing(false);
  };

  // ✅ Function to close search and reset everything
  const handleCloseSearch = () => {
    setShowSearch(false);
    setSearch('');

    // Reset to first page with cleared search
    dispatch(
      getBooks({
        page: 1,
        sort_by: sortBy,
        search: '',
        genre_id: genreId,
      }),
    );
  };

  // ✅ Function to close genre dropdown and reset everything
  const handleCloseGenre = () => {
    setShowGenreDropdown(false);
    setGenreId('');

    // Reset to first page with cleared genre
    dispatch(
      getBooks({
        page: 1,
        sort_by: sortBy,
        search: search,
        genre_id: '',
      }),
    );
  };

  // ✅ Toggle search with reset on close
  const handleSearchToggle = () => {
    if (showSearch) {
      // Closing search - reset everything
      handleCloseSearch();
    } else {
      // Opening search
      setShowSearch(true);
    }
  };

  // ✅ Toggle genre dropdown with reset on close
  const handleGenreToggle = () => {
    if (showGenreDropdown) {
      // Closing genre dropdown - reset everything
      handleCloseGenre();
    } else {
      // Opening genre dropdown
      setShowGenreDropdown(true);
    }
  };

  // ✅ footer
  const renderFooter = () => {
    if (loading && page > 1) {
      return (
        <View style={{ paddingVertical: 20 }}>
          <CardSkeleton width={CARD_WIDTH} height={260} />
        </View>
      );
    }

    if (!hasMore && books.length > 0) {
      return (
        <Text
          style={{
            textAlign: 'center',
            padding: 20,
            opacity: 0.6,
            color: themeColors.white,
          }}
        >
          🎉 You've reached the end
        </Text>
      );
    }

    return null;
  };

  // ✅ empty
  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View
        style={{
          alignItems: 'center',
          marginTop: 100,
        }}
      >
        <StarBanner />
        <Text style={{ color: themeColors.primary, fontFamily: Fonts.Medium, fontSize: 16 }}>Oops! No Books Found</Text>
      </View>
    );
  };

  // ✅ skeleton
  const skeletonData = Array.from({ length: 6 }, (_, i) => ({
    id: i,
  }));

  const hideHeader =
    showSearch &&
    search.trim().length > 0 &&
    books.length === 0 &&
    !loading;

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor,
        },
      ]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        translucent
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      <AuthHeader
        showBack
        title="Books"
        count={pagination?.total_contents}
        showCount={true}
        onBack={handleBack}
        // ✅ Search props
        showSearchIcon={true}
        showSearchOpen={showSearch}
        onSearchToggle={handleSearchToggle}
        search={search}
        setSearch={setSearch}
        onSearch={(text: string) => {
          setSearch(text);
          dispatch(
            getBooks({
              page: 1,
              sort_by: sortBy,
              search: text,
              genre_id: genreId,
            }),
          );
        }}
        // ✅ Genre props
        showGenreIcon={true}
        showGenreDropdown={showGenreDropdown}
        handleGenre={handleGenreToggle}
        genre={genreId}
        setGenre={setGenreId}
        onGenreChange={(value: string) => {
          setGenreId(value);
          dispatch(
            getBooks({
              page: 1,
              sort_by: sortBy,
              search: search,
              genre_id: value,
            }),
          );
        }}
        dropdownType="genre"
      />

      <FlatList
        ListHeaderComponent={
          !hideHeader ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottomColor: themeColors.gray,
                borderBottomWidth: 0.5,
                marginBottom: 10,
              }}
            >
              <Tabs
                tabs={TABS}
                activeTab={activeTab}
                onChange={tab => {
                  if (activeReactionBookId) {
                    setActiveReactionBookId(null);
                  }
                  setActiveTab(tab);

                  let newSort = 'recent';

                  if (tab === 'Trending') {
                    newSort = 'trending';
                  }

                  if (tab === 'Most Rated') {
                    newSort = 'most_rated';
                  }

                  if (tab === 'Most Viewed') {
                    newSort = 'most_viewed';
                  }

                  setSortBy(newSort);

                  // Close reaction popup when changing tabs
                  if (activeReactionBookId) {
                    setActiveReactionBookId(null);
                  }

                  dispatch(
                    getBooks({
                      page: 1,
                      sort_by: newSort,
                      search: search,
                      genre_id: genreId,
                    }),
                  );
                }}
              />
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => {
                  navigation.navigate('AddBook');
                }}
              >
                <Plus size={28} />
              </TouchableOpacity>
            </View>
          ) : null
        }
        data={loading && page === 1 ? skeletonData : books}
        keyExtractor={(item: any) => item?.id?.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        initialNumToRender={6}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={10}
        removeClippedSubviews={true}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        onScroll={handleScroll} // 👈 Add this
        scrollEventThrottle={16} // 👈 Add this
        renderItem={({ item }: any) => {
          const isReactionOpen = activeReactionBookId === String(item?.id);
          return (
            <View
              style={{
                width: CARD_WIDTH,
              }}
            >
              {loading && page === 1 ? (
                <CardSkeleton width={CARD_WIDTH} height={260} />
              ) : (
                <BookCard
                  image={item?.image}
                  ribbonText={item?.genre?.name || 'Book'}
                  height={260}
                  width={CARD_WIDTH}
                  onPress={() =>
                    navigation.navigate('BookDetails', {
                      bookId: item?.id,
                    })
                  }
                  bookmarked={bookmarkedIds.includes(item?.id)}
                  onBookmark={() => handleBookmark(item?.id)}
                  likes={likeCountMap[item?.id] ?? item?.likes_count}
                  views={item?.views}
                  rating={item?.avg_rating ?? '0'}
                  title={item?.title}
                  author={item?.user?.name}
                  handleLike={(reaction?: ReactionType) =>
                    handleLike({
                      id: item?.id,
                      emoji_type: reaction || 'Heart',
                      likes_count: item?.likes_count || 0,
                      isReactionPress: reaction !== undefined,
                    })
                  }
                  emoji_type={
                    likedIds.includes(item?.id)
                      ? reactionMap[item?.id] ?? item?.emoji_type
                      : null
                  }
                  isLiked={likedIds.includes(item?.id)}
                  reactionPopupVisible={isReactionOpen}
                  onOpenReaction={() => {
                    setActiveReactionBookId(String(item?.id));
                  }}
                  onCloseReaction={() => {
                    setActiveReactionBookId(null);
                  }}
                />
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
};

export default AllBooks;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  listContainer: {
    paddingHorizontal: CARD_MARGIN,
    paddingBottom: 20,
  },

  row: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addBtn: {
    backgroundColor: themeColors.primary,
    padding: 2,
    borderRadius: 100,
  },
});
