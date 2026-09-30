import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchContestBookmarks,
  resetBookmarksByType,
  removeContestBookmarkLocal,
} from '../../../redux/slices/bookmarkSlice';
import CardSkeleton from '../../../components/Cards/CardSkeleton';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { setInitialBookmarks } from '../../../redux/slices/actionSlice';
import { useToast } from '../../../components/Toast/ToastProvider';
import ContestCard from '../../../components/Contest/ContestCard';
import {
  toggleBookmarkLocal,
  toggleContestBookmark,
} from '../../../redux/slices/contestSlice';
import ContestSkeleton from '../../../components/Contest/ContestSkeleton';
import { getContestStatus, getDaysLeft } from '../../../utils/timeAgo';
import { formatDate } from '../../../utils/date';
import { themeColors } from '../../../theme/colors';
import { Fonts } from '../../../constants/Fonts';
import NoBookMark from '../../../assets/SVG/NoBookMark';

const { width } = Dimensions.get('window');

const CARD_MARGIN = 10;
const CARD_WIDTH = (width - CARD_MARGIN * 2.5) / 2;

const ContestTab = () => {
  const dispatch = useDispatch<any>();
  const navigation = useNavigation<any>();
  const { show } = useToast();

  const onEndReachedCalledDuringMomentum = useRef(false);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Correct selector
  const { contests, loading, hasMore, page } = useSelector(
    (state: any) => state.bookmarks,
  );
    const currentPage = page.contest;
  const hasMoreContest = hasMore.contest;

  // console.log('contests bookmark', contests);

  const { bookmarkedIds } = useSelector((state: any) => state.actions);

  /* ---------------- INITIAL LOAD ---------------- */
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchContestBookmarks(1));

      return () => {};
    }, [dispatch]),
  );

  /* ---------------- SET INITIAL BOOKMARKS ---------------- */
  useEffect(() => {
    if (contests?.length) {
      const bookmarked = contests
        .filter((item: any) => item?.contest?.is_wishlisted === 1)
        .map((item: any) => item?.contest?.id);

      dispatch(setInitialBookmarks(bookmarked));
    }
  }, [contests]);

  /* ---------------- BOOKMARK HANDLER ---------------- */
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
        dispatch(toggleBookmarkLocal(id));

        show({
          type: 'error',
          title: res?.payload || 'Something went wrong',
        });
        return;
      }

      // Remove instantly from bookmark screen
      if (isAlreadyBookmarked) {
        dispatch(removeContestBookmarkLocal(id));
      }

      // show({
      //   type: 'success',
      //   title:
      //     res?.payload?.res?.message ||
      //     (isAlreadyBookmarked
      //       ? 'Removed from bookmarks'
      //       : 'Added to bookmarks'),
      // });
    } catch (error: any) {
      dispatch(toggleBookmarkLocal(id));

      show({
        type: 'error',
        title: 'Something went wrong',
      });
    }
  };

  /* ---------------- REFRESH ---------------- */
  const onRefresh = async () => {
    setRefreshing(true);

    dispatch(resetBookmarksByType('contest'));
    await dispatch(fetchContestBookmarks(1));

    setRefreshing(false);
  };

  /* ---------------- PAGINATION ---------------- */
  const loadMore = () => {
    if (loading || !hasMoreContest) return;

    dispatch(fetchContestBookmarks(currentPage + 1));
  };

  /* ---------------- FOOTER ---------------- */
  const renderFooter = () => {
    if (loading && currentPage > 1) {
      return (
        <View style={{ paddingVertical: 20 }}>
          <CardSkeleton width={CARD_WIDTH} height={260} />
        </View>
      );
    }

    if (!hasMoreContest && contests?.length > 0) {
      return (
        <Text style={{ textAlign: 'center', padding: 20, opacity: 0.6 }}>
          🎉 You’ve reached the end
        </Text>
      );
    }

    return null;
  };

  /* ---------------- EMPTY ---------------- */
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
          Oops! No Saved Contests Found
        </Text>
        <Text style={{ color: themeColors.gray, fontFamily: Fonts.Regular }}>
          You haven't saved any contests yet.
        </Text>
      </View>
    );
  };

  /* ---------------- DEDUP ---------------- */
  const uniqueContests = Array.from(
    new Map(
      (contests || []).map((item: any) => [item?.contest?.id, item]),
    ).values(),
  );

  const skeletonData = Array.from({ length: 6 }, (_, i) => ({
    id: `skeleton-${i}`,
  }));

  /* ---------------- RENDER ---------------- */
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={loading && page.contest === 1 ? skeletonData : uniqueContests}
        keyExtractor={(item: any) =>
          item?.contest?.id ? `contest-${item.contest.id}` : item.id
        }
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReachedThreshold={0.5}
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
        renderItem={({ item }: any) => {
          if (!item?.contest?.id) {
            return <ContestSkeleton />;
          }

          const contest = item.contest;
          const now = new Date();

          const startDateObj = new Date(contest?.start_date);
          const endDateObj = new Date(contest?.end_date);

          let contestStatus = 'ongoing';

          if (now < startDateObj) {
            contestStatus = 'upcoming';
          } else if (now > endDateObj) {
            contestStatus = 'completed';
          }

          return (
            <ContestCard
              {...contest}
              bookmarked={
                bookmarkedIds.includes(contest?.id) ||
                contest?.isWishlisted === 1
              }
              onBookMark={() => handleBookmark(contest?.id)}
              onPress={() =>
                navigation.navigate('ContestDetails', {
                  contestId: contest?.id,
                })
              }
              startDate={formatDate(contest?.start_date)}
              endDate={getDaysLeft(contest?.end_date)}
              status={getContestStatus(contest?.start_date, contest?.end_date)}
              participants={contest.participants_count}
            />
          );
        }}
      />
    </View>
  );
};

export default ContestTab;

const styles = StyleSheet.create({
  listContainer: {
    // paddingHorizontal: 10,
    marginTop: 10,
  },
});
