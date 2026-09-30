import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBookmarks,
  resetBookmarksByType,
} from '../../../redux/slices/bookmarkSlice';
import CardSkeleton from '../../../components/Cards/CardSkeleton';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  likeAction,
  setInitialBookmarks,
  setInitialLikes,
  setInitialReactions,
  toggleBookmarkLocal,
  toggleLikeLocal,
  wishlistAction,
} from '../../../redux/slices/actionSlice';
import { updateLikeCount } from '../../../redux/slices/bookSlice';
import { useToast } from '../../../components/Toast/ToastProvider';
import VisionXCard from '../../VisionX/components/cards/VisionXCard';
import VisionCard from '../../VisionX/components/cards/VisionCard';
import { useHandleLike } from '../../../hooks/useHandleLike';
import { ReactionType } from '../../../hooks/useEmojiReaction';
import PostMenu from '../../../components/Post/PostMenu';
import ReportModal from '../../../components/Modals/ReportModal';
import { createReport, getReports } from '../../../redux/slices/reportSlice';
import { themeColors } from '../../../theme/colors';
import NoBookMark from '../../../assets/SVG/NoBookMark';
import { Fonts } from '../../../constants/Fonts';
import { useShare } from '../../../hooks/useShare';

const { width } = Dimensions.get('window');

const CARD_MARGIN = 10;
const CARD_WIDTH = (width - CARD_MARGIN * 2.5) / 2;

