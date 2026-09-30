import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FlatList, View, Dimensions, Text, Alert } from 'react-native';
import PostCard from '../../../components/Post/PostCard';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useToast } from '../../../components/Toast/ToastProvider';

import { fetchBookmarks } from '../../../redux/slices/bookmarkSlice';

import PostSkeleton from '../../../components/Post/PostSkeleton';
import PostMenu from '../../../components/Post/PostMenu';
import ReportModal from '../../../components/Modals/ReportModal';
import CommentSheet from '../../../components/Comments/CommentSheet';

import { deletePost, repostPost } from '../../../redux/slices/postSlice';
import { createReport, getReports } from '../../../redux/slices/reportSlice';

// ✅ HOOK
import { usePostActions } from '../../../hooks/usePostActions';
import { fetchCommentsByPost } from '../../../redux/slices/feedSlice';
import { ReactionType } from '../../../hooks/usePostReaction';
import { Fonts } from '../../../constants/Fonts';
import { themeColors } from '../../../theme/colors';
import NoBookMark from '../../../assets/SVG/NoBookMark';
import RepostModal from '../../../components/Modals/RepostModal';
import { useShare } from '../../../hooks/useShare';

const SCREEN_WIDTH = Dimensions.get('window').width;

const PostsTab = () => {
  const dispatch = useDispatch<any>();
  const navigation = useNavigation<any>();
  const { show } = useToast();
  const { handleShare } = useShare({}); // ✅ FIXED
  const onEndReachedCalledDuringMomentum = useRef(false);

  const [refreshing, setRefreshing] = useState(false);
  const [commentVisible, setCommentVisible] = useState(false);
  const [activePost, setActivePost] = useState<any>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 4, y: 0 });
  const [reportVisible, setReportVisible] = useState(false);
  const [repostVisible, setRepostVisible] = useState(false);
  const [selectedRepostPost, setSelectedRepostPost] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const [activeReactionPostId, setActiveReactionPostId] = useState<string | null>(null);

  const { posts, loading, page, hasMore } = useSelector(
    (state: any) => state.bookmarks,
  );
  const [localData, setLocalData] = useState(posts || []);
  useEffect(() => {
    setLocalData(posts || []);
  }, [posts]);
  const currentPage = page.post;
  const hasMorePosts = hasMore.post;

  const { reports } = useSelector((state: any) => state.report);
  const { user: authUser } = useSelector((state: any) => state.auth);

  // ✅ USE HOOK (Redux mode)
  const { handleLike, handleBookmark } = usePostActions({
    data: localData,
    setData: setLocalData,
  });

  useFocusEffect(
    useCallback(() => {
      return () => {
        setActiveReactionPostId(null);
      };
    }, [])
  );

  // ✅ Handle scroll to close reaction popup
  const handleScroll = () => {
    if (activeReactionPostId) {
      setActiveReactionPostId(null);
    }
  };

  // ================= FETCH =================
  useFocusEffect(
    useCallback(() => {
      const loadPosts = async () => {
        setInitialLoading(true);

        try {
          await dispatch(
            fetchBookmarks({
              page: 1,
              type: 'post',
            }),
          );
        } finally {
          setInitialLoading(false);
        }
      };

      loadPosts();

      return () => { };
    }, [dispatch]),
  );

  const onRefresh = async () => {
    try {
      setRefreshing(true);

      await dispatch(fetchBookmarks({ page: 1, type: 'post' }));
    } finally {
      setRefreshing(false);
    }
  };

  const loadMore = () => {
    if (loading || !hasMorePosts) return;
    dispatch(fetchBookmarks({ page: currentPage + 1, type: 'post' }));
  };

  // ================= FOOTER =================

  const renderFooter = () => {
    if (loading && currentPage > 1) {
      return (
        <View style={{ paddingVertical: 20 }}>
          <PostSkeleton />
        </View>
      );
    }

    if (!hasMorePosts && posts?.length > 0) {
      return (
        <Text
          style={{
            textAlign: 'center',
            padding: 20,
            opacity: 0.6,
            color: themeColors.white, // 🔥 FIX: no color = invisible on black background
            fontFamily: Fonts.Regular,
          }}
        >
          🎉 You've reached the end
        </Text>
      );
    }

    return null;
  };

  // ================= MENU =================

  const openMenu = useCallback((event: any, post: any) => {
    const { pageY } = event.nativeEvent;
    setMenuPosition({ x: 20, y: pageY });
    setActivePost(post);
    setMenuVisible(true);
  }, []);

  const isOwnPost = useMemo(() => {
    return Boolean(String(authUser?.id) === String(activePost?.user?.id));
  }, [authUser?.id, activePost?.user?.id]);

  // ================= REPORT =================

  const handleOpenReport = async () => {
    try {
      if (!reports || reports.length === 0) {
        await dispatch(getReports());
      }
      setMenuVisible(false);
      setReportVisible(true);
    } catch {
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
        reported_user_id: activePost?.userId,
      };

      const res: any = await dispatch(createReport(payload));

      if (res?.meta?.requestStatus !== 'fulfilled') {
        throw new Error();
      }

      show({ type: 'success', title: 'Report submitted' });
      setReportVisible(false);
    } catch {
      show({ type: 'error', title: 'Something went wrong' });
    }
  };

  // ================= DELETE =================

  const handleOwnPostDelete = (id: any) => {
    if (!id) return;

    Alert.alert('Delete Post', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const res: any = await dispatch(deletePost(id));

          if (res?.meta?.requestStatus !== 'fulfilled') {
            show({ type: 'error', title: 'Delete failed' });
            return;
          }

          setMenuVisible(false);
          setActivePost(null);

          show({ type: 'success', title: 'Post deleted successfully' });
        },
      },
    ]);
  };

  const handleOwnPostEdit = () => {
    navigation.navigate('AddPost', { post: activePost });
  };

  const refreshBookmarks = async () => {
    await dispatch(fetchBookmarks({ page: 1, type: 'post' }));
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

      await refreshBookmarks();

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

      await refreshBookmarks();

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
          Oops! No Saved Posts Found
        </Text>
        <Text style={{ color: themeColors.gray, fontFamily: Fonts.Regular }}>
          You haven't saved any posts yet.
        </Text>
      </View>
    );
  };

  // ================= RENDER =================

  return (
    <>
      <View style={{ width: SCREEN_WIDTH, flex: 1, marginTop: 10 }}>
        {initialLoading ? (
          <View>
            {[1, 2, 3, 4].map(item => (
              <PostSkeleton key={item} />
            ))}
          </View>
        ) : (
          <FlatList
            data={localData}
            keyExtractor={item => item.id}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onEndReachedThreshold={0.6}

            onEndReached={() => {
              if (!onEndReachedCalledDuringMomentum.current) {
                loadMore();
                onEndReachedCalledDuringMomentum.current = true;
              }
            }}
            onMomentumScrollBegin={() => {
              onEndReachedCalledDuringMomentum.current = false;
            }}
            renderItem={({ item }) => {
              const post = item?.synopsis;

              // ✅ CHECK REPOST
              const isRepost = !!post?.reposted_synopsis_id;

              // ✅ ORIGINAL POST
              const originalPost = isRepost ? post?.original_post : null;

              // ✅ DISPLAY POST
              const displayPost = isRepost ? originalPost : post;
              const isThoughtRepost =
                isRepost && post?.story && post?.story?.trim()?.length > 0;

              // ✅ MEDIA
              let mediaArr: any[] = [];

              if (
                Array.isArray(displayPost?.medias) &&
                displayPost?.medias.length > 0
              ) {
                mediaArr = displayPost.medias.map((m: any) => ({
                  type: 'image',
                  url: m?.image,
                }));
              } else if (displayPost?.image) {
                mediaArr = [
                  {
                    type: 'image',
                    url: displayPost?.image,
                  },
                ];
              }

              const postId = String(post?.id);
              const isReactionOpen = activeReactionPostId === postId;

              const postType =
                item?.postType ||
                item?.postType ||
                item?.type ||
                item?.type ||
                'normal';

              console.log("item", post)

              return (
                <PostCard
                  id={post?.id}
                  userName={post?.user?.name}
                  user_name={post?.user?.user_name}
                  userAvatar={post?.user?.profile_photo_path}
                  time={post?.createdAt}
                  caption={
                    isThoughtRepost
                      ? post?.story
                      : !isRepost
                        ? displayPost?.story
                        : ''
                  }
                  media={!isRepost ? mediaArr : []}
                  comments={displayPost?.comments_count}
                  likeCount={displayPost?.likes_count}
                  repostCount={displayPost?.reposted_count}
                  isRepost={isRepost}
                  repostedUser={isRepost ? post?.reposted_user : null}
                  originalPost={isRepost ? originalPost : null}
                  liked={post?.isLiked === 1}
                  bookmarked={post?.isWishlisted === 1}
                  emoji_type={post?.emoji_type}
                  onCommentPress={() => {
                    setActivePost(post);
                    setCommentVisible(true);

                    dispatch(fetchCommentsByPost(post?.id));
                  }}
                  onLike={() =>
                    handleLike(post?.id, post, post?.emoji_type || 'heart')
                  }
                  onReactionSelect={(reaction: any) => {
                    handleLike(post?.id, post, reaction);
                  }}
                  onBookmark={async () => {
                    // ✅ CALL API
                    await handleBookmark(post);

                    // ✅ REMOVE FROM LOCAL LIST
                    setLocalData((prev: any[]) =>
                      prev.filter((x: any) => x?.synopsis?.id !== post?.id),
                    );
                  }}
                  onMenuPress={e => openMenu(e, post)}
                  onPress={() =>
                    navigation.navigate('SinglePostDetailes', {
                      postId: post?.id,
                    })
                  }
                  onProfilepPress={() =>
                    navigation.navigate('Profile', {
                      username: post?.user?.user_name,
                    })
                  }
                  onRepostPress={() => {
                    setSelectedRepostPost({
                      ...post,

                      userName: post?.user?.name,
                      userAvatar: post?.user?.profile_photo_path,

                      caption: post?.story || "",

                      media:
                        post?.medias?.map((m: any) => ({
                          type: 'image',
                          url: m?.image,
                        })) || [],

                      originalPost: post?.original_post
                        ? {
                          ...post.original_post,

                          user: {
                            ...post.original_post.user,
                          },

                          story: post.original_post.story,

                          image:
                            post.original_post.image ||
                            post.original_post.medias?.[0]?.image,
                        }
                        : null,
                    });

                    setRepostVisible(true);
                  }}
                  reactionPopupVisible={isReactionOpen}
                  onOpenReaction={() => {
                    setActiveReactionPostId(postId);
                  }}
                  onCloseReaction={() => {
                    setActiveReactionPostId(null);
                  }}
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
                      username: post?.user?.user_name,
                    });
                  }}
                />
              );
            }}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>

      {/* MENU */}
      <PostMenu
        visible={menuVisible}
        x={menuPosition.x}
        y={menuPosition.y}
        onClose={() => setMenuVisible(false)}
        onReport={handleOpenReport}
        isReported={activePost?.isReported}
        onEdit={handleOwnPostEdit}
        isOwnPost={!!isOwnPost}
        onDelete={() => handleOwnPostDelete(activePost?.id)}
      />

      {/* REPORT */}
      <ReportModal
        visible={reportVisible}
        post={activePost}
        onClose={() => setReportVisible(false)}
        onSubmit={handleReport}
        reportType="POST"
      />

      {/* COMMENTS */}
      <CommentSheet
        visible={commentVisible}
        post={activePost}
        onClose={() => setCommentVisible(false)}
      />

      <RepostModal
        visible={repostVisible}
        post={selectedRepostPost}
        onClose={() => setRepostVisible(false)}
        onInstantRepost={handleInstantRepost}
        onThoughtsRepost={handleRepostWithThoughts}
      />
    </>
  );
};

export default PostsTab;
