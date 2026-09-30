// RepostDetails.tsx

import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-native';

import AuthHeader from '../../components/Header/AuthHeader';
import PostCard from '../../components/Post/PostCard';
import PostDetailsSkeleton from '../../components/Post/PostDetailsSkeleton';
import PostMenu from '../../components/Post/PostMenu';
import ReportModal from '../../components/Modals/ReportModal';

import {
    clearSelectedPost,
    getPostByIdThunk,
    updateReportedPostLocal,
} from '../../redux/slices/feedSlice';

import { themeColors } from '../../theme/colors';
import { useFeedLike } from '../../hooks/feed/useFeedLike';
import { useFeedBookmark } from '../../hooks/feed/useFeedBookmark';
import { useShare } from '../../hooks/useShare';
import { useToast } from '../Toast/ToastProvider';
import { ReactionType } from '../../hooks/usePostReaction';
import RepostModal from '../Modals/RepostModal';
import { deletePost, repostPost } from '../../redux/slices/postSlice';
import { createReport, getReports } from '../../redux/slices/reportSlice';
import NotFoundScreen from '../../screens/NotFoundScreen';

const RepostDetails = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const dispatch = useDispatch<any>();
    const { show } = useToast();
    const { postId } = route.params;

    const { selectedPost, loading } = useSelector(
        (state: any) => state.feed,
    );

    const { handleFeedLike } = useFeedLike();
    const { handleFeedBookmark } = useFeedBookmark();
    const { handleShare } = useShare({});

    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 20, y: 0 });
    const [activePost, setActivePost] = useState<any>(null);

    const [repostVisible, setRepostVisible] = useState(false);
    const [selectedRepostPost, setSelectedRepostPost] = useState<any>(null);

    const [reportVisible, setReportVisible] = useState(false);

    // 👇 Add this state for reaction popup
    const [reactionPopupVisible, setReactionPopupVisible] = useState(false);
    const [activeReactionPostId, setActiveReactionPostId] = useState<string | null>(null);

    const { bookmarkedIds: feedBookMark, likedIds, reactionMap, likeCountMap } =
        useSelector((state: any) => state.actions);

    const { reports } = useSelector((state: any) => state.report);
    const { user: authUser } = useSelector((state: any) => state.auth);

    // Check if current user owns the post
    const isOwnPost = useMemo(
        () => authUser?.id === selectedPost?.data?.user?.id,
        [authUser?.id, selectedPost?.data?.user?.id],
    );

    const openMenu = (event: any, post: any) => {
        const { pageY } = event.nativeEvent;

        setMenuPosition({
            x: 20,
            y: pageY,
        });

        setActivePost(post);
        setMenuVisible(true);
    };

    // ✅ Close reaction popup when navigating away
    useFocusEffect(
        useCallback(() => {
            return () => {
                setReactionPopupVisible(false);
                setActiveReactionPostId(null);
            };
        }, [])
    );

    useFocusEffect(
        useCallback(() => {
            dispatch(clearSelectedPost());
            dispatch(getPostByIdThunk(postId));

            return () => {
                dispatch(clearSelectedPost());
                setReactionPopupVisible(false);
                setActiveReactionPostId(null);
            };
        }, [postId]),
    );

    // ✅ Handle scroll to close reaction popup
    const handleScroll = () => {
        if (reactionPopupVisible) {
            setReactionPopupVisible(false);
            setActiveReactionPostId(null);
        }
    };

    // ================= REPORT HANDLERS =================

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
                reported_user_id: activePost?.userId || activePost?.user?.id,
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

    // ================= DELETE HANDLER =================

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

                    setMenuVisible(false);
                    setActivePost(null);

                    navigation.goBack();

                    show({
                        type: 'success',
                        title: 'Post deleted successfully',
                    });
                },
            },
        ]);
    };

    // ================= EDIT HANDLER =================

    const handleOwnPostEdit = () => {
        navigation.navigate('AddPost', {
            post: selectedPost?.data,
        });
        setMenuVisible(false);
    };

    // ================= REPOST HANDLERS =================

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

    if (loading) {
        return (
            <SafeAreaView
                style={{
                    flex: 1,
                    backgroundColor: themeColors.black,
                }}>
                <AuthHeader
                    title=""
                    showBack
                    onBack={() => navigation.goBack()}
                />

                <PostDetailsSkeleton />
            </SafeAreaView>
        );
    }

    if (!selectedPost?.data) {
        return (
            <SafeAreaView
                style={{
                    flex: 1,
                    backgroundColor: themeColors.black,
                }}>
                <AuthHeader
                    title=""
                    showBack
                    onBack={() => navigation.goBack()}
                />

                <NotFoundScreen
                    title="Post Not Found"
                    description="The repost you're looking for doesn't exist or may have been removed."
                    icon="document-text-outline"
                    showButton={false}
                />
            </SafeAreaView>
        );
    }

    const post = selectedPost.data;

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: themeColors.black,
            }}>
            <AuthHeader
                title=""
                showBack
                onBack={() => navigation.goBack()}
            />

            <FlashList
                data={[post]}
                keyExtractor={(item) => item.id}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                renderItem={({ item }) => {
                    // ✅ FIXED: a repost-with-thought (has its own story/caption)
                    // must NOT be treated the same as a plain/instant repost.
                    const isThoughtRepost =
                        item.isRepost === 1 &&
                        !!item.story &&
                        item.story.trim().length > 0;

                    // content (media/tags/link/etc.) still comes from the
                    // original post whenever this is a repost — reposts don't
                    // carry their own media.
                    const contentPost =
                        item.isRepost === 1 && item.original_post
                            ? item.original_post
                            : item;

                    // ✅ actions (like/bookmark/repost) should target the
                    // thought-repost itself when it has its own commentary,
                    // and only fall back to the original post for a plain
                    // instant repost.
                    const actionPost = isThoughtRepost ? item : contentPost;

                    const postId = String(actionPost?.id);
                    const isReactionOpen = activeReactionPostId === postId;

                    return (
                        <PostCard
                            id={item.id}
                            userName={item.user?.name}
                            userAvatar={item.user?.profile_photo_path}
                            time={item.createdAt}
                            caption={item.story}

                            media={(contentPost.medias || []).map((m: any) => ({
                                type: m.mediable_type === 'video' ? 'video' : 'image',
                                url: m.image,
                            }))}

                            link={contentPost.link}
                            platform={contentPost.platform}
                            image={contentPost.image}

                            comments={contentPost.comments_count}

                            postType={contentPost.type}

                            isRepost={item.isRepost === 1}
                            repostedUser={item.reposted_user}
                            originalPost={item.original_post}

                            tags={contentPost.tags?.map((t: any) => t.name)}

                            isReported={contentPost.isReported === 1}

                            liked={likedIds?.includes(actionPost?.id)}

                            likeCount={
                                likeCountMap?.hasOwnProperty(actionPost?.id)
                                    ? likeCountMap[actionPost.id]
                                    : actionPost.likes_count
                            }

                            repostCount={actionPost.reposted_count}

                            bookmarked={
                                feedBookMark.includes(actionPost.id) ||
                                actionPost.isWishlisted === 1
                            }

                            emoji_type={
                                likedIds?.includes(actionPost.id)
                                    ? reactionMap?.[actionPost.id] || actionPost.emoji_type
                                    : null
                            }

                            onReactionSelect={(reaction: ReactionType) => {
                                handleFeedLike(actionPost, reaction || undefined);
                                setReactionPopupVisible(false);
                                setActiveReactionPostId(null);
                            }}
                            onLike={() =>
                                handleFeedLike(
                                    actionPost,
                                    reactionMap?.[actionPost.id] ||
                                    actionPost.emoji_type ||
                                    'heart',
                                )
                            }

                            onBookmark={() => handleFeedBookmark(actionPost)}

                            onRepostPress={() => {
                                setSelectedRepostPost(actionPost);
                                setRepostVisible(true);
                            }}

                            onMenuPress={e => openMenu(e, item)}

                            onShare={handleShare}

                            onProfilepPress={() => {
                                navigation.navigate('Profile', {
                                    username: item?.user?.user_name,
                                });
                            }}

                            isVisible

                            // 👇 Reaction popup props
                            reactionPopupVisible={isReactionOpen}
                            onOpenReaction={() => {
                                setActiveReactionPostId(postId);
                                setReactionPopupVisible(true);
                            }}
                            onCloseReaction={() => {
                                setActiveReactionPostId(null);
                                setReactionPopupVisible(false);
                            }}
                        />
                    )
                }}
            />

            {/* ✅ Post Menu */}
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

            {/* ✅ Report Modal */}
            <ReportModal
                visible={reportVisible}
                post={activePost}
                onClose={() => setReportVisible(false)}
                onSubmit={handleReport}
                reportType="POST"
            />

            {/* ✅ Repost Modal */}
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

export default RepostDetails;