import {
  Dimensions,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { themeColors } from '../../theme/colors';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import AuthHeader from '../../components/Header/AuthHeader';
import FastImage from 'react-native-fast-image';
import Heart from '../../assets/SVG/Heart';
import Star from '../../assets/SVG/Star';
import Share from '../../assets/SVG/Share';
import { Fonts } from '../../constants/Fonts';
import MovieRatingModal from './components/modal/MovieRatingModal';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import SingleMovieDetailsSkeleton from './components/SingleMovieDetailsSkeleton';
import LinearGradient from 'react-native-linear-gradient';
import { useShare } from '../../hooks/useShare';
import HeartActive from '../../assets/SVG/HeartActive';
import ReviewCard from './components/ReviewCard';
import ActionBar from '../../components/AcrtionBar/ActionBar';
import EyeTwo from '../../assets/SVG/EyeTwo';
import { useDispatch, useSelector } from 'react-redux';
import {
  getMovieById,
  submitMovieRating,
  toggleBookmarkLocal,
  toggleContestBookmark,
  toggleLikeLocal,
  toggleMovieLike,
  updateRatingLocalDetails,
} from '../../redux/slices/movieSlice';
import { useToast } from '../../components/Toast/ToastProvider';
import { ReactionType } from '../../hooks/useEmojiReaction';
import MovieCard from './components/MovieCard';
import GenreBadge from '../../components/Badges/GenreBadge';
import Play from '../../assets/SVG/Play';
import Note from '../../assets/SVG/Note';
import RenderHtml from 'react-native-render-html';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 10;
const CARD_WIDTH = 180;

const SingleMovieDetails = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const id = route.params?.id || route.params?.movieId;
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<any>();
  const { show } = useToast();
  const [imageError, setImageError] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [refreshing, setRefreshing] = useState(false);


  const isDark = true;

  const [ratingVisible, setRatingVisible] = useState(false);

  const backgroundColor = useMemo(
    () => (isDark ? themeColors.black : themeColors.appBackground),
    [isDark],
  );

  const { selectedMovies, detailsLoading, bookmarkedIds } = useSelector(
    (state: any) => state.movie,
  );
  const { user } = useSelector((state: any) => state.auth);

  const myReview = useMemo(() => {
    return selectedMovies?.reviews?.find(
      (item: any) => item?.user?.user_name === user?.user_name,
    );
  }, [selectedMovies, user]);

  const [ratings, setRatings] = useState(myReview?.rating || 0);
  useEffect(() => {
    if (myReview?.rating) {
      setRatings(myReview.rating);
    }
  }, [myReview]);

  const rating = selectedMovies?.avg_rating
    ? Number(selectedMovies.avg_rating).toFixed(1)
    : '0.0';

  // 🔥 FETCH
  useFocusEffect(
    useCallback(() => {
      if (id) dispatch(getMovieById(id));
    }, [id]),
  );

  const { handleShare } = useShare({
    type: 'movie',
    value: selectedMovies?.id,
    title: selectedMovies?.title,
  });

  const handleBookmark = async (id: string) => {
    if (!id) return;

    const isAlreadyBookmarked =
      bookmarkedIds?.includes(id) || selectedMovies?.is_wishlisted === 1;

    // ✅ optimistic update
    dispatch(toggleBookmarkLocal(id));

    try {
      const res: any = await dispatch(
        toggleContestBookmark({
          content_id: id,

          // ✅ IMPORTANT
          type: isAlreadyBookmarked ? 'delete' : 'create',
        }),
      );

      console.log('bookmarkRes', res);

      const isSuccess = res?.meta?.requestStatus === 'fulfilled';

      // ❌ rollback
      if (!isSuccess) {
        dispatch(toggleBookmarkLocal(id));

        show({
          type: 'error',
          title: res?.payload?.res?.message || 'Something went wrong',
        });

        return;
      }

      // ✅ sync wishlist state
      // dispatch(getMovieById(selectedMovies?.id));

      show({
        type: 'success',
        title: res?.payload?.res?.message,
      });
    } catch (error) {
      // ❌ rollback
      dispatch(toggleBookmarkLocal(id));

      show({
        type: 'error',
        title: 'Something went wrong',
      });
    }
  };

  const handleLike = async (id: string, emoji_type: ReactionType = 'Heart') => {
    if (!id) return;

    const currentEmoji = selectedMovies?.emoji_type;
    const isAlreadyLiked = selectedMovies?.is_liked === 1;

    // ✅ SAME emoji → unlike
    const isUnlike = isAlreadyLiked && currentEmoji === emoji_type;

    // ✅ optimistic update
    dispatch(
      toggleLikeLocal({
        id,
        emoji_type: isUnlike ? null : emoji_type,
      }),
    );

    try {
      const res: any = await dispatch(
        toggleMovieLike({
          content_id: id,

          emoji_type,

          // ✅ IMPORTANT
          type: isUnlike ? 'delete' : 'create',
        } as any),
      );

      const isSuccess = res?.meta?.requestStatus === 'fulfilled';

      if (!isSuccess) {
        dispatch(
          toggleLikeLocal({
            id,
            emoji_type: currentEmoji,
          }),
        );
      }
    } catch (error) {
      dispatch(
        toggleLikeLocal({
          id,
          emoji_type: currentEmoji,
        }),
      );
    }
  };

  const handleSubmitRating = async (data: any) => {
    const payload = {
      reviewcontent_id: selectedMovies?.id,
      userreview: data.message,
    };

    try {
      const res: any = await dispatch(submitMovieRating(payload));

      const isSuccess = res?.meta?.requestStatus === 'fulfilled';

      if (isSuccess) {
        await dispatch(getMovieById(selectedMovies?.id));

        show({
          type: 'success',
          title: res?.payload?.message || 'Review submitted successfully',
        });
      }
    } catch (error) {
      show({
        type: 'error',
        title: 'Something went wrong',
      });
    }
  };

  const handleCloseReactions = useCallback(() => {
    if (showReactions) {
      setShowReactions(false);
    }
  }, [showReactions]);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('BottomTab');
    }
  };

  const description = selectedMovies?.description || '';

  const isHTML = /<\/?[a-z][\s\S]*>/i.test(description);

  const onRefresh = useCallback(async () => {
    if (!id) return;

    try {
      setRefreshing(true);
      await dispatch(getMovieById(id));
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, id]);

  // ✅ 👉 PLACE IT HERE (BEFORE RETURN UI)
  if (detailsLoading || !selectedMovies) {
    return <SingleMovieDetailsSkeleton />;
  }

  console.log('selected movie', selectedMovies);

  const isBook = selectedMovies?.type === 'books';
  const hasMovie = !!selectedMovies?.movie_link;
  const hasTrailer = !!selectedMovies?.trailerurl;

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor }]}
        edges={['left', 'right']}
      >
        <StatusBar
          translucent
          barStyle="light-content"
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 10 },
          ]} // 🔥 important
          bounces={false}
          keyboardShouldPersistTaps="handled"
          overScrollMode="auto"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={themeColors.primary} // iOS
              colors={[themeColors.primary]} // Android
              progressBackgroundColor="#1A1A1A"
            />
          }
          onScrollBeginDrag={() => {
            if (showReactions) {
              setShowReactions(false);
            }
          }}
          // Optional: Also close on momentum scroll
          onMomentumScrollBegin={() => {
            if (showReactions) {
              setShowReactions(false);
            }
          }}
        >
          {/* IMAGE */}
          <View style={styles.imageWrapper}>
            <FastImage
              style={styles.image}
              onError={() => setImageError(true)}
              source={
                imageError || !selectedMovies?.coverimage
                  ? require('../../assets/images/fallback.png')
                  : {
                    uri:
                      selectedMovies?.coverimage ||
                      selectedMovies?.bannerimage,
                    priority: FastImage.priority.high,
                  }
              }
              resizeMode={FastImage.resizeMode.cover}
            />

            {/* TOP OVERLAY */}
            <LinearGradient
              colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.3)', 'transparent']}
              style={styles.gradient}
            />

            {/* BOTTOM OVERLAY FOR TITLE */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.92)']}
              style={styles.bottomOverlay}
            />

            <View style={styles.headerOverlay}>
              <AuthHeader
                transparent
                showBack
                // title={selectedMovies?.title}
                onBack={handleBack}
                showBookMark
                postId={selectedMovies?.id}
                bookmarked={
                  bookmarkedIds?.includes(selectedMovies?.id) ||
                  selectedMovies?.is_wishlisted === 1
                }
                onToggleBookmark={() => handleBookmark(selectedMovies?.id)}
              />
            </View>

            {/* TITLE SECTION */}
            <View style={styles.titleContainer}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: "space-between",
                  alignItems: 'center',
                  marginBottom: 4,
                  flexWrap: 'wrap',
                  gap: 6,
                }}
              >
                <View style={{
                  flexDirection: 'row',
                  gap: 6,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}>
                  {selectedMovies?.genres?.length > 0 && (
                    <GenreBadge
                      label={selectedMovies.genres
                        .map((g: any) => g?.name)
                        .filter(Boolean)
                        .join(', ')}
                      size="sm"
                    />
                  )}

                  {isBook ? (
                    hasTrailer && (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={{
                          borderColor: themeColors.primary,
                          borderWidth: 1,
                          paddingHorizontal: 12,
                          paddingVertical: 1,
                          borderRadius: 30,
                          flexDirection: 'row',
                          gap: 6,
                          alignItems: 'center',
                        }}
                        onPress={async () => {
                          if (!selectedMovies?.trailerurl) return;
                          try {
                            await Linking.openURL(selectedMovies.trailerurl);
                          } catch (e) {
                            console.log('Error opening link:', e);
                          }
                        }}
                      >
                        <Text
                          style={{
                            color: themeColors.white,
                            fontFamily: Fonts.Bold,
                            fontSize: 13,
                          }}
                        >
                          Click Link
                        </Text>
                      </TouchableOpacity>
                    )
                  ) : (
                    <>
                      {selectedMovies?.view_trailer_url === true && hasTrailer && (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={{
                            borderColor: themeColors.primary,
                            borderWidth: 1,
                            paddingHorizontal: 12,
                            paddingVertical: 1,
                            borderRadius: 30,
                            flexDirection: 'row',
                            gap: 6,
                            alignItems: 'center',
                          }}
                          onPress={async () => {
                            if (!selectedMovies?.trailerurl) return;
                            try {
                              await Linking.openURL(selectedMovies.trailerurl);
                            } catch (e) {
                              console.log('Error opening trailer URL:', e);
                            }
                          }}
                        >
                          <Text
                            style={{
                              color: themeColors.white,
                              fontFamily: Fonts.Bold,
                              fontSize: 13,
                            }}
                          >
                            Watch Trailer
                          </Text>
                        </TouchableOpacity>
                      )}

                      {selectedMovies?.view_trailer_url === false && hasTrailer && (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={{
                            borderColor: themeColors.primary,
                            borderWidth: 1,
                            paddingHorizontal: 12,
                            paddingVertical: 1,
                            borderRadius: 30,
                            flexDirection: 'row',
                            gap: 6,
                            alignItems: 'center',
                          }}
                          onPress={async () => {
                            if (!selectedMovies?.trailerurl) return;
                            try {
                              await Linking.openURL(selectedMovies.trailerurl);
                            } catch (e) {
                              console.log('Error opening video URL:', e);
                            }
                          }}
                        >
                          <Text
                            style={{
                              color: themeColors.white,
                              fontFamily: Fonts.Bold,
                              fontSize: 13,
                            }}
                          >
                            Watch Video
                          </Text>
                        </TouchableOpacity>
                      )}

                      {/* Show Watch Movie if view_movie_url is true */}
                      {selectedMovies?.view_movie_url === true && hasMovie && (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={{
                            borderColor: themeColors.primary,
                            borderWidth: 1,
                            paddingHorizontal: 12,
                            paddingVertical: 1,
                            borderRadius: 30,
                            flexDirection: 'row',
                            gap: 6,
                            alignItems: 'center',
                          }}
                          onPress={async () => {
                            if (!selectedMovies?.movie_link) return;
                            try {
                              await Linking.openURL(selectedMovies.movie_link);
                            } catch (e) {
                              console.log('Error opening movie URL:', e);
                            }
                          }}
                        >
                          <Text
                            style={{
                              color: themeColors.white,
                              fontFamily: Fonts.Bold,
                              fontSize: 13,
                            }}
                          >
                            Watch Movie
                          </Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>
              </View>
              <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
                {selectedMovies?.title}
              </Text>
            </View>
            {showReactions && (
              <View
                pointerEvents="box-none"
                style={{
                  position: 'absolute',
                  top: 350,
                  zIndex: 9999,
                  elevation: 20,

                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-around',

                  backgroundColor: '#111',
                  borderRadius: 40,

                  paddingVertical: 4,
                  paddingHorizontal: 12,

                  width: 250,

                  alignSelf: 'center',
                }}
              >
                {[
                  {
                    id: 'Heart',
                    icon: require('../../assets/Likes/511.gif'),
                  },
                  {
                    id: 'Love',
                    icon: require('../../assets/Likes/515.gif'),
                  },
                  {
                    id: 'Claps',
                    icon: require('../../assets/Likes/514.gif'),
                  },
                  {
                    id: 'Joy',
                    icon: require('../../assets/Likes/512.gif'),
                  },
                  {
                    id: 'Laugh',
                    icon: require('../../assets/Likes/513.gif'),
                  },
                ].map(item => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    onPress={() => {
                      setShowReactions(false);

                      if (selectedMovies?.id) {
                        handleLike(selectedMovies.id, item.id as ReactionType);
                      }
                    }}
                  >
                    <FastImage
                      source={item.icon}
                      style={{
                        width: 24,
                        height: 24,
                      }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* ACTION BAR */}
            <ActionBar
              style={{
                borderWidth: 1,
                borderColor: 'rgba(200,155,60,0.25)',
                backgroundColor: 'rgba(20,20,20,0.95)',
              }}
              variant="floating" // 💥 IMPORTANT
              backgroundColor={isDark ? themeColors.card : themeColors.card4}
              items={[
                {
                  isLike: true,

                  liked: selectedMovies?.is_liked === 1,
                  title: 'Likes',

                  emoji_type: selectedMovies?.emoji_type,

                  icon: <Heart size={18} color={isDark ? '#fff' : '#000'} />,

                  activeIcon: <HeartActive size={18} color={themeColors.red} />,

                  label: String(selectedMovies?.is_like || 0),

                  onPress: () => {
                    if (!showReactions) {
                      handleLike(
                        selectedMovies?.id,

                        // ✅ if already reacted -> unlike same emoji
                        selectedMovies?.is_liked === 1
                          ? selectedMovies?.emoji_type
                          : 'Heart',
                      );
                    }
                  },

                  onLongPress: () => {
                    setShowReactions(true);
                  },
                },
                {
                  icon: <EyeTwo size={22} color={isDark ? '#fff' : '#000'} />,
                  label: selectedMovies?.views ?? '0',
                  title: 'Views',
                },
                {
                  icon: <Star size={18} color={themeColors.primary} rating={rating ? Number(rating) : 0}/>,
                  label: rating,
                  title: 'Ratings',
                },
                {
                  icon: <Share size={18} color={isDark ? '#fff' : '#000'} />,
                  title: 'Share',
                  onPress: handleShare,
                },
              ]}
            />
          </View>

          {/* CONTENT */}
          <View style={styles.contentContainer}>
            {/* Stars */}
            <View
              style={[
                styles.descriptionCard,
                {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                },
              ]}
            >
              <View>
                <Text
                  style={{
                    color: themeColors.white,
                    marginBottom: 5,
                    fontFamily: Fonts.Bold,
                    fontSize: 16,
                  }}
                >
                  Rate This Movie
                </Text>
                <View style={styles.starRow}>
                  {[1, 2, 3, 4, 5].map((i: any) => (
                    <TouchableOpacity
                      key={i}
                      onPress={async () => {
                        setRatings(i);

                        const payload = {
                          rating: i,
                          reviewcontent_id: selectedMovies?.id,
                        };

                        try {
                          const res: any = await dispatch(
                            submitMovieRating(payload),
                          );

                          const isSuccess =
                            res?.meta?.requestStatus === 'fulfilled';

                          if (isSuccess) {
                            await dispatch(getMovieById(selectedMovies?.id));

                            show({
                              type: 'success',
                              title: 'Rating submitted',
                            });
                          }
                        } catch (e) {
                          show({
                            type: 'error',
                            title: 'Something went wrong',
                          });
                        }
                      }}
                    >
                      <Star
                        size={28}
                        color={i <= ratings ? '#FFD700' : '#444'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <Text
                  style={{
                    color: themeColors.gray,
                    marginTop: 5,
                    fontFamily: Fonts.Bold,
                    fontSize: 12,
                  }}
                >
                  Tap a star to rate
                </Text>
              </View>
              <TouchableOpacity
                style={styles.reviewBtn}
                onPress={() => {
                  setRatingVisible(true);
                }}
              >
                <Text style={styles.reviewBtnText}>Write Review</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.descContainer}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  marginBottom: 8,
                }}
              >
                <Note size={22} color={themeColors.primary} />
                <Text style={styles.descTitle}>About the Movie</Text>
              </View>

              {isHTML ? (
                <RenderHtml
                  contentWidth={width}
                  source={{
                    html: expanded ? description : description?.slice(0, 250),
                  }}
                  systemFonts={[
                    Fonts.Regular,
                    Fonts.Bold,
                    Fonts.SemiBold,
                    Fonts.Italic,
                    Fonts.Black,
                  ]}
                  baseStyle={{
                    color: '#ECE2D0',
                    fontFamily: Fonts.Regular,
                  }}
                  tagsStyles={{
                    body: {
                      margin: 0,
                      padding: 0,
                    },

                    p: {
                      fontSize: 15,
                      marginTop: 0,
                      marginBottom: 0,
                      padding: 0,
                      color: '#ECE2D0',
                      fontFamily: Fonts.Regular,
                      lineHeight: 24,
                    },

                    ul: {
                      paddingLeft: 18,
                      marginTop: 0,
                      marginBottom: 0,
                    },

                    ol: {
                      paddingLeft: 18,
                      marginTop: 0,
                      marginBottom: 0,
                    },

                    li: {
                      fontSize: 15,
                      marginBottom: 8,
                      color: '#ECE2D0',
                      fontFamily: Fonts.Regular,
                      lineHeight: 24,
                    },

                    h1: {
                      fontSize: 24,
                      color: '#FFFFFF',
                      fontFamily: Fonts.Black,
                      marginBottom: 12,
                    },

                    h2: {
                      fontSize: 22,
                      marginBottom: 10,
                      color: '#FFFFFF',
                      fontFamily: Fonts.Bold,
                    },

                    strong: {
                      fontFamily: Fonts.Bold,
                      color: '#FFFFFF',
                    },

                    em: {
                      fontFamily: Fonts.Italic,
                    },
                  }}
                />
              ) : (
                <Text
                  style={styles.description}
                  numberOfLines={expanded ? undefined : 4}
                >
                  {description}
                </Text>
              )}

              {!!description && description?.length > 140 && (
                <Pressable
                  onPress={() => setExpanded(!expanded)}
                  style={{
                    marginTop: 8,
                    alignSelf: 'flex-start',
                  }}
                >
                  <Text style={styles.readMoreText}>
                    {expanded ? 'Read less' : 'Read more'}
                  </Text>
                </Pressable>
              )}
            </View>

            {/* ⭐ POPULAR REVIEWS */}
            {selectedMovies?.reviews.length > 0 && (
              <View style={styles.reviewSection}>
                <Text
                  style={[
                    styles.reviewTitle,
                    { color: isDark ? '#fff' : '#000' },
                  ]}
                >
                  Popular Reviews
                </Text>

                {selectedMovies?.reviews
                  ?.slice(0, visibleReviews)
                  ?.map((item: any, index: number) => (
                    <ReviewCard key={index} item={item} />
                  ))}

                {selectedMovies?.reviews?.length > visibleReviews && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setVisibleReviews(prev => prev + 5)}
                    style={{
                      marginTop: 10,
                      alignSelf: 'center',
                      paddingVertical: 5,
                      paddingHorizontal: 18,
                      borderRadius: 30,
                      backgroundColor: themeColors.card2,
                    }}
                  >
                    <Text
                      style={{
                        color: themeColors.primary,
                        fontFamily: Fonts.Bold,
                        fontSize: 12,
                      }}
                    >
                      View More Reviews
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* 🎬 RECOMMENDED MOVIES */}
            {!!selectedMovies?.recommended?.length && (
              <View style={styles.recommendedSection}>
                <View style={styles.peopleHeader}>
                  <View style={styles.peopleLine} />

                  <Text style={styles.peopleHeaderText}>
                    SUGGESTED
                  </Text>

                  <View style={styles.peopleLine} />
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingRight: 10,
                  }}
                >
                  {selectedMovies?.recommended?.map(
                    (item: any, index: number) => (
                      <TouchableOpacity
                        key={item?.id || index}
                        activeOpacity={0.9}
                        onPress={() => {
                          navigation.push('SingleMovieDetails', {
                            id: item?.id,
                          });
                        }}
                        style={{
                          marginRight: 7,
                        }}
                      >
                        <MovieCard
                          title={item?.title}
                          height={230}
                          rating={item?.avg_rating}
                          width={CARD_WIDTH}
                          image={item?.bannerimage}
                          onPress={() =>
                            navigation.navigate('SingleMovieDetails', {
                              id: item.id,
                            })
                          }
                          bookmarked={
                            bookmarkedIds?.includes(item?.id) ||
                            item?.is_wishlisted === 1
                          }
                          onBookmark={() => handleBookmark(item?.id)}
                        />
                      </TouchableOpacity>
                    ),
                  )}
                </ScrollView>
              </View>
            )}

            {/* 🔥 BUTTON AT BOTTOM */}
            {/* <View style={styles.buttonContainer}>
              <PrimaryButton
                title={'Write Review'}
                onPress={() => {
                  setRatingVisible(true);
                }}
              />
            </View> */}
          </View>
        </ScrollView>
        {/* MODAL */}
        <MovieRatingModal
          visible={ratingVisible}
          onClose={() => setRatingVisible(false)}
          movieId={selectedMovies?.id}
          initialMessage={myReview?.userreview || ''}
          onSubmit={handleSubmitRating}
        />
      </SafeAreaView>
    </View>
  );
};

export default SingleMovieDetails;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  imageWrapper: {
    borderRadius: 10,
    // overflow: 'hidden',
    position: 'relative',
  },

  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 1,
  },

  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    zIndex: 1,
  },

  headerOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    zIndex: 10,
  },

  titleContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    zIndex: 999,
  },

  image: {
    width: '100%',
    height: 400,
  },

  contentContainer: {
    flex: 1,
    marginTop: 30,
    paddingHorizontal: 10,
  },

  title: {
    fontSize: 26,
    fontFamily: Fonts.Black,
    color: themeColors.white,
  },

  // description: {
  //   fontSize: 15,
  //   color: themeColors.white,
  //   fontFamily: Fonts.Regular,
  //   textAlign: 'justify',
  // },

  buttonContainer: {
    marginTop: 'auto',
  },

  reviewSection: {
    marginTop: 20,
  },

  reviewTitle: {
    fontSize: 18,
    fontFamily: Fonts.Bold,
    marginBottom: 12,
  },

  recommendedSection: {
    marginTop: 30,
    marginBottom: 20,
  },

  descriptionCard: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: themeColors.card2,
    marginTop: 6,
  },

  descContainer: {
    paddingVertical: 10,
  },

  descTitle: {
    fontSize: 18,
    fontFamily: Fonts.Bold,
    color: themeColors.primary,
  },

  description: {
    fontSize: 15,
    color: themeColors.white,
    fontFamily: Fonts.Regular,
    textAlign: 'justify',
  },

  readMoreText: {
    color: themeColors.primary,
    fontSize: 14,
    fontFamily: Fonts.Bold,
  },

  starRow: {
    flexDirection: 'row',
    // justifyContent: 'center',
    gap: 10,
    // marginVertical: 10,
  },

  reviewBtn: {
    backgroundColor: themeColors.primary,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  reviewBtnText: {
    fontFamily: Fonts.Bold,
    fontSize: 12,
    color: themeColors.white,
  },

  peopleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  peopleLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#3A2A00',
  },

  peopleHeaderText: {
    color: themeColors.white,
    fontSize: 12,
    letterSpacing: 2,
    marginHorizontal: 12,
    fontFamily: Fonts.Medium,
  },
});
