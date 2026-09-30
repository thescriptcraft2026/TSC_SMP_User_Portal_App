import React, { useCallback, useState } from 'react';
import { View, FlatList, StyleSheet, Dimensions, Text } from 'react-native';

import { useFocusEffect, useNavigation } from '@react-navigation/native';

import SynopsisCard from '../../../Synopsis/components/SynopsisCard';

import useSynopsisActions from '../../../../hooks/useSynopsisActions';
import { Fonts } from '../../../../constants/Fonts';
import { themeColors } from '../../../../theme/colors';
import Opps from '../../../../assets/SVG/Opps';
import { useInfiniteScroll } from '../../../../hooks/useInfiniteScroll';

const { width } = Dimensions.get('window');

const CARD_MARGIN = 10;
const CARD_WIDTH = width - 20;

type Props = {
  data?: any;
  loadMore?: any;
  isLoading?: boolean;
  hasMore?: boolean;
};

const SynopsesTab = ({ data = [], loadMore, isLoading = false, hasMore = true }: Props) => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [activeReactionSynopsisId, setActiveReactionSynopsisId] = useState<string | null>(null);

  // ================= CUSTOM HOOK =================

  const { handleBookmark, handleLike, getItemState } = useSynopsisActions(data);

  const { handleEndReached, handleMomentumScrollBegin } = useInfiniteScroll({
    hasMore,
    loading: isLoading,
    onLoadMore: () => loadMore?.(),
  });

  useFocusEffect(
    useCallback(() => {
      return () => {
        setActiveReactionSynopsisId(null);
      };
    }, [])
  );

  // ✅ Handle scroll to close reaction popup
  const handleScroll = () => {
    if (activeReactionSynopsisId) {
      setActiveReactionSynopsisId(null);
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
          Oops! No Synopses Found
        </Text>
      </View>
    );
  };

  // ================= RETURN =================

  return (
    <View style={styles.container}>
      <FlatList
        nestedScrollEnabled
        data={data}
        keyExtractor={(item: any) => item.id.toString()}
        // numColumns={2}
        onEndReached={handleEndReached}
        onMomentumScrollBegin={handleMomentumScrollBegin}
        ListEmptyComponent={renderEmpty}
        onEndReachedThreshold={0.3}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => {
          console.log('item', item);
          const { isLiked, currentReaction, currentLikes, isBookmarked } =
            getItemState({
              synopsis: item,
            });
          const isReactionOpen = activeReactionSynopsisId === String(item?.id);
          return (
            <SynopsisCard
              image={item?.image || 'https://via.placeholder.com/150'}
              height={180}
              width={CARD_WIDTH}
              onPress={() => {
                navigation.navigate('SynopsisDetails', {
                  synopsisId: item?.id,
                });
              }}
              ribbonText={item?.genre?.name || 'Synopsis'}
              bookmarked={isBookmarked}
              onBookmark={() => handleBookmark(item?.id)}
              likes={currentLikes}
              views={item?.views}
              rating={item?.avg_rating ?? '0'}
              title={item?.title}
              createdAt={item?.createdAt}
              author={item?.user?.name}
              handleLike={(reaction?: any) =>
                handleLike(
                  item?.id,
                  reaction || currentReaction,
                  isLiked,
                  currentLikes,
                )
              }
              emoji_type={currentReaction}
              isLiked={isLiked}
              reactionPopupVisible={isReactionOpen}
              onOpenReaction={() => {
                setActiveReactionSynopsisId(String(item?.id));
              }}
              onCloseReaction={() => {
                setActiveReactionSynopsisId(null);
              }}
            />
          );
        }}
      />
    </View>
  );
};

export default SynopsesTab;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    marginTop: 15,
  },
});
