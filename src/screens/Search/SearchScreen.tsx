import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';

import Ionicons from '@react-native-vector-icons/ionicons';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import { SafeAreaView } from 'react-native-safe-area-context';

import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';

import { useDispatch, useSelector } from 'react-redux';
import { fetchSearch } from '../../redux/slices/searchSlice';
import PostCard from '../../components/Post/PostCard';
import BookCard from '../Books/components/cards/BookCard';
import SynopsisCard from '../Synopsis/components/SynopsisCard';
import OpportunityCard from '../Opportunity/components/card/OpportunityCard';
import MovieCardSkeleton from '../Movie/components/MovieCardSkeleton';
import MovieCard from '../Movie/components/MovieCard';
import ContestCard from '../../components/Contest/ContestCard';
import { formatDate } from '../../utils/date';
import { getDaysLeft } from '../../utils/timeAgo';
import CardSkeleton from '../../components/Cards/CardSkeleton';

import {
  fetchCommentsByPost,
  updateReportedPostLocal
} from '../../redux/slices/feedSlice';
import PostMenu from '../../components/Post/PostMenu';
import ReportModal from '../../components/Modals/ReportModal';
import { createReport, getReports } from '../../redux/slices/reportSlice';
import { useToast } from '../../components/Toast/ToastProvider';
import { deletePost, repostPost } from '../../redux/slices/postSlice';
import { useHandleLike } from '../../hooks/useHandleLike';
import { useHandleBookmark } from '../../hooks/useHandleBookmark';
import api from '../../../Instance/Instance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Avatar from '../../components/Avatar/Avatar';
import Eye from '../../assets/SVG/Eye';

import { useFeedLike } from '../../hooks/feed/useFeedLike';
import { useFeedBookmark } from '../../hooks/feed/useFeedBookmark';
import { ReactionType } from '../../hooks/usePostReaction';
import RepostModal from '../../components/Modals/RepostModal';
import VisionCard from '../VisionX/components/cards/VisionCard';
import PostSkeleton from '../../components/Post/PostSkeleton';
import VisionCardSkeleton from '../VisionX/components/cards/VisionCardSkeleton';
import ContestSkeleton from '../../components/Contest/ContestSkeleton';
import OpportunityCardSkeleton from '../Opportunity/components/OpportunityCardSkeleton';
import { toggleBookmarkLocal, toggleContestBookmark } from '../../redux/slices/movieSlice';
import { useFocusEffect } from '@react-navigation/native';
import { useShare } from '../../hooks/useShare';

const TABS = [
  { label: 'Posts', value: 'posts' },
  { label: 'Users', value: 'users' },
  { label: 'Books', value: 'books' },
  { label: 'Synopses', value: 'synopses' },
  { label: 'Creators Zone', value: 'visionx' },
  { label: 'Contest', value: 'contest' },
  { label: 'Opportunities', value: 'opportunities' },
  { label: 'Unfiltered', value: 'movies' },
];

const emptyLabels: Record<string, string> = {
  posts: 'posts',
  users: 'users',
  books: 'books',
  synopses: 'synopses',
  visionx: 'creator zone',
  contest: 'contests',
  opportunities: 'opportunities',
  movies: 'unfiltered',
};


const { width } = Dimensions.get('window');

const CARD_MARGIN = 10;
const CARD_WIDTH = (width - CARD_MARGIN * 2.5) / 2;
const CARDWIDTH = width - 20;

