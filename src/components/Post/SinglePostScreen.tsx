import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  Alert,
  Pressable,
  Linking,
} from 'react-native';

import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import Ionicons from '@react-native-vector-icons/ionicons';
import FastImage from 'react-native-fast-image';

import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import Heart from '../../assets/SVG/Heart';
import AuthHeader from '../Header/AuthHeader';
import Comment from '../../assets/SVG/Comment';
import Share from '../../assets/SVG/Share';
import PostCarousel from './PostCarousel';
import { useLike } from '../../hooks/useLike';
import { useShare } from '../../hooks/useShare';
import ReportModal from '../Modals/ReportModal';
import { useLikeAnimation } from '../../hooks/useLikeAnimation';
import { LikeParticles } from '../Like/LikeParticles'
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../Toast/ToastProvider';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearSelectedPost,
  fetchCommentsByPost,
  fetchFeed,
  getPostByIdThunk,
  toggleCommentLikeLocal,
  toggleLikeCountLocal,
  updatePostReactionLocal,
} from '../../redux/slices/feedSlice';
import TagChip from '../Tags/TagChip';
import { formatDate } from '../../utils/date';
import api from '../../../Instance/Instance';
import {
  likeAction,
  toggleBookmarkLocal,
  toggleLikeLocal,
  wishlistAction,
} from '../../redux/slices/actionSlice';
import { createReport, getReports } from '../../redux/slices/reportSlice';
import { deletePost, repostPost } from '../../redux/slices/postSlice';
import Repost from '../../assets/SVG/Repost';
import { ReactionType, usePostReaction } from '../../hooks/usePostReaction';
import PostDetailsSkeleton from './PostDetailsSkeleton';
import EmbeddedMedia from '../Media/EmbeddedMedia';
import RepostModal from '../Modals/RepostModal';
import NotFoundScreen from '../../screens/NotFoundScreen';
import Avatar from '../Avatar/Avatar';
type Comment = {
  id: string;
  name: string;
  avatar: string;
  comment: string;
  liked: boolean;
  likes: number;
};

