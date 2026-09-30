import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, Text } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import PostCard from '../../../../components/Post/PostCard';
import PostMenu from '../../../../components/Post/PostMenu';
import ReportModal from '../../../../components/Modals/ReportModal';
import CommentSheet from '../../../../components/Comments/CommentSheet';

import { deletePost, repostPost } from '../../../../redux/slices/postSlice';
import { createReport, getReports } from '../../../../redux/slices/reportSlice';
import { useToast } from '../../../../components/Toast/ToastProvider';

// ✅ HOOK
import { usePostActions } from '../../../../hooks/usePostActions';
import { fetchCommentsByPost } from '../../../../redux/slices/feedSlice';
import { ReactionType } from '../../../../hooks/usePostReaction';
import { Fonts } from '../../../../constants/Fonts';
import NoBookMark from '../../../../assets/SVG/NoBookMark';
import { themeColors } from '../../../../theme/colors';
import Opps from '../../../../assets/SVG/Opps';
import RepostModal from '../../../../components/Modals/RepostModal';
import api from '../../../../../Instance/Instance';
import EditThoughtModal from '../../../../components/Modals/EditThoughtModal';
import { useShare } from '../../../../hooks/useShare';

type Props = {
  data?: any[];
  loadMore?: any;
  refreshPosts?: () => Promise<void> | void;
  isLoading?: boolean;
  hasMore?: boolean;
  onEndReached?: () => void;
};

