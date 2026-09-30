import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { fetchBookmarks } from '../../../redux/slices/bookmarkSlice';

import CardSkeleton from '../../../components/Cards/CardSkeleton';

import { useFocusEffect, useNavigation } from '@react-navigation/native';

import SynopsisCard from '../../Synopsis/components/SynopsisCard';

import useSynopsisActions from '../../../hooks/useSynopsisActions';
import { useHandleLike } from '../../../hooks/useHandleLike';
import {
  setInitialLikes,
  setInitialReactions,
} from '../../../redux/slices/actionSlice';
import { ReactionType } from '../../../hooks/useEmojiReaction';
import { themeColors } from '../../../theme/colors';
import NoBookMark from '../../../assets/SVG/NoBookMark';
import { Fonts } from '../../../constants/Fonts';

const { width } = Dimensions.get('window');

const CARD_MARGIN = 10;
const CARD_WIDTH = width - 20;

const SynopsesTabs = () => {
  const dispatch = useDispatch<any>();
  const navigation = useNavigation<any>();

  const onEndReachedCalledDuringMomentum = useRef(false);

  const [refreshing, setRefreshing] = useState(false);
  const [activeReactionSynopsisId, setActiveReactionSynopsisId] = useState<string | null>(null);

  const { synopses, loading, hasMore, page } = useSelector(
    (state: any) => state.bookmarks,
  );
  const currentPage = page.synopses;
  const hasMoreSynopses = hasMore.synopses;


  // ================= CUSTOM HOOK =================

  const { handleBookmark, getItemState } = useSynopsisActions(synopses);
  const { handleLike, likedIds, reactionMap, likeCountMap } = useHandleLike();


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

  // ================= FETCH =================

  useFocusEffect(
    useCallback(() => {
      dispatch(
        fetchBookmarks({
          type: 'script',
          page: 1,
        }),
      );

      return () => { };
    }, [dispatch]),
  );

  useEffect(() => {
    if (!synopses?.length) return;

    const liked = synopses
      .filter((item: any) => item?.synopsis?.isLiked === 1)
      .map((item: any) => item?.synopsis?.id);

    dispatch(setInitialLikes(liked));

    const reactions: Record<string, string> = {};

    synopses.forEach((item: any) => {
      const synopsis = item?.synopsis;

      if (synopsis?.isLiked === 1 && synopsis?.emoji_type) {
        reactions[synopsis.id] = synopsis.emoji_type;
      }
    });

    dispatch(setInitialReactions(reactions));
  }, [synopses]);

  // ================= REFRESH =================

  const onRefresh = async () => {
    setRefreshing(true);

    await dispatch(
      fetchBookmarks({
        page: 1,
        type: 'script',
      }),
    );

    setRefreshing(false);
  };

  // ================= LOAD MORE =================

  const loadMore = () => {
    if (loading || !hasMoreSynopses) return;

    dispatch(
      fetchBookmarks({
        page: currentPage + 1,
        type: 'script',
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

    if (!hasMoreSynopses && synopses?.length > 0) {
      return (
        <Text
          style={{
            textAlign: 'center',
            padding: 20,
            opacity: 0.6,
            color: themeColors.white, // 🔥 FIX: no color = invisible on black background
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
          Oops! No Saved Synopses Found
        </Text>
        <Text style={{ color: themeColors.gray, fontFamily: Fonts.Regular }}>
          You haven't saved any synopses yet.
        </Text>
      </View>
    );
  };

  // ================= SKELETON =================

  const skeletonData = Array.from({ length: 6 }, (_, i) => ({
    id: `skeleton-${i}`,
  }));

  // ================= UNIQUE DATA =================

  const uniqueSynopses = Array.from(
    new Map(
      (synopses || []).map((item: any) => [item?.synopsis?.id, item]),
    ).values(),
  );

  // ================= RETURN =================

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={loading && page === 1 ? skeletonData : uniqueSynopses}
        keyExtractor={(item: any) =>
          item?.synopsis?.id ? `synopsis-${item.synopsis.id}` : item.id
        }
        contentContainerStyle={styles.listContainer}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews={true}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReachedThreshold={0.5}
        onScroll={handleScroll} // 👈 Add this
        scrollEventThrottle={16} // 👈 Add this
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
          const isReactionOpen = activeReactionSynopsisId === String(synopsisId);

          return (
            <View style={{ width: CARD_WIDTH }}>
              <SynopsisCard
                image={item?.synopsis?.image}
                ribbonText={item?.synopsis?.genre?.name || 'Synopsis'}
                height={180}
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
                createdAt={item?.createdAt}
                author={item?.synopsis?.user?.name}
                bookmarked={isBookmarked}
                onBookmark={async () => {
                  const currentlyBookmarked = getItemState(item).isBookmarked;

                  await handleBookmark(item?.synopsis?.id);

                  // 🔥 remove instantly after unbookmark
                  if (currentlyBookmarked) {
                    dispatch(
                      fetchBookmarks({
                        page: 1,
                        type: 'script',
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
                  setActiveReactionSynopsisId(String(synopsisId));
                }}
                onCloseReaction={() => {
                  setActiveReactionSynopsisId(null);
                }}
              />
            </View>
          );
        }}
      />
    </View>
  );
};

export default SynopsesTabs;

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
