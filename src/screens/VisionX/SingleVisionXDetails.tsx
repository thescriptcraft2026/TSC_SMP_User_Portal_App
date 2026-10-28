import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  Pressable,
  RefreshControl,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { WebView } from 'react-native-webview';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';

import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';

import AuthHeader from '../../components/Header/AuthHeader';
import RatingModal from '../../components/Modals/RatingModal';
import Avatar from '../../components/Avatar/Avatar';
import PrimaryButton from '../../components/Buttons/PrimaryButton';

import Heart from '../../assets/SVG/Heart';
import HeartActive from '../../assets/SVG/HeartActive';
import Star from '../../assets/SVG/Star';
import Share from '../../assets/SVG/Share';

import { useLike } from '../../hooks/useLike';
import { useBookmark } from '../../hooks/useBookmark';
import SingleMovieDetailsSkeleton from '../Movie/components/SingleMovieDetailsSkeleton';
import ActionBar from '../../components/AcrtionBar/ActionBar';
import FollowButton from '../../components/Buttons/FollowButton';
import EyeTwo from '../../assets/SVG/EyeTwo';

import { useDispatch, useSelector } from 'react-redux';
import {
  setInitialLikeCounts,
  setInitialLikes,
  setInitialReactions,
  toggleBookmarkLocal,
  wishlistAction,
} from '../../redux/slices/actionSlice';
import { useToast } from '../../components/Toast/ToastProvider';
import {
  deleteVisionXThunk,
  getVisionXByIdThunk,
} from '../../redux/slices/visionXSlice';
import { createReport, getReports } from '../../redux/slices/reportSlice';
import ReportModal from '../../components/Modals/ReportModal';
import { ratingAction, updateRatingLocal } from '../../redux/slices/bookSlice';
import { ReactionType } from '../../hooks/useEmojiReaction';
import { useHandleLike } from '../../hooks/useHandleLike';
import { useShare } from '../../hooks/useShare';
import NoData from '../../assets/SVG/NoData';
import EmbeddedMedia from '../../components/Media/EmbeddedMedia';
import GenreBadge from '../../components/Badges/GenreBadge';
import { getTimeAgo } from '../../utils/timeAgo';
const fallbackImage = require('../../assets/images/fallback.png');

