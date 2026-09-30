import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { fetchBookmarks } from '../../../redux/slices/bookmarkSlice';

import BookCard from '../../Books/components/cards/BookCard';
import CardSkeleton from '../../../components/Cards/CardSkeleton';

import { useFocusEffect, useNavigation } from '@react-navigation/native';

import useSynopsisActions from '../../../hooks/useSynopsisActions';
import { useHandleLike } from '../../../hooks/useHandleLike';
import {
  setInitialLikes,
  setInitialReactions,
} from '../../../redux/slices/actionSlice';
import { ReactionType } from '../../../hooks/useEmojiReaction';
import { themeColors } from '../../../theme/colors';
import { Fonts } from '../../../constants/Fonts';
import NoBookMark from '../../../assets/SVG/NoBookMark';

const { width } = Dimensions.get('window');

const CARD_MARGIN = 10;
const CARD_WIDTH = (width - CARD_MARGIN * 2.5) / 2;

const BookTabs = () => {
  const dispatch = useDispatch<any>();
  const navigation = useNavigation<any>();

  const onEndReachedCalledDuringMomentum = useRef(false);

  const [refreshing, setRefreshing] = useState(false);
  const [activeReactionBookId, setActiveReactionBookId] = useState<string | null>(null);

  const { books, loading, hasMore, page } = useSelector(
    (state: any) => state.bookmarks,
  );
  const currentPage = page.book;
  const hasMoreBooks = hasMore.book;

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


  // ================= CUSTOM HOOK =================

  const { handleBookmark, getItemState } = useSynopsisActions(books);
  const { handleLike, likedIds, reactionMap, likeCountMap } = useHandleLike();

  // ================= FETCH =================

  useFocusEffect(
    useCallback(() => {
      dispatch(
        fetchBookmarks({
          type: 'book',
          page: 1,
        }),
      );

      return () => { };
    }, [dispatch]),
  );

  useEffect(() => {
    if (!books?.length) return;

    const liked = books
      .filter((item: any) => item?.synopsis?.isLiked === 1)
      .map((item: any) => item?.synopsis?.id);

    dispatch(setInitialLikes(liked));

    const reactions: Record<string, string> = {};

    books.forEach((item: any) => {
      const synopsis = item?.synopsis;

      if (synopsis?.isLiked === 1 && synopsis?.emoji_type) {
        reactions[synopsis.id] = synopsis.emoji_type;
      }
    });

    dispatch(setInitialReactions(reactions));
  }, [books]);

  // ================= REFRESH =================

  const onRefresh = async () => {
    setRefreshing(true);

    await dispatch(
      fetchBookmarks({
        page: 1,
        type: 'book',
      }),
    );

    setRefreshing(false);
  };

  // ================= LOAD MORE =================

  const loadMore = () => {
    if (loading || !hasMoreBooks) return;

    dispatch(
      fetchBookmarks({
        page: currentPage + 1,
        type: 'book',
      }),
    );
  };

  // ================= FOOTER =================

  const renderFooter = () => {
    if (loading && currentPage > 1) {
      return (
        <View style={{ paddingVertical: 20 }}>
          <CardSkeleton width={CARD_WIDTH} height={260} />
        </View>
      );
    }

    if (!hasMoreBooks && books?.length > 0) {
      return (
        <Text
          style={{
            textAlign: 'center',
            padding: 20,
            opacity: 0.6,
            color: themeColors.white,
            fontFamily: Fonts.Regular,
          }}
        >
          🎉 You’ve reached the end
        </Text>
      );
    }

    return null;
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
          Oops! No Saved Books Found
        </Text>
        <Text style={{ color: themeColors.gray, fontFamily: Fonts.Regular }}>
          You haven't saved any books yet.
        </Text>
      </View>
    );
  };

  // ================= SKELETON =================

  const skeletonData = Array.from({ length: 6 }, (_, i) => ({
    id: `skeleton-${i}`,
  }));

  // ================= UNIQUE DATA =================

  const uniqueBooks = Array.from(
    new Map(
      (books || []).map((item: any) => [item?.synopsis?.id, item]),
    ).values(),
  );

  // ================= RETURN =================

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={loading && page === 1 ? skeletonData : uniqueBooks}
        keyExtractor={(item: any) =>
          item?.synopsis?.id
            ? `book-${item.synopsis.id}`
            : `skeleton-${item.id}`
        }
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={10}
        removeClippedSubviews={true}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReachedThreshold={0.6}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onMomentumScrollBegin={() => {
          onEndReachedCalledDuringMomentum.current = false;
        }}
        onEndReached={() => {
          if (!onEndReachedCalledDuringMomentum.current) {
            loadMore();

            onEndReachedCalledDuringMomentum.current = true;
          }
        }}
        renderItem={({ item }: any) => {
          const { isBookmarked } = getItemState(item);
          const synopsisId = item?.synopsis?.id;
          const isReactionOpen = activeReactionBookId === String(synopsisId);

          return (
            <View style={{ width: CARD_WIDTH }}>
              <BookCard
                image={item?.synopsis?.image}
                ribbonText={item?.synopsis?.genre?.name || 'Book'}
                height={260}
                width={CARD_WIDTH}
                onPress={() =>
                  navigation.navigate('BookDetails', {
                    bookId: item?.synopsis?.id,
                  })
                }
                likes={
                  likeCountMap[item?.synopsis?.id] ??
                  item?.synopsis?.likes_count
                }
                views={item?.synopsis?.views}
                rating={item?.synopsis?.avg_rating ?? '0'}
                title={item?.synopsis?.title}
                author={item?.synopsis?.user?.name}
                bookmarked={isBookmarked}
                onBookmark={async () => {
                  const currentlyBookmarked = getItemState(item).isBookmarked;

                  await handleBookmark(item?.synopsis?.id);

                  // if removing bookmark → refresh list
                  if (currentlyBookmarked) {
                    dispatch(
                      fetchBookmarks({
                        page: 1,
                        type: 'book',
                      }),
                    );
                  }
                }}
                handleLike={(reaction?: ReactionType) =>
                  handleLike({
                    id: item?.synopsis?.id,
                    emoji_type: reaction || 'heart',
                    likes_count: item?.synopsis?.likes_count || 0,
                    isReactionPress: reaction !== undefined,
                  })
                }
                emoji_type={
                  likedIds.includes(item?.synopsis?.id)
                    ? reactionMap[item?.synopsis?.id]
                      ? reactionMap[item?.synopsis?.id]
                      : item?.synopsis?.emoji_type
                    : null
                }
                isLiked={likedIds.includes(item?.synopsis?.id)}
                reactionPopupVisible={isReactionOpen}
                onOpenReaction={() => {
                  setActiveReactionBookId(String(synopsisId));
                }}
                onCloseReaction={() => {
                  setActiveReactionBookId(null);
                }}
              />
            </View>
          );
        }}
      />
    </View>
  );
};

export default BookTabs;

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: CARD_MARGIN,
    paddingBottom: 20,
    marginTop: 10,
  },

  row: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});