const PostTab = ({ data, loadMore, refreshPosts, isLoading = false,
  hasMore = true,
  onEndReached }: Props) => {
  const isDark = true;
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const { show } = useToast();
  const { handleShare } = useShare({});
  const [localData, setLocalData] = useState(data || []);
  const [loading, setLoading] = useState(false);
  const [commentVisible, setCommentVisible] = useState(false);
  const [activePost, setActivePost] = useState<any>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 4, y: 0 });
  const [reportVisible, setReportVisible] = useState(false);
  const [repostVisible, setRepostVisible] = useState(false);
  const [selectedRepostPost, setSelectedRepostPost] = useState<any>(null);

  const [editThoughtVisible, setEditThoughtVisible] = useState(false);
  const [editingThoughtPost, setEditingThoughtPost] = useState<any>(null);
  const [activeReactionPostId, setActiveReactionPostId] = useState<string | null>(null);

  const { reports } = useSelector((state: any) => state.report);
  const { user: authUser } = useSelector((state: any) => state.auth);

  // ✅ USE HOOK WITH LOCAL STATE
  const { handleLike, handleBookmark } = usePostActions({
    data: localData,
    setData: setLocalData,
  });

  // ✅ Sync props → local
  useEffect(() => {
    setLocalData(data || []);
  }, [data]);

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

  // ================= MENU =================

  const openMenu = useCallback((event: any, post: any) => {
    const { pageY } = event.nativeEvent;
    setMenuPosition({ x: 20, y: pageY });
    setActivePost(post);
    setMenuVisible(true);
  }, []);

  const isOwnPost = useMemo(
    () => authUser?.id === activePost?.user?.id,
    [authUser?.id, activePost?.user?.id],
  );

  // ================= REPORT =================

  const handleOpenReport = async () => {
    try {
      if (!reports || reports.length === 0) {
        await dispatch(getReports());
      }
      setMenuVisible(false);
      setReportVisible(true);
    } catch {
      show({ type: 'error', title: 'Failed to load report options' });
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

      show({
        type: 'success',
        title: 'Report submitted',
      });

      setLocalData(prev =>
        prev.map(post =>
          post.id === activePost.id
            ? {
              ...post,
              isReported: 1,
            }
            : post,
        ),
      );

      setReportVisible(false);
      setMenuVisible(false);
      setActivePost(null);
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
          await refreshPosts?.();
          show({ type: 'success', title: 'Post deleted' });
        },
      },
    ]);
  };

  const handleOwnPostEdit = () => {
    if (!activePost) return;

    // Any repost (instant or thought repost)
    if (activePost?.isRepost === 1) {
      setEditingThoughtPost(activePost);
      setEditThoughtVisible(true);
      setMenuVisible(false);
      return;
    }

    navigation.navigate('AddPost', {
      post: activePost,
    });

    setMenuVisible(false);
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
      await refreshPosts?.();

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
      await refreshPosts?.();

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

  const handleUpdateThought = async (story: string) => {
    try {
      const payload = {
        synopsis_id: editingThoughtPost?.id,
        story,
      };

      const res = await api.put('/content/repost/update', payload);

      show({
        type: 'success',
        title: res?.data?.message || 'Thought updated',
      });

      setEditThoughtVisible(false);
      setEditingThoughtPost(null);

      await refreshPosts?.();
    } catch (error: any) {
      show({
        type: 'error',
        title: error?.response?.data?.message || 'Failed to update thought',
      });
    }
  };

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={{ alignItems: 'center', marginTop: 100, flex: 1 }}>
        <Opps width={80} height={80} />
        <Text
          style={{
            color: themeColors.primary,
            marginTop: 15,
            fontFamily: Fonts.Bold,
            fontSize: 18,
          }}
        >
          Oops! No Posts Found
        </Text>
      </View>
    );
  };

  // ================= RENDER =================

  return (
    <>
      <View style={styles.container}>
        <FlatList
          nestedScrollEnabled
          data={localData} // ✅ FIXED
          ListEmptyComponent={renderEmpty}
          keyExtractor={(item: any) => item?.id?.toString()}
          onEndReached={() => {
            if (hasMore && !isLoading) {
              loadMore?.();
            }
          }}
          onEndReachedThreshold={0.3}
          onScroll={handleScroll} // 👈 Add this
          scrollEventThrottle={16} // 👈 Add this
          renderItem={({ item }) => {
            const post = item;

            console.log("post data", post?.type)

            const isThoughtRepost =
              post?.isRepost === 1 &&
              post?.story &&
              post?.story?.trim().length > 0;

            const isSimpleRepost =
              post?.isRepost === 1 &&
              (!post?.story || post?.story?.trim().length === 0);

            const actionPost =
              post?.isRepost === 1 && !isThoughtRepost
                ? post?.original_post
                : post;

            let mediaArr: any[] = [];

            // ❌ DO NOT LOAD MEDIA FOR REPOSTS
            if (post?.isRepost !== 1) {
              if (Array.isArray(post?.medias) && post?.medias?.length > 0) {
                mediaArr = post?.medias?.map((m: any) => ({
                  type: 'image',
                  url: m?.image,
                }));
              } else if (post?.image) {
                mediaArr = [
                  {
                    type: 'image',
                    url: post?.image,
                  },
                ];
              }
            }

            const repostCount =
              actionPost?.reposted_count || post?.reposted_count || 0;

            const likeCount = actionPost?.likes_count || post?.likes_count || 0;
            const postId = String(post?.id);
            const isReactionOpen = activeReactionPostId === postId;

            // 🔥 FIX: Use postType from the data structure
            const postType =
              post?.postType ||
              actionPost?.postType ||
              actionPost?.type ||
              post?.type ||
              'normal';

            return (
              <PostCard
                id={post?.id}
                userName={post?.user?.name}
                user_name={post?.user?.user_name}
                userAvatar={post?.user?.profile_photo_path}
                caption={isSimpleRepost ? '' : post?.title || post?.story || ''}
                media={mediaArr}
                // ✅ EMBEDDED MEDIA
                platform={post?.platform}
                link={post?.link}
                image={post?.image}
                isVisible={true}
                comments={
                  actionPost?.comments_count || post?.comments_count || 0
                }
                postType={post?.type}
                time={post?.createdAt}
                likeCount={likeCount}
                repostCount={repostCount}
                liked={actionPost?.isLiked === 1}
                bookmarked={actionPost?.isWishlisted === 1}
                isRepost={post?.isRepost === 1}
                repostedUser={post?.reposted_user}
                originalPost={post?.isRepost === 1 ? post?.original_post : null}
                onCommentPress={() => {
                  setActivePost(actionPost);
                  setCommentVisible(true);

                  dispatch(fetchCommentsByPost(actionPost?.id));
                }}
                onReactionSelect={(reaction: ReactionType) => {
                  handleLike(actionPost?.id, actionPost, reaction || '');
                }}
                onLike={() => {
                  handleLike(
                    actionPost?.id,
                    actionPost,
                    actionPost?.emoji_type,
                  );
                }}
                emoji_type={actionPost?.emoji_type}
                onBookmark={() => handleBookmark(actionPost)}
                onMenuPress={e => openMenu(e, post)}
                onPress={() =>
                  navigation.navigate('SinglePostDetailes', {
                    postId: actionPost?.id,
                  })
                }
                onProfilepPress={() =>
                  navigation.navigate('Profile', {
                    username: actionPost?.user?.user_name,
                  })
                }
                onRepostPress={() => {
                  setSelectedRepostPost({
                    ...actionPost,

                    userName: actionPost?.user?.name,
                    userAvatar: actionPost?.user?.profile_photo_path,

                    caption: actionPost?.story,

                    media:
                      actionPost?.medias?.map((m: any) => ({
                        type: 'image',
                        url: m?.image,
                      })) || [],

                    originalPost: actionPost?.original_post
                      ? {
                        ...actionPost.original_post,

                        user: {
                          ...actionPost.original_post.user,
                        },

                        story: actionPost.original_post.story,

                        image:
                          actionPost.original_post.image ||
                          actionPost.original_post.medias?.[0]?.image,
                      }
                      : null,
                  });

                  setRepostVisible(true);
                }}
                isReported={post?.isReported}
                reactionPopupVisible={isReactionOpen}
                onOpenReaction={() => {
                  setActiveReactionPostId(postId);
                }}
                onCloseReaction={() => {
                  setActiveReactionPostId(null);
                }}
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
                    username: post?.user?.user_name,
                  });
                }}
              />
            );
          }}
        />
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
        isOwnPost={isOwnPost}
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

      <EditThoughtModal
        visible={editThoughtVisible}
        initialValue={editingThoughtPost?.story || ''}
        onClose={() => {
          setEditThoughtVisible(false);
          setEditingThoughtPost(null);
        }}
        onUpdate={handleUpdateThought}
      />
    </>
  );
};

export default PostTab;

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
});