const VisionXTabs = () => {
  const dispatch = useDispatch<any>();
  const navigation = useNavigation<any>();
  const { show } = useToast();
  const { handleShare } = useShare({}); // ✅ FIXED
  const onEndReachedCalledDuringMomentum = useRef(false);
  const [refreshing, setRefreshing] = useState(false);
  // const [activeIndex, setActiveIndex] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({
    x: 20,
    y: 0,
  });
  const [activePost, setActivePost] = useState<any>(null);
  const [reportVisible, setReportVisible] = useState(false);
  const [activeReactionVisionId, setActiveReactionVisionId] = useState<string | null>(null);

  const { bookmarks, visionx, loading, hasMore, page } = useSelector(
    (state: any) => state.bookmarks,
  );
  const { bookmarkedIds, likedIds } = useSelector(
    (state: any) => state.actions,
  );


  const currentPage = page.visionx;
  const hasMoreVision = hasMore.visionx;



  const { reports } = useSelector((state: any) => state.report);
  const { user: authUser } = useSelector((state: any) => state.auth);
  const { handleLike, reactionMap, likeCountMap } = useHandleLike();

  useFocusEffect(
    useCallback(() => {
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

  useFocusEffect(
    useCallback(() => {
      dispatch(
        fetchBookmarks({
          type: 'visionx',
          page: 1,
        }),
      );

      return () => { };
    }, [dispatch]),
  );

  useEffect(() => {
    if (visionx?.length) {
      const bookmarked = visionx
        .filter((item: any) => item?.synopsis?.isWishlisted === 1)
        .map((item: any) => item?.synopsis?.id);

      dispatch(setInitialBookmarks(bookmarked));
    }
    if (visionx?.length) {
      const liked = visionx
        .filter((item: any) => item?.synopsis?.isLiked === 1)
        .map((item: any) => item?.synopsis?.id);

      dispatch(setInitialLikes(liked));

      const reactions: Record<string, string> = {};

      visionx.forEach((item: any) => {
        const synopsis = item?.synopsis;

        if (synopsis?.isLiked === 1 && synopsis?.emoji_type) {
          reactions[synopsis.id] = synopsis.emoji_type;
        }
      });

      dispatch(setInitialReactions(reactions));
    }
  }, [visionx]);

  const handleBookmark = async (id: string) => {
    const isAlreadyBookmarked = bookmarkedIds?.includes(id);

    // ✅ instant UI update
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
        // ❌ rollback
        dispatch(toggleBookmarkLocal(id));

        show({
          type: 'error',
          title: res?.payload?.message || 'Something went wrong',
        });
      } else {
        show({
          type: 'success',
          title:
            res?.payload?.message ||
            (isAlreadyBookmarked
              ? 'Removed from bookmarks'
              : 'Added to bookmarks'),
        });
      }
    } catch (error) {
      // ❌ rollback
      dispatch(toggleBookmarkLocal(id));

      show({
        type: 'error',
        title: 'Something went wrong',
      });
    }
  };


  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchBookmarks({ page: 1, type: 'visionx' }));
    setRefreshing(false);
  };

  const renderFooter = () => {
    if (loading && currentPage > 1) {
      return (
        <View style={{ paddingVertical: 20 }}>
          <CardSkeleton width={CARD_WIDTH} height={260} />
        </View>
      );
    }

    if (!hasMoreVision && bookmarks?.length > 0) {
      return (
        <Text style={{
          textAlign: 'center',
          padding: 20,
          opacity: 0.6,
          color: themeColors.white, // 🔥 FIX: no color = invisible on black background
          fontFamily: Fonts.Regular,
        }}>
          🎉 You’ve reached the end
        </Text>
      );
    }

    return null;
  };

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

  const loadMore = () => {
    if (loading || !hasMoreVision) return;
    dispatch(fetchBookmarks({ page: currentPage + 1, type: 'visionx' }));
  };

  // const skeletonData = Array.from({ length: 6 }, (_, i) => ({ id: i }));
  const skeletonData = Array.from({ length: 6 }, (_, i) => ({
    id: `skeleton-${i}`,
  }));
  const uniqueVisionx = Array.from(
    new Map(
      (visionx || []).map((item: any) => [item?.synopsis?.id, item]),
    ).values(),
  );

  const isOwnPost = useMemo(
    () => authUser?.id === activePost?.user?.id,
    [authUser?.id, activePost?.user?.id],
  );

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
      if (!activePost?.synopsis?.id && !activePost?.id) return;

      const payload = {
        report_id: data.reason,
        description: data.message || '',

        // ✅ REAL SYNOPSIS ID
        synopses_id: activePost?.synopsis?.id || activePost?.id,

        // ✅ REAL USER ID
        reported_user_id:
          activePost?.synopsis?.user?.id || activePost?.user?.id,

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

  /* ---------------- NAVIGATION ---------------- */
  const handleOpenVideo = useCallback(
    (item: any) => {
      navigation.navigate('VisionXDetails', { visionxId: item?.synopsis?.id });
    },
    [navigation],
  );
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={loading && page === 1 ? skeletonData : uniqueVisionx}
        keyExtractor={(item: any) =>
          item?.synopsis?.id ? `visionx-${item.synopsis.id}` : item.id
        }
        contentContainerStyle={[
          styles.listContainer,
          {
            paddingTop: 10,
          },
        ]}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReachedThreshold={0.5}
        onScroll={handleScroll} // 👈 Add this
        scrollEventThrottle={16} // 👈 Add this
        onMomentumScrollBegin={() => {
          onEndReachedCalledDuringMomentum.current = false;
        }}
        onEndReached={() => {
          if (!onEndReachedCalledDuringMomentum.current) {
            loadMore();
            onEndReachedCalledDuringMomentum.current = true;
          }
        }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }: any) => {
          const visionId = item?.synopsis?.id;
          const isReactionOpen = activeReactionVisionId === String(visionId);
          return (
            <VisionCard
              url={item?.synopsis?.image}
              title={item?.synopsis?.title}
              avatar={item?.synopsis?.user?.profile_photo_path}
              name={item?.synopsis?.user?.name}
              user_name={item?.user?.user_name}
              time={item?.synopsis?.createdAt}
              likes={
                likeCountMap[item?.synopsis?.id] ?? item?.synopsis?.likes_count
              }
              liked={likedIds.includes(item?.synopsis?.id)}
              emoji_type={
                likedIds.includes(item?.synopsis?.id)
                  ? reactionMap[item?.synopsis?.id] ??
                  item?.synopsis?.emoji_type
                  : null
              }
              onReactionSelect={(reaction?: ReactionType) =>
                handleLike({
                  id: item?.synopsis?.id,
                  emoji_type: reaction || 'Heart',
                  likes_count: item?.synopsis?.likes_count || 0,
                  isReactionPress: reaction !== undefined,
                })
              }
              views={item?.synopsis?.views}
              rating={item?.synopsis?.avg_rating}
              type={item?.synopsis?.platform}
              link={item?.synopsis?.link}
              // isActive={activeIndex === index}
              isActive={true}
              bookmarked={bookmarkedIds.includes(item?.synopsis?.id)}
              onSaved={() => handleBookmark(item?.synopsis?.id)}
              onPress={() => handleOpenVideo(item)}
              handleUser={() => {
                navigation.navigate('Profile', {
                  username: item?.synopsis?.user?.user_name,
                });
              }}
              onMenuPress={e => openMenu(e, item)}
              reactionPopupVisible={isReactionOpen}
              onOpenReaction={() => {
                setActiveReactionVisionId(String(visionId));
              }}
              onCloseReaction={() => {
                setActiveReactionVisionId(null);
              }}
              onShare={() => {
                handleShare({
                  title: item?.synopsis?.title,
                  value: item?.synopsis?.id,
                  type: 'visionx',
                })
              }}
            />
          );
        }}
      />

      <PostMenu
        visible={menuVisible}
        x={menuPosition.x}
        y={menuPosition.y}
        onClose={() => setMenuVisible(false)}
        onReport={handleOpenReport}
        isOwnPost={isOwnPost}
        isReported={activePost?.synopsis?.isReported === 1}
      />

      <ReportModal
        visible={reportVisible}
        post={activePost}
        onClose={() => setReportVisible(false)}
        onSubmit={handleReport}
        reportType="VISIONX"
      />
    </View>
  );
};

export default VisionXTabs;

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
  },
});