const SinglePostDetails = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const flashListRef = useRef<any>(null);
  const dispatch = useDispatch<any>();
  const { show } = useToast();
  const postId = route.params?.postId || route.params?.id;

  const isDark = true;

  const [reportVisible, setReportVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [expandedComments, setExpandedComments] = useState<
    Record<string, boolean>
  >({});
  const [selectedReaction, setSelectedReaction] =
    useState<ReactionType>('Heart');

  const scaleAnimations = useRef<Record<string, Animated.Value>>({});
  const { likedMap } = useLike();
  const { likeScale, particleAnims, animateLike, animateParticles } =
    useLikeAnimation();


  const [menuVisible, setMenuVisible] = useState(false);
  const [linkPreviews, setLinkPreviews] = useState<any[]>([]);
  const [repostVisible, setRepostVisible] = useState(false);
  const [selectedRepostPost, setSelectedRepostPost] = useState<any>(null);
  const [showEmptyState, setShowEmptyState] = useState(false);

  const [reactionPopupVisible, setReactionPopupVisible] = useState(false);
  const [expandedCaption, setExpandedCaption] = useState(false);


  useFocusEffect(
    useCallback(() => {
      return () => {
        setReactionPopupVisible(false);
      };
    }, [])
  );

  // Redux
  const {
    selectedPost,
    loading,
    commentsByPost,
    commentsPageByPost,
    commentsHasMore,
    commentsLoadingMore,
  } = useSelector((state: any) => state.feed);
  const { user: authUser } = useSelector((state: any) => state.auth);
  const isOwnPost = useMemo(
    () => authUser?.id === selectedPost?.data?.user?.id,
    [authUser?.id, selectedPost?.data?.user?.id],
  );
  const { bookmarkedIds, likedIds } = useSelector(
    (state: any) => state.actions,
  );
  const { reports, loading: reportsLoading } = useSelector(
    (state: any) => state.report,
  );

  // Extract Tags from story
  const extractTagsFromStory = (text: string) => {
    if (!text) return [];

    const matches = text.match(/#\w+/g);
    return matches ? matches.map(tag => tag.replace('#', '')) : [];
  };

  const post = useMemo(() => {
    const p = selectedPost?.data;
    if (!p) return null;

    // ✅ Priority: API tags first
    const apiTags = Array.isArray(p?.tags)
      ? p.tags.map((t: any) => t?.name || t)
      : [];

    const storyTags = extractTagsFromStory(p?.story);

    // Don't show chips for tags already written as hashtags in the story
    const finalTags = apiTags.filter(
      (tag: any) =>
        !storyTags.some(
          storyTag => storyTag.toLowerCase() === String(tag).toLowerCase(),
        ),
    );

    let mediaArr = [];

    if (Array.isArray(p?.medias) && p.medias.length > 0) {
      mediaArr = p.medias.map((m: any) => ({
        type: 'image',
        url: m?.image,
      }));
    } else if (p?.image) {
      mediaArr = [{ type: 'image', url: p.image }];
    }

    // 🔥 NEW CONDITION HERE
    const caption =
      p?.type === 'book' || p?.type === 'script' ? p?.title : p?.story;

    return {
      id: p.id,
      userName: p?.user?.name,
      userAvatar: p?.user?.profile_photo_path,
      user_name: p?.user?.user_name,
      caption,
      link: p?.link,
      time: p?.createdAt,
      likes: p?.likes_count || 0,
      comments: p?.comments_count || 0,
      isLiked: !!p?.isLiked,
      media: mediaArr,

      // ✅ FIXED TAGS
      tags: finalTags,
    };
  }, [selectedPost]);

  useEffect(() => {
    if (selectedPost?.data?.emoji_type) {
      setSelectedReaction(selectedPost?.data?.emoji_type);
    }
  }, [selectedPost?.data?.emoji_type]);

  const cleanCaption = post?.caption ?? '';

  const CAPTION_LIMIT = 185;

  const displayedCaption = expandedCaption
    ? cleanCaption
    : cleanCaption.length > CAPTION_LIMIT
      ? `${cleanCaption.slice(0, CAPTION_LIMIT).trim()}...`
      : cleanCaption;
  const commentsRaw = commentsByPost?.[post?.id];
  const comments = Array.isArray(commentsRaw) ? commentsRaw : [];
  const isLoadingComments = commentsRaw === undefined;

  const mappedComments = useMemo(() => {
    return comments.map((item: any) => ({
      id: item?.id,
      name: item?.user?.name,
      avatar: item?.user?.profile_photo_path,
      comment: item?.comment,
      liked: !!item?.isLiked,
      likes: item?.likes_count || 0,
    }));
  }, [comments]);

  const { reactions, submitReaction, handleLongPress, getReactionAsset } =
    usePostReaction({
      isOpen: reactionPopupVisible,
      onOpen: () => setReactionPopupVisible(true),
      onClose: () => setReactionPopupVisible(false),

      onSubmit: async reaction => {
        setSelectedReaction(reaction); // ✅ instant UI update

        handleFeedLike(post?.id, reaction);
      },
    });

  // 🔥 FETCH
  useFocusEffect(
    useCallback(() => {
      if (!postId) return;

      dispatch(clearSelectedPost());

      dispatch(getPostByIdThunk(postId));
      dispatch(fetchCommentsByPost({ postId, page: 1 }));

      return () => {
        dispatch(clearSelectedPost());
      };
    }, [postId]),
  );
  const animateHeart = (id: string) => {
    const scale = scaleAnimations.current[id];

    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1.4,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const { handleShare } = useShare({
    type: selectedPost?.data?.type || 'post',
    value: post?.id,
    title: post?.caption || post?.userName || 'Check out this post',
    description: post?.caption || '',
    image: post?.media?.[0]?.url || '',
  });

  useEffect(() => {
    comments.forEach(comment => {
      if (!scaleAnimations.current[comment.id]) {
        scaleAnimations.current[comment.id] = new Animated.Value(1);
      }
    });
  }, [comments]);

  /* Render comment */
  const toggleExpand = (id: string) => {
    setExpandedComments(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderComment = useCallback(
    ({ item }: { item: Comment }) => (
      <View style={styles.commentRow}>
        <FastImage
          source={{ uri: item?.avatar }}
          style={styles.commentAvatar}
        />

        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.commentUser,
              { color: isDark ? themeColors.white : '#000' },
            ]}
          >
            {item?.name}
          </Text>

          <Text
            numberOfLines={expandedComments[item.id] ? undefined : 2}
            style={[styles.commentText, { color: isDark ? '#bbb' : '#444' }]}
          >
            {item?.comment}
          </Text>

          {/* 👇 SEE MORE / SEE LESS */}
          {item?.comment?.length > 80 && (
            <TouchableOpacity onPress={() => toggleExpand(item.id)}>
              <Text style={{ color: themeColors.primary, fontSize: 12 }}>
                {expandedComments[item.id] ? 'See less' : 'See more'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.likeColumn}>
          <TouchableOpacity onPress={() => handleCommentLike(item)}>
            <Animated.View
              style={{
                transform: [
                  {
                    scale:
                      scaleAnimations.current[item.id] || new Animated.Value(1),
                  },
                ],
              }}
            >
              <Ionicons
                name={item?.liked ? 'heart' : 'heart-outline'}
                color={item?.liked ? '#ff3040' : '#888'}
                size={18}
              />
            </Animated.View>
          </TouchableOpacity>

          <Text style={styles.likeCount}>{item?.likes}</Text>
        </View>
      </View>
    ),
    [isDark, likedMap, expandedComments],
  );

  // ✅ Keyboard Fix
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', e => {
      setKeyboardHeight(e.endCoordinates.height - (insets.bottom || 0));
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [insets.bottom]);

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

      dispatch(getPostByIdThunk(postId));

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
        story: data?.story || '',
        mentions: data?.mentions || [],
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

      dispatch(getPostByIdThunk(postId));

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

  const handleCommentLike = async (item: any) => {
    console.log('item', item);
    const commentId = item?.id;
    console.log('comment id', commentId);

    if (!commentId) return;

    const wasLiked = item?.liked;

    // ✅ optimistic UI (instant)
    dispatch(
      toggleCommentLikeLocal({
        commentId,
      }),
    );

    animateHeart(commentId);

    try {
      await api.post(`actions/comment/like/${commentId}`, {
        type: wasLiked ? 'delete' : 'create',
      });
    } catch (error) {
      console.log('error', error);

      // ❌ rollback if API fails
      dispatch(
        toggleCommentLikeLocal({
          commentId,
        }),
      );
    }
  };

  const handleFeedBookmark = async (post: any) => {
    const id = post?.id;
    console.log('id', id);

    const isAlreadyBookmarked = bookmarkedIds?.includes(id) || post?.wishList;

    dispatch(toggleBookmarkLocal(id));

    try {
      const res: any = await dispatch(
        wishlistAction({
          synopsis_id: id,
          type: isAlreadyBookmarked ? 'delete' : 'create',
        }),
      );

      const isSuccess = res?.meta?.requestStatus === 'fulfilled';

      if (!isSuccess) {
        dispatch(toggleBookmarkLocal(id));

        show({
          type: 'error',
          title: res?.payload?.message || res?.payload || 'Bookmark failed',
        });
        return;
      }

      show({
        type: 'success',
        title:
          res?.payload?.message ||
          (isAlreadyBookmarked
            ? 'Removed from bookmarks'
            : 'Added to bookmarks'),
      });
    } catch (error) {
      dispatch(toggleBookmarkLocal(id));

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
      if (!post?.id) return;

      const payload = {
        report_id: data.reason,
        description: data.message || '',

        // ✅ correct key
        synopsis_id: post.id,

        // ✅ correct user id
        reported_user_id: selectedPost?.data?.user?.id,

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

          navigation.goBack();
          // 🔥 REFETCH FEED
          dispatch(fetchFeed());

          show({
            type: 'success',
            title: 'Post deleted successfully',
          });
        },
      },
    ]);
  };

  const handleFeedLike = async (id: string, emoji_type?: ReactionType) => {
    if (!id) return;

    const alreadyLiked =
      likedIds?.includes(id) || selectedPost?.data?.isLiked === 1;

    // ✅ unlike on single click
    if (alreadyLiked && !emoji_type) {
      dispatch(toggleLikeLocal(id));
      dispatch(toggleLikeCountLocal(id));

      try {
        await dispatch(
          likeAction({
            synopsis_id: id,
            type: 'delete',
          }),
        );

        setSelectedReaction('Heart');
      } catch (error) {
        dispatch(toggleLikeLocal(id));
        dispatch(toggleLikeCountLocal(id));
      }

      return;
    }

    // ✅ first time like
    if (!alreadyLiked) {
      dispatch(toggleLikeLocal(id));
      dispatch(toggleLikeCountLocal(id));
    }

    // ✅ update emoji instantly
    if (emoji_type) {
      setSelectedReaction(emoji_type);

      dispatch(
        updatePostReactionLocal({
          postId: id,
          emoji_type,
        }),
      );
    }

    try {
      await dispatch(
        likeAction({
          synopsis_id: id,
          type: 'create',
          emoji_type: emoji_type ?? selectedReaction ?? undefined,
        }),
      );
    } catch (error) {
      if (!alreadyLiked) {
        dispatch(toggleLikeLocal(id));
        dispatch(toggleLikeCountLocal(id));
      }
    }
  };

  const handleOwnPostEdit = () => {
    navigation.navigate('AddPost', {
      post: selectedPost?.data,
    });
  };

  const isLikedFinal =
    likedIds?.includes(post?.id) ?? selectedPost?.data?.isLiked === 1;
  const postType = selectedPost?.data?.type;
  const handleReadPress = () => {
    if (postType === 'book') {
      navigation.navigate('BookDetails', { postId: post?.id });
    } else if (postType === 'script') {
      navigation.navigate('SynopsisDetails', { postId: post?.id });
    }
  };

  const extractAllUrls = (text?: string | null) => {
    if (!text) return [];

    const matches = text.match(
      /(?:(?:https?:\/\/)|(?:www\.))?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/g,
    );

    return (matches || [])
      .map(url => normalizeUrl(url))
      .filter(Boolean);
  };

  const normalizeUrl = (value?: string | null) => {
    if (!value) return null;

    let url = String(value).trim();

    // Remove punctuation that may be attached to the URL
    url = url.replace(/[),.!?;:'"\]}]+$/g, '');

    if (!url) return null;

    // Add protocol when missing
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    return url;
  };

  const getPostUrls = useCallback(() => {
    const urls = extractAllUrls(post?.caption);

    if (post?.link) {
      const postLink = normalizeUrl(post.link);

      if (postLink && !urls.includes(postLink)) {
        urls.unshift(postLink);
      }
    }

    return urls;
  }, [post?.link, post?.caption]);

  useEffect(() => {
    let cancelled = false;

    const fetchPreviews = async () => {
      const urls = getPostUrls();

      if (!urls.length) {
        setLinkPreviews([]);
        return;
      }

      try {
        const results = await Promise.all(
          urls.map(async (url: any) => {
            try {
              const response = await fetch(
                `https://api.microlink.io/?url=${encodeURIComponent(url)}`,
              );

              if (!response.ok) {
                return null;
              }

              const json = await response.json();

              if (json?.status === 'success' && json?.data) {
                return {
                  ...json.data,
                  _normalizedUrl: url,
                };
              }

              return null;
            } catch (error) {
              console.log('Preview error:', url, error);
              return null;
            }
          }),
        );

        if (!cancelled) {
          setLinkPreviews(results.filter(Boolean));
        }
      } catch (error) {
        if (!cancelled) {
          setLinkPreviews([]);
        }
      }
    };

    fetchPreviews();

    return () => {
      cancelled = true;
    };
  }, [getPostUrls]);

  const isCorrectPost = selectedPost?.data?.id === postId;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (!loading && (!selectedPost?.data || !isCorrectPost)) {
      timer = setTimeout(() => {
        setShowEmptyState(true);
      }, 800);
    } else {
      setShowEmptyState(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading, selectedPost?.data, isCorrectPost]);


  // Still loading -> Skeleton
  if (loading || (!showEmptyState && (!selectedPost?.data || !isCorrectPost))) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.black }}>
        <AuthHeader
          title="Post Details"
          showBack
          onBack={() => navigation.goBack()}
        />
        <PostDetailsSkeleton />
      </SafeAreaView>
    );
  }

  // API completed and no data
  if (showEmptyState) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: themeColors.black }}
        edges={['top', 'left', 'right']}
      >
        <AuthHeader
          title="Post Details"
          showBack
          fontSize={20}
          onBack={() => navigation.goBack()}
        />

        <NotFoundScreen
          title="Post Not Found"
          description="The post you're looking for doesn't exist or may have been deleted."
          icon="document-text-outline"
          showButton={false}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? themeColors.black
            : themeColors.appBackground,
        },
      ]}
      edges={['top']}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          translucent
          backgroundColor="transparent"
        />
        <AuthHeader
          title="Post Details"
          fontSize={20}
          showBack
          onBack={() => navigation.goBack()}
          showBookMark
          showMenu
          postId={post?.id} // ✅ IMPORTANT
          bookmarked={bookmarkedIds?.includes(post?.id)}
          onToggleBookmark={() => handleFeedBookmark(post)} // ✅ pass function directly
          onReport={handleOpenReport}
          isOwnPost={isOwnPost}
          onDelete={() => handleOwnPostDelete(post?.id)}
          onEdit={handleOwnPostEdit}
          type={"Post"}
        />

        <FlashList
          ref={flashListRef}
          data={isLoadingComments ? [] : mappedComments}
          renderItem={renderComment}
          keyExtractor={item => item?.id}
          keyboardShouldPersistTaps="handled" // ✅ ADD THIS
          keyboardDismissMode="interactive"
          onScroll={() => {
            // Close reaction popup on scroll
            if (reactionPopupVisible) {
              setReactionPopupVisible(false);
            }
          }}
          scrollEventThrottle={16}
          onEndReached={() => {
            if (!post?.id) return;

            const currentPage = commentsPageByPost?.[post.id] || 1;
            const hasMore = commentsHasMore?.[post.id];
            const isLoadingMore = commentsLoadingMore?.[post.id];

            if (!hasMore || isLoadingMore) return;

            dispatch(
              fetchCommentsByPost({
                postId: post.id,
                page: currentPage + 1,
              }),
            );
          }}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={
            <>
              {/* USER */}
              <View style={styles.postHeader}>
                <Avatar size={38} uri={post?.userAvatar} name={post?.userName} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('Profile', {
                        username: post?.user_name,
                      });
                    }}
                    style={styles.nameRow}
                  >
                    <Text
                      style={[
                        styles.username,
                        { color: isDark ? '#fff' : '#000' },
                      ]}
                    >
                      {post?.userName}
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.time}>{formatDate(post?.time)}</Text>
                </View>
              </View>

              {/* CAPTION */}
              <View style={{ paddingHorizontal: 14, marginBottom: 10 }}>
                <Text
                  style={[
                    styles.caption,
                    {
                      color: isDark ? '#fff' : '#000',
                      paddingHorizontal: 0,
                      marginBottom: 0,
                    },
                  ]}
                >
                  {displayedCaption
                    ?.split(/(\s+)/)
                    ?.map((word: string, index: number) => {
                      const isMention = word.startsWith('@');

                      const isHashtag = word.startsWith('#');

                      const isLink =
                        word.startsWith('http://') ||
                        word.startsWith('https://') ||
                        word.includes('.com');

                      // 🔥 MENTION
                      if (isMention) {
                        return (
                          <Text
                            key={index}
                            style={{
                              color: themeColors.primary,
                              fontFamily: Fonts.Bold,
                            }}
                            onPress={() => {
                              navigation.navigate('Profile', {
                                username: word.replace('@', ''),
                              });
                            }}
                          >
                            {word}
                          </Text>
                        );
                      }

                      // 🔥 HASHTAG
                      if (isHashtag) {
                        return (
                          <Text
                            key={index}
                            style={{
                              color: themeColors.primary,
                              fontFamily: Fonts.Medium,
                            }}
                          >
                            {word}
                          </Text>
                        );
                      }

                      // 🔥 LINK
                      // 🔥 LINK
                      if (isLink) {
                        return (
                          <Text
                            key={index}
                            style={{
                              color: themeColors.primary,
                              fontFamily: Fonts.Medium,
                            }}
                            onPress={async () => {
                              try {
                                let url = word.trim();

                                // Remove punctuation accidentally attached to the URL
                                url = url.replace(/[),.!?;:'"]+$/, '');

                                // Add https if protocol is missing
                                if (!/^https?:\/\//i.test(url)) {
                                  url = `https://${url}`;
                                }

                                console.log('Opening URL:', url);

                                await Linking.openURL(url);
                              } catch (error) {
                                console.log('Failed to open URL:', error);

                                Alert.alert(
                                  'Unable to open link',
                                  'Could not open this link on your device.',
                                );
                              }
                            }}
                          >
                            {word}
                          </Text>
                        );
                      }

                      return <Text key={index}>{word}</Text>;
                    })}
                </Text>

                {/* SEE MORE / SEE LESS */}
                {cleanCaption?.length > 185 && (
                  <TouchableOpacity
                    onPress={() => setExpandedCaption(prev => !prev)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: themeColors.primary,
                        fontSize: 13,
                        fontFamily: Fonts.SemiBold,
                        marginTop: 4,
                      }}
                    >
                      {expandedCaption ? 'Show less' : 'Show more'}
                    </Text>
                    <Ionicons
                      name={expandedCaption ? 'chevron-up' : 'chevron-down'}
                      size={14}
                      color={themeColors.primary}
                    />
                  </TouchableOpacity>
                )}


                {post?.link ? (
                  <TouchableOpacity
                    onPress={() => {
                      const url = post?.link || extractAllUrls(post?.caption);

                      if (url) {
                        Linking.openURL(url);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={{
                        color: themeColors.primary,
                        marginVertical: 8,
                      }}
                    >
                      {post.link}
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {linkPreviews.map((preview, index) => (
                  <TouchableOpacity
                    key={`${preview?._normalizedUrl}-${index}`}
                    activeOpacity={0.9}
                    style={styles.previewCard}
                    onPress={async () => {
                      const url = normalizeUrl(
                        preview?._normalizedUrl ||
                        preview?.url,
                      );

                      if (!url) return;

                      try {
                        const supported = await Linking.canOpenURL(url);

                        if (!supported) {
                          Alert.alert(
                            'Unable to open link',
                            'This link cannot be opened on your device.',
                          );
                          return;
                        }

                        await Linking.openURL(url);
                      } catch (error) {
                        console.log('Preview open error:', error);

                        Alert.alert(
                          'Unable to open link',
                          'Could not open this link on your device.',
                        );
                      }
                    }}
                  >
                    <FastImage
                      source={{
                        uri:
                          preview?.image?.url ||
                          preview?.logo?.url ||
                          'https://via.placeholder.com/120x120.png',
                      }}
                      style={styles.previewImage}
                      resizeMode={FastImage.resizeMode.cover}
                    />

                    <View style={styles.previewContent}>
                      {!!preview?.publisher && (
                        <Text
                          style={styles.previewSite}
                          numberOfLines={1}
                        >
                          {preview?.publisher}
                        </Text>
                      )}

                      {!!preview?.title && (
                        <Text
                          style={styles.previewTitle}
                          numberOfLines={2}
                        >
                          {preview?.title}
                        </Text>
                      )}

                      {!!preview?.description && (
                        <Text
                          style={styles.previewDesc}
                          numberOfLines={3}
                        >
                          {preview?.description}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {(postType === 'book' || postType === 'script') && (
                <View style={{ paddingHorizontal: 14, marginTop: 10 }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: themeColors.primary,
                      paddingVertical: 3,
                      paddingHorizontal: 16,
                      borderRadius: 6,
                      alignSelf: 'flex-start',
                      marginBottom: 10,
                    }}
                    activeOpacity={0.8}
                    onPress={handleReadPress}
                  >
                    <Text style={{ color: '#fff', fontFamily: Fonts.SemiBold }}>
                      {postType === 'book' ? 'Read Book' : 'Read Synopses'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {post?.tags?.length > 0 && (
                <View
                  style={{
                    flexDirection: 'row',
                    marginBottom: 10,
                    flexWrap: 'wrap',
                    paddingHorizontal: 14,
                    gap: 6,
                  }}
                >
                  {post?.tags.map((tag: any, index: any) => (
                    <TagChip key={`${tag}-${index}`} label={tag} />
                  ))}
                </View>
              )}

              {/* MEDIA */}
              {selectedPost?.data?.platform && selectedPost?.data?.link ? (
                <EmbeddedMedia
                  platform={selectedPost.data.platform}
                  link={selectedPost.data.link}
                  image={selectedPost.data.image}
                  height={260}
                />
              ) : post?.media?.length > 0 ? (
                <PostCarousel media={post?.media} isVisible={true} />
              ) : null}

              {/* ACTIONS */}
              <View style={styles.actions}>
                <View style={styles.leftActions}>
                  <View style={{ position: 'relative' }}>
                    {/* REACTION POPUP */}
                    {reactionPopupVisible && (
                      <>
                        <Pressable
                          style={styles.reactionOverlay}
                          onPress={() => setReactionPopupVisible(false)}
                        />
                        <View style={styles.reactionPopup}>
                          {reactions.map(item => (
                            <Pressable
                              key={item.id}
                              onPress={() => {
                                submitReaction(item.id as ReactionType);
                                setReactionPopupVisible(false);
                              }}
                              style={styles.reactionItem}
                            >
                              <FastImage
                                source={item.active}
                                style={styles.reactionImage}
                              />
                            </Pressable>
                          ))}
                        </View>
                      </>
                    )}

                    <TouchableOpacity
                      style={styles.iconRow}
                      delayLongPress={180}
                      onLongPress={() => {
                        // Close any other popup first
                        setReactionPopupVisible(true);
                        handleLongPress();
                      }}
                      onPress={() => {
                        if (!isLikedFinal) {
                          animateLike();
                          animateParticles();

                          // ✅ normal click = heart like
                          handleFeedLike(post?.id, 'Heart');
                        } else {
                          // ✅ unlike
                          handleFeedLike(post?.id);
                        }
                      }}
                    >
                      <View
                        style={{
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <LikeParticles particleAnims={particleAnims} />

                        <Animated.View
                          style={{
                            transform: [{ scale: likeScale }],
                            zIndex: 2,
                          }}
                        >
                          {isLikedFinal ? (
                            <FastImage
                              source={getReactionAsset(selectedReaction)}
                              style={{
                                width: 26,
                                height: 26,
                              }}
                            />
                          ) : (
                            <Heart size={26} color={isDark ? '#fff' : '#000'} />
                          )}
                        </Animated.View>
                      </View>

                      <Text style={styles.countText}>
                        {(selectedPost?.data?.likes_count || 0) +
                          (likedIds?.includes(post?.id)
                            ? selectedPost?.data?.isLiked
                              ? 0
                              : 1
                            : selectedPost?.data?.isLiked
                              ? -1
                              : 0)}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity style={styles.iconRow} onPress={() => {
                    setSelectedRepostPost(selectedPost?.data);
                    setRepostVisible(true);
                  }}>

                    <Repost size={24} color={isDark ? '#fff' : '#000'} />
                    <Text style={styles.countText}>{selectedPost?.data?.reposted_count}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.iconRow}
                    onPress={() => handleShare()}
                  >
                    <Share size={24} color={isDark ? '#fff' : '#000'} />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          }
          contentContainerStyle={{
            paddingBottom: keyboardHeight > 0 ? keyboardHeight + 100 : 120,
          }}
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>
      <ReportModal
        visible={reportVisible}
        post={post}
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

export default SinglePostDetails;

const styles = StyleSheet.create({
  container: { flex: 1 },

  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  username: {
    fontFamily: Fonts.Bold,
    fontSize: 18,
  },

  time: {
    fontSize: 12,
    color: '#777',
  },

  caption: {
    paddingHorizontal: 14,
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 20,
  },

  captionUser: {
    fontFamily: Fonts.Bold,
  },

  postImage: {
    width: '100%',
    height: 420,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginTop: 10,
  },

  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  countText: {
    fontSize: 14,
    color: '#777',
  },

  commentTitle: {
    fontSize: 16,
    fontFamily: Fonts.Bold,
    paddingHorizontal: 14,
    marginTop: 16,
  },

  commentRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  commentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
  },

  commentUser: {
    fontFamily: Fonts.Bold,
    fontSize: 14,
  },

  commentText: {
    fontSize: 13,
  },

  likeColumn: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  likeCount: {
    fontSize: 11,
    color: '#777',
    fontFamily: Fonts.Bold,
  },

  commentContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },

  inputAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 10,
  },

  linkedinInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 14,
    height: 40,
  },

  input: {
    flex: 1,
    fontSize: 14,
    marginRight: 8,
  },

  particleContainer: {
    position: 'absolute',
    top: -12,
    left: -12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },

  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    fontSize: 14,
    fontFamily: Fonts.SemiBold,
  },

  reactionPopup: {
    position: 'absolute',
    bottom: 45,
    left: -10,
    flexDirection: 'row',
    backgroundColor: '#1c1c1e',
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 8,
    zIndex: 999,
    elevation: 10,
  },

  reactionItem: {
    marginHorizontal: 4,
  },

  reactionImage: {
    width: 34,
    height: 34,
  },

  previewCard: {
    flexDirection: 'row',
    alignItems: "center",
    marginTop: 14,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A2F3A',
    backgroundColor: '#0F1117',
  },

  previewImage: {
    width: 80,
    height: 80,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    backgroundColor: '#1A1D26',
  },

  previewContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    justifyContent: 'center',
  },

  previewSite: {
    color: '#777',
    fontSize: 12,
    marginBottom: 6,
    fontFamily: Fonts.Medium,
  },

  previewTitle: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Fonts.Bold,
  },

  previewDesc: {
    color: '#999',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
    fontFamily: Fonts.Regular,
  },

  reactionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
    backgroundColor: 'transparent',
  },
});
