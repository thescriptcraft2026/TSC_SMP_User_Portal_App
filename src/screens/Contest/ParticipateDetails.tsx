import {
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
import { useNavigation, useRoute } from '@react-navigation/native';
import { themeColors } from '../../theme/colors';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import AuthHeader from '../../components/Header/AuthHeader';
import FastImage from 'react-native-fast-image';
import Heart from '../../assets/SVG/Heart';
import Star from '../../assets/SVG/Star';
import { Fonts } from '../../constants/Fonts';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import LinearGradient from 'react-native-linear-gradient';
import SingleMovieDetailsSkeleton from '../Movie/components/SingleMovieDetailsSkeleton';
import RatingModal from '../../components/Modals/RatingModal';
import Avatar from '../../components/Avatar/Avatar';
import HeartActive from '../../assets/SVG/HeartActive';
import ActionBar from '../../components/AcrtionBar/ActionBar';
import EyeTwo from '../../assets/SVG/EyeTwo';
import { formatCount, formatDate } from '../../utils/date';
import { useDispatch, useSelector } from 'react-redux';
import {
  setInitialLikeCounts,
  setInitialLikes,
  setInitialReactions,
} from '../../redux/slices/actionSlice';
import { getParticipantDetails } from '../../redux/slices/contestSlice';
import { ReactionType } from '../../hooks/useEmojiReaction';
import { useHandleLike } from '../../hooks/useHandleLike';
import { isHtmlContent } from '../../utils/html';
import HtmlRenderer from '../../components/HtmlRenderer/HtmlRenderer';
import MediaViewer from '../../components/MediaViewer/MediaViewer';
import api from '../../../Instance/Instance';
import { useToast } from '../../components/Toast/ToastProvider';
import { verticalScaleSize } from '../../utils/responsive';
import { clearLogs } from '../../utils/simpleCrashLogger';
import { useShare } from '../../hooks/useShare';

const ParticipateDetails = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params;
  const isDark = true;
  const [ratingVisible, setRatingVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const dispatch = useDispatch<any>();
  const [showReactions, setShowReactions] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { show } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const { handleShare } = useShare();

  const backgroundColor = useMemo(
    () => (isDark ? themeColors.black : themeColors.appBackground),
    [isDark],
  );
  const textPrimary = isDark ? themeColors.white : themeColors.black;
  const { selectedParticipant, loading } = useSelector(
    (state: any) => state.contest,
  );
  const { likedIds } = useSelector((state: any) => state.actions);

  // 🔥 LIKE
  const { handleLike, reactionMap, likeCountMap } = useHandleLike();
  const likeCount =
    likeCountMap[selectedParticipant?.id] ??
    selectedParticipant?.likes_count ??
    0;

  // ✅ fetch participant details by id
  useEffect(() => {
    if (id) {
      dispatch(getParticipantDetails(id));
    }
  }, [id, dispatch]);

  const mediaUrl =
    selectedParticipant?.medias?.[0]?.image ||
    selectedParticipant?.work_link ||
    selectedParticipant?.link;

  const getYoutubeId = (url: string) => {
    if (!url) return null;

    const regExp =
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^?&/]+)/;

    const match = url.match(regExp);

    return match?.[1] || null;
  };

  const videoId = getYoutubeId(mediaUrl);

  const rating = selectedParticipant?.avg_rating
    ? Number(selectedParticipant?.avg_rating).toFixed(1)
    : '0.0';

  useEffect(() => {
    if (!selectedParticipant?.id) return;

    dispatch(
      setInitialLikes(
        selectedParticipant.isLiked === 1 ? [selectedParticipant.id] : [],
      ),
    );

    dispatch(
      setInitialReactions({
        [selectedParticipant.id]: selectedParticipant?.emoji_type || '',
      }),
    );

    dispatch(
      setInitialLikeCounts({
        [selectedParticipant.id]: selectedParticipant?.likes_count || 0,
      }),
    );
  }, [
    dispatch,
    selectedParticipant?.id,
    selectedParticipant?.isLiked,
    selectedParticipant?.emoji_type,
    selectedParticipant?.likes_count,
  ]);

  const onRefresh = useCallback(async () => {
    if (!id) return;

    try {
      setRefreshing(true);

      dispatch(setInitialLikeCounts({}));

      await dispatch(getParticipantDetails(id));
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, id]);

  const votingClosed = selectedParticipant?.contest?.voting_open_till_date
    ? new Date(selectedParticipant.contest.voting_open_till_date) < new Date()
    : false;

  const hasMedia =
    !!selectedParticipant?.medias?.length ||
    !!selectedParticipant?.work_link ||
    !!selectedParticipant?.link;

  // ✅ 👉 PLACE IT HERE (BEFORE RETURN UI)
  if (loading || !selectedParticipant) {
    return <SingleMovieDetailsSkeleton />;
  }

  const handleRate = async (rating: number) => {
    try {
      const res = await api.post(`/actions/rate/${selectedParticipant?.id}`, {
        rating,
      });

      dispatch(getParticipantDetails(selectedParticipant?.id));

      show({
        type: 'success',
        title: res?.data?.message || 'Rated successfully',
      });
    } catch (error: any) {
      show({
        type: 'error',
        title: error?.response?.data?.message || 'Failed to submit rating',
      });

      throw error; // Important so the modal knows the request failed
    }
  };


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
          contentContainerStyle={[styles.scrollContent, {
            paddingBottom: insets.bottom + verticalScaleSize(100),
          }]} // 🔥 important
          bounces={false}
          overScrollMode="auto"
          keyboardShouldPersistTaps="handled"
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
              source={
                imageError || !selectedParticipant?.image
                  ? require('../../assets/images/fallback.png')
                  : {
                    uri: selectedParticipant?.image,
                    priority: FastImage.priority.high,
                  }
              }
              style={styles.image}
              resizeMode={FastImage.resizeMode.cover}
              onError={() => setImageError(true)}
              defaultSource={require('../../assets/images/fallback.png')}
            />

            {/* 🔥 GRADIENT OVERLAY */}
            <LinearGradient
              colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.6)', 'transparent']}
              style={styles.gradient}
            />
            {/* HEADER */}
            <View style={styles.headerOverlay}>
              <AuthHeader
                transparent
                showBack
                onBack={() => navigation.goBack()}
                showShare={true}
                onShare={() => {
                  console.log('🔥 SHARE BUTTON CLICKED');

                  console.log('Participant:', selectedParticipant?.id);
                  console.log('Contest:', selectedParticipant?.contest?.id);

                  handleShare({
                    title: selectedParticipant?.title,
                    value: selectedParticipant?.id,
                    contestId: selectedParticipant?.contest?.id,
                    type: 'participateDetails',
                  });
                }}
              />
            </View>

            {showReactions && !votingClosed && (
              <View
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
                    id: 'heart',
                    icon: require('../../assets/Likes/511.gif'),
                  },
                ].map(item => (
                  <TouchableOpacity
                    key={item?.id}
                    activeOpacity={0.8}
                    onPress={() => {
                      setShowReactions(false);

                      if (selectedParticipant?.id) {
                        handleLike({
                          id: selectedParticipant?.id,
                          emoji_type: (item?.id as ReactionType) || '',
                          likes_count: selectedParticipant?.likes_count || 0,
                          isReactionPress: true,
                        });
                      }
                    }}
                  >
                    <FastImage
                      source={item?.icon}
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
              variant="floating" // 💥 IMPORTANT
              key={likedIds.join(',')} // 🔥 FORCE UPDATE
              style={{
                borderWidth: 1,
                borderColor: 'rgba(200,155,60,0.25)',
                backgroundColor: 'rgba(20,20,20,0.95)',
              }}
              backgroundColor={isDark ? themeColors.card : themeColors.white}
              items={[
                {
                  isLike: true,
                  disabled: votingClosed,
                  liked:
                    !!selectedParticipant?.id &&
                    likedIds.includes(selectedParticipant?.id),
                  title: 'Likes',

                  emoji_type: likedIds.includes(selectedParticipant?.id)
                    ? reactionMap[selectedParticipant?.id] ??
                    selectedParticipant?.emoji_type
                    : null,

                  icon: <Heart size={18} color={isDark ? '#fff' : '#000'} />,

                  activeIcon: <HeartActive size={18} color={themeColors.red} />,

                  label: formatCount(String(likeCount || 0)),

                  onPress: () => {
                    if (votingClosed) return;

                    if (!showReactions) {
                      handleLike({
                        id: selectedParticipant?.id,
                        emoji_type: 'heart',
                        likes_count: selectedParticipant?.likes_count || 0,
                        isReactionPress: false,
                      });
                    }
                  },

                  onLongPress: () => {
                    if (votingClosed) return;

                    setShowReactions(true);
                  },
                },
                {
                  icon: <EyeTwo size={22} color={isDark ? '#fff' : '#000'} />,
                  label: formatCount(String(selectedParticipant?.views || 0)),
                  title: 'Views',
                },
                {
                  icon: <Star size={18} color={themeColors.primary} rating={rating ? Number(rating) : 0}/>,
                  label: formatCount(rating),
                  title: 'Ratings',
                },
                {
                  icon: <Star size={18} color={themeColors.primary} />,
                  label: formatCount(
                    selectedParticipant?.ratings_count
                      ? String(selectedParticipant?.ratings_count)
                      : '0',
                  ),
                  title: 'Total Rated',
                },
              ]}
            />
          </View>

          {/* CONTENT */}
          <View style={styles.contentContainer}>
            <Text style={[styles.title, { color: isDark ? '#fff' : '#222' }]}>
              {selectedParticipant?.title}
            </Text>

            {selectedParticipant?.story && (
              <View
                style={{
                  marginTop: 10,
                }}
              >
                <View style={styles.timelineHeader}>
                  <Text style={styles.timelineTitle}>Description</Text>
                </View>
                <Text
                  style={styles.description}
                  numberOfLines={expanded ? undefined : 4}
                  ellipsizeMode="tail"
                >
                  {String(selectedParticipant?.story || '')}
                </Text>

                {/* SEE MORE BUTTON */}
                {selectedParticipant?.story?.length > 150 && (
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
              </View>
            )}

            {selectedParticipant?.contest_story && (
              <View
                style={{
                  marginTop: 10,
                }}
              >
                <View style={styles.timelineHeader}>
                  <Text style={styles.timelineTitle}>Content</Text>
                </View>
                {isHtmlContent(selectedParticipant?.contest_story) ? (
                  <HtmlRenderer html={selectedParticipant?.contest_story} textColor={themeColors.white}/>
                ) : (
                  <Text style={styles.description}>
                    {selectedParticipant?.contest_story}
                  </Text>
                )}
              </View>
            )}

            {/* Video Card */}
            {hasMedia && (
              <View style={styles.videoCard}>
                <MediaViewer url={mediaUrl} />
              </View>
            )}

            <View
              style={[
                styles.descContainer,
                {
                  backgroundColor: isDark
                    ? themeColors.card2
                    : themeColors.white,
                },
              ]}
            >
              <View
                style={[
                  styles.headingContainer,
                  {
                    borderColor: isDark
                      ? themeColors.card
                      : themeColors.secondary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.heading,
                    { color: isDark ? themeColors.white : themeColors.black },
                  ]}
                >
                  Posted By
                </Text>
              </View>
              <View style={styles.companyRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    navigation.navigate('Profile', {
                      username:
                        selectedParticipant?.user?.user_name ||
                        selectedParticipant?.user?.id ||
                        selectedParticipant?.user?.userId,
                    });
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <Avatar
                    uri={selectedParticipant?.user?.profile_photo_path}
                    name={selectedParticipant?.user?.name}
                    size={36}
                  />
                  <View>
                    <Text style={[styles.companyName, { color: textPrimary }]}>
                      {selectedParticipant?.user?.name}
                    </Text>
                    <Text style={[styles.postedOn, { color: textPrimary }]}>
                      {formatDate(selectedParticipant?.createdAt)}
                    </Text>
                  </View>
                </TouchableOpacity>
                {/* <FollowButton isFollowing={false} onPress={() => {}} /> */}
              </View>
            </View>
          </View>
        </ScrollView>
        {/* 🔥 BUTTON AT BOTTOM */}
        <View
          style={[
            styles.btnWrapper,
            {
              paddingBottom:
                Platform.OS === 'android' ? insets.bottom + 10 : 15,
            },
          ]}
        >
          <PrimaryButton
            title={votingClosed ? 'Voting Closed' : 'Rate Now'}
            disabled={votingClosed}
            style={{ flex: 1 }}
            onPress={() => {
              if (votingClosed) return;

              setRatingVisible(true);
            }}
            variant={votingClosed ? 'outline' : 'filled'}
          />
        </View>

        {/* MODAL */}
        <RatingModal
          visible={ratingVisible}
          onClose={() => setRatingVisible(false)}
          onSubmit={handleRate}
          initialRating={selectedParticipant?.ratings?.[0]?.rating || 0}
        />
      </SafeAreaView>
    </View>
  );
};

export default ParticipateDetails;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1, // 🔥 IMPORTANT
    paddingBottom: 100
  },

  imageWrapper: {
    position: 'relative',
  },

  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120, // adjust based on header height
    zIndex: 1,
  },

  headerOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    zIndex: 10,
  },

  image: {
    width: '100%',
    height: 400,
    borderBottomLeftRadius: 45,
    borderBottomRightRadius: 45,
  },

  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 40,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    position: 'absolute',
    bottom: -15,
  },

  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },

  actionText: {
    fontSize: 12,
    fontFamily: Fonts.Regular,
  },

  divider: {
    width: 1,
    height: 16,
  },

  contentContainer: {
    flex: 1, // 🔥 REQUIRED
    marginTop: 30,
    paddingHorizontal: 16,
  },

  title: {
    fontSize: 24,
    fontFamily: Fonts.Black,
  },

  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  timelineTitle: {
    fontFamily: Fonts.Bold,
    fontSize: 20,
    color: themeColors.primary,
  },

  description: {
    // marginTop: 10,
    fontSize: 14,
    color: themeColors.white,
    fontFamily: Fonts.Regular,
    textAlign: 'justify',
  },

  descContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 10,
  },

  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    paddingBottom: 3,
  },

  heading: {
    fontSize: 16,
    fontFamily: Fonts.Bold,
  },

  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 10,
  },

  companyName: {
    fontSize: 14,
    fontFamily: Fonts.Bold,
  },

  postedOn: {
    fontSize: 12,
    fontFamily: Fonts.Regular,
  },

  buttonContainer: {
    marginTop: 'auto', // 🔥 MAGIC LINE
    // paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },

  // Video Card Styles
  videoCard: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },

  videoWrapper: {
    height: 220,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#000',
  },

  video: {
    ...StyleSheet.absoluteFillObject,
  },

  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },

  videoLoader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    zIndex: 20,
  },

  playButton: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 45,
    height: 45,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },

  videoInfo: {
    padding: 12,
  },

  videoTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Fonts.Bold,
  },

  videoSub: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 2,
  },

  errorBox: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },

  reactionBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },

  btnWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    backgroundColor: themeColors.black,
  },
});
