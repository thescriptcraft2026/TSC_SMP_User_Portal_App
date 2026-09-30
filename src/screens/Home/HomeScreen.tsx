import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import {
  Animated,
  StatusBar,
  StyleSheet,
  View,
  RefreshControl,
  Platform,
  Alert,
  Dimensions,
  Text,
  TouchableOpacity,
  TextInput,
} from 'react-native';

import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';

import PostCard from '../../components/Post/PostCard';
import PostSkeleton from '../../components/Post/PostSkeleton';
import HomeHeader from './components/Header/HomeHeader';
import PostMenu from '../../components/Post/PostMenu';
import ProfileSuggestionCard from '../../components/Cards/ProfileSuggestionCard';
import ContestCard from '../../components/Contest/ContestCard';
import ReportModal from '../../components/Modals/ReportModal';

import { themeColors } from '../../theme/colors';
import { mockUsers } from '../../data/data';
import { useShare } from '../../hooks/useShare';
import { useDispatch, useSelector } from 'react-redux';
import { ActivityIndicator } from 'react-native-paper';
import {
  getAllContest,
  getContestBanner,
  getMyParticipatedContestsThunk,
  resetContest,
  startContestLoading,
  toggleBookmarkLocal,
  toggleContestBookmark,
} from '../../redux/slices/contestSlice';
import ContestSkeleton from '../../components/Contest/ContestSkeleton';
import { useToast } from '../../components/Toast/ToastProvider';
import {
  fetchFeed,
  getPostByIdThunk,
  resetFeed,
  updateReportedPostLocal,
} from '../../redux/slices/feedSlice';
import {
  getAllMovies,
  toggleBookmarkLocal as toggleMovieBookmarkLocal,
  toggleContestBookmark as toggleMovieBookmark,
  resetMovies,
} from '../../redux/slices/movieSlice';
import { createReport, getReports } from '../../redux/slices/reportSlice';
import { deletePost, repostPost } from '../../redux/slices/postSlice';
import RepostModal from '../../components/Modals/RepostModal';
import { ReactionType } from '../../hooks/usePostReaction';
import MovieCardSkeleton from '../Movie/components/MovieCardSkeleton';
import MovieCard from '../Movie/components/MovieCard';
import { useFeedLike } from '../../hooks/feed/useFeedLike';
import { useFeedBookmark } from '../../hooks/feed/useFeedBookmark';
import { mapContests, useFeedData } from '../../hooks/feed/useFeedData';
import { useFeedInitialization } from '../../hooks/feed/useFeedInitialization';
import { useFeedPagination } from '../../hooks/feed/useFeedPagination';
import { tabBarScrollY } from '../../navigation/BottomTab';
import { notificationCount } from '../../redux/slices/notificationSlice';
import Tabs from '../../components/Tabs/Tabs';
import ArrowUpRight from '../../assets/SVG/ArrowUpRight';
import { Fonts } from '../../constants/Fonts';
import Search from '../../assets/SVG/Search';
import Fillter from '../../assets/SVG/Fillter';
import Ionicons from '@react-native-vector-icons/ionicons';
import api from '../../../Instance/Instance';
import FloatingDropdown from '../../components/DropDown/FloatingDropdown';
import { useSocket } from '../../context/SocketContext';
import NoPost from '../../assets/SVG/NoPost';
import Sort from '../../assets/SVG/Sort';
import { getBookByIdThunk } from '../../redux/slices/bookSlice';
import { getVisionXByIdThunk } from '../../redux/slices/visionXSlice';
import EditThoughtModal from '../../components/Modals/EditThoughtModal';
import NoContest from '../../assets/SVG/NoContest';
import { responsiveHeight } from '../../utils/responsive';
import { skipFeedRefreshOnFocus } from '../../utils/navigationFlags';
import StarBanner from '../../assets/SVG/StarBanner';
import Dart from '../../assets/SVG/Dart';
import ContestBannerSwiper from '../Contest/components/ContestBannerSwiper';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList);
const { height, width } = Dimensions.get('window');

const CARD_MARGIN = 10;
const CARD_GAP = 10;

const CARD_WIDTH = (width - CARD_MARGIN * 2 - CARD_GAP) / 2;

const isIphone61 =
  Platform.OS === 'ios' &&
  ((height === 844 && width === 390) || (height === 390 && width === 844));

const EXPANDED_HEADER_HEIGHT =
  Platform.OS === 'ios'
    ? isIphone61
      ? 160 // adjusted for 6.1-inch iPhone
      : 80
    : 120;

const COLLAPSED_HEADER_HEIGHT = Platform.OS === 'ios' ? 90 : 65;

const TOP_HEADER_HEIGHT = EXPANDED_HEADER_HEIGHT - COLLAPSED_HEADER_HEIGHT;

const TABS = ['Feed', 'Unfiltered', 'Contest'];

