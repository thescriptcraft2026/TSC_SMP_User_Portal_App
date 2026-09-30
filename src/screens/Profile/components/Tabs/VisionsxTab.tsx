import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useToast } from '../../../../components/Toast/ToastProvider';
import VisionXCard from '../../../VisionX/components/cards/VisionXCard';
import {
  toggleBookmarkLocal,
  wishlistAction,
} from '../../../../redux/slices/actionSlice';
import VisionCard from '../../../VisionX/components/cards/VisionCard';
import ReportModal from '../../../../components/Modals/ReportModal';
import PostMenu from '../../../../components/Post/PostMenu';
import { createReport, getReports } from '../../../../redux/slices/reportSlice';
import { Fonts } from '../../../../constants/Fonts';
import { themeColors } from '../../../../theme/colors';
import Opps from '../../../../assets/SVG/Opps';
import { useInfiniteScroll } from '../../../../hooks/useInfiniteScroll';
import { useShare } from '../../../../hooks/useShare';

const { width } = Dimensions.get('window');

const CARD_MARGIN = 10;
const CARD_WIDTH = (width - CARD_MARGIN * 2.5) / 2;

type Props = {
  data?: any; // ✅ dynamic tabs
  loadMoree?: any;
  isLoading?: boolean;
  hasMore?: boolean;
};

const VisionXTab = ({ data, loadMoree, isLoading = false, hasMore = true }: Props) => {
  const dispatch = useDispatch<any>();
  const navigation = useNavigation<any>();
  const { handleShare } = useShare({});
  const { show } = useToast();
  const onEndReachedCalledDuringMomentum = useRef(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({
    x: 20,
    y: 0,
  });
  const [activePost, setActivePost] = useState<any>(null);
  const [reportVisible, setReportVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [localData, setLocalData] = useState<any[]>(data || []);
  const [activeReactionVisionId, setActiveReactionVisionId] = useState<string | null>(null);

  useEffect(() => {
    setLocalData(data || []);
  }, [data]);

  const { bookmarkedIds } = useSelector((state: any) => state.actions);
  const { reports } = useSelector((state: any) => state.report);
  const { user: authUser } = useSelector((state: any) => state.auth);

  const { handleEndReached, handleMomentumScrollBegin } = useInfiniteScroll({
    hasMore,
    loading: isLoading,
    onLoadMore: () => loadMoree?.(),
  });


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


  const handleBookmark = async (id: string) => {
    const isAlreadyBookmarked = bookmarkedIds?.includes(id);

    dispatch(toggleBookmarkLocal(id));

    try {
      const res: any = await dispatch(
        wishlistAction({
          synopsis_id: id,
          type: isAlreadyBookmarked ? 'delete' : 'create',
        }),
      );

      if (res?.meta?.requestStatus !== 'fulfilled') {
        dispatch(toggleBookmarkLocal(id));
        show({ type: 'error', title: 'Something went wrong' });
      }
    } catch {
      dispatch(toggleBookmarkLocal(id));
      show({ type: 'error', title: 'Something went wrong' });
    }
  };

  /* ---------------- NAVIGATION ---------------- */
  const handleOpenVideo = useCallback(
    (item: any) => {
      navigation.navigate('VisionXDetails', { visionxId: item?.id });
    },
    [navigation],
  );

  const isOwnPost = useMemo(
    () => String(authUser?.id) === String(activePost?.user?.id),
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
      if (!activePost?.id) return;

      const payload = {
        report_id: data.reason,
        description: data.message || '',

        // ✅ CORRECT ID
        synopses_id: activePost?.id,

        // ✅ CORRECT USER
        reported_user_id: activePost?.user?.id,

        chat_id: undefined,
        message_id: undefined,
      };

      const res: any = await dispatch(createReport(payload));

      if (res?.meta?.requestStatus !== 'fulfilled') {
        throw new Error(res?.payload?.message || 'Report failed');
      }

      show({
        type: 'success',
        title: res?.payload?.message || 'Report submitted',
      });

      setLocalData(prev =>
        prev.map(item =>
          item.id === activePost.id
            ? {
              ...item,
              isReported: 1,
            }
            : item,
        ),
      );

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
          Oops! No Content Found
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        nestedScrollEnabled
        data={data}
        keyExtractor={(item: any) =>
          item?.id ? `visionx-${item?.id}` : item?.id
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmpty}
        refreshing={refreshing}
        onEndReachedThreshold={0.5}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onMomentumScrollBegin={handleMomentumScrollBegin}
        onEndReached={handleEndReached}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }: any) => {
          const isReactionOpen = activeReactionVisionId === String(item?.id);
          return (
            <VisionCard
              url={item?.image}
              title={item?.title}
              avatar={item?.user?.profile_photo_path}
              name={item?.user?.name}
              user_name={item?.user?.user_name}
              time={item?.createdAt}
              likes={item?.likes_count}
              views={item?.views}
              rating={item?.avg_rating}
              type={item?.platform}
              link={item?.link}
              isActive={activeIndex === index}
              bookmarked={bookmarkedIds.includes(item.id)}
              onSaved={() => handleBookmark(item.id)}
              onPress={() => handleOpenVideo(item)}
              handleUser={() => {
                navigation.navigate('Profile', {
                  username: item?.user?.user_name,
                });
              }}
              style={{
                marginTop: 10,
                marginHorizontal: 10,
              }}
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
        isReported={activePost?.isReported === 1}
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

export default VisionXTab;

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 10,
    marginTop: 10,
  },
});