const SingleVisionXDetails = () => {
  const { params } = useRoute<any>();
  const navigation = useNavigation<any>();
  const isDark = true;
  const dispatch = useDispatch<any>();
  const { show } = useToast();
  const route = useRoute<any>();
  const visionxId = route.params?.visionxId || route.params?.id;

  const [ratingVisible, setRatingVisible] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [playing] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { bookmarkedIds, likedIds } = useSelector(
    (state: any) => state.actions,
  );
  const { user: authUser } = useSelector((state: any) => state.auth);

  const { selectedVisionX, loading } = useSelector(
    (state: any) => state.visionx,
  );

  const isOwnPost = useMemo(() => {
    return String(authUser?.id) === String(selectedVisionX?.user?.id);
  }, [authUser?.id, selectedVisionX?.user?.id]);

  const handleDelete = async () => {
    if (!selectedVisionX?.id) return;

    const res: any = await dispatch(deleteVisionXThunk(selectedVisionX.id));

    if (res?.meta?.requestStatus === 'fulfilled') {
      show({ type: 'success', title: 'Deleted successfully' });
      navigation.goBack();
    } else {
      show({ type: 'error', title: 'Delete failed' });
    }
  };

  const confirmDelete = () => {
    Alert.alert(`Delete this ${selectedVisionX.title}`, 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: handleDelete },
    ]);
  };

  const isFollowing = selectedVisionX?.user?.isFollowing === 1;

  const isAlreadyReported = selectedVisionX?.user_reports?.length > 0;

  /* ---------------- DERIVED ---------------- */
  const backgroundColor = isDark
    ? themeColors.black
    : themeColors.appBackground;

  // 🔥 LIKE
  const { handleLike, reactionMap, likeCountMap } = useHandleLike();
  const likeCount = refreshing
    ? selectedVisionX?.likes_count ?? 0
    : likeCountMap[selectedVisionX?.id] ?? selectedVisionX?.likes_count ?? 0;

  // 🔥 BOOKMARK
  const handleBookmark = useCallback(
    async (id: string) => {
      const isBookmarked = bookmarkedIds?.includes(id);

      // Optimistic update
      dispatch(toggleBookmarkLocal(id));

      const res: any = await dispatch(
        wishlistAction({
          synopsis_id: id,
          type: isBookmarked ? 'delete' : 'create',
        }),
      );

      if (res?.meta?.requestStatus !== 'fulfilled') {
        // Rollback if API fails
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
        // 🔥 REFETCH UPDATED DATA
        await dispatch(getVisionXByIdThunk(id));

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

  // Handle Report
  const handleReport = async (data: any) => {
    try {
      if (!selectedVisionX?.id) return;

      const payload: any = {
        report_id: data.reason, // ✅ already ID from modal
        description: data.message || '',
        synopses_id: selectedVisionX.id,
        reported_user_id: selectedVisionX?.user?.id,
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
      await dispatch(getVisionXByIdThunk(selectedVisionX?.id));
    } catch (error: any) {
      show({
        type: 'error',
        title: error,
      });
    }
  };

  // 🔥 INITIAL LIKE FIX
  useEffect(() => {
    if (!selectedVisionX?.id) return;

    dispatch(
      setInitialLikes(
        selectedVisionX.isLiked === 1 ? [selectedVisionX.id] : [],
      ),
    );

    dispatch(
      setInitialReactions({
        [selectedVisionX.id]: selectedVisionX?.emoji_type || '',
      }),
    );

    dispatch(
      setInitialLikeCounts({
        [selectedVisionX.id]: selectedVisionX?.likes_count || 0,
      }),
    );
  }, [
    dispatch,
    selectedVisionX?.id,
    selectedVisionX?.isLiked,
    selectedVisionX?.emoji_type,
    selectedVisionX?.likes_count,
  ]);

  const onRefresh = useCallback(async () => {
    if (!visionxId) return;

    try {
      setRefreshing(true);

      dispatch(setInitialLikeCounts({}));

      await dispatch(getVisionXByIdThunk(visionxId));
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, visionxId]);

  useFocusEffect(
    useCallback(() => {
      if (visionxId) dispatch(getVisionXByIdThunk(visionxId));
    }, [visionxId]),
  );

  const { handleShare } = useShare({
    type: 'visionx',
    value: selectedVisionX?.id,
    title: selectedVisionX?.title,
  });

  // ✅ 👉 PLACE IT HERE (BEFORE RETURN UI)
  if (loading) {
    return <SingleMovieDetailsSkeleton />;
  }

  if (!selectedVisionX?.id) {
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            backgroundColor,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
          },
        ]}
      >
        <NoData size={120} color="#FFF" />
        <Text
          style={{
            color: '#FFF',
            fontSize: 18,
            fontFamily: Fonts.SemiBold,
            marginTop: 6,
            textAlign: 'center',
          }}
        >
          Content Not Found
        </Text>

        <Text
          style={{
            color: '#999',
            fontSize: 14,
            marginTop: 10,
            textAlign: 'center',
            lineHeight: 22,
          }}
        >
          This content has been removed or you don't have permission to view it.
        </Text>

        <PrimaryButton
          title="Go Back"
          style={{ marginTop: 30, width: 180 }}
          onPress={() => navigation.goBack()}
        />
      </SafeAreaView>
    );
  }

  const rating = selectedVisionX?.avg_rating
    ? Number(selectedVisionX.avg_rating).toFixed(1)
    : '0.0';

  const content =
    selectedVisionX?.description || selectedVisionX?.story || '';

  const SHOW_MORE_LIMIT = 150;
  /* ---------------- RENDER ---------------- */

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('BottomTab');
    }
  };

  const getMediaHeight = () => {
    switch (selectedVisionX?.platform) {
      case 'youtube':
        return 210;

      case 'instagram':
        return 400;

      case 'facebook':
        return 500;

      case 'vimeo':
        return 300;

      case 'google-drive':
        return 450;

      case 'google-docs':
        return 420;

      case 'x':
        return 500;

      case 'image':
        return 450;

      default:
        return 300;
    }
  };

  const mediaHeight = getMediaHeight();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={['left', 'right']}
    >
      <StatusBar
        translucent
        barStyle={'light-content'}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.primary}
            colors={[themeColors.primary]}
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
  source={
    selectedVisionX?.image
      ? { uri: selectedVisionX.image }
      : fallbackImage
  }
  defaultSource={fallbackImage}
  style={styles.image}
  resizeMode={FastImage.resizeMode.cover}
