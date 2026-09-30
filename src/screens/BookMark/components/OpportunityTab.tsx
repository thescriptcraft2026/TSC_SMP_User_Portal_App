import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchContestBookmarks,
  fetchOpporunityBookmarks,
  resetBookmarksByType,
} from '../../../redux/slices/bookmarkSlice';
import CardSkeleton from '../../../components/Cards/CardSkeleton';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useToast } from '../../../components/Toast/ToastProvider';
import ContestSkeleton from '../../../components/Contest/ContestSkeleton';
import OpportunityCard from '../../Opportunity/components/card/OpportunityCard';
import { themeColors } from '../../../theme/colors';
import NoBookMark from '../../../assets/SVG/NoBookMark';
import { Fonts } from '../../../constants/Fonts';

const { width } = Dimensions.get('window');

const CARD_MARGIN = 10;
const CARD_WIDTH = (width - CARD_MARGIN * 2.5) / 2;

const OpportunityTab = () => {
  const dispatch = useDispatch<any>();
  const navigation = useNavigation<any>();
  const { show } = useToast();

  const onEndReachedCalledDuringMomentum = useRef(false);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Correct selector
  const { opportunities, loading, hasMore, page } = useSelector(
    (state: any) => state.bookmarks,
  );

  const currentPage = page.opportunities;
  const hasMorePosts = hasMore.opportunities;

  /* ---------------- INITIAL LOAD ---------------- */
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchOpporunityBookmarks(1));

      return () => { };
    }, [dispatch]),
  );

  /* ---------------- REFRESH ---------------- */
  const onRefresh = async () => {
    setRefreshing(true);

    dispatch(resetBookmarksByType('contest'));
    await dispatch(fetchOpporunityBookmarks(1));

    setRefreshing(false);
  };

  /* ---------------- PAGINATION ---------------- */
  const loadMore = () => {
    if (loading || !hasMorePosts) return;

    dispatch(fetchOpporunityBookmarks(currentPage + 1));
  };

  /* ---------------- FOOTER ---------------- */
  const renderFooter = () => {
    if (loading && page.contest > 1) {
      return (
        <View style={{ paddingVertical: 20 }}>
          <CardSkeleton width={CARD_WIDTH} height={260} />
        </View>
      );
    }

    if (!hasMore.contest && opportunities?.length > 0) {
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
          Oops! No Saved Oppourtunites Found
        </Text>
        <Text style={{ color: themeColors.gray, fontFamily: Fonts.Regular }}>
          You haven't saved any opportunities yet.
        </Text>
      </View>
    );
  };

  /* ---------------- DEDUP ---------------- */
  const uniqueOpportunities = Array.from(
    new Map(
      (opportunities || []).map((item: any) => [item?.oppourtunity?.id, item]),
    ).values(),
  );
  const skeletonData = Array.from({ length: 6 }, (_, i) => ({
    id: `skeleton-${i}`,
  }));

  /* ---------------- RENDER ---------------- */
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={
          loading && page.opportunity === 1 ? skeletonData : uniqueOpportunities
        }
        keyExtractor={(item: any) =>
          item?.opportunity?.id ? `opportunity-${item.opportunity.id}` : item.id
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
          if (!item?.oppourtunity?.id) {
            return <ContestSkeleton />;
          }
          const opp = item?.oppourtunity;

          return (
            <OpportunityCard
              data={opp}
              onPress={() => {
                navigation.navigate('SingleOpportunityDetails', {
                  opp_id: opp?.opp_id,
                });
              }}
            />
          );
        }}
      />
    </View>
  );
};

export default OpportunityTab;

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 10,
    marginTop: 10,
  },
});
