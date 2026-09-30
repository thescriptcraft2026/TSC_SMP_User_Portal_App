import React, { useCallback, useState } from 'react';
import { View, FlatList, StyleSheet, Dimensions, Text } from 'react-native';

import { useFocusEffect, useNavigation } from '@react-navigation/native';

import BookCard from '../../../Books/components/cards/BookCard';

import useSynopsisActions from '../../../../hooks/useSynopsisActions';
import { Fonts } from '../../../../constants/Fonts';
import { themeColors } from '../../../../theme/colors';
import Opps from '../../../../assets/SVG/Opps';
import { useInfiniteScroll } from '../../../../hooks/useInfiniteScroll';

const { width } = Dimensions.get('window');

const CARD_MARGIN = 10;
const CARD_WIDTH = (width - CARD_MARGIN * 2.5) / 2;

type Props = {
  data?: any;
  loadMore?: any;
  isLoading?: boolean;
  hasMore?: boolean;
};

const BookTab = ({ data = [], loadMore, isLoading = false, hasMore = true }: Props) => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);

  const [activeReactionBookId, setActiveReactionBookId] = useState<string | null>(null);

  // ================= CUSTOM HOOK =================

  const { handleBookmark, handleLike, getItemState } = useSynopsisActions(data);

  const { handleEndReached, handleMomentumScrollBegin } = useInfiniteScroll({
    hasMore,
    loading: isLoading,
    onLoadMore: () => loadMore?.(),
  });


  // ✅ Close reaction popup when navigating away from the screen
  useFocusEffect(
    useCallback(() => {
      return () => {
        setActiveReactionBookId(null);
      };
    }, [])
  );

  // ✅ Handle scroll to close reaction popup
  const handleScroll = () => {
    if (activeReactionBookId) {
      setActiveReactionBookId(null);
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
          Oops! No Books Found
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
        numColumns={2}
        onEndReached={handleEndReached}
        onMomentumScrollBegin={handleMomentumScrollBegin}
        ListEmptyComponent={renderEmpty}
        onEndReachedThreshold={0.3}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => {
          const { isLiked, currentReaction, currentLikes, isBookmarked } =
            getItemState({
              synopsis: item,
            });
          const isReactionOpen = activeReactionBookId === String(item?.id);

          return (
            <BookCard
              image={item?.image}
              ribbonText={item?.genre?.name || 'Book'}
              height={260}
              width={CARD_WIDTH}
              onPress={() =>
                navigation.navigate('BookDetails', {
                  bookId: item?.id,
                })
              }
              likes={currentLikes}
              views={item?.views}
              rating={item?.avg_rating ?? '0'}
              title={item?.title}
              author={item?.user?.name}
              bookmarked={isBookmarked}
              onBookmark={() => handleBookmark(item?.id)}
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
                setActiveReactionBookId(String(item?.id));
              }}
              onCloseReaction={() => {
                setActiveReactionBookId(null);
              }}
            />
          );
        }}
      />
    </View>
  );
};

export default BookTab;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    marginTop: 15,
  },
});
