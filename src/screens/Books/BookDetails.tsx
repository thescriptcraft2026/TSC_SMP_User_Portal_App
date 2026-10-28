import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
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
import GenreBadge from '../../components/Badges/GenreBadge';
import RatingModal from '../../components/Modals/RatingModal';
import User from '../../assets/SVG/User';
import { useShare } from '../../hooks/useShare';
import HeartActive from '../../assets/SVG/HeartActive';
import ActionBar from '../../components/AcrtionBar/ActionBar';
import FollowButton from '../../components/Buttons/FollowButton';
import EyeTwo from '../../assets/SVG/EyeTwo';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteBook,
  getBookByIdThunk,
  getSuggestedBooks,
  ratingAction,
  updateRatingLocal,
} from '../../redux/slices/bookSlice';
import BookDetailsSkeleton from '../../components/skeleton/BookDetailsSkeleton';
import { formatDate } from '../../utils/date';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import he from 'he';
import {
  setInitialLikes,
  setInitialReactions,
  toggleBookmarkLocal,
  wishlistAction,
} from '../../redux/slices/actionSlice';
import { useToast } from '../../components/Toast/ToastProvider';
import { follow, unFollow } from '../../redux/slices/profileSlice';
import ReportModal from '../../components/Modals/ReportModal';
import { createReport, getReports } from '../../redux/slices/reportSlice';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import BookCard from './components/cards/BookCard';
import { ReactionType } from '../../hooks/useEmojiReaction';
import { useHandleLike } from '../../hooks/useHandleLike';
import LinearGradient from 'react-native-linear-gradient';
import StarTwo from '../../assets/SVG/StarTwo';
import { verticalScaleSize } from '../../utils/responsive';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 10;
const CARD_WIDTH = (width - CARD_MARGIN * 2.5) / 2;

