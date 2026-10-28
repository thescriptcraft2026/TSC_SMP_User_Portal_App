import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import AuthHeader from '../../components/Header/AuthHeader';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';

import Heart from '../../assets/SVG/Heart';
import Star from '../../assets/SVG/Star';
import Share from '../../assets/SVG/Share';

import { Fonts } from '../../constants/Fonts';
import { themeColors } from '../../theme/colors';
import RatingModal from '../../components/Modals/RatingModal';
import User from '../../assets/SVG/User';
import { useShare } from '../../hooks/useShare';
import HeartActive from '../../assets/SVG/HeartActive';
import ActionBar from '../../components/AcrtionBar/ActionBar';
import FollowButton from '../../components/Buttons/FollowButton';
import EyeTwo from '../../assets/SVG/EyeTwo';
import { useDispatch, useSelector } from 'react-redux';
import he from 'he';
import {
  likeAction,
  setInitialLikes,
  toggleBookmarkLocal,
  toggleLikeLocal,
  wishlistAction,
} from '../../redux/slices/actionSlice';
import { createReport, getReports } from '../../redux/slices/reportSlice';
import { useToast } from '../../components/Toast/ToastProvider';
import {
  deleteBook,
  getBookByIdThunk,
  getSuggestedBooks,
  ratingAction,
  updateLikeCount,
  updateRatingLocal,
} from '../../redux/slices/bookSlice';
import { follow, unFollow } from '../../redux/slices/profileSlice';
import { formatDate } from '../../utils/date';
import GenreBadge from '../../components/Badges/GenreBadge';
import ReportModal from '../../components/Modals/ReportModal';
import BookDetailsSkeleton from '../../components/skeleton/BookDetailsSkeleton';
import RenderHTML from 'react-native-render-html';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import BookCard from '../Books/components/cards/BookCard';
import SynopsisCard from './components/SynopsisCard';
import { ReactionType } from '../../hooks/useEmojiReaction';
import { useHandleLike } from '../../hooks/useHandleLike';
import { verticalScaleSize } from '../../utils/responsive';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 10;
const CARD_WIDTH = width - 100;