/>

          <LinearGradient
            colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.6)', 'transparent']}
            style={styles.gradient}
          />

          <View style={styles.headerOverlay}>
            <AuthHeader
              transparent
              showBack
              // title={selectedVisionX?.title}
              onBack={handleBack}
              showBookMark
              postId={selectedVisionX?.id}
              bookmarked={
                selectedVisionX?.id
                  ? bookmarkedIds.includes(selectedVisionX.id)
                  : false
              }
              onToggleBookmark={bookId => handleBookmark(bookId)}
              showMenu
              onEdit={
                isOwnPost
                  ? () => {
                    navigation.navigate('AddVisionX', {
                      vision: selectedVisionX,
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
            />
          </View>

          {/* REACTION PICKER */}
          {showReactions && (
            <Pressable
              style={StyleSheet.absoluteFillObject}
              onPress={() => setShowReactions(false)}
            >
              <Pressable
                onPress={e => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  top: 340,

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

                      if (selectedVisionX?.id) {
                        handleLike({
                          id: selectedVisionX.id,
                          emoji_type: item.id,
                          likes_count: selectedVisionX?.likes_count || 0,
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
              </Pressable>
            </Pressable>
          )}

          {/* ACTION BAR */}
          <ActionBar
            variant="floating" // 💥 IMPORTANT
            backgroundColor={isDark ? themeColors.card : themeColors.card4}
            key={likedIds.join(',')}
            style={{
              borderWidth: 1,
              borderColor: 'rgba(200,155,60,0.25)',
              backgroundColor: 'rgba(20,20,20,0.95)',
            }}
            items={[
              {
                isLike: true,

                liked:
                  !!selectedVisionX?.id &&
                  likedIds.includes(selectedVisionX.id),

                emoji_type: likedIds.includes(selectedVisionX?.id)
                  ? reactionMap[selectedVisionX?.id]
                    ? reactionMap[selectedVisionX?.id]
                    : selectedVisionX?.emoji_type
                  : null,
                title: 'Like',
                icon: <Heart size={18} color={isDark ? '#fff' : '#000'} />,

                activeIcon: <HeartActive size={18} color={themeColors.red} />,

                label: `${likeCount}`,

                onPress: () => {
                  if (!showReactions) {
                    selectedVisionX?.id &&
                      handleLike({
                        id: selectedVisionX.id,
                        likes_count: selectedVisionX?.likes_count || 0,
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
                label: selectedVisionX?.views ?? '0',
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
        </View>

        {/* CONTENT */}
        <View style={styles.contentContainer}>
          <GenreBadge label={selectedVisionX?.genre?.name} size="xs" />

          {/* TITLE + FOLLOW */}
          <View style={styles.metaRow}>
            <View style={styles.titleWrapper}>
              <Text
                style={[styles.title, { color: isDark ? '#fff' : '#2C2C2C' }]}
                numberOfLines={2}
              >
                {selectedVisionX?.title}
              </Text>
            </View>
          </View>

          {/* USER */}
          <View style={styles.userRow}>
            <Avatar
              uri={selectedVisionX?.user?.profileImage}
              name={selectedVisionX?.user?.name}
              size={24}
            />
            <Text
              style={[
                styles.author,
                { color: isDark ? themeColors.white : themeColors.black },
              ]}
            >
              {selectedVisionX?.user?.name}
            </Text>
            <Text
              style={[
                styles.date,
                { color: isDark ? themeColors.white : themeColors.black },
              ]}
            >
              - {getTimeAgo(selectedVisionX?.createdAt)}
            </Text>
          </View>

          {/* ABOUT */}
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? themeColors.white : themeColors.black },
            ]}
          >
            About
          </Text>

          <Text
            style={[styles.description, { color: isDark ? '#ccc' : '#555' }]}
            numberOfLines={expanded ? undefined : 8}
            ellipsizeMode="tail"
          >
            {content}
          </Text>

          {/* SEE MORE BUTTON */}
          {content.length > SHOW_MORE_LIMIT && (
            <TouchableOpacity onPress={() => setExpanded(!expanded)}>
              <Text
                style={{
                  color: themeColors.primary,
                  marginTop: 5,
                  fontFamily: Fonts.Bold,
                }}
              >
                {expanded ? 'See Less' : 'See More'}
              </Text>
            </TouchableOpacity>
          )}

          {/* VIDEO */}
          {/* EMBEDDED MEDIA */}
          <View
            style={[
              styles.videoOuter,
              {
                height: mediaHeight,
              },
            ]}
          >
            <View style={styles.videoInner}>
              <EmbeddedMedia
                platform={selectedVisionX?.platform}
                link={selectedVisionX?.link}
                image={selectedVisionX?.image}
                height={mediaHeight}
                isVisible={true}
              />
            </View>
          </View>

          {/* BUTTON */}
          <View style={styles.buttonContainer}>
            <PrimaryButton
              title="Rate Now"
              onPress={() => setRatingVisible(true)}
            />
          </View>
        </View>
      </ScrollView>

      <RatingModal
        visible={ratingVisible}
        initialRating={Number(selectedVisionX?.ratings?.[0]?.rating || 0)}
        onClose={() => setRatingVisible(false)}
        onSubmit={(rating: any) => {
          if (!selectedVisionX?.id) return;
          handleRating(selectedVisionX.id, rating);
          setRatingVisible(false);
        }}
      />

      <ReportModal
        visible={reportVisible}
        onClose={() => setReportVisible(false)}
        post={selectedVisionX} // 🔥 important
        onSubmit={handleReport}
        reportType="VISIONX"
      />
    </SafeAreaView>
  );
};

export default SingleVisionXDetails;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: {},
  scrollContent: { paddingBottom: 100 },

  imageWrapper: {
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(200,155,60,0.25)',
    borderBottomLeftRadius: 45,
    borderBottomRightRadius: 45,
  },
  image: {
    width: '100%',
    height: 400,
    borderBottomLeftRadius: 45,
    borderBottomRightRadius: 45,
  },

  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 1,
  },

  headerOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    zIndex: 10,
  },

  contentContainer: {
    flex: 1,
    marginTop: 30,
    paddingHorizontal: 10,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  titleWrapper: {
    flex: 1,
    marginRight: 10,
  },

  title: {
    fontSize: 20,
    fontFamily: Fonts.Bold,
    lineHeight: 24,
  },

  followButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },

  followContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  followText: {
    fontSize: 12,
    fontFamily: Fonts.SemiBold,
  },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },

  author: {
    fontSize: 15,
    fontFamily: Fonts.SemiBold,
  },

  date: {
    fontSize: 10,
    fontFamily: Fonts.Regular,
  },

  sectionTitle: {
    fontSize: 20,
    marginTop: 20,
    fontFamily: Fonts.Bold,
  },

  description: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: Fonts.Regular,
  },

  videoOuter: {
    marginTop: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },

  videoInner: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
  },

  webview: {
    height: 400,
  },

  buttonContainer: {
    marginTop: 'auto',
    paddingTop: 20,
  },
});