const SearchScreen = ({ navigation, route }: any) => {
  const isDark = true;
  const dispatch = useDispatch<any>();
  const { show } = useToast();
  const initialQuery = route?.params?.initialQuery ?? '';
  const { handleShare } = useShare({});

  const [trendingTags, setTrendingTags] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState('posts');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 4, y: 0 });

  const [commentVisible, setCommentVisible] = useState(false);
  const [activePost, setActivePost] = useState<any>(null);

  const [reportVisible, setReportVisible] = useState(false);

  const [repostVisible, setRepostVisible] = useState(false);
  const [selectedRepostPost, setSelectedRepostPost] = useState<any>(null);

  const [activeIndex, setActiveIndex] = useState(0);

  const [activeReactionId, setActiveReactionId] = useState<string | null>(null);
  const [activeReactionType, setActiveReactionType] = useState<string | null>(null);

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { results, loading, cursor } = useSelector((state: any) => state.search);
  const {
    bookmarkedIds: feedBookMark,
    likedIds,
    reactionMap,
    likeCountMap,
  } = useSelector((state: any) => state.actions);
  const { reports, loading: reportsLoading } = useSelector(
    (state: any) => state.report,
  );
  const { user: authUser } = useSelector((state: any) => state.auth);
  const { bookmarkedIds: movieBookmarkedIds } = useSelector((state: any) => state.movie);

  // ✅ custom hooks
  const { handleLike, likedIds: OtheLikeIds } = useHandleLike();

  const { handleBookmark, bookmarkedIds } = useHandleBookmark();
  const { handleFeedLike } = useFeedLike();
  const { handleFeedBookmark } = useFeedBookmark();

  // ✅ Close reaction popup when navigating away from the screen
  useFocusEffect(
    useCallback(() => {
      return () => {
        setActiveReactionId(null);
        setActiveReactionType(null);
      };
    }, [])
  );

  // ✅ Handle scroll to close reaction popup
  const handleScroll = () => {
    if (activeReactionId) {
      setActiveReactionId(null);
      setActiveReactionType(null);
    }
  };


  const isOwnPost = useMemo(
    () => authUser?.id === activePost?.userId,
    [authUser?.id, activePost?.userId],
  );

  const handleBack = () => navigation.goBack();

  const listData = results?.[activeType] || [];
  const nextCursor = cursor?.[activeType];

  // 🔍 SEARCH
  const handleSearch = (text: string) => {
    setQuery(text);
  };

  const loadRecentSearches = async () => {
    try {
      const saved = await AsyncStorage.getItem('RECENT_SEARCHES');

      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.log('Load recent search error', e);
    }
  };

  useEffect(() => {
    const search = query.trim();

    if (search.length < 2) return;

    const timer = setTimeout(async () => {
      const formattedQuery = search.replace(/^#/, '');

      dispatch(
        fetchSearch({
          query: formattedQuery,
          type: activeType,
        }),
      );

      const updated = [
        search,
        ...recentSearches.filter(item => item !== search),
      ].slice(0, 5);

      setRecentSearches(updated);
      await saveRecentSearches(updated);
    }, 500);

    return () => clearTimeout(timer);
  }, [query, activeType]);

  const saveRecentSearches = async (items: string[]) => {
    try {
      await AsyncStorage.setItem('RECENT_SEARCHES', JSON.stringify(items));
    } catch (e) {
      console.log('Save recent search error', e);
    }
  };

  const openMenu = useCallback((event: any, post: any) => {
    const { pageY } = event.nativeEvent;

    setMenuPosition({ x: 20, y: pageY });
    setActivePost(post);
    setMenuVisible(true);
  }, []);

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

      console.log('FINAL REPORT PAYLOAD:', payload);

      const res: any = await dispatch(createReport(payload));
      console.log('post repost successfull', res);

      if (res?.meta?.requestStatus !== 'fulfilled') {
        throw new Error(res?.payload || 'Report failed');
      }

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
        title: error?.message || 'Something went wrong',
      });
    }
  };

  const handleOwnPostEdit = () => {
    navigation.navigate('AddPost', {
      post: activePost,
    });
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

          // 🔥 REFETCH FEED
          // dispatch(resetFeed());
          // dispatch(fetchFeed());

          show({
            type: 'success',
            title: 'Post deleted successfully',
          });
        },
      },
    ]);
  };

  const handleStartChat = async (item: any) => {
    try {
      console.log('PROFILE USER:', item);

      // ✅ Profile API returns chat_id
      const chatId = item?.chat_id || null;

      console.log('CHAT ID:', chatId);

      navigation.navigate('ChatRoom', {
        chatId,
        isNewChat: !chatId,
        user: {
          id: item?.id,
          userId: item?.id,
          user_name: item?.user_name,
          name: item?.name,
          avatar: item?.profile_photo_path || item?.avatar,
          is_online: item?.is_online,
        },
      });
    } catch (error) {
      console.log('Chat start error:', error);
    }
  };

  const refreshSearch = () => {
    if (query.trim().length < 2) return;

    dispatch(
      fetchSearch({
        query: query.replace(/^#/, ''),
        type: activeType,
      }),
    );
  };

  const handleInstantRepost = async () => {
    try {
      if (!selectedRepostPost?.id) return;

      const payload = {
        synopsis_id: selectedRepostPost.id,
        story: '',
        mentions: [],
        tags: [],
      };

      const res: any = await dispatch(repostPost(payload));

      if (res?.meta?.requestStatus !== 'fulfilled') {
        show({
          type: 'error',
          title: res?.payload || 'Repost failed',
        });
        return;
      }

      setRepostVisible(false);

      refreshSearch();

      show({
        type: 'success',
        title: res?.payload?.message || 'Post reposted successfully',
      });
    } catch {
      show({
        type: 'error',
        title: 'Something went wrong',
      });
    }
  };

  const handleRepostWithThoughts = async (data: any) => {
    try {
      if (!selectedRepostPost?.id) return;

      const payload = {
        synopsis_id: selectedRepostPost.id,
        story: data.story,
        mentions: data.mentions || [],
        tags: [],
      };

      const res: any = await dispatch(repostPost(payload));

      if (res?.meta?.requestStatus !== 'fulfilled') {
        show({
          type: 'error',
          title: res?.payload || 'Repost failed',
        });
        return;
      }

      setRepostVisible(false);

      refreshSearch();

      show({
        type: 'success',
        title: res?.payload?.message || 'Reposted successfully',
      });
    } catch {
      show({
        type: 'error',
        title: 'Something went wrong',
      });
    }
  };

  const handleMovieBookmark = async (id: string) => {
    if (!id) return;

    const isAlreadyBookmarked = movieBookmarkedIds?.includes(id);
    console.log("isAlreadyBookmarked", isAlreadyBookmarked)

    // ✅ Optimistic UI
    dispatch(toggleBookmarkLocal(id));

    try {
      const res: any = await dispatch(
        toggleContestBookmark({
          content_id: id,
          type: isAlreadyBookmarked ? 'delete' : 'create',
        }),
      );

      const isSuccess = res?.meta?.requestStatus === 'fulfilled';

      if (!isSuccess) {
        // ❌ rollback
        dispatch(toggleBookmarkLocal(id));

        show({
          type: 'error',
          title: res?.payload?.message || res?.payload?.res?.message || 'Something went wrong',
        });

        return;
      }

      // ✅ SUCCESS TOAST
      show({
        type: 'success',
        title: res?.payload?.message || res?.payload?.res?.message,
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


  const handleOpenVideo = useCallback(
    (item: any) => {
      navigation.navigate('VisionXDetails', {
        visionxId: item?.id,
      });
    },
    [navigation],
  );

  // Helper function to check if reaction popup is open for a specific item
  const isReactionOpen = (id: string, type: string) => {
    return activeReactionId === String(id) && activeReactionType === type;
  };

  // Helper function to open reaction popup
  const openReaction = (id: string, type: string) => {
    setActiveReactionId(String(id));
    setActiveReactionType(type);
  };

  // Helper function to close reaction popup
  const closeReaction = () => {
    setActiveReactionId(null);
    setActiveReactionType(null);
  };

  const loadMore = useCallback(async () => {
    if (loading || isLoadingMore) return;

    if (!nextCursor) return;

    if (query.trim().length < 2) return;

    setIsLoadingMore(true);

    try {
      await dispatch(
        fetchSearch({
          query: query.replace(/^#/, ''),
          type: activeType,
          cursor: nextCursor,
        }),
      ).unwrap();
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    loading,
    isLoadingMore,
    nextCursor,
    query,
    activeType,
    dispatch,
  ]);

  // Render Post
  const renderPostItem = ({ item }: any) => {
    let mediaArr = [];

    // ✅ CASE 1: Multiple images
    if (Array.isArray(item?.medias) && item.medias.length > 0) {
      mediaArr = item.medias.map((m: any) => ({
        type: 'image',
        url: m?.image,
      }));
    }

    // ✅ CASE 2: Single image
    else if (item?.image) {
      mediaArr = [
        {
          type: 'image',
          url: item.image,
        },
      ];
    }

    const postId = String(item?.id);
    const isReactionOpen = activeReactionId === postId && activeReactionType === 'post';

    // 🔥 FIX: Use postType from the data structure
    const postType =
      item?.postType ||
      item?.postType ||
      item?.type ||
      item?.type ||
      'normal';

    return (
      <PostCard
        id={item?.id}
        userName={item?.user?.name}
        user_name={item?.user?.user_name}
        userAvatar={item?.user?.profile_photo_path}
        time={item?.createdAt}
        caption={item?.title || item?.story}
        // ✅ EMBEDDED MEDIA
        platform={item?.platform}
        link={item?.link}
        image={item?.image}
        isVisible={true}

        media={mediaArr}
        comments={item?.comments_count}
        repostCount={item?.reposted_count ?? 0}
        liked={likedIds.includes(item.id)}
        likeCount={
          likeCountMap?.hasOwnProperty(item.id)
            ? likeCountMap[item.id]
            : item.likes_count
        }
        bookmarked={feedBookMark.includes(item.id) || item.isWishlisted === 1}
        emoji_type={
          likedIds.includes(item.id)
            ? reactionMap?.[item.id] || item.emoji_type
            : null
        }
        onReactionSelect={(reaction: ReactionType) => {
          handleFeedLike(item, reaction || 'Heart');
        }}
        onLike={() => {
          handleFeedLike(
            item,
            reactionMap?.[item.id] || item?.emoji_type || 'Heart',
          );
        }}
        onBookmark={() => handleFeedBookmark(item)}
        onProfilepPress={() =>
          navigation.navigate('Profile', {
            username: item?.user?.user_name,
          })
        }
        onMenuPress={e => openMenu(e, item)}
        onCommentPress={() => {
          setActivePost(item);
          setCommentVisible(true);
          dispatch(fetchCommentsByPost(item.id));
        }}
        postType="normal"
        onRepostPress={() => {
          setSelectedRepostPost({
            ...item,

            userName: item?.user?.name,
            userAvatar: item?.user?.profile_photo_path,

            caption: item?.story,

            media:
              item?.medias?.map((m: any) => ({
                type: 'image',
                url: m?.image,
              })) || [],

            originalPost: item?.original_post || null,
          });

          setRepostVisible(true);
        }}
        originalPost={item.original_post}
        repostedUser={item.reposted_user}
        isRepost={!!item.original_post}
        isReported={!!item.isReported}
        reactionPopupVisible={isReactionOpen}
        onOpenReaction={() => openReaction(item.id, 'post')}
        onCloseReaction={closeReaction}
        onShare={() => {
          handleShare({
            title: item?.title || item?.story,
            value: item?.id,
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
            username: item?.user?.user_name,
          });
        }}
      />
    );
  };

  // 👤 USER ITEM
  const renderUserItem = ({ item }: any) => {
    const imageSource =
      item?.profile_photo_path &&
        item?.profile_photo_path.trim() &&
        item?.profile_photo_path !== 'null' &&
        item?.profile_photo_path !== 'undefined'
        ? { uri: item.profile_photo_path }
        : require('../../assets/images/default-profile.jpg');

    if (loading && item?.id?.includes?.('skeleton')) {
      return (
        <View
          style={[
            styles.userRow,
            {
              backgroundColor: isDark ? themeColors.card2 : themeColors.card2,
              borderRadius: 12,
              marginBottom: 8,
            },
          ]}
        >
          {/* Avatar Skeleton */}
          <View
            style={{
              width: 45,
              height: 45,
              borderRadius: 22,
              backgroundColor: isDark ? '#2A2A2D' : '#D8D8D8',
              marginRight: 10,
            }}
          />

          {/* Text Skeleton */}
          <View style={{ flex: 1 }}>
            <View
              style={{
                width: '60%',
                height: 14,
                borderRadius: 6,
                backgroundColor: isDark ? '#2A2A2D' : '#D8D8D8',
                marginBottom: 8,
              }}
            />

            <View
              style={{
                width: '40%',
                height: 12,
                borderRadius: 6,
                backgroundColor: isDark ? '#1F1F22' : '#E5E5E5',
              }}
            />
          </View>

          {/* Button Skeleton */}
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isDark ? '#2A2A2D' : '#D8D8D8',
            }}
          />
        </View>
      );
    }
    return (
      <TouchableOpacity
        style={[
          styles.userRow,
          {
            backgroundColor: isDark ? themeColors.card2 : themeColors.card2,
            borderRadius: 12,
            marginBottom: 8,
          },
        ]}
        onPress={() =>
          navigation.navigate('Profile', {
            username: item?.user_name || item?.id || item?.user_id,
          })
        }
      >
        {/* <FastImage source={imageSource} style={styles.avatar} /> */}
        <Avatar uri={imageSource} name={item?.name} size={40} />

        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.name, { color: isDark ? '#fff' : '#000' }]}>
            {item?.name}
          </Text>

          <Text style={styles.username}>@{item?.user_name || 'unknown'}</Text>
        </View>

        {item?.isConnected === 1 ? (
          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() => handleStartChat(item)}
          >
            <Ionicons name="chatbubble-ellipses" size={18} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.followBtn}
            onPress={() => {
              navigation.navigate('Profile', {
                username: item?.user_name,
              });
            }}
          >
            <Eye size={14} color={themeColors.white} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  // Books
  const renderBookItem = ({ item }: any) => {
    if (loading && item?.id?.includes?.('skeleton')) {
      return <CardSkeleton height={260} />;
    }
    const bookId = String(item?.id);
    const isReactionOpen = activeReactionId === bookId && activeReactionType === 'book';
    return (
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
        likes={likeCountMap[item.id] ?? item.likes_count}
        views={item?.views}
        rating={item?.avg_rating ?? '0'}
        title={item?.title}
        author={item?.user?.name}
        bookmarked={
          bookmarkedIds.includes(item?.id) || item?.isWishlisted === 1
        }
        onBookmark={() => handleBookmark(item?.id)}
        handleLike={(reaction?: ReactionType) =>
          handleLike({
            id: item?.id,
            emoji_type: reaction || 'Heart',
            likes_count: item?.likes_count || 0,

            // ✅ picker only
            isReactionPress: reaction !== undefined,
          })
        }
        emoji_type={
          likedIds.includes(item.id)
            ? reactionMap[item.id] ?? item?.emoji_type
            : null
        }
        isLiked={likedIds.includes(item.id)}
        reactionPopupVisible={isReactionOpen}
        onOpenReaction={() => openReaction(item.id, 'book')}
        onCloseReaction={closeReaction}
      />
    );
  };

  const renderSynopsesItem = ({ item }: any) => {
    const stripHtml = (html: string) => {
      if (!html) return '';

      return html
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .trim();
    };

    if (loading && item?.id?.includes?.('skeleton')) {
      return (
        <View
          style={{
            width: CARDWIDTH,
            alignSelf: 'center',
            marginBottom: 12,
          }}
        >
          <CardSkeleton width={CARDWIDTH} height={180} />
        </View>
      );
    }

    const synopsisId = String(item?.id);
    const isReactionOpen = activeReactionId === synopsisId && activeReactionType === 'synopsis';

    return (
      <View
        style={{
          width: CARDWIDTH,
          alignSelf: 'center',
          marginBottom: 12,
        }}
      >
        <SynopsisCard
          image={item?.image || 'https://via.placeholder.com/150'}
          height={180}
          width={CARDWIDTH}
          onPress={() =>
            navigation.navigate('SynopsisDetails', {
              synopsisId: item?.id,
            })
          }
          ribbonText={item?.genre?.name}
          likes={likeCountMap[item.id] ?? item.likes_count}
          views={item?.views}
          rating={item?.avg_rating ?? '0'}
          title={item?.title}
          createdAt={item?.createdAt}
          author={item?.user?.name}
          description={stripHtml(item?.story || item?.synopsis)}
          handleLike={(reaction?: ReactionType) =>
            handleLike({
              id: item?.id,
              emoji_type: reaction || 'Heart',
              likes_count: item?.likes_count || 0,
              isReactionPress: reaction !== undefined,
            })
          }
          emoji_type={
            likedIds.includes(item.id)
              ? reactionMap[item.id] ?? item?.emoji_type
              : null
          }
          isLiked={likedIds.includes(item.id)}
          bookmarked={bookmarkedIds.includes(item.id)}
          onBookmark={() => handleBookmark(item.id)}
          reactionPopupVisible={isReactionOpen}
          onOpenReaction={() => openReaction(item.id, 'synopsis')}
          onCloseReaction={closeReaction}
        />
      </View>
    );
  };

  const renderVisionxItem = ({ item, index }: any) => {
    const visionId = String(item?.id);
    const isReactionOpen = activeReactionId === visionId && activeReactionType === 'visionx';

    return (
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
        isActive={true}
        bookmarked={bookmarkedIds.includes(item?.id)}
        onSaved={() => handleBookmark(item?.id)}
        onPress={() => handleOpenVideo(item)}
        handleUser={() => {
          navigation.navigate('Profile', {
            username:
              item?.user?.user_name || item?.user?.id || item?.user?.userId,
          });
        }}
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
        reactionPopupVisible={isReactionOpen}
        onOpenReaction={() => openReaction(item.id, 'visionx')}
        onCloseReaction={closeReaction}
        onShare={() => {
          handleShare({
            title: item?.title,
            value: item?.id,
            type: 'visionx',
          })
        }}
      />
    );
  };

  const renderMovieItem = ({ item }: any) => {
    const isBookmarked = movieBookmarkedIds?.includes(item?.id);

    return (
      <View style={{ width: CARD_WIDTH }}>
        {loading && item?.id?.includes?.('skeleton') ? (
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
            bookmarked={isBookmarked}
            onBookmark={() => handleMovieBookmark(item?.id)}
          />
        )}
      </View>
    );
  };

  const renderOpportunityItem = ({ item }: any) => {
    return (
      <OpportunityCard
        data={item}
        onPress={() => {
          navigation.navigate('SingleOpportunityDetails', {
            opp_id: item?.opp_id,
          });
        }}
      />
    );
  };

  const renderContestItem = ({ item }: any) => {
    return (
      <ContestCard
        {...item}
        onPress={() =>
          navigation.navigate('ContestDetails', {
            contestId: item?.id,
          })
        }
        startDate={formatDate(item?.start_date)}
        endDate={getDaysLeft(item?.end_date)}
        participants={item.participants_count}
      />
    );
  };

  const isGridType = ['books', 'movies'].includes(activeType);
  const isCardType = ['visionx', 'contest', 'opportunities', 'users', 'synopses',].includes(
    activeType,
  );

  const getTrendingHashTags = async () => {
    try {
      const res = await api.get('/content/trending-hashtags');

      console.log('TRENDING TAGS', res?.data);

      setTrendingTags(res?.data?.data || []);
    } catch (error) {
      console.log('Trending hashtags error', error);
    }
  };

  const getSuggestedUsers = async () => {
    try {
      const res = await api.get('/connection/suggestions/users');

      console.log('SUGGESTED USERS', res?.data);

      setSuggestedUsers(res?.data?.data || []);
    } catch (error) {
      console.log('Suggested user error', error);
    }
  };

  useEffect(() => {
    getTrendingHashTags();
    getSuggestedUsers();
    loadRecentSearches();
  }, []);

  useEffect(() => {
    if (!initialQuery) return;

    setQuery(`${initialQuery}`);

    dispatch(
      fetchSearch({
        query: initialQuery,
        type: 'posts',
      }),
    );
  }, [initialQuery]);

  const sortedTrendingTags = React.useMemo(() => {
    return [...trendingTags].sort(
      (a: any, b: any) => b.synopses_count - a.synopses_count,
    );
  }, [trendingTags]);

  const skeletonData = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: `skeleton-${i}`,
      })),
    [],
  );


  return (
    <SafeAreaView
      style={[
        styles.safe,
        {
          backgroundColor: isDark
            ? themeColors.black
            : themeColors.appBackground,
        },
      ]}
      edges={['right', 'left', 'top']}
    >
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={[
              styles.backButton,
              { backgroundColor: isDark ? '#1E1E1E' : themeColors.card2 },
            ]}
            onPress={handleBack}
          >
            <FontAwesome6
              name="arrow-left"
              size={20}
              color={themeColors.white}
              iconStyle="solid"
            />
          </TouchableOpacity>

          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: themeColors.card2,
                borderWidth: 1,
                borderColor: themeColors.card2,
              },
            ]}
          >
            <Ionicons name="search-outline" size={20} color="#8E8E93" />

            <TextInput
              placeholder="Search"
              placeholderTextColor="#B5B5B5"
              value={query}
              onChangeText={handleSearch}
              autoCapitalize="none"
              style={[
                styles.input,
                {
                  color: isDark ? '#fff' : '#000',
                },
              ]}
              autoFocus
            />

            {query?.length > 0 && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setQuery('');
                }}
              >
                <View style={styles.closeIcon}>
                  <Ionicons name="close" size={14} color="#fff" />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* SINGLE FLATLIST */}
        <FlatList
          data={
            loading && query.length > 0
              ? skeletonData
              : query.length > 0
                ? listData
                : []
          }
          key={isGridType ? 'grid' : 'list'}
          numColumns={isGridType ? 2 : 1}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{
            paddingHorizontal: isGridType ? 10 : 0,
            paddingBottom: 20,
          }}
          columnWrapperStyle={
            isGridType
              ? {
                justifyContent: 'space-between',
                marginBottom: 10,
              }
              : undefined
          }
          keyExtractor={(item, index) =>
            item?.id?.toString() || index.toString()
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.6}
          // 🔥 HEADER (Tabs OR Recent)
          ListHeaderComponent={
            query.length > 0 ? (
              <View style={{ marginBottom: 10 }}>
                <FlatList
                  horizontal
                  data={TABS}
                  keyExtractor={(item) => item.value}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 10 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        setActiveType(item.value);
                      }}
                      style={[
                        styles.tab,
                        {
                          backgroundColor:
                            activeType === item.value
                              ? themeColors.primary
                              : isDark
                                ? '#222'
                                : '#dedede',
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontFamily: Fonts.Medium,
                          color:
                            activeType === item.value
                              ? '#fff'
                              : isDark
                                ? '#aaa'
                                : '#333',
                        }}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            ) : (
              <View style={{ paddingHorizontal: 6, marginTop: 10 }}>
                {recentSearches.length > 0 && (
                  <View style={styles.recentHeader}>
                    <Text style={styles.recentTitle}>Recent Searches</Text>

                    <TouchableOpacity
                      onPress={async () => {
                        setRecentSearches([]);

                        await AsyncStorage.removeItem('RECENT_SEARCHES');
                      }}
                    >
                      <Text style={styles.clearAll}>Clear all</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {recentSearches.length > 0 && (
                  <View style={{ marginBottom: 10 }}>
                    {recentSearches.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.recentRow}
                        activeOpacity={0.7}
                        onPress={() => {
                          setQuery(item);
                        }}
                      >
                        <Ionicons
                          name="time-outline"
                          size={18}
                          color="#8E8E93"
                        />

                        <Text
                          style={[
                            styles.recentText,
                            { color: themeColors.white },
                          ]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Trending Hasthags */}
                {sortedTrendingTags.length > 0 && (
                  <View style={{ marginHorizontal: 2 }}>
                    <View style={styles.trendingHeader}>
                      <Ionicons
                        name="trending-up"
                        size={22}
                        color="#FF8C00"
                      />

                      <Text
                        style={[
                          styles.trendingTitle,
                          { color: isDark ? '#fff' : '#000' },
                        ]}
                      >
                        Trending Hashtags
                      </Text>
                    </View>

                    {sortedTrendingTags.map((item: any) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.trendingItem}
                        onPress={() => {
                          setQuery(item.name);
                        }}
                      >
                        <Text style={styles.tag}>
                          #{item.name}
                        </Text>

                        <Text style={styles.posts}>
                          {item.synopses_count} {item.synopses_count === 1 ? 'tag' : 'tags'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* SUGGESTED USERS */}
                <View style={{ marginTop: 20, marginHorizontal: 10 }}>
                  <View style={styles.peopleHeader}>
                    <View style={styles.peopleLine} />

                    <Text style={styles.peopleHeaderText}>
                      SUGGESTED FOR YOU
                    </Text>

                    <View style={styles.peopleLine} />
                  </View>
                  {suggestedUsers?.map((item: any, index: number) => (
                    <View key={item?.id || index}>
                      {renderUserItem({ item })}
                    </View>
                  ))}
                </View>
              </View>
            )
          }
          // 🔥 MAIN RENDER
          renderItem={({ item }) => {
            const content =
              activeType === 'posts'
                ? loading ? (
                  <PostSkeleton withTopSpacing={false} />
                ) : (
                  renderPostItem({ item })
                )
                : activeType === 'users'
                  ? renderUserItem({ item })
                  : activeType === 'books' ? loading ? (
                    <CardSkeleton width={CARD_WIDTH} height={260} />
                  ) : (
                    renderBookItem({ item })
                  )
                    : activeType === 'synopses'
                      ? renderSynopsesItem({ item })
                      : activeType === 'visionx' ? (loading ? (
                        <VisionCardSkeleton />
                      ) : (

                        renderVisionxItem({ item })
                      ))
                        : activeType === 'opportunities' ? (loading ? (
                          <OpportunityCardSkeleton />
                        ) : (
                          renderOpportunityItem({ item })
                        ))
                          : activeType === 'movies' ? (loading ? (
                            <MovieCardSkeleton height={260} />
                          ) : (
                            renderMovieItem({ item })
                          ))
                            : activeType === 'contest' ? (loading ? (
                              <ContestSkeleton />
                            ) : (
                              renderContestItem({ item })
                            ))
                              : renderUserItem({ item });

            return (
              <View style={{ marginHorizontal: isCardType ? 10 : 0 }}>
                {content}
              </View>
            );
          }}
          ListEmptyComponent={() => {
            if (loading || query.length === 0) return null;

            return (
              <View style={styles.emptyState}>
                <Ionicons
                  name="search-outline"
                  size={70}
                  color={isDark ? '#555' : '#999'}
                />

                <Text
                  style={[
                    styles.emptyTitle,
                    { color: isDark ? '#fff' : '#000' },
                  ]}
                >
                  No Results Found
                </Text>

                <Text
                  style={[
                    styles.emptySubtitle,
                    { color: isDark ? '#888' : '#666' },
                  ]}
                >
                  We couldn't find any {emptyLabels[activeType] || activeType}.
                </Text>

                <Text
                  style={[
                    styles.emptySubtitle,
                    { color: isDark ? '#888' : '#666' },
                  ]}
                >
                  Try another keyword or check your spelling.
                </Text>
              </View>
            );
          }}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="small" color={themeColors.primary} />
              </View>
            ) : null
          }
        />
      </View>

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
    </SafeAreaView>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1 },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 22,
  },

  closeIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#5A5A5A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  input: {
    flex: 1,
    marginLeft: 10,
  },

  tab: {
    paddingHorizontal: 16,
    height: 25, // ✅ FIX: control height
    borderRadius: 18,
    marginRight: 10,
    justifyContent: 'center', // ✅ center text vertically
    alignItems: 'center', // ✅ center text horizontally
    // marginBottom: 15,
  },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22,
    marginRight: 10,
  },

  name: {
    fontFamily: Fonts.Bold,
    fontSize: 14,
  },

  username: {
    fontSize: 12,
    color: '#888',
  },

  followBtn: {
    backgroundColor: themeColors.primary,
    width: 25,
    height: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },

  followText: {
    color: '#fff',
    fontSize: 12,
  },

  chatBtn: {
    backgroundColor: themeColors.primary,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyBox: {
    alignItems: 'center',
    // marginTop: 40,
  },

  recentTitle: {
    fontFamily: Fonts.Bold,
    marginBottom: 10,
    color: themeColors.white,
  },

  recentItem: {
    paddingVertical: 8,
    fontSize: 14,
  },

  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  clearAll: {
    fontSize: 12,
    color: themeColors.primary,
    fontFamily: Fonts.Medium,
  },

  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 12,
    marginBottom: 8,
  },

  recentText: {
    flex: 1,
    marginLeft: 5,
    fontSize: 14,
  },

  /* TRENDING */
  trendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    // gap: 6,
    marginBottom: 10,
  },

  trendingTitle: {
    marginLeft: 8,
    fontFamily: Fonts.Bold,
    fontSize: 22,
  },

  trendingItem: {
    marginBottom: 10,
  },

  tag: {
    fontSize: 14,
    fontFamily: Fonts.Bold,
    color: themeColors.primary,
  },

  posts: {
    fontSize: 12,
    color: '#888',
    fontFamily: Fonts.Medium,
  },

  peopleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  peopleLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#3A2A00',
  },

  peopleHeaderText: {
    color: themeColors.white,
    fontSize: 12,
    letterSpacing: 2,
    marginHorizontal: 12,
    fontFamily: Fonts.Medium,
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 80,
  },

  emptyTitle: {
    fontSize: 20,
    fontFamily: Fonts.Bold,
    marginTop: 15,
  },

  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 22,
  },
});