const SynopsisDetails = () => {
  const navigation = useNavigation<any>();
  const isDark = true;
  const [ratingVisible, setRatingVisible] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const route = useRoute<any>();
  const synopsisId = route.params?.synopsisId || route.params?.id;
  const dispatch = useDispatch<any>();
  const { show } = useToast();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // 📖 Kindle-like background
  const backgroundColor = useMemo(
    () => (isDark ? themeColors.black : themeColors.appBackground),
    [isDark],
  );

  // Redux
  const {
    selectedBook: selectedSynopses,
    loading,
    suggestedBooks: synopsesSuggetion,
  } = useSelector((state: any) => state.book);
  const { bookmarkedIds, likedIds } = useSelector(
    (state: any) => state.actions,
  );
  const { user: authUser } = useSelector((state: any) => state.auth);

  const isOwnPost = useMemo(
    () => authUser?.id === selectedSynopses?.user?.id,
    [authUser?.id, selectedSynopses?.user?.id],
  );
  const isFollowing = selectedSynopses?.user?.isFollowing === 1;
  // const likeCount = selectedSynopses?.likes_count ?? 0;
  const isAlreadyReported = selectedSynopses?.isReported;

  // 🔥 CLEAN HTML
  const decodedHTML = useMemo(() => {
    const htmlContent =
      selectedSynopses?.story || selectedSynopses?.synopsis || '';

    if (!htmlContent) {
      return '';
    }

    let html = he.decode(htmlContent);

    html = html.replace(/<div>/g, '<p>');
    html = html.replace(/<\/div>/g, '</p>');
    html = html.replace(/<p>\s*<\/p>/g, '');
    html = html.replace(/<p>&nbsp;<\/p>/g, '');

    return html;
  }, [selectedSynopses?.story, selectedSynopses?.synopsis]);

  const TRUNCATE_LENGTH = 500;

  const displayedHTML = useMemo(() => {
    if (!decodedHTML) return '';

    if (expanded || decodedHTML.length <= TRUNCATE_LENGTH) {
      return decodedHTML;
    }

    return `${decodedHTML.slice(0, TRUNCATE_LENGTH)}...`;
  }, [decodedHTML, expanded]);

  const showSeeMore = decodedHTML.length > TRUNCATE_LENGTH;

  useFocusEffect(
    useCallback(() => {
      if (synopsisId) dispatch(getBookByIdThunk(synopsisId));
    }, [synopsisId]),
  );

  useEffect(() => {
    if (selectedSynopses?.id) {
      dispatch(getSuggestedBooks(selectedSynopses?.id));
    }
  }, [selectedSynopses?.id]);

  // 🔥 LIKE
  const {
    handleLike,
    likedIds: bookLikeIds,
    reactionMap,
    likeCountMap,
  } = useHandleLike();
  const likeCount =
    likeCountMap[selectedSynopses?.id] ?? selectedSynopses?.likes_count ?? 0;

  // 🔥 BOOKMARK
  const handleBookmark = useCallback(
    async (id: string) => {
      const isBookmarked = bookmarkedIds?.includes(id);

      dispatch(toggleBookmarkLocal(id));

      const res: any = await dispatch(
        wishlistAction({
          synopsis_id: id,
          type: isBookmarked ? 'delete' : 'create',
        }),
      );

      if (res?.meta?.requestStatus !== 'fulfilled') {
        dispatch(toggleBookmarkLocal(id));
        show({ type: 'error', title: 'Something went wrong' });
      } else {
        show({
          type: 'success',
          title: isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks',
        });
      }
    },
    [bookmarkedIds],
  );

  // 🔥 DELETE
  const handleDelete = async () => {
    if (!selectedSynopses?.id) return;

    const res: any = await dispatch(deleteBook(selectedSynopses.id));

    if (res?.meta?.requestStatus === 'fulfilled') {
      show({ type: 'success', title: 'Book deleted successfully' });
      navigation.goBack();
    } else {
      show({ type: 'error', title: 'Delete failed' });
    }
  };

  const confirmDelete = () => {
    Alert.alert(`Delete this ${selectedSynopses.title}`, 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: handleDelete },
    ]);
  };

  // 🔥 RATING
  const handleRating = async (id: string, rating: number) => {
    try {
      const res: any = await dispatch(
        ratingAction({
          synopsis_id: id,
          rating,
        }),
      );

      if (res?.payload?.success) {
        // 🔥 REFRESH BOOK DETAILS
        await dispatch(getBookByIdThunk(id));

        show({
          type: 'success',
          title: res.payload.message,
        });
      }
    } catch (error) {
      show({
        type: 'error',
        title: 'Rating failed',
      });
    }
  };

  // 🔥 FOLLOW
  const handleFollow = async () => {
    if (!selectedSynopses?.user?.id) return;

    const action = isFollowing ? unFollow : follow;

    const res = await dispatch(action(selectedSynopses.user.id)).unwrap();

    await dispatch(getBookByIdThunk(selectedSynopses.id));

    show({ type: 'success', title: res?.message });
  };

  const { handleShare } = useShare({
    type: 'synopsis',
    value: selectedSynopses?.id,
    title: selectedSynopses?.title,
  });

  // Handle Report
  const handleReport = async (data: any) => {
    try {
      if (!selectedSynopses?.id) return;

      const payload: any = {
        report_id: data.reason, // ✅ already ID from modal
        description: data.message || '',
        synopses_id: selectedSynopses.id,
        reported_user_id: selectedSynopses?.user?.id,
        chat_id: null,
        message_id: null,
      };

      console.log('FINAL REPORT PAYLOAD:', payload);

      const res = await dispatch(createReport(payload));
      console.log('report submit res', res);
      show({
        type: 'success',
        title: res?.payload?.message,
      });

      setReportVisible(false); // ✅ close modal
      await dispatch(getBookByIdThunk(selectedSynopses?.id));
    } catch (error: any) {
      show({
        type: 'error',
        title: error,
      });
    }
  };

  const rating = selectedSynopses?.avg_rating
    ? Number(selectedSynopses.avg_rating).toFixed(1)
    : '0.0';

  // 🔥 INITIAL LIKE FIX
  useEffect(() => {
    if (selectedSynopses?.id && selectedSynopses?.isLiked === 1) {
      if (!likedIds.includes(selectedSynopses.id)) {
        dispatch(setInitialLikes([selectedSynopses.id]));
      }
    }
  }, [selectedSynopses?.id]);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('BottomTab');
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        translucent
        barStyle={'light-content'}
      />

      <AuthHeader
        showBack
        // title={selectedSynopses?.title}
        fontSize={18}
        onBack={handleBack}
        showBookMark
        showMenu
        postId={selectedSynopses?.id}
        bookmarked={
          selectedSynopses?.id
            ? bookmarkedIds.includes(selectedSynopses.id)
            : false
        }
        onToggleBookmark={bookId => handleBookmark(bookId)}
        disabled={!selectedSynopses?.id}
        onEdit={
          isOwnPost
            ? () => {
              navigation.navigate('AddSynopsis', {
                book: selectedSynopses, // 🔥 pass full object
              });
            }
            : undefined
        }
        onDelete={isOwnPost ? confirmDelete : undefined}
        onReport={
          !isOwnPost && !isAlreadyReported
            ? () => {
              dispatch(getReports());
              setReportVisible(true);
            }
            : undefined
        }
        isOwnPost={isOwnPost}
        isAlreadyReported={isAlreadyReported}
        onNotInterested={() => {
          show({
            type: 'info',
            title: 'Marked as not interested',
          });
        }}
        type={"Synopses"}
      />

      {loading ? (
        <BookDetailsSkeleton />
      ) : (
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: insets.bottom + verticalScaleSize(30),
          }}
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
          <View>
            {/* IMAGE */}
            <View style={styles.imageWrapper}>
              {imageLoading && (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="small" color={themeColors.primary} />
                </View>
              )}
              <FastImage
                source={
                  imageError || !selectedSynopses?.image
                    ? require('../../assets/images/book-1.png')
                    : { uri: selectedSynopses?.image }
                }
                style={styles.image}
                resizeMode="cover"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
              />
              <View style={{ position: 'absolute', top: 10, right: 10 }}>
                <GenreBadge label={selectedSynopses?.genre?.name} size="sm" />
              </View>
            </View>

            {/* REACTION PICKER */}
            {showReactions && (
              <View
                style={{
                  position: 'absolute',
                  top: 260,
                  left: 20,
                  right: 20,
                  zIndex: 9999,
                  elevation: 20,

                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-around',

                  backgroundColor: '#111',
                  borderRadius: 40,

                  paddingVertical: 6,
                  paddingHorizontal: 16,
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

                      if (selectedSynopses?.id) {
                        handleLike({
                          id: selectedSynopses.id,
                          emoji_type: (item.id as ReactionType) || '',
                          likes_count: selectedSynopses?.likes_count || 0,
                          isReactionPress: true,
                        });
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
              key={likedIds.join(',')} // 🔥 FORCE UPDATE
              style={{
                borderWidth: 1,
                borderColor: 'rgba(200,155,60,0.25)',
                backgroundColor: 'rgba(20,20,20,0.95)',
              }}
              items={[
                {
                  isLike: true,

                  liked:
                    !!selectedSynopses?.id &&
                    likedIds.includes(selectedSynopses.id),

                  emoji_type: likedIds.includes(selectedSynopses?.id)
                    ? reactionMap[selectedSynopses?.id] ??
                    selectedSynopses?.emoji_type
                    : null,
                  title: 'Like',
                  icon: <Heart size={18} color={isDark ? '#fff' : '#000'} />,

                  activeIcon: <HeartActive size={18} color={themeColors.red} />,

                  label: `${likeCount}`,

                  onPress: () => {
                    if (!showReactions) {
                      selectedSynopses?.id &&
                        handleLike({
                          id: selectedSynopses.id,
                          emoji_type: 'Heart',
                          likes_count: selectedSynopses?.likes_count || 0,
                          isReactionPress: false,
                        });
                    }
                  },

                  onLongPress: () => {
                    setShowReactions(true);
                  },
                },
                {
                  icon: <EyeTwo size={22} color={isDark ? '#fff' : '#000'} />,
                  label: selectedSynopses?.views ?? '0',
                  title: 'View',
                },
                {
                  icon: <Star size={18} color={themeColors.primary} rating={rating ? Number(rating) : 0}/>,
                  label: rating,
                  title: 'Rating',
                },
                {
                  icon: <Share size={18} color={isDark ? '#fff' : '#000'} />,
                  title: 'Share',
                  onPress: handleShare,
                },
              ]}
            />

            {/* 📖 READING CONTENT */}
            <View style={styles.contentContainer}>
              <View
                style={{
                  backgroundColor: isDark
                    ? themeColors.card2
                    : themeColors.white,
                  padding: 10,
                  borderRadius: 10,
                }}
              >
                <View style={styles.metaRow}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    {/* TITLE */}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.title,
                          { color: isDark ? '#fff' : '#2C2C2C' },
                        ]}
                        ellipsizeMode="tail"
                        numberOfLines={2}
                      >
                        {selectedSynopses?.title}
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('Profile', {
                        username:
                          selectedSynopses?.user?.user_name ||
                          selectedSynopses?.user?.id ||
                          selectedSynopses?.user?.userId,
                      });
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      justifyContent: "space-between"
                    }}
                  >
                    <User
                      size={14}
                      color={isDark ? themeColors.gray : themeColors.black}
                    />
                    <Text
                      style={[
                        styles.author,
                        {
                          color: isDark ? themeColors.gray : themeColors.black,
                        },
                      ]}
                      numberOfLines={1} ellipsizeMode='tail'
                    >
                      {selectedSynopses?.user?.name} -
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.date}>
                    {formatDate(selectedSynopses?.createdAt)}
                  </Text>
                </View>
              </View>

              {/* DESCRIPTION */}
              {decodedHTML && (
                <View
                  style={{
                    marginTop: 7,
                    backgroundColor: isDark
                      ? themeColors.card2
                      : themeColors.white,
                    padding: 10,
                    borderRadius: 10,
                  }}
                >
                  <RenderHTML
                    contentWidth={width - 20}
                    source={{ html: displayedHTML }}
                    systemFonts={[
                      Fonts.Regular,
                      Fonts.Bold,
                      Fonts.SemiBold,
                      Fonts.Italic,
                      Fonts.Black,
                    ]}
                    renderersProps={{
                      text: {
                        onPress: (event: any, text: any) => {
                          if (text.startsWith('#')) {
                            console.log('Tag clicked:', text);
                          }
                        },
                      },
                    }}
                    baseStyle={{
                      color: isDark ? themeColors.white : themeColors.black,
                      fontFamily: Fonts.Regular,
                    }}
                    tagsStyles={{
                      p: {
                        fontSize: 15,
                        marginBottom: 14,
                        textAlign: 'justify',
                        color: isDark ? themeColors.white : '#3E3A36',
                        fontFamily: Fonts.Regular,
                      },
                      h1: {
                        fontSize: 22,
                        marginBottom: 12,
                        color: isDark ? themeColors.white : themeColors.black,
                        fontFamily: Fonts.Bold,
                      },
                      h2: {
                        fontSize: 20,
                        marginBottom: 10,
                        color: isDark ? themeColors.white : themeColors.black,
                        fontFamily: Fonts.SemiBold,
                      },
                      li: {
                        fontSize: 15,
                        marginBottom: 8,
                        color: isDark ? themeColors.white : themeColors.black,
                        fontFamily: Fonts.Regular,
                      },
                      strong: {
                        fontFamily: Fonts.Bold,
                      },
                      em: {
                        fontFamily: Fonts.Italic,
                      },
                    }}
                  />

                  {/* SEE MORE / SEE LESS */}
                  {showSeeMore && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setExpanded(prev => !prev)}
                      style={styles.seeMoreButton}
                    >
                      <Text style={styles.seeMoreText}>
                        {expanded ? 'See Less' : 'See More'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <View style={styles.tagsContainer}>
                {selectedSynopses?.tags?.length > 0 &&
                  selectedSynopses.tags.map((tag: any, index: number) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() =>
                        console.log('Tag clicked:', tag.name || tag)
                      }
                      style={[
                        styles.tag,
                        {
                          backgroundColor: isDark
                            ? themeColors.card2
                            : themeColors.card2,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tagText,
                          {
                            color: isDark
                              ? themeColors.primary
                              : themeColors.primary,
                          },
                        ]}
                      >
                        #{tag.name || tag}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>

              {/* 🔥 SUGGESTED Synopses */}
              {synopsesSuggetion?.length > 0 && (
                <View style={{ marginTop: 20 }}>
                  {/* <Text
                    style={{
                      fontSize: 18,
                      fontFamily: Fonts.Bold,
                      color: isDark ? '#fff' : '#000',
                      marginBottom: 10,
                      paddingHorizontal: 6,
                    }}
                  >
                    Suggested for you
                  </Text> */}
                  <View style={styles.peopleHeader}>
                    <View style={styles.peopleLine} />

                    <Text style={styles.peopleHeaderText}>
                      suggested synopses
                    </Text>

                    <View style={styles.peopleLine} />
                  </View>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {synopsesSuggetion.map((item: any, index: number) => (
                      <SynopsisCard
                        key={index}
                        image={item.image || 'https://via.placeholder.com/150'}
                        height={160}
                        width={CARD_WIDTH}
                        onPress={() => {
                          navigation.navigate('SynopsisDetails', {
                            synopsisId: item?.id,
                          });
                        }}
                        ribbonText={item.genre?.name}
                        bookmarked={bookmarkedIds.includes(item.id)}
                        onBookmark={() => handleBookmark(item.id)}
                        likes={likeCountMap[item.id] ?? item.likes_count}
                        views={item?.views}
                        rating={item?.avg_rating ?? '0'}
                        title={item?.title}
                        author={item?.user?.name}
                        handleLike={(reaction?: ReactionType) =>
                          handleLike({
                            id: item.id,
                            emoji_type: reaction || 'Heart',
                            likes_count: item.likes_count || 0,
                            isReactionPress: reaction !== undefined,
                          })
                        }
                        emoji_type={
                          likedIds.includes(item.id)
                            ? reactionMap[item.id] ?? item.emoji_type
                            : null
                        }
                        isLiked={likedIds.includes(item.id)}
                        marginRight={10}
                      />
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* 🔥 BUTTON AT BOTTOM */}
              <View style={styles.buttonContainer}>
                <PrimaryButton
                  title="Rate now"
                  onPress={() => setRatingVisible(true)}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Rating Modal */}
      <RatingModal
        visible={ratingVisible}
        initialRating={Number(selectedSynopses?.ratings?.[0]?.rating || 0)}
        onClose={() => setRatingVisible(false)}
        onSubmit={(rating: any) => {
          if (!selectedSynopses?.id) return;
          handleRating(selectedSynopses.id, rating);
          setRatingVisible(false);
        }}
      />

      <ReportModal
        visible={reportVisible}
        onClose={() => setReportVisible(false)}
        post={selectedSynopses} // 🔥 important
        onSubmit={handleReport}
        reportType="SYNOPSIS"
      />
    </SafeAreaView>
  );
};

export default SynopsisDetails;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  scroll: {
    paddingHorizontal: 10,
  },

  imageWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },

  image: {
    width: '100%',
    height: 300,
  },

  contentContainer: {
    marginTop: 8,
    flex: 1,
  },

  title: {
    fontSize: 20,
    fontFamily: Fonts.Black,
    lineHeight: 24,
    flexShrink: 1, // 🔥 MUST
  },

  author: {
    fontSize: 14,
    fontFamily: Fonts.Regular,
    maxWidth: width * 0.6,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // 🔥 important
  },

  date: {
    fontSize: 12,
    color: '#9A8F7A',
    fontFamily: Fonts.Regular,
  },

  description: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 28,
    color: '#3E3A36',
    fontFamily: Fonts.Regular,
    textAlign: 'justify',
  },

  buttonContainer: {
    marginTop: 'auto',
  },

  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 6,
  },

  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  tagText: {
    fontSize: 13,
    fontFamily: Fonts.SemiBold,
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
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
    marginHorizontal: 8,
    fontFamily: Fonts.Medium,
    textTransform: 'uppercase',
  },

  seeMoreButton: {
    alignSelf: 'flex-start',
    marginTop: 2,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },

  seeMoreText: {
    color: themeColors.primary,
    fontSize: 14,
    fontFamily: Fonts.SemiBold,
  },
});
