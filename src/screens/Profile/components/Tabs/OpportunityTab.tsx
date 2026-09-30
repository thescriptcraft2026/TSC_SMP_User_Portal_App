import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../../../components/Toast/ToastProvider';
import ContestSkeleton from '../../../../components/Contest/ContestSkeleton';
import OpportunityCard from '../../../Opportunity/components/card/OpportunityCard';
import Opps from '../../../../assets/SVG/Opps';
import { themeColors } from '../../../../theme/colors';
import { Fonts } from '../../../../constants/Fonts';
import { useInfiniteScroll } from '../../../../hooks/useInfiniteScroll';

const { width } = Dimensions.get('window');

const CARD_MARGIN = 10;
const CARD_WIDTH = (width - CARD_MARGIN * 2.5) / 2;

type Props = {
  data?: any; // ✅ dynamic tabs
  loadMore?: any;
  isLoading?: boolean;
  hasMore?: boolean;
};

const OpportunityTab = ({ data, loadMore, isLoading = false, hasMore = true }: Props) => {
  const dispatch = useDispatch<any>();
  const navigation = useNavigation<any>();
  const { show } = useToast();

  const onEndReachedCalledDuringMomentum = useRef(false);
  const [refreshing, setRefreshing] = useState(false);

  const { handleEndReached, handleMomentumScrollBegin } = useInfiniteScroll({
    hasMore,
    loading: isLoading,
    onLoadMore: () => loadMore?.(),
  });

  const renderEmpty = () => {
    // if (loading) return null;

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

  /* ---------------- RENDER ---------------- */
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        nestedScrollEnabled
        data={data}
        keyExtractor={(item: any) =>
          item?.opportunity?.id ? `opportunity-${item.opportunity.id}` : item.id
        }
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onEndReachedThreshold={0.5}
        onMomentumScrollBegin={handleMomentumScrollBegin}
        onEndReached={handleEndReached}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }: any) => {
          if (!item?.id) {
            return <ContestSkeleton />;
          }

          return (
            <View style={{ marginTop: 10, marginBottom: 0 }}>
              <OpportunityCard
                data={item}
                onPress={() => {
                  navigation.navigate('SingleOpportunityDetails', {
                    opp_id: item?.opp_id,
                  });
                }}
              />
            </View>
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
  },
});
