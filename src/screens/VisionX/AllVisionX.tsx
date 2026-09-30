import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import React, {
  useMemo,
  useCallback,
  useEffect,
  useState,
  useRef,
} from 'react';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import AuthHeader from '../../components/Header/AuthHeader';
import { themeColors } from '../../theme/colors';
import Tabs from '../../components/Tabs/Tabs';

import {
  deleteVisionXThunk,
  getVisionXByIdThunk,
  getVisionXThunk,
} from '../../redux/slices/visionXSlice';

import {
  setInitialBookmarks,
  setInitialLikeCounts,
  setInitialLikes,
  setInitialReactions,
} from '../../redux/slices/actionSlice';

import { useHandleBookmark } from '../../hooks/useHandleBookmark';
import VisionCard from './components/cards/VisionCard';
import { useHandleLike } from '../../hooks/useHandleLike';
import { ReactionType } from '../../hooks/useEmojiReaction';
import Plus from '../../assets/SVG/Plus';
import { createReport, getReports } from '../../redux/slices/reportSlice';
import { useToast } from '../../components/Toast/ToastProvider';
import ReportModal from '../../components/Modals/ReportModal';
import PostMenu from '../../components/Post/PostMenu';
import VisionCardSkeleton from './components/cards/VisionCardSkeleton';
import StarBanner from '../../assets/SVG/StarBanner';
import { Fonts } from '../../constants/Fonts';
import { useShare } from '../../hooks/useShare';