/* ---------------- COMPONENT ---------------- */
export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const { handleShare } = useShare({}); // ✅ FIXED
  const { show } = useToast();
  const onEndReachedCalledDuringMomentum = useRef(false);
  const contestMomentum = useRef(false);
  const contestFetchingMore = useRef(false);

  const movieMomentum = useRef(false);
  const movieFetchingMore = useRef(false);

  const bg = '#09090d';

  /* ---------------- STATE ---------------- */
  const [refreshing, setRefreshing] = useState(false);

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 4, y: 0 });

  const [activePost, setActivePost] = useState<any>(null);

  const [reportVisible, setReportVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('Feed');

  const [repostVisible, setRepostVisible] = useState(false);
  const [selectedRepostPost, setSelectedRepostPost] = useState<any>(null);

  const [contestTab, setContestTab] = useState('Ongoing');
  const [sortBy, setSortBy] = useState('ongoing');
  const [showMyOpps, setShowMyOpps] = useState(false);
  const CONTEST_TABS = ['Ongoing', 'Upcoming', 'Completed'];
  const MOVIE_TABS = ['New', 'Top Rated'];

  const [sortMovieBy, setSortMovieBy] = useState('new');
  const [activeMovieTab, setActiveMovieTab] = useState('New');
  const [viewSortTab, setViewSortTab] = useState(false);

  const [showMovieSearch, setShowMovieSearch] = useState(false);
  const [movieSearch, setMovieSearch] = useState('');

  const [showContestSearch, setShowContestSearch] = useState(false);
  const [contestSearch, setContestSearch] = useState('');

  const [movieGenre, setMovieGenre] = useState('');
  const [genreOptions, setGenreOptions] = useState<any[]>([]);
  const [showFilter, setShowFilter] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [reviewCategoryId, setReviewCategoryId] = useState('');

  const [editThoughtVisible, setEditThoughtVisible] = useState(false);
  const [editingThoughtPost, setEditingThoughtPost] = useState<any>(null);

  const [headerHeight, setHeaderHeight] = useState(0);

  const [visiblePostIds, setVisiblePostIds] = useState<Set<string>>(new Set());
  const [activeReactionPostId, setActiveReactionPostId] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const [refreshingStates, setRefreshingStates] = useState({
    feed: false,
    unfiltered: false,
    contest: false,
  });

  /* ---------------- REFS ---------------- */
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOffset = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const tabVisible = useRef(true);

  const pagerRef = useRef<PagerView>(null);
  const pagerScroll = useRef(new Animated.Value(0)).current;

  const scrollRefs = useRef<any[]>([]);
  const scrollOffsets = useRef([0, 0, 0]);

  const resetHomeHeader = () => {
    headerOffset.setValue(0);

    lastScrollY.current = 0;

    scrollOffsets.current = [0, 0, 0];

    Animated.spring(tabBarScrollY, {
      toValue: 0,
      useNativeDriver: true,
    }).start();

    requestAnimationFrame(() => {
      scrollRefs.current.forEach(ref => {
        ref?.scrollToOffset({
          offset: 0,
          animated: false,
        });
      });
    });
  };

  const movieListRef = useRef<any>(null);
  const contestListRef = useRef<any>(null);

  const movieScrollY = useRef(0);
  const contestScrollY = useRef(0);

  const { notificationCount: socketNotificationCount } = useSocket();

  /* ---------------- ACTIONS ---------------- */

  /* ---------------- MENU ---------------- */

  const openMenu = useCallback((event: any, post: any) => {
    const { pageY } = event.nativeEvent;

    setMenuPosition({ x: 20, y: pageY });
    setActivePost(post);
    setMenuVisible(true);
  }, []);

  /* ---------------- Redux ---------------- */
  const {
    movies,
    loading: movieLoading,
    page,
    hasMore,
    loadingMore,
  } = useSelector((state: any) => state.movie);

  const {
    contest: contestList,
    loading: contestLoading,
    page: contestPage,
    hasMore: contestHasMore,
    myParticipatedContests,
    myParticipatedLoading,
    bannerData,
  } = useSelector((state: any) => state.contest);

  const { bookmarkedIds } = useSelector((state: any) => state.contest);
  const { bookmarkedIds: movieBookmarkedIds } = useSelector(
    (state: any) => state.movie,
  );
  const {
    feed,
    loading: feedLoading,
    hasMore: feedHasMore,
  } = useSelector((state: any) => state.feed);

  const {
    bookmarkedIds: feedBookMark,
    likedIds,
    reactionMap,
    likeCountMap,
  } = useSelector((state: any) => state.actions);
  const { reports } = useSelector((state: any) => state.report);
  const { user: authUser } = useSelector((state: any) => state.auth);
  const notificationCountValue = useSelector(
    (state: any) => state.notification?.count || 0,
  );

  const totalNotificationCount =
    notificationCountValue + socketNotificationCount;

  // Hooks
  const { handleFeedLike } = useFeedLike();
  const { handleFeedBookmark } = useFeedBookmark();

  /* ---------------- DATA ---------------- */
  const { mixedFeed, moviesData } = useFeedData({
    feed,
    contestList,
    movies,
  });

  const filteredMovies = useMemo(() => {
    let data = moviesData;

    // SEARCH FILTER
    if (movieSearch?.trim()) {
      data = data.filter((item: any) => {
        const title = item?.data?.title || '';

        return title.toLowerCase().includes(movieSearch.toLowerCase());
      });
    }
    return data;
  }, [moviesData, movieSearch, movieGenre]);

  const finalContestData = useMemo(() => {
    if (!showMyOpps) {
      return mapContests(contestList || []);
    }

    const seen = new Map();

    (myParticipatedContests || []).forEach((item: any) => {
      const contestId = item?.contest?.id;
      if (!contestId) return;

      if (!seen.has(contestId)) {
        seen.set(contestId, {
          ...item,
          submissionCount: 1,
        });
      } else {
        seen.get(contestId).submissionCount += 1;
      }
    });

    return mapContests(Array.from(seen.values()));
  }, [showMyOpps, myParticipatedContests, contestList]);

  const filteredContestData = useMemo(() => {
    let data = finalContestData;

    if (contestSearch?.trim()) {
      data = data.filter((item: any) => {
        const title = item?.data?.title || '';

        return title.toLowerCase().includes(contestSearch.toLowerCase());
      });
    }

    return data;
  }, [finalContestData, contestSearch]);

  // Fetch Movies Data
  const fetchedMoviesRef = useRef(false);
  const fetchedContestRef = useRef(false);

  useEffect(() => {
    // Movies
    if (activeTab === 'Unfiltered') {
      if (!fetchedMoviesRef.current) {
        fetchedMoviesRef.current = true;

        dispatch(
          getAllMovies({
            page: 1,
            sort_by: sortMovieBy,
            genre_id: movieGenre || undefined,
            reviewcategory_id: reviewCategoryId || undefined,
          }),
        );
      }
    }

    // Contest
    if (activeTab === 'Contest' && !showMyOpps) {
      if (!fetchedContestRef.current) {
        fetchedContestRef.current = true;

        dispatch(
          getAllContest({
            page: 1,
            sort_by: sortBy,
            search: contestSearch,
          }),
        );
        dispatch(getContestBanner());
      }
    }
  }, [activeTab]);

  useEffect(() => {
    fetchedMoviesRef.current = false;
  }, [sortMovieBy, movieGenre, reviewCategoryId]);

  useEffect(() => {
    fetchedContestRef.current = false;
  }, [sortBy, contestSearch, showMyOpps]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await api.get('/genre');

        const formatted =
          res?.data?.data?.map((item: any) => ({
            label: item?.name,
            value: item?.id,
          })) || [];

        setGenreOptions(formatted);
      } catch (e) {
        console.log('genre error', e);
      }
    };

    fetchGenres();
  }, []);

  /* ---------------- COMMON LIST CONFIG ---------------- */

  const HEADER_CONTENT_GAP = Platform.OS === 'ios' ? -6 : responsiveHeight(1);

  const CONTENT_TOP_SPACING = headerHeight + HEADER_CONTENT_GAP;

  const listProps = {
    bounces: false,
    showsVerticalScrollIndicator: false,
    scrollEventThrottle: 16,
    removeClippedSubviews: false,
    drawDistance: 2000,
    initialNumToRender: 10,
    maxToRenderPerBatch: 10,
    windowSize: 15,
    contentContainerStyle: {
      paddingTop: CONTENT_TOP_SPACING,
      paddingBottom: 120,
    },
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    const ids = new Set<string>();

    viewableItems.forEach((item: any) => {
      if (item?.item?.type === 'post') {
        ids.add(String(item.item.data.id));
      }
    });

    setVisiblePostIds(ids);
  }).current;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  /* ---------------- Like & BookMark Handle ---------------- */
  const handleBookmark = async (id: string) => {
    if (!id) return;

    const isAlreadyBookmarked = bookmarkedIds?.includes(id);

    // ✅ optimistic update
    dispatch(toggleBookmarkLocal(id));

    try {
      const res: any = await dispatch(
        toggleContestBookmark({
          contest_id: id,
          type: isAlreadyBookmarked ? 'delete' : 'create',
        }),
      );

      const isSuccess = res?.meta?.requestStatus === 'fulfilled';

      if (!isSuccess) {
        // ❌ rollback
        dispatch(toggleBookmarkLocal(id));

        show({
          type: 'error',
          title: res?.payload || 'Something went wrong',
        });
        return;
      }

      // ✅ correct success message
      show({
        type: 'success',
        title:
          res?.payload?.res?.message || // 👈 actual API response
          (isAlreadyBookmarked
            ? 'Removed from bookmarks'
            : 'Added to bookmarks'),
      });
    } catch (error: any) {
      dispatch(toggleBookmarkLocal(id));

      show({
        type: 'error',
        title: 'Something went wrong',
      });
    }
  };

  const handleMovieBookmark = async (id: string) => {
    if (!id) return;

    const movie = movies?.find((m: any) => m?.id === id);

    const isAlreadyBookmarked =
      movieBookmarkedIds?.includes(id) || movie?.is_wishlisted === 1;

    // ✅ optimistic update
    dispatch(toggleMovieBookmarkLocal(id));

    try {
      const res: any = await dispatch(
        toggleMovieBookmark({
          content_id: id,

          // ✅ IMPORTANT
          type: isAlreadyBookmarked ? 'delete' : 'create',
        }),
      );

      const isSuccess = res?.meta?.requestStatus === 'fulfilled';

      // ❌ rollback
      if (!isSuccess) {
        dispatch(toggleMovieBookmarkLocal(id));

        show({
          type: 'error',
          title: res?.payload || 'Something went wrong',
        });

        return;
      }

      show({
        type: 'success',

        // ✅ API response message
        title:
          res?.payload?.res?.message ||
          (res?.payload?.res?.data?.in_wishlist
            ? 'Added to bookmarks'
            : 'Removed from bookmarks'),
      });
    } catch (error) {
      // ❌ rollback
      dispatch(toggleMovieBookmarkLocal(id));

      show({
        type: 'error',
        title: 'Something went wrong',
      });
    }
  };

  const handleOpenReport = async () => {
    try {
      // 👇 only fetch if not already available
      if (!reports || reports.length === 0) {
        await dispatch(getReports()); // 👈 your API
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
      if (!activePost?.id) return; // ✅ FIXED

      const payload = {
        report_id: data.reason,
        description: data.message || '',

        // ✅ THIS IS YOUR POST ID
        synopses_id: activePost.id,

        // ⚠️ YOU DON'T HAVE USER IN mapped data
        reported_user_id: activePost?.userId,

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

      show({
        type: 'success',
        title: res?.payload?.message || 'Report submitted',
      });

      dispatch(updateReportedPostLocal(activePost.id));

      setReportVisible(false);
      setMenuVisible(false);
      setActivePost(null);
    } catch (error: any) {
      show({
        type: 'error',
        title: error || error?.message || 'Something went wrong',
      });
    }
  };

  const handleOwnPostDelete = (id: any) => {
    if (!id) return;

    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const res: any = await dispatch(deletePost(id));

          const isSuccess = res?.meta?.requestStatus === 'fulfilled';

          if (!isSuccess) {
            show({
              type: 'error',
              title: res?.payload || 'Delete failed',
            });
            return;
          }

          // ✅ close menu
          setMenuVisible(false);

          // ✅ clear active post
          setActivePost(null);

          resetHomeHeader();

          dispatch(resetFeed());

          await dispatch(fetchFeed());

          show({
            type: 'success',
            title: 'Post deleted successfully',
          });
        },
      },
    ]);
  };

  const handleInstantRepost = async () => {
    try {
      if (!selectedRepostPost?.id) return;

      const payload = {
        synopsis_id: selectedRepostPost?.id,
        story: '', // optional caption
        mentions: [],
        tags: [],
      };

      console.log('REPOST PAYLOAD', payload);
      const res: any = await dispatch(repostPost(payload));

      console.log('REPOST RESPONSE', res);

      const isSuccess = res?.meta?.requestStatus === 'fulfilled';

      if (!isSuccess) {
        show({
          type: 'error',
          title: res?.payload || 'Repost failed',
        });

        return;
      }

      // 🔥 refresh feed
      resetHomeHeader();

      dispatch(resetFeed());

      await dispatch(fetchFeed());
      setRepostVisible(false);
      show({
        type: 'success',
        title: res?.payload?.message || 'Post reposted successfully',
      });
    } catch (error) {
      show({
        type: 'error',
        title: 'Something went wrong',
      });
    }
  };

  const handleRepostWithThoughts = async (data: any) => {
    try {
      if (!selectedRepostPost?.id) {
        return;
      }

      const payload = {
        synopsis_id: selectedRepostPost?.id,

        story: data?.story || '',

        mentions: data?.mentions || [],

        tags: [],
      };

      console.log('REPOST WITH THOUGHTS PAYLOAD', payload);

      const res: any = await dispatch(repostPost(payload));

      console.log('REPOST WITH THOUGHTS RESPONSE', res);

      const isSuccess = res?.meta?.requestStatus === 'fulfilled';

      if (!isSuccess) {
        show({
          type: 'error',
          title: res?.payload || 'Repost failed',
        });

        return;
      }

      setRepostVisible(false);

      // 🔥 refresh feed
      resetHomeHeader();

      dispatch(resetFeed());

      await dispatch(fetchFeed());

      show({
        type: 'success',
        title: res?.payload?.message || 'Reposted successfully',
      });
    } catch (error) {
      console.log('REPOST WITH THOUGHTS ERROR', error);

      show({
        type: 'error',
        title: 'Something went wrong',
      });
    }
  };

  const handleOwnPostEdit = async () => {
    if (!activePost) return;

    if (activePost?.isRepost) {
      setEditingThoughtPost(activePost);

      setEditThoughtVisible(true);

      setMenuVisible(false);

      return;
    }

    const data = activePost?.isRepost
      ? activePost?.original_post || activePost?.originalPost || activePost
      : activePost;

    const type = data?.postType || data?.type;

    try {
      switch (type) {
        case 'book': {
          const res: any = await dispatch(getBookByIdThunk(data.id));

          navigation.navigate('AddBook', {
            book: res?.payload?.data ?? res?.payload,
          });
          break;
        }

        case 'script': {
          const res: any = await dispatch(getBookByIdThunk(data.id));

          navigation.navigate('AddSynopsis', {
            book: res?.payload?.data ?? res?.payload,
          });
          break;
        }

        case 'visionx': {
          const res: any = await dispatch(getVisionXByIdThunk(data.id));

          navigation.navigate('AddVisionX', {
            vision: res?.payload?.data ?? res?.payload,
          });
          break;
        }

        default:
          const res = await dispatch(getPostByIdThunk(data.id)).unwrap();

          navigation.navigate('AddPost', {
            post: res.data,
          });
      }

      setMenuVisible(false);
    } catch (error) {
      console.log(error);
    }
  };
  /* ---------------- SYNC SCROLL BETWEEN TABS ---------------- */

  /* ---------------- SCROLL ---------------- */

  const handleTabBarAnimation = (y: number) => {
    const delta = y - lastScrollY.current;

    if (delta > 8 && tabVisible.current) {
      tabVisible.current = false;

      Animated.spring(tabBarScrollY, {
        toValue: 120,
        useNativeDriver: true,
      }).start();
    }

    if (delta < -8 && !tabVisible.current) {
      tabVisible.current = true;

      Animated.spring(tabBarScrollY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }

    lastScrollY.current = y;
  };

  const handleScroll = (index: number) =>
    Animated.event(
      [
        {
          nativeEvent: {
            contentOffset: {
              y: headerOffset,
            },
          },
        },
      ],
      {
        useNativeDriver: true,
        listener: (event: any) => {
          const y = event.nativeEvent.contentOffset.y;
          const clamped = Math.min(y, TOP_HEADER_HEIGHT);

          // Close reaction popup on scroll
          if (activeReactionPostId) {
            setActiveReactionPostId(null);
          }

          scrollOffsets.current[index] = y;
          handleTabBarAnimation(y);
          lastScrollY.current = y;
        },
      },
    );

  const handleContestScroll = useCallback((event: any) => {
    const y = event.nativeEvent.contentOffset.y;

    contestScrollY.current = y;
    scrollOffsets.current[2] = y;

    headerOffset.setValue(Math.min(y, TOP_HEADER_HEIGHT));

    handleTabBarAnimation(y);

    // 👇 Always show bottom tab when at top
    if (y <= 5) {
      tabVisible.current = true;

      Animated.spring(tabBarScrollY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }

    lastScrollY.current = y;
  }, []);

  /* ---------------- PAGE SELECT ---------------- */

  const onPageSelected = (e: any) => {
    const index = e.nativeEvent.position;
    setActiveTab(TABS[index]);

    // Close reaction popup when switching tabs
    if (activeReactionPostId) {
      setActiveReactionPostId(null);
    }
  };

  /* ---------------- PAGER SCROLL ---------------- */

  const onPageScroll = (e: any) => {
    const { position, offset } = e.nativeEvent;
    pagerScroll.setValue(position + offset);
  };

  const scrollToTop = () => {
    const tabIndex = TABS.indexOf(activeTab);
    const ref = scrollRefs.current[tabIndex];

    if (!ref) return;

    // Reset header whenever user taps the active tab
    resetHomeHeader();

    const currentOffset = scrollOffsets.current[tabIndex] || 0;

    // If not at top -> only scroll to top
    if (currentOffset > 20) {
      ref.scrollToOffset({
        offset: 0,
        animated: true,
      });

      return;
    }

    // Already at top -> refresh current tab
    switch (activeTab) {
      case 'Feed':
        onRefreshFeed();
        break;

      case 'Unfiltered':
        refreshUnfiltered();
        break;

      case 'Contest':
        refreshContest();
        break;
    }
  };

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={themeColors.primary as any} />
      </View>
    );
  };

  const renderFeedFooter = () => {
    if (!feedLoading) return null;

    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={themeColors.primary as any} />
      </View>
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      if (activeTab === 'Feed') {
        if (skipFeedRefreshOnFocus.current) {
          skipFeedRefreshOnFocus.current = false;
          return;
        }

        // resetHomeHeader();
        // dispatch(resetFeed());
        dispatch(fetchFeed());
      }
    }, [activeTab]),
  );

  useEffect(() => {
    dispatch(notificationCount());
  }, []);

  // Get Unfilltred Categories
  const getCategories = async () => {
    try {
      const res = await api.get('/review-contents/category/dropdown');

      setCategories(res?.data?.data?.categories);
      setActiveCategory('');
    } catch (error) {
      console.log('error', error);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  /* ---------------- RENDER ITEM ---------------- */

  const isOwnPost = useMemo(
    () => authUser?.id === activePost?.userId,
    [authUser?.id, activePost?.userId],
  );

  useFeedInitialization(feed);

  const renderItem = useCallback(
    ({ item }: any) => {
      if (item.type === 'suggestion') {
        return (
          <ProfileSuggestionCard
            data={mockUsers}
            onFollow={user => console.log('Follow', user)}
            onPress={user => {
              navigation.navigate('Profile', {
                userId: user.id,
                isOwnProfile: false,
              });
            }}
          />
        );
      }

      if (item.type === 'contest') {
        return (
          <ContestCard
            {...item.data}
            bookmarked={bookmarkedIds?.includes(item?.data?.id)}
            onBookMark={() => {
              console.log('ID:', item?.data?.id);
              handleBookmark(item?.data?.id);
            }}
            onPress={() =>
              navigation.navigate('ContestDetails', {
                contestId: item?.data?.contestId || item?.data?.id,
              })
            }
            status={item?.data?.status}
            onShare={() => {
              handleShare({
                title: item?.data?.title,
                value: item?.data?.id,
                type: 'contest',
              });
            }}
          />
        );
      }

      const post = item?.data;

      const isThoughtRepost =
        post?.isRepost && post?.caption && post?.caption?.trim()?.length > 0;

      const actionPost =
        post?.isRepost && !isThoughtRepost ? post?.originalPost : post;

      const postId = String(post.id);
      const isReactionOpen = activeReactionPostId === postId;

      // 🔥 FIX: Use postType from the data structure
      const postType =
        post?.postType ||
        actionPost?.postType ||
        actionPost?.type ||
        post?.type ||
        'normal';

      const readPost = post?.isRepost ? post?.originalPost : post;
      return (
        <PostCard
          {...post}
          liked={likedIds?.includes(actionPost?.id)}
          likeCount={
            likeCountMap?.hasOwnProperty(actionPost?.id)
              ? likeCountMap[actionPost?.id]
              : actionPost?.likeCount || post?.likeCount
          }
          repostCount={actionPost?.repostCount || post?.repostCount}
          onReactionSelect={(reaction: ReactionType) => {
            handleFeedLike(actionPost, reaction || 'heart');
          }}
          onLike={() => {
            handleFeedLike(
              actionPost,
              reactionMap?.[actionPost?.id] ||
              actionPost?.emoji_type ||
              'heart',
            );
          }}
          bookmarked={
            feedBookMark.includes(actionPost?.id) ||
            actionPost?.isWishlisted === 1
          }
          onBookmark={() => handleFeedBookmark(actionPost)}
          emoji_type={
            likedIds?.includes(actionPost?.id)
              ? reactionMap?.[actionPost?.id] || actionPost?.emoji_type
              : null
          }
          onRepostPress={() => {
            setSelectedRepostPost(actionPost);
            setRepostVisible(true);
          }}
          onMenuPress={e => openMenu(e, post)}
          onShare={() => {
            handleShare({
              title: actionPost?.title || actionPost?.caption,
              value: actionPost?.id,
              type:
                postType === 'script'
                  ? 'synopsis'
                  : postType === 'book'
                    ? 'book'
                    : postType === 'visionx'
                      ? 'visionx'
                      : postType === 'movie'
                        ? 'movie'
                        : postType === 'contest'
                          ? 'contest'
                          : postType === 'opportunity'
                            ? 'opportunity'
                            : 'post',
              username: post?.user_name,
            });
          }}
          onProfilepPress={() => {
            navigation.navigate('Profile', {
              username: post?.user_name || post?.userId,
            });
          }}
          isVisible={visiblePostIds.has(String(post.id))}
          postType={postType}
          onReadPress={() => {
            const target = readPost || actionPost || post;

            const type = target?.postType || target?.type || postType;

            if (type === 'book') {
              navigation.navigate('BookDetails', {
                bookId: target?.bookId || target?.id,
              });
            } else if (type === 'script') {
              navigation.navigate('SynopsisDetails', {
                synopsisId: target?.synopsisId || target?.id,
              });
            }
          }}
          isReported={post?.isReported}
          // isVisible={visiblePostIds.has(String(post.id))}
          reactionPopupVisible={isReactionOpen}
          onOpenReaction={() => {
            // Close any other open reaction popup first
            setActiveReactionPostId(postId);
          }}
          onCloseReaction={() => {
            setActiveReactionPostId(null);
          }}
        />
      );
    },
    [
      navigation,
      openMenu,
      bookmarkedIds,
      feedBookMark,
      likedIds,
      reactionMap,
      likeCountMap,
      visiblePostIds, // ✅ add this
      activeReactionPostId, // 👈 ADD THIS
    ],
  );

  const handleUpdateThought = async (story: string) => {
    try {
      const payload = {
        synopsis_id: editingThoughtPost?.id,
        story,
      };

      console.log('UPDATE REPOST PAYLOAD:', payload);

      const res = await api.put('/content/repost/update', payload);

      console.log('UPDATE REPOST RESPONSE:', res.data);

      show({
        type: 'success',
        title: res?.data?.message || 'Thought updated successfully',
      });

      setEditThoughtVisible(false);
      setEditingThoughtPost(null);

      // Refresh feed
      dispatch(resetFeed());
      dispatch(fetchFeed());
    } catch (error: any) {
      console.log('UPDATE REPOST ERROR:', error?.response?.data);

      show({
        type: 'error',
        title:
          error?.response?.data?.message || 'Failed to update repost thought',
      });
    }
  };

  const renderMovieItem = useCallback(
    ({ item, index }: any) => {
      // ✅ Add safety check
      if (!item || !item.data) {
        return null;
      }

      return (
        <MovieCard
          key={`movie-${item.data.id || index}`}
          title={item?.data?.title || ''}
          height={260}
          rating={item?.data?.avg_rating}
          width={CARD_WIDTH}
          image={item?.data?.bannerimage}
          onPress={() =>
            navigation.navigate('SingleMovieDetails', {
              id: item?.data?.id,
            })
          }
          bookmarked={
            movieBookmarkedIds?.includes(item?.data?.id) ||
            item?.data?.is_wishlisted === 1
          }
          onBookmark={() => handleMovieBookmark(item?.data?.id)}
        // type={item?.data?.type}
        />
      );
    },
    [movieBookmarkedIds, navigation, handleMovieBookmark],
  );

  const feedExtraData = useMemo(
    () => ({
      likedIds,
      reactionMap,
      likeCountMap,
    }),
    [likedIds, reactionMap, likeCountMap],
  );

  /* ---------------- Refresh ---------------- */
  const {
    onRefresh: onRefreshFeed,
    onRefreshContest,
    loadMore,
    loadMoreMovies,
    loadMoreContest,
  } = useFeedPagination({
    feedLoading,
    feedHasMore,

    movieLoading,
    hasMore,
    page,

    sortMovieBy,
    movieSearch,
    movieGenre,

    contestLoading,
    sortBy,
    contestSearch,
    contestHasMore,
    contestPage,

    setRefreshing: (value: any) =>
      setRefreshingStates(prev => ({ ...prev, feed: value })),
  });

  // refreshUnfiltered
  const refreshUnfiltered = useCallback(async () => {
    console.log('🔄 Refreshing Unfiltered tab...');

    if (refreshingStates.unfiltered) return;

    movieMomentum.current = false;
    movieFetchingMore.current = false;

    setMovieSearch('');
    setShowMovieSearch(false);

    setRefreshingStates(prev => ({ ...prev, unfiltered: true }));

    try {
      dispatch(resetMovies());

      await dispatch(
        getAllMovies({
          page: 1,
          sort_by: sortMovieBy,
          genre_id: movieGenre || undefined,
          reviewcategory_id: reviewCategoryId || undefined,
        }),
      );

      if (movieListRef.current) {
        setTimeout(() => {
          movieListRef.current?.scrollToOffset({
            offset: 0,
            animated: true,
          });
        }, 100);
      }

      console.log('✅ Unfiltered tab refreshed successfully');
    } catch (error) {
      console.log('❌ Error refreshing Unfiltered:', error);
    } finally {
      setRefreshingStates(prev => ({ ...prev, unfiltered: false }));
    }
  }, [sortMovieBy, movieGenre, reviewCategoryId, refreshingStates.unfiltered]);

  // refreshContest
  const refreshContest = useCallback(async () => {
    console.log('🔄 Refreshing Contest tab...');

    if (refreshingStates.contest) return;

    setRefreshingStates(prev => ({ ...prev, contest: true }));

    try {
      if (showMyOpps) {
        await dispatch(
          getMyParticipatedContestsThunk({
            page: 1,
          }),
        );
      } else {
        await onRefreshContest();
      }

      // Scroll to top
      if (contestListRef.current) {
        setTimeout(() => {
          contestListRef.current?.scrollToOffset({
            offset: 0,
            animated: true,
          });
        }, 100);
      }
    } finally {
      setRefreshingStates(prev => ({ ...prev, contest: false }));
    }
  }, [showMyOpps, onRefreshContest, refreshingStates.contest]);

  // Handle tab refresh based on which tab is clicked
  const handleTabRefresh = useCallback(
    (tab: string) => {
      switch (tab) {
        case 'Unfiltered':
          refreshUnfiltered();
          break;
        case 'Contest':
          refreshContest();
          break;
        default:
          break;
      }
    },
    [refreshUnfiltered, refreshContest],
  );

  const handleHeaderSearch = (text: string) => {
    if (activeTab === 'Unfiltered') {
      setMovieSearch(text);
    } else if (activeTab === 'Contest') {
      setContestSearch(text);
    }
  };

  // Add this effect to reset refresh states when switching tabs
  useEffect(() => {
    // Reset the refresh state when tab changes to ensure it's not stuck
    const tabIndex = TABS.indexOf(activeTab);
    if (tabIndex === 0 && refreshingStates.feed) {
      setRefreshingStates(prev => ({ ...prev, feed: false }));
    } else if (tabIndex === 1 && refreshingStates.unfiltered) {
      setRefreshingStates(prev => ({ ...prev, unfiltered: false }));
    } else if (tabIndex === 2 && refreshingStates.contest) {
      setRefreshingStates(prev => ({ ...prev, contest: false }));
    }
  }, [activeTab]);

  const hideUnfilteredHeader =
    movieSearch.trim().length > 0 &&
    filteredMovies.length === 0 &&
    !movieLoading;

  const hideContestHeader =
    contestSearch.trim().length > 0 &&
    filteredContestData.length === 0 &&
    !contestLoading &&
    !myParticipatedLoading;

  const bannerDataSorted = useMemo(() => {
    const banners = Array.isArray(bannerData)
      ? bannerData
      : [];

    return banners
      .filter(
        (item: any) =>
          item?.status === 'active' &&
          !!item?.image,
      )
      .sort(
        (a: any, b: any) =>
          Number(a?.position ?? 0) -
          Number(b?.position ?? 0),
      );
  }, [bannerData]);

  const hasUpcomingBanners =
    contestTab === 'Upcoming' &&
    !showMyOpps &&
    bannerDataSorted?.length > 0;

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <StatusBar barStyle="light-content" translucent />

      <HomeHeader
        headerOffset={headerOffset}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pagerRef={pagerRef}
        pagerScroll={pagerScroll}
        onActiveTabPress={scrollToTop}
        showTabs
        notificationCount={totalNotificationCount}
        onTabRefresh={handleTabRefresh}
        searchValue={
          activeTab === 'Unfiltered'
            ? movieSearch
            : activeTab === 'Contest'
              ? contestSearch
              : ''
        }
        onSearchChange={
          activeTab === 'Unfiltered' || activeTab === 'Contest'
            ? handleHeaderSearch
            : undefined
        }
        placeholder={
          activeTab === 'Unfiltered'
            ? 'Search Unfiltered...'
            : activeTab === 'Contest'
              ? 'Search Contest...'
              : ''
        }
        onHeightChange={height => {
          setHeaderHeight(Platform.OS === 'ios' ? height - 38 : height);
        }}
      />

      <SafeAreaView
        style={[styles.container, { backgroundColor: bg }]}
        edges={['left', 'right']}
      >
        {feed.length === 0 && feedLoading ? (
          <View
            style={{
              marginTop:
                Platform.OS === 'ios'
                  ? responsiveHeight(8)
                  : responsiveHeight(5),
              paddingHorizontal: 10,
            }}
          >
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </View>
        ) : (
          <PagerView
            ref={pagerRef}
            style={{
              flex: 1,
              overflow: 'visible',
            }}
            overdrag={false}
            initialPage={0}
            onPageSelected={onPageSelected}
            onPageScroll={onPageScroll}
            scrollEnabled={false}
            overScrollMode="never"
          >
            <View key="feed" style={{ flex: 1, overflow: 'visible' }}>
              <AnimatedFlashList
                ref={ref => {
                  scrollRefs.current[0] = ref;
                }}
                extraData={feedExtraData}
                automaticallyAdjustContentInsets={false}
                contentInsetAdjustmentBehavior="never"
                maintainVisibleContentPosition={undefined}
                data={mixedFeed}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                keyExtractor={(item: any) => `${item.type}-${item.data.id}`}
                renderItem={renderItem}
                onEndReachedThreshold={1}
                onScroll={handleScroll(0)} // Feed
                refreshControl={
                  <RefreshControl
                    refreshing={refreshingStates.feed}
                    onRefresh={() => {
                      resetHomeHeader();
                      onRefreshFeed();
                      // Also scroll to top
                      if (scrollRefs.current[0]) {
                        scrollRefs.current[0].scrollToOffset({
                          offset: 0,
                          animated: true,
                        });
                      }
                    }}
                    colors={[themeColors.primary]}
                    tintColor={themeColors.primary}
                  />
                }
                ListFooterComponent={
                  <>
                    {renderFeedFooter()}
                    <View style={{ height: 100 }} />
                  </>
                }
                ListEmptyComponent={
                  !feedLoading && !refreshingStates.feed ? (
                    <View
                      style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: 180,
                        paddingHorizontal: 30,
                      }}
                    >
                      <NoPost size={100} />

                      <Text
                        style={{
                          color: themeColors.white,
                          fontSize: 18,
                          fontFamily: Fonts.Bold,
                          textAlign: 'center',
                          marginTop: 7,
                        }}
                      >
                        No Posts Found
                      </Text>
                    </View>
                  ) : null
                }
                {...listProps}
                onEndReached={() => {
                  console.log('🔥 onEndReached');
                  if (!onEndReachedCalledDuringMomentum.current) {
                    console.log('🔥 loadMore');
                    loadMore();
                    onEndReachedCalledDuringMomentum.current = true;
                  }
                }}
                onMomentumScrollBegin={() => {
                  if (activeReactionPostId) {
                    setActiveReactionPostId(null);
                  }
                  onEndReachedCalledDuringMomentum.current = false;
                }}
              />
            </View>

            <View key="unfiltered" style={{ flex: 1, overflow: 'visible' }}>
              {movieLoading && filteredMovies.length === 0 ? (
                <View
                  style={{
                    marginTop: CONTENT_TOP_SPACING,
                    paddingHorizontal: CARD_MARGIN,
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                  }}
                >
                  {Array.from({ length: 6 }).map((_, index) => (
                    <View
                      key={index}
                      style={{
                        width: CARD_WIDTH,
                        marginBottom: 12,
                      }}
                    >
                      <MovieCardSkeleton height={260} />
                    </View>
                  ))}
                </View>
              ) : (
                <AnimatedFlashList
                  ref={ref => {
                    scrollRefs.current[1] = ref;
                    movieListRef.current = ref;
                  }}
                  data={filteredMovies}
                  automaticallyAdjustContentInsets={false}
                  contentInsetAdjustmentBehavior="never"
                  extraData={{
                    data: filteredMovies,
                    loading: movieLoading,
                    genre: movieGenre,
                    category: reviewCategoryId,
                    sort: sortMovieBy,
                  }}
                  keyExtractor={(item: any, index: number) => {
                    // ✅ FIXED: Use more unique key combining id and index
                    const id = item?.data?.id;
                    return id ? `${id}-${index}` : `movie-${index}`;
                  }}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshingStates.unfiltered}
                      onRefresh={() => {
                        refreshUnfiltered();
                      }}
                      colors={[themeColors.primary]}
                      tintColor={themeColors.primary}
                    />
                  }
                  numColumns={2}
                  renderItem={renderMovieItem}
                  onScroll={handleScroll(1)} // Unfiltered
                  onEndReached={() => {
                    if (!movieLoading && hasMore) {
                      dispatch(
                        getAllMovies({
                          page: page + 1,
                          sort_by: sortMovieBy,
                          search: movieSearch,
                          genre_id: movieGenre,
                          reviewcategory_id: reviewCategoryId,
                        }),
                      );
                    }
                  }}
                  onEndReachedThreshold={0.5}
                  {...listProps}
                  ListFooterComponent={renderFooter}
                  ListEmptyComponent={
                    !movieLoading ? (
                      <View
                        style={{
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
                            fontFamily: Fonts.SemiBold,
                          }}
                        >
                          Oops! No Content Found
                        </Text>
                      </View>
                    ) : null
                  }
                  contentContainerStyle={{
                    paddingTop: CONTENT_TOP_SPACING - 10,
                    paddingHorizontal: CARD_MARGIN,
                    paddingBottom: 180,
                  }}
                  ListHeaderComponent={
                    !hideUnfilteredHeader ? (
                      <View
                        style={{
                          justifyContent: 'center',
                          zIndex: 999,
                          elevation: 999,
                        }}
                      >
                        {/* Rest of your header component remains the same */}
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 10,
                            marginVertical: 5,
                          }}
                        >
                          {/* TABS */}
                          {!showMovieSearch && !showFilter && (
                            <>
                              {/* LEFT SIDE TABS */}
                              {viewSortTab ? (
                                <Tabs
                                  tabs={MOVIE_TABS}
                                  activeTab={activeMovieTab}
                                  showCloseIcon={!!activeMovieTab}
                                  onClosePress={() => {
                                    setActiveMovieTab('');
                                    setSortMovieBy('');

                                    movieMomentum.current = true;
                                    movieFetchingMore.current = false;

                                    dispatch(resetMovies());

                                    dispatch(
                                      getAllMovies({
                                        page: 1,
                                        sort_by: '',
                                        genre_id: movieGenre || undefined,
                                        reviewcategory_id:
                                          reviewCategoryId || undefined,
                                      }),
                                    );
                                  }}
                                  onChange={tab => {
                                    setActiveMovieTab(tab);

                                    let newSort = 'new';
                                    if (tab === 'New') newSort = 'new';
                                    if (tab === 'Top Rated') {
                                      newSort = 'top_rated';
                                    }

                                    setSortMovieBy(newSort);

                                    movieMomentum.current = true;
                                    movieFetchingMore.current = false;

                                    dispatch(resetMovies());

                                    dispatch(
                                      getAllMovies({
                                        page: 1,
                                        sort_by: newSort,
                                        genre_id: movieGenre || undefined,
                                        reviewcategory_id:
                                          reviewCategoryId || undefined,
                                      }),
                                    );
                                  }}
                                />
                              ) : (
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
                                        sort_by: sortMovieBy,
                                        genre_id: movieGenre || undefined,
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

                                    movieMomentum.current = true;
                                    movieFetchingMore.current = false;

                                    dispatch(resetMovies());

                                    dispatch(
                                      getAllMovies({
                                        page: 1,
                                        sort_by: sortMovieBy,
                                        genre_id: movieGenre || undefined,
                                        reviewcategory_id: categoryId,
                                      }),
                                    );
                                  }}
                                />
                              )}

                              {/* ICONS */}
                              <View
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  gap: 16,
                                }}
                              >
                                <TouchableOpacity
                                  onPress={() => {
                                    setShowFilter(true);
                                    setViewSortTab(false);
                                  }}
                                >
                                  <Fillter
                                    color={
                                      movieGenre
                                        ? themeColors.primary
                                        : themeColors.white
                                    }
                                  />
                                </TouchableOpacity>

                                <TouchableOpacity
                                  onPress={() => {
                                    setViewSortTab(prev => !prev);
                                  }}
                                >
                                  <Sort color={themeColors.white} />
                                </TouchableOpacity>
                              </View>
                            </>
                          )}

                          {/* FILTER DROPDOWN */}
                          {showFilter && (
                            <View
                              style={{
                                flex: showMovieSearch ? 0.3 : 1,
                                marginTop: 5,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 8,
                                marginBottom: -5,
                              }}
                            >
                              <View style={{ flex: 1 }}>
                                <FloatingDropdown
                                  label="Genre"
                                  value={movieGenre}
                                  options={genreOptions}
                                  style={{ height: 40, marginBottom: 10 }}
                                  onChange={(value: any) => {
                                    setMovieGenre(value);

                                    movieMomentum.current = true;
                                    movieFetchingMore.current = false;

                                    dispatch(resetMovies());

                                    dispatch(
                                      getAllMovies({
                                        page: 1,
                                        sort_by: sortMovieBy,
                                        genre_id: value,
                                        reviewcategory_id:
                                          reviewCategoryId || undefined,
                                      }),
                                    );
                                  }}
                                />
                              </View>

                              <TouchableOpacity
                                onPress={() => {
                                  setShowFilter(false);
                                  setMovieGenre('');

                                  movieMomentum.current = true;
                                  movieFetchingMore.current = false;

                                  dispatch(
                                    getAllMovies({
                                      page: 1,
                                      sort_by: sortMovieBy,
                                      reviewcategory_id:
                                        reviewCategoryId || undefined,
                                    }),
                                  );
                                }}
                                style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 12,
                                  backgroundColor: '#151518',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  borderWidth: 1,
                                  borderColor: '#26262b',
                                  marginTop: -10,
                                }}
                              >
                                <Ionicons
                                  name="close"
                                  size={22}
                                  color={themeColors.white}
                                />
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      </View>
                    ) : null
                  }
                />
              )}
            </View>

            <View key="contest" style={{ flex: 1, overflow: 'visible' }}>
              {(contestLoading || myParticipatedLoading) &&
                finalContestData.length === 0 ? (
                <View style={{ marginTop: CONTENT_TOP_SPACING }}>
                  <ContestSkeleton />
                  <ContestSkeleton />
                  <ContestSkeleton />
                </View>
              ) : (
                <AnimatedFlashList
                  ref={ref => {
                    scrollRefs.current[2] = ref;
                    contestListRef.current = ref;
                  }}
                  data={filteredContestData}
                  automaticallyAdjustContentInsets={false}
                  contentInsetAdjustmentBehavior="never"
                  maintainVisibleContentPosition={undefined}
                  keyExtractor={(item: any, index) =>
                    `${item?.data?.id}-${index}`
                  }
                  renderItem={renderItem}
                  onScroll={handleContestScroll}
                  // ✅ ADD THIS
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshingStates.contest}
                      onRefresh={() => {
                        refreshContest();
                      }}
                      colors={[themeColors.primary]}
                      tintColor={themeColors.primary}
                    />
                  }
                  ListFooterComponent={renderFooter}
                  ListEmptyComponent={
                    !(contestLoading || myParticipatedLoading || hasUpcomingBanners) ? (
                      <View style={styles.emptyContainer}>
                        <Dart />

                        <Text style={styles.emptyTitle}>
                          {showMyOpps
                            ? 'No Contests Participate Yet'
                            : 'Oops! No Contests Found !'}
                        </Text>
                      </View>
                    ) : null
                  }
                  onEndReached={async () => {
                    if (
                      contestMomentum.current ||
                      contestLoading ||
                      myParticipatedLoading ||
                      contestFetchingMore.current
                    ) {
                      return;
                    }

                    if (!contestHasMore) {
                      return;
                    }

                    contestMomentum.current = true;

                    contestFetchingMore.current = true;

                    try {
                      if (showMyOpps) {
                        await dispatch(
                          getMyParticipatedContestsThunk({
                            page:
                              Math.ceil(myParticipatedContests.length / 10) + 1,
                          }),
                        );
                      } else {
                        await dispatch(
                          getAllContest({
                            page: contestPage + 1,
                            sort_by: sortBy,
                            search: contestSearch,
                          }),
                        );
                      }
                    } finally {
                      setTimeout(() => {
                        contestFetchingMore.current = false;
                      }, 500);
                    }
                  }}
                  onEndReachedThreshold={0.3}
                  onMomentumScrollBegin={() => {
                    contestMomentum.current = false;
                  }}
                  {...listProps}
                  ListHeaderComponent={
                    !hideContestHeader ? (
                      <View>
                        <View
                          style={[
                            styles.headerRow,
                            {
                              zIndex: 20,
                              alignItems: 'center',
                            },
                          ]}
                        >
                          {/* NORMAL HEADER */}
                          <View
                            style={{
                              flex: 1,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: showMyOpps
                                ? 'flex-end'
                                : 'space-between',
                              opacity: showContestSearch ? 0 : 1,
                              position: showContestSearch ? 'absolute' : 'relative',
                              width: '100%',
                            }}
                          >
                            {/* TABS */}
                            <Tabs
                              tabs={CONTEST_TABS}
                              marginVertical={0}
                              activeTab={contestTab}
                              onChange={tab => {
                                // If user is viewing My Contests, switch back to All Contests
                                if (showMyOpps) {
                                  setShowMyOpps(false);
                                }

                                setContestTab(tab);

                                let newSort = 'ongoing';

                                switch (tab) {
                                  case 'Upcoming':
                                    newSort = 'upcoming';
                                    break;

                                  case 'Completed':
                                    newSort = 'completed';
                                    break;

                                  default:
                                    newSort = 'ongoing';
                                }

                                setSortBy(newSort);

                                dispatch(startContestLoading());
                                dispatch(resetContest());

                                dispatch(
                                  getAllContest({
                                    page: 1,
                                    sort_by: newSort,
                                    search: contestSearch,
                                  }),
                                );
                              }}
                            />

                            {/* RIGHT SIDE */}
                            <View>
                              {/* MY CONTESTS */}
                              <TouchableOpacity
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                                onPress={() => {
                                  if (showMyOpps) {
                                    // Back to All Contests
                                    setShowMyOpps(false);

                                    // Restore default tab (or keep previous one if you prefer)
                                    setContestTab('Ongoing');
                                    setSortBy('ongoing');

                                    dispatch(resetContest());

                                    dispatch(
                                      getAllContest({
                                        page: 1,
                                        sort_by: 'ongoing',
                                        search: contestSearch,
                                      }),
                                    );
                                  } else {
                                    // My Contests
                                    setShowMyOpps(true);

                                    // Remove active tab
                                    setContestTab('');

                                    dispatch(resetContest());

                                    dispatch(
                                      getMyParticipatedContestsThunk({
                                        page: 1,
                                      }),
                                    );
                                  }
                                }}
                              >
                                <Text
                                  style={[
                                    styles.myOppBtn,
                                    {
                                      color: themeColors.primary,
                                    },
                                  ]}
                                >
                                  {showMyOpps ? 'All Contests' : 'My Contests'}
                                </Text>

                                <ArrowUpRight color={themeColors.primary} />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                        {contestTab === 'Upcoming' &&
                          !showMyOpps &&
                          bannerDataSorted.length > 0 && (
                            <ContestBannerSwiper
                              data={bannerDataSorted}
                              cardWidth={width * 0.8}
                              cardHeight={width * 0.8}
                              spacing={0}
                              autoPlay
                              autoPlayInterval={3000}
                            />
                          )}
                      </View>
                    ) : null
                  }
                />
              )}
            </View>
          </PagerView>
        )}

        <PostMenu
          visible={menuVisible}
          x={menuPosition.x}
          y={menuPosition.y}
          onClose={() => setMenuVisible(false)}
          onReport={handleOpenReport}
          isReported={activePost?.isReported}
          onEdit={handleOwnPostEdit}
          isOwnPost={isOwnPost}
          onDelete={() => handleOwnPostDelete(activePost?.id)}
        />

        <ReportModal
          visible={reportVisible}
          post={activePost}
          onClose={() => setReportVisible(false)}
          onSubmit={handleReport}
          reportType="POST"
        />

        <RepostModal
          visible={repostVisible}
          post={selectedRepostPost}
          onClose={() => setRepostVisible(false)}
          onInstantRepost={handleInstantRepost}
          onThoughtsRepost={handleRepostWithThoughts}
        />

        <EditThoughtModal
          visible={editThoughtVisible}
          initialValue={editingThoughtPost?.caption || ''}
          onClose={() => {
            setEditThoughtVisible(false);
            setEditingThoughtPost(null);
          }}
          onUpdate={handleUpdateThought}
        />
      </SafeAreaView>
    </View>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  myOppBtn: {
    fontSize: 12,
    fontFamily: Fonts.Bold,
  },

  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 120,
    paddingHorizontal: 30,
  },

  emptyEmoji: {
    fontSize: 52,
    marginBottom: 14,
  },

  emptyTitle: {
    color: themeColors.white,
    fontSize: 18,
    fontFamily: Fonts.Bold,
    textAlign: 'center',
  },

  emptySubtitle: {
    color: '#8E8E93',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    fontFamily: Fonts.Regular,
  },
});