const BookDetails = () => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation<any>();
  const isDark = true;
  const dispatch = useDispatch<any>();
  const { show } = useToast();
  const insets = useSafeAreaInsets();

  const route = useRoute<any>();
  const bookId = route.params?.bookId || route.params?.id;

  const [ratingVisible, setRatingVisible] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { selectedBook, loading, suggestedBooks, suggestedLoading } =
    useSelector((state: any) => state.book);
  const { bookmarkedIds, likedIds } = useSelector(
    (state: any) => state.actions,
  );
  const { user: authUser } = useSelector((state: any) => state.auth);

  const isOwnPost = useMemo(
    () => authUser?.id === selectedBook?.user?.id,
    [authUser?.id, selectedBook?.user?.id],
  );

  useEffect(() => {
    setExpanded(false);
  }, [bookId]);

  const isFollowing = selectedBook?.user?.isFollowing === 1;

  const backgroundColor = useMemo(
    () => (isDark ? themeColors.black : themeColors.appBackground),
    [isDark],
  );

  const isAlreadyReported = selectedBook?.isReported;

  // 🔥 CLEAN HTML
  const decodedHTML = useMemo(() => {
    const htmlContent = selectedBook?.story || selectedBook?.synopsis;

    if (!htmlContent) {
      return '';
    }

    let html = he.decode(htmlContent);

    html = html.replace(/<div>/g, '<p>');
    html = html.replace(/<\/div>/g, '</p>');
    html = html.replace(/<p>\s*<\/p>/g, '');
    html = html.replace(/<p><ul>/g, '<ul>');
    html = html.replace(/<\/ul><\/p>/g, '</ul>');

    return html;
  }, [selectedBook?.story, selectedBook?.synopsis]);

  const TRUNCATE_LENGTH = 500;

  const displayHTML = useMemo(() => {
    if (!decodedHTML) return '';

    if (expanded) {
      return decodedHTML;
    }

    // Remove HTML tags only for checking length
    const plainText = decodedHTML.replace(/<[^>]*>/g, '').trim();

    if (plainText.length <= TRUNCATE_LENGTH) {
      return decodedHTML;
    }

    // Take first 500 characters from the text
    const truncatedText = plainText.slice(0, TRUNCATE_LENGTH);

    return `<p>${truncatedText}...</p>`;
  }, [decodedHTML, expanded]);

  const showSeeMore =
    decodedHTML.replace(/<[^>]*>/g, '').trim().length > TRUNCATE_LENGTH;

  // 🔥 FETCH
  useFocusEffect(
    useCallback(() => {
      if (bookId) dispatch(getBookByIdThunk(bookId));
    }, [bookId]),
  );

  useEffect(() => {
    if (selectedBook?.id) {
      dispatch(getSuggestedBooks(selectedBook?.id));
    }
  }, [selectedBook?.id]);

  // 🔥 LIKE
  const { handleLike, reactionMap, likeCountMap } = useHandleLike();
  const likeCount =
    likeCountMap[selectedBook?.id] ?? selectedBook?.likes_count ?? 0;

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
        show({
          type: 'error',
          title: 'Something went wrong',
        });
      } else {
        show({
          type: 'success',
          title: res?.payload?.message || 'Success',
        });
      }
    },
    [bookmarkedIds, dispatch],
  );

  // 🔥 DELETE
  const handleDelete = async () => {
    if (!selectedBook?.id) return;

    const res: any = await dispatch(deleteBook(selectedBook.id));

    if (res?.meta?.requestStatus === 'fulfilled') {
      show({ type: 'success', title: 'Book deleted successfully' });
      navigation.goBack();
    } else {
      show({ type: 'error', title: 'Delete failed' });
    }
  };

  const confirmDelete = () => {
    Alert.alert(`Delete this ${selectedBook.title}`, 'Are you sure?', [
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
        // 🔥 REFETCH BOOK DETAILS
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

  const onRefresh = useCallback(async () => {
    if (!bookId) return;

    try {
      setRefreshing(true);

      await Promise.all([
        dispatch(getBookByIdThunk(bookId)),
        selectedBook?.id
          ? dispatch(getSuggestedBooks(selectedBook.id))
          : Promise.resolve(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [bookId, selectedBook?.id, dispatch]);

  // 🔥 FOLLOW
  const handleFollow = async () => {
    if (!selectedBook?.user?.id) return;

    const action = isFollowing ? unFollow : follow;

    const res = await dispatch(action(selectedBook.user.id)).unwrap();

    await dispatch(getBookByIdThunk(selectedBook.id));

    show({ type: 'success', title: res?.message });
  };

  const { handleShare } = useShare({
    type: 'book',
    value: selectedBook?.id,
    title: selectedBook?.title,
  });

  // Handle Report
  const handleReport = async (data: any) => {
    try {
      if (!selectedBook?.id) return;

      const payload: any = {
        report_id: data.reason, // ✅ already ID from modal
        description: data.message || '',
        synopses_id: selectedBook.id,
        reported_user_id: selectedBook?.user?.id,
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
      await dispatch(getBookByIdThunk(selectedBook?.id));
    } catch (error: any) {
      show({
        type: 'error',
        title: error,
      });
    }
  };

  const rating = selectedBook?.avg_rating
    ? Number(selectedBook.avg_rating).toFixed(1)
    : '0.0';

  // 🔥 INITIAL LIKE FIX
  useEffect(() => {
    if (selectedBook?.id && selectedBook?.isLiked === 1) {
      if (!likedIds.includes(selectedBook.id)) {
        dispatch(setInitialLikes([selectedBook.id]));
      }

      dispatch(
        setInitialReactions({
          [selectedBook.id]: selectedBook?.emoji_type || 'Heart',
        }),
      );
    }
  }, [selectedBook?.id]);

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
      edges={['left', 'right']}
    >
      <StatusBar
        translucent
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      {/* SCROLL */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        // contentContainerStyle={{ paddingBottom: 100 }}
        bounces={false}
        overScrollMode="auto"
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingBottom: insets.bottom + verticalScaleSize(30),
        }}
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
        {loading || !selectedBook ? (
          <BookDetailsSkeleton />
        ) : (
          <>
            <View style={styles.imageWrapper}>
              <FastImage
                source={
                  imageError || !selectedBook?.image
                    ? require('../../assets/images/book-1.png')
                    : { uri: selectedBook?.image }
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
              {/* HEADER */}
              <View style={styles.headerOverlay}>
                <AuthHeader
                  transparent
                  showBack={true}
                  // title={selectedBook?.title}
                  fontSize={18}
                  onBack={handleBack}
                  showBookMark
                  showMenu
                  postId={selectedBook?.id}
                  bookmarked={
                    selectedBook?.id
                      ? bookmarkedIds.includes(selectedBook.id)
                      : false
                  }
                  onToggleBookmark={bookId => handleBookmark(bookId)}
                  disabled={!selectedBook?.id}
                  onEdit={
                    isOwnPost
                      ? () => {
                        navigation.navigate('AddBook', {
                          book: selectedBook, // 🔥 pass full object
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
                  type={"Book"}
                />
              </View>

              {/* TITLE SECTION */}
              <View style={styles.titleContainer}>
                {selectedBook?.genre?.name && (
                  <GenreBadge label={selectedBook?.genre?.name} size="sm" />
                )}
                <Text
                  style={styles.title}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {selectedBook?.title}
                </Text>
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
                          selectedBook?.user?.user_name ||
                          selectedBook?.user?.id ||
                          selectedBook?.user?.userId,
                      });
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <User
                      size={16}
                      color={isDark ? themeColors.gray : themeColors.black}
                    />
                    <Text
                      style={[
                        styles.author,
                        {
                          color: isDark ? themeColors.gray : themeColors.black,
                        },
                      ]}
                    >
                      {selectedBook?.user?.name} -
                    </Text>
                    <Text style={styles.date}>
                      {formatDate(selectedBook?.createdAt)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={styles.scroll}>
              {/* REACTION PICKER */}
              {showReactions && (
                <View
                  style={{
                    position: 'absolute',
                    top: -20,
                    left: 20,
                    right: 20,
                    zIndex: 9999,
                    elevation: 20,

                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-around',

                    backgroundColor: themeColors.card,
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
                      key={item?.id}
                      activeOpacity={0.8}
                      onPress={() => {
                        setShowReactions(false);

                        if (selectedBook?.id) {
                          handleLike({
                            id: selectedBook.id,
                            emoji_type: (item?.id as ReactionType) || '',
                            likes_count: selectedBook?.likes_count || 0,
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
                      !!selectedBook?.id && likedIds.includes(selectedBook.id),

                    emoji_type: likedIds.includes(selectedBook?.id)
                      ? reactionMap[selectedBook?.id] ??
                      selectedBook?.emoji_type
                      : null,
                    title: 'Like',
                    icon: <Heart size={18} color={isDark ? '#fff' : '#000'} />,

                    activeIcon: (
                      <HeartActive size={18} color={themeColors.red} />
                    ),

                    label: `${likeCount}`,

                    onPress: () => {
                      if (!showReactions) {
                        selectedBook?.id &&
                          handleLike({
                            id: selectedBook.id,
                            emoji_type: 'Heart',
                            likes_count: selectedBook?.likes_count || 0,
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
                    label: selectedBook?.views ?? '0',
                    title: 'View',
                  },
                  {
                    icon: <Star size={18} color={themeColors.primary} rating={rating ? Number(rating) : 0}/>,
                    label: rating,
                    title: 'Rating',
                  },
                  {
                    icon: <Share size={18} color={isDark ? '#fff' : '#000'} />,
                    // label: 'Share',
                    title: 'Share',
                    onPress: handleShare,
                  },
                ]}
              />
              {/* 📖 READING CONTENT */}
              <View style={styles.contentContainer}>
                {/* DESCRIPTION */}
                <View style={styles.readingSection}>
                  {/* STORY */}
                  <RenderHtml
                    contentWidth={width}
                    source={{
                      html: displayHTML,
                    }}
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
                      color: themeColors.white,
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
                        marginBottom: 14,
                        padding: 0,
                        color: themeColors.white,
                        fontFamily: Fonts.Regular,
                        letterSpacing: 0.2,
                      },

                      ul: {
                        marginTop: 0,
                        // marginBottom: 12,
                        paddingLeft: 18,
                      },

                      ol: {
                        marginTop: 0,
                        marginBottom: 12,
                        paddingLeft: 18,
                      },

                      li: {
                        fontSize: 15,
                        marginBottom: 6,
                        color: '#ECE2D0',
                        fontFamily: Fonts.Regular,
                      },

                      h1: {
                        fontSize: 28,
                        marginTop: 0,
                        // marginBottom: 12,
                        color: '#FFFFFF',
                        fontFamily: Fonts.Black,
                      },

                      h2: {
                        fontSize: 22,
                        // lineHeight: 30,
                        marginTop: 0,
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
                  {showSeeMore && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setExpanded(prev => !prev)}
                      style={styles.seeMoreButton}
                    >
                      <Text style={styles.seeMoreText}>
                        {expanded ? 'Show Less' : 'Show More'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* BOTTOM LINE */}
                  {/* <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />

                    <Text style={styles.dividerIcon}>✧</Text>

                    <View style={styles.dividerLine} />
                  </View> */}

                  {/* PREMIUM TAGS */}
                  {selectedBook?.tags?.length > 0 && (
                    <View style={styles.premiumTagsContainer}>
                      {selectedBook?.tags?.length > 0 &&
                        selectedBook.tags.map((tag: any, index: number) => (
                          <TouchableOpacity
                            key={index}
                            activeOpacity={0.8}
                            style={styles.premiumTag}
                          >
                            <Text style={styles.premiumTagText}>
                              # {tag.name || tag}
                            </Text>
                          </TouchableOpacity>
                        ))}
                    </View>
                  )}
                </View>

                {/* 🔥 SUGGESTED BOOKS */}
                {suggestedBooks?.length > 0 && (
                  <View style={{ marginTop: 20 }}>
                    <View style={styles.peopleHeader}>
                      <View style={styles.peopleLine} />

                      <Text style={styles.peopleHeaderText}>
                        suggested Books
                      </Text>

                      <View style={styles.peopleLine} />
                    </View>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      {suggestedBooks.map((item: any, index: number) => (
                        <BookCard
                          key={index}
                          image={
                            item?.image || 'https://via.placeholder.com/150'
                          }
                          ribbonText={item.genre?.name || 'Book'}
                          height={220}
                          width={180}
                          onPress={() =>
                            navigation.navigate('BookDetails', {
                              bookId: item?.id,
                            })
                          }
                          bookmarked={bookmarkedIds.includes(item?.id)}
                          onBookmark={() => handleBookmark(item?.id)}
                          likes={likeCountMap[item?.id] ?? item?.likes_count}
                          views={item?.views}
                          rating={item?.avg_rating ?? '0'}
                          title={item?.title}
                          author={item?.user?.name}
                          handleLike={(reaction?: ReactionType) =>
                            handleLike({
                              id: item?.id,
                              emoji_type: reaction || 'Heart',
                              likes_count: item?.likes_count || 0,
                            })
                          }
                          emoji_type={reactionMap[item?.id] ?? item?.emoji_type}
                          isLiked={likedIds.includes(item?.id)}
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
          </>
        )}
      </ScrollView>

      <RatingModal
        visible={ratingVisible}
        initialRating={Number(selectedBook?.ratings?.[0]?.rating || 0)}
        onClose={() => setRatingVisible(false)}
        onSubmit={(rating: any) => {
          if (!selectedBook?.id) return;

          handleRating(selectedBook.id, rating);

          setRatingVisible(false);
        }}
      />

      <ReportModal
        visible={reportVisible}
        onClose={() => setReportVisible(false)}
        post={selectedBook} // 🔥 important
        onSubmit={handleReport}
        reportType="BOOKS" // ✅ add this
      />
    </SafeAreaView>
  );
};

export default BookDetails;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  scroll: {
    paddingHorizontal: 10,
  },

  imageWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },

  image: {
    width: '100%',
    height: 400,
  },

  contentContainer: {
    // marginTop: 8,
    flex: 1,
  },

  title: {
    fontSize: 24,
    fontFamily: Fonts.Black,
    lineHeight: 30,
    flexShrink: 1, // 🔥 MUST
    color: themeColors.white,
    marginTop: 4,
  },

  author: {
    fontSize: 16,
    fontFamily: Fonts.SemiBold,
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

  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120, // adjust based on header height
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

  contestBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,184,0,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,184,0,0.35)',
    paddingHorizontal: 10,
    // paddingVertical: 2,
    borderRadius: 100,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingTop: 3,
  },

  contestText: {
    color: '#FFB800',
    fontSize: 10,
    fontFamily: Fonts.Bold,
    // letterSpacing: 1,
    marginTop: -2,
  },

  titleContainer: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    zIndex: 999,
  },

  subTitle: {
    fontFamily: Fonts.Regular,
    fontSize: 16,
    color: themeColors.white,
  },

  readingSection: {
    backgroundColor: '#0D0D0D',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,

    borderWidth: 1,
    borderColor: 'rgba(200,155,60,0.18)',
    marginTop: 10,
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(200,155,60,0.25)',
  },

  dividerIcon: {
    color: '#C89B3C',
    marginHorizontal: 12,
    fontSize: 14,
  },

  premiumTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
  },

  premiumTag: {
    paddingHorizontal: 18,
    paddingVertical: 10,

    borderRadius: 999,

    borderWidth: 1,
    borderColor: 'rgba(200,155,60,0.35)',

    backgroundColor: 'rgba(200,155,60,0.05)',
  },

  premiumTagText: {
    color: '#D4A646',
    fontSize: 14,
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
    marginBottom: 8,
    paddingVertical: 5,
  },

  seeMoreText: {
    color: themeColors.primary,
    fontSize: 14,
    fontFamily: Fonts.SemiBold,
  },
});