const AllVisionX = () => {
  const navigation = useNavigation<any>();
  const isDark = true;
  const dispatch = useDispatch<any>();
  const [sortBy, setSortBy] = useState('recent');
  const [activeTab, setActiveTab] = useState('Recent');
  const [refreshing, setRefreshing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const onEndReachedCalledDuringMomentum = useRef(false);
  const { show } = useToast();
  const { handleShare } = useShare({});

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({
    x: 20,
    y: 0,
  });
  const [activePost, setActivePost] = useState<any>(null);
  const [reportVisible, setReportVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [genreId, setGenreId] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [activeReactionVisionId, setActiveReactionVisionId] = useState<string | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ reusable hooks
  const { handleBookmark, bookmarkedIds } = useHandleBookmark();
  const { handleLike, likedIds, reactionMap, likeCountMap } = useHandleLike();

  const backgroundColor = useMemo(
    () => (isDark ? themeColors.black : themeColors.appBackground),
    [isDark],
  );

  const { visionX, loading, page, hasMore, loadingMore, pagination } =
    useSelector((state: any) => state.visionx);
  const { reports } = useSelector((state: any) => state.report);
  const { user: authUser } = useSelector((state: any) => state.auth);

  /* ---------------- INITIAL LOAD ---------------- */

  useFocusEffect(
    React.useCallback(() => {
      dispatch(
        getVisionXThunk({
          page: 1,
          sort_by: sortBy,
          search,
          genre_id: genreId,
        }),
      );
    }, [dispatch, sortBy, search, genreId]),
  );

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setActiveReactionVisionId(null);
      };
    }, [])
  );

  // ✅ Handle scroll to close reaction popup
  const handleScroll = () => {
    if (activeReactionVisionId) {
      setActiveReactionVisionId(null);
    }
  };

  /* ---------------- SET INITIAL STATES ---------------- */

  useEffect(() => {
    if (!visionX?.length) return;

    dispatch(
      setInitialBookmarks(
        visionX
          .filter((item: any) => item.isWishlisted === 1)
          .map((item: any) => item.id),
      ),
    );

    dispatch(
      setInitialLikes(
        visionX
          .filter((item: any) => item.isLiked === 1)
          .map((item: any) => item.id),
      ),
    );

    const reactions: Record<string, string> = {};
    const likeCounts: Record<string, number> = {};

    visionX.forEach((item: any) => {
      likeCounts[item.id] = item.likes_count || 0;

      if (item.emoji_type) {
        reactions[item.id] = item.emoji_type;
      }
    });

    dispatch(setInitialReactions(reactions));
    dispatch(setInitialLikeCounts(likeCounts));
  }, [visionX, dispatch]);

  /* ---------------- NAVIGATION ---------------- */

  const handleOpenVideo = useCallback(
    (item: any) => {
      navigation.navigate('VisionXDetails', {
        visionxId: item?.id,
      });
    },
    [navigation],
  );

  /* ---------------- REFRESH ---------------- */

  const onRefresh = async () => {
    setRefreshing(true);

    dispatch(setInitialLikeCounts({}));

    await dispatch(
      getVisionXThunk({
        page: 1,
        sort_by: sortBy,
        search,
        genre_id: genreId,
      }),
    );

    setRefreshing(false);
  };

  /* ---------------- LOAD MORE ---------------- */

  const loadMore = () => {
    console.log({
      page,
      loading,
      loadingMore,
      hasMore,
    });

    if (loading || loadingMore || !hasMore) return;

    console.log('Fetching page', page + 1);

    dispatch(
      getVisionXThunk({
        page: page + 1,
        sort_by: sortBy,
        search,
        genre_id: genreId,
      }),
    );
  };

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 30, // pause only once it's mostly gone, not merely "not top"
    minimumViewTime: 250,
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems?.length > 0) {
      // keep the *closest to top* visible item active, not strictly index 0 by array order
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const openMenu = useCallback((event: any, post: any) => {
    const { pageY } = event.nativeEvent;

    setMenuPosition({
      x: 20,
      y: pageY,
    });

    setActivePost(post);

    setMenuVisible(true);
  }, []);

  const handleOpenReport = async () => {
    try {
      if (!reports || reports.length === 0) {
        await dispatch(getReports());
      }

      setMenuVisible(false);

      setReportVisible(true);
    } catch (e) {
      show({
        type: 'error',
        title: 'Failed to load report options',
      });
    }
  };

  const handleReport = async (data: any) => {
    try {
      if (!activePost?.id) return;

      const payload = {
        report_id: data.reason,
        description: data.message || '',

        synopses_id: activePost.id,

        reported_user_id: activePost?.user?.id,

        chat_id: undefined,
        message_id: undefined,
      };

      const res: any = await dispatch(createReport(payload));

      if (res?.meta?.requestStatus !== 'fulfilled') {
        throw new Error(res?.payload || 'Report failed');
      }

      show({
        type: 'success',
        title: res?.payload?.message || 'Report submitted',
      });

      setReportVisible(false);
    } catch (error: any) {
      show({
        type: 'error',
        title: error?.message || 'Something went wrong',
      });
    }
  };

  const handleEdit = async () => {
    if (!activePost) return;

    try {
      const res: any = await dispatch(
        getVisionXByIdThunk(activePost.id),
      ).unwrap();

      navigation.navigate('AddVisionX', {
        vision: res.data ?? res,
      });

      setMenuVisible(false);
    } catch (e) {
      console.log('Vision edit error', e);
    }
  };
  const handleDelete = () => {
    if (!activePost) return;

    Alert.alert(
      'Delete Vision',
      'Are you sure you want to delete this content?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteVisionXThunk(activePost.id)).unwrap();

              await dispatch(
                getVisionXThunk({
                  page: 1,
                  sort_by: sortBy,
                  search,
                  genre_id: genreId,
                }),
              );

              show({
                type: 'success',
                title: 'Vision deleted successfully',
              });

              setMenuVisible(false);
            } catch (error: any) {
              show({
                type: 'error',
                title: error || 'Delete failed',
              });
            }
          },
        },
      ],
    );
  };

  const handleCloseSearch = () => {
    setShowSearch(false);
    setSearch('');

    dispatch(
      getVisionXThunk({
        page: 1,
        sort_by: sortBy,
        search: '',
        genre_id: genreId,
      }),
    );
  };

  const handleCloseGenre = () => {
    setShowGenreDropdown(false);
    setGenreId('');

    dispatch(
      getVisionXThunk({
        page: 1,
        sort_by: sortBy,
        search: search,
        genre_id: '',
      }),
    );
  };

  const handleSearchToggle = () => {
    if (showSearch) {
      handleCloseSearch();
    } else {
      // Opening search
      setShowSearch(true);
    }
  };

  const handleGenreToggle = () => {
    if (showGenreDropdown) {
      handleCloseGenre();
    } else {
      setShowGenreDropdown(true);
    }
  };

  /* ---------------- FOOTER ---------------- */

  const renderFooter = () => {
    if (loadingMore) {
      return <ActivityIndicator size={'small'} />;
    }

    if (!hasMore && visionX.length > 0) {
      return <Text style={styles.end}>🎉 You've reached the end</Text>;
    }

    return null;
  };

  /* ---------------- EMPTY ---------------- */

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.empty}>
        <StarBanner />
        <Text style={{ color: themeColors.primary, fontFamily: Fonts.Medium, fontSize: 16 }}>Oops! No Content Found</Text>
      </View>
    );
  };

  const isOwnPost = useMemo(
    () => authUser?.id === activePost?.user?.id,
    [authUser?.id, activePost?.user?.id],
  );

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
        title="Creators Zone"
        fontSize={22}
        count={pagination?.total_contents}
        showCount={true}
        onBack={() => navigation.goBack()}
        // ✅ Search props
        showSearchIcon={true}
        showSearchOpen={showSearch}
        onSearchToggle={handleSearchToggle}
        search={search}
        setSearch={setSearch}
        onSearch={(text: string) => {
          setSearch(text);
          dispatch(
            getVisionXThunk({
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
            getVisionXThunk({
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
        onScroll={(event) => {
          // Clear any existing timeout
          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
          }

          // Set scrolling to true
          setIsScrolling(true);

          // Set scrolling to false after scrolling stops (300ms delay)
          scrollTimeoutRef.current = setTimeout(() => {
            setIsScrolling(false);
          }, 300);

          // Also call your existing handleScroll
          handleScroll();
        }}
        scrollEventThrottle={16}
        ListHeaderComponent={
          loading || visionX.length > 0 ? (
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
                tabs={['Recent', 'Most Rated', 'Most Viewed']}
                activeTab={activeTab}
                onChange={tab => {
                  if (activeReactionVisionId) {
                    setActiveReactionVisionId(null);
                  }
                  setActiveTab(tab);

                  let newSort = 'recent';

                  // if (tab === 'Trending') {
                  //   newSort = 'trending';
                  // }

                  if (tab === 'Most Rated') {
                    newSort = 'most_rated';
                  }

                  if (tab === 'Most Viewed') {
                    newSort = 'most_viewed';
                  }

                  setSortBy(newSort);
                }}
              />

              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => navigation.navigate('AddVisionX')}
              >
                <Plus size={28} />
              </TouchableOpacity>
            </View>
          ) : null
        }
        data={loading && page === 1 ? [1, 2, 3, 4] : visionX}
        keyExtractor={(item, index) =>
          loading && page === 1
            ? `skeleton-${index}`
            : String((item as any).id)
        }
        renderItem={({ item, index }) => {
          // Skeleton Loader
          if (loading && page === 1) {
            return (
              <View style={styles.cardWrapper}>
                <VisionCardSkeleton />
              </View>
            );
          }

          const isReactionOpen = activeReactionVisionId === String(item?.id);
          return (
            <View style={styles.cardWrapper}>
              <VisionCard
                url={item?.image}
                title={item?.title}
                avatar={item?.user?.profile_photo_path}
                name={item?.user?.name}
                user_name={item?.user?.user_name}
                time={item?.createdAt}
                likes={likeCountMap[item?.id] ?? item?.likes_count}
                liked={likedIds.includes(item?.id)}
                views={item?.views}
                rating={item?.avg_rating}
                type={item?.platform}
                link={item?.link}
                isActive={activeIndex === index}
                bookmarked={bookmarkedIds.includes(item?.id)}
                onSaved={() => handleBookmark(item?.id)}
                onPress={() => handleOpenVideo(item)}
                handleUser={() =>
                  navigation.navigate('Profile', {
                    username:
                      item?.user?.user_name ||
                      item?.user?.id ||
                      item?.user?.userId,
                  })
                }
                emoji_type={
                  likedIds.includes(item.id)
                    ? reactionMap[item.id] ?? item?.emoji_type
                    : null
                }
                onReactionSelect={(reaction?: ReactionType) =>
                  handleLike({
                    id: item?.id,
                    emoji_type: reaction || 'Heart',
                    likes_count: item?.likes_count || 0,
                    isReactionPress: reaction !== undefined,
                  })
                }
                onMenuPress={e => openMenu(e, item)}
                isReported={item?.isReported}
                reactionPopupVisible={isReactionOpen}
                onOpenReaction={() => {
                  setActiveReactionVisionId(String(item?.id));
                }}
                onCloseReaction={() => {
                  setActiveReactionVisionId(null);
                }}
                onShare={() => {
                  handleShare({
                    title: item?.title,
                    value: item?.id,
                    type: 'visionx',
                  })
                }}
                isScrolling={isScrolling}
              />
            </View>
          );
        }}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={!loading ? renderEmpty : null}
        onEndReachedThreshold={1}
        removeClippedSubviews={Platform.OS === 'ios'}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={7}
        updateCellsBatchingPeriod={50}
        showsVerticalScrollIndicator={false}
        onMomentumScrollBegin={() => {
          onEndReachedCalledDuringMomentum.current = false;
        }}
        onEndReached={() => {
          if (
            !loading &&
            !loadingMore &&
            hasMore &&
            !onEndReachedCalledDuringMomentum.current
          ) {
            loadMore();
            onEndReachedCalledDuringMomentum.current = true;
          }
        }}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      <PostMenu
        visible={menuVisible}
        x={menuPosition.x}
        y={menuPosition.y}
        onClose={() => setMenuVisible(false)}
        onReport={handleOpenReport}
        isOwnPost={isOwnPost}
        isReported={activePost?.isReported === 1}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ReportModal
        visible={reportVisible}
        post={activePost}
        onClose={() => setReportVisible(false)}
        onSubmit={handleReport}
        reportType="VISIONX"
      />
    </SafeAreaView>
  );
};

export default AllVisionX;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  listContainer: {
    paddingHorizontal: 10,
  },

  cardWrapper: {
    marginBottom: 7,
  },

  loading: {
    textAlign: 'center',
    padding: 20,
    opacity: 0.6,
  },

  end: {
    textAlign: 'center',
    padding: 20,
    opacity: 0.6,
    color: themeColors.white,
  },

  empty: {
    alignItems: 'center',
    marginTop: 100,
  },

  addBtn: {
    backgroundColor: themeColors.primary,
    padding: 2,
    borderRadius: 100,
  },
});
