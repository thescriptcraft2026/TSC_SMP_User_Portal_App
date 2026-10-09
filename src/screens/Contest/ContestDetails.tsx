import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import ContentNotFound from '../../components/NotFound/ContentNotFound';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import Share from '../../assets/SVG/Share';
import FastImage from 'react-native-fast-image';
import { Fonts } from '../../constants/Fonts';
import Calendar from '../../assets/SVG/Calendar';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import LinearGradient from 'react-native-linear-gradient';
import { ParticipantCard } from './components/ParticipantCard';
import { InfoItem } from './components/InfoItem';
import WinnerCard from './components/WinnerCard';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../components/Toast/ToastProvider';
import {
  getContestByIdThunk,
  getContestStatusThunk,
  getParticipantsByContestId,
  toggleBookmarkLocal,
  toggleContestBookmark,
  toggleContestWishlistStatus,
} from '../../redux/slices/contestSlice';
import { formatCount, formatDate } from '../../utils/date';
import Users from '../../assets/SVG/Users';
import Movie from '../../assets/SVG/Movie';
import UserTwo from '../../assets/SVG/UserTwo';
import StarTwo from '../../assets/SVG/StarTwo';
import Note from '../../assets/SVG/Note';
import Ionicons from '@react-native-vector-icons/ionicons';
import RenderHTML from 'react-native-render-html';
import { useShare } from '../../hooks/useShare';
import { getUserSubmissionsByContestId } from '../../services/contestApi';
import SubmissionCard from './components/SubmissionCard';
import ContestDetailsSkeleton from './components/ContestDetailsSkeleton';
import PrizeMoneyCard from './components/PrizeMoneyCard';
import ContestWinnerPodium from '../../components/ContestWinnerPodium/ContestWinnerPodium';
import {
  getContestStatus,
  hasContestExpired,
  hasContestStarted,
} from '../../utils/contest';

const ContestDetails = () => {
  const navigation = useNavigation<any>();
  const isDark = true;
  const route = useRoute<any>();
  const { contestId, showSubmission = false } = route.params || {};
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<any>();
  const { show } = useToast();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const { width } = useWindowDimensions();
  const [imageError, setImageError] = useState(false);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);

  const { selectedContest, bookmarkedIds, loading } = useSelector(
    (state: any) => state.contest,
  );

  const participantsCount = selectedContest?.participants_count;
  const {
    contestStatus: contestStatusData,
    contestStatusLoading,
    contestStatusError,
  } = useSelector((state: any) => state.contest);

  const user = useSelector((state: any) => state.auth?.user);

  const isParticipated = contestStatusData?.isParticipated ?? false;
  const isWishlisted = contestStatusData?.isWishlisted ?? false;

  const submissionLimitType = selectedContest?.submission_limit_type; // "single" | "multiple"
  const isSingleLimit = submissionLimitType === 'single';

  // Only block the button when it's a single-submission contest AND the user already participated
  const blockParticipation = isSingleLimit && isParticipated;

  const backgroundColor = useMemo(
    () => (isDark ? themeColors.black : themeColors.appBackground),
    [isDark],
  );

  const handleParticipate = () => {
    const userRoleIds = user?.roles?.map((role: any) => Number(role?.id)) || [];

    const contestRoleIds =
      selectedContest?.roles?.map((role: any) => Number(role?.id)) || [];

    console.log('User Role IDs:', userRoleIds);
    console.log('Contest Role IDs:', contestRoleIds);

    const isEligible = userRoleIds.some((roleId: any) =>
      contestRoleIds.includes(roleId),
    );

    console.log('Is Eligible:', isEligible);

    if (!isEligible) {
      show({
        type: 'error',
        title: 'You are not eligible for contest',
      });
      return;
    }

    navigation.navigate('ParticipateNow', {
      contest_id: selectedContest,
    });
  };

  const contestStatus = useMemo(() => {
    return getContestStatus(
      selectedContest?.start_date,
      selectedContest?.end_date,
    );
  }, [selectedContest?.start_date, selectedContest?.end_date]);

  const hasStarted = hasContestStarted(selectedContest?.start_date);

  const isExpired = hasContestExpired(selectedContest?.end_date);

  const isUpcoming = !hasStarted;

  const [fetchDone, setFetchDone] = useState(false);
  useFocusEffect(
    useCallback(() => {
      if (!contestId) {
        setFetchDone(true);
        return;
      }

      dispatch(getContestByIdThunk(contestId)).finally(() =>
        setFetchDone(true),
      );
      dispatch(getContestStatusThunk(contestId));
    }, [contestId]),
  );

  useEffect(() => {
    if (showSubmission !== true || !contestId) return;

    (async () => {
      try {
        const res = await getUserSubmissionsByContestId(contestId);
        const list = res?.data?.submissions || [];
        setMySubmissions(Array.isArray(list) ? list : []);
        console.log(
          '[ContestDetails] My submissions:',
          JSON.stringify(res, null, 2),
        );
      } catch (err: any) {
        console.log(
          '[ContestDetails] My submissions error:',
          err?.response?.data || err?.message,
        );
      }
    })();
  }, [showSubmission, contestId]);

  const participantsData = selectedContest?.top_five_submissions || [];
  const extraCount = participantsData.length - 3;

  const handleViewSubmissions = async () => {
    try {
      const res = await dispatch(
        getParticipantsByContestId(selectedContest?.id),
      ).unwrap();
      navigation.navigate('ViewAllSubmissions', {
        participants: res?.data || res || [],
        contestId: selectedContest?.id,
      });
    } catch (err) {
      console.log('Participants fetch error', err);
    }
  };

  const handleBookmark = async (id: string) => {
    if (!id) return;

    const isAlreadyBookmarked = isWishlisted;

    // ✅ Instant UI update
    dispatch(toggleContestWishlistStatus());

    try {
      const res = await dispatch(
        toggleContestBookmark({
          contest_id: id,
          type: isAlreadyBookmarked ? 'delete' : 'create',
        }),
      ).unwrap();

      console.log('bookmark api result', res);

      // Refresh status from API
      // await dispatch(getContestStatusThunk(id));

      show({
        type: 'success',
        title: res?.res?.message || res?.message,
      });
    } catch (error) {
      // ❌ Rollback if API fails
      dispatch(toggleContestWishlistStatus());

      show({
        type: 'error',
        title: error,
      });
    }
  };

  const MAX_LENGTH = 180;

  const description = selectedContest?.description || '';

  const plainDescription = description.replace(/<[^>]*>/g, '');

  const isLongText = plainDescription.length > MAX_LENGTH;

  const displayedText = showFullDescription
    ? description
    : `${plainDescription.slice(0, MAX_LENGTH)}...`;

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('BottomTab');
    }
  };

  const { handleShare } = useShare({
    type: 'contest',
    value: selectedContest?.id,
    title: selectedContest?.title,
    description: selectedContest?.genre?.name,
  });

  const winners = [...(selectedContest?.winners || [])].sort(
    (a, b) => Number(a?.winning_position) - Number(b?.winning_position),
  );

  const first = winners.find(item => Number(item?.winning_position) === 1);
  const second = winners.find(item => Number(item?.winning_position) === 2);
  const third = winners.find(item => Number(item?.winning_position) === 3);
  const others = winners.filter(item => Number(item?.winning_position) > 3);

  const showViewSubmissions =
    selectedContest?.publish_winners || contestStatus === 'completed';

  if (fetchDone && !loading && !selectedContest) {
    return (
      <ContentNotFound
        headerTitle="Contest Details"
        title="Contest Not Found"
        description="This contest doesn't exist, may have been deleted, or is no longer available."
        icon="trophy-outline"
      />
    );
  }

  if (loading || !selectedContest) {
    return <ContestDetailsSkeleton />;
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={['left', 'right']}
    >
      <StatusBar translucent barStyle={'light-content'} />

      {/* SCROLL */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        // contentContainerStyle={{ paddingBottom: 100 }}
        bounces={false}
        overScrollMode="auto"
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
        }}
      >
        <View style={styles.imageWrapper}>
          <FastImage
            source={
              imageError || !selectedContest?.image
                ? require('../../assets/images/fallback.png')
                : {
                    uri: selectedContest?.image,
                    priority: FastImage.priority.high,
                  }
            }
            style={styles.image}
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
              showBack
              onBack={handleBack}
              showBookMark
              postId={selectedContest?.id}
              bookmarked={isWishlisted}
              onToggleBookmark={() => handleBookmark(selectedContest?.id)}
            />
          </View>

          {/* TITLE SECTION */}
          <View style={styles.titleContainer}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <View style={styles.contestBadge}>
                <StarTwo size={18} color={themeColors.primary} />
                <Text style={styles.contestText}>CONTEST</Text>
              </View>
              {selectedContest?.user_rank && (
                <View
                  style={[
                    styles.contestBadge,
                    {
                      backgroundColor: 'rgba(255,184,0,0.7)',
                      borderColor: '#FFB800',
                      paddingVertical: 3,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.contestText,
                      {
                        color: '#FFF',
                      },
                    ]}
                  >
                    🏆 Your Rank: {selectedContest?.user_rank}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
              {selectedContest?.title}
            </Text>
            {/* <Text style={styles.subTitle}>
              {selectedContest?.category?.name}
            </Text> */}
          </View>
        </View>

        <View style={styles.scroll}>
          {/* ACTION BAR */}
          <View
            style={[
              styles.actionContainer,
              {
                backgroundColor: isDark ? themeColors.card2 : themeColors.white,
              },
            ]}
          >
            <View style={styles.overlayRow}>
              <UserTwo color={themeColors.primary} size={23} />

              <View style={{ marginLeft: 10 }}>
                <Text
                  style={[
                    styles.overlayParticipants,
                    { color: isDark ? '#fff' : '#000' },
                  ]}
                >
                  {formatCount(participantsCount)}
                </Text>

                <Text style={styles.overlayLabel}>Participated</Text>
              </View>
            </View>

            <View
              style={[
                styles.divider,
                {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.2)'
                    : 'rgba(0, 0, 0, 0.6)',
                },
              ]}
            />
            <View style={styles.overlayRow}>
              <Movie color={themeColors.primary} width={23} height={23} />

              <View style={{ marginLeft: 10 }}>
                <Text
                  style={[
                    styles.overlayParticipants,
                    { color: isDark ? '#fff' : '#000' },
                  ]}
                  numberOfLines={1}
                >
                  {selectedContest?.category?.name || 'N/A'}
                </Text>

                <Text style={styles.overlayLabel}>Category</Text>
              </View>
            </View>
          </View>

          <View
            style={{
              paddingHorizontal: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <View style={{ flex: 1 }}>
              {showViewSubmissions ? (
                <PrimaryButton
                  title="View Submissions"
                  onPress={handleViewSubmissions}
                  marginTop={10}
                />
              ) : (
                <PrimaryButton
                  title={
                    isExpired
                      ? 'Contest Ended'
                      : isUpcoming
                      ? 'Contest Not Started'
                      : blockParticipation
                      ? 'Already Participated'
                      : isParticipated && !isSingleLimit
                      ? 'Participate'
                      : 'Participate'
                  }
                  onPress={handleParticipate}
                  disabled={isExpired || isUpcoming || blockParticipation}
                  marginTop={10}
                  style={{
                    opacity:
                      blockParticipation || contestStatus === 'upcoming'
                        ? 0.7
                        : 1,
                  }}
                />
              )}
            </View>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                handleShare({
                  type: 'contest',
                  value: selectedContest?.id,
                  title: selectedContest?.title,
                });
              }}
            >
              <Share
                size={20}
                color={isDark ? themeColors.white : themeColors.black}
              />
            </TouchableOpacity>
          </View>

          {/* CONTENT */}
          <View style={styles.contentContainer}>
            {/* HEADER */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                marginBottom: 6,
              }}
            >
              <Note size={20} color={themeColors.primary} />

              <Text
                style={{
                  fontFamily: Fonts.Bold,
                  fontSize: 20,
                  color: themeColors.white,
                }}
              >
                About Contest
              </Text>
            </View>

            {/* DESCRIPTION */}
            <RenderHTML
              contentWidth={width}
              source={{ html: displayedText }}
              baseStyle={styles.description}
              systemFonts={[
                Fonts.Regular,
                Fonts.Bold,
                Fonts.SemiBold,
                Fonts.Italic,
                Fonts.Black,
              ]}
              tagsStyles={{
                body: {
                  color: '#fff',
                  fontSize: 14,
                  fontFamily: Fonts.Regular,
                },

                p: {
                  color: '#fff',
                  marginBottom: 8,
                },

                h1: {
                  color: '#fff',
                  fontSize: 24,
                  fontFamily: Fonts.Bold,
                },

                h2: {
                  color: '#fff',
                  fontSize: 20,
                  fontFamily: Fonts.Bold,
                },

                strong: {
                  color: '#fff',
                  fontFamily: Fonts.Bold,
                },

                li: {
                  color: '#fff',
                },
              }}
            />

            {/* READ MORE */}
            {isLongText && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowFullDescription(!showFullDescription)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 2,
                  alignSelf: 'flex-start',
                  gap: 4,
                }}
              >
                <Text
                  style={{
                    color: themeColors.primary,
                    fontFamily: Fonts.SemiBold,
                    fontSize: 13,
                  }}
                >
                  {showFullDescription ? 'Read Less' : 'Read More'}
                </Text>

                <Ionicons
                  name="chevron-down"
                  size={13}
                  color={themeColors.primary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* TimeLine */}
          <View style={styles.timelineContainer}>
            {/* HEADER */}
            <View style={styles.timelineHeader}>
              <Calendar size={20} color={themeColors.primary} />

              <Text style={styles.timelineTitle}>Timeline</Text>
            </View>

            {/* LINE */}
            <View style={styles.timelineWrapper}>
              <View style={styles.timelineLine} />

              {/* START DATE */}
              <View style={[styles.timelineItem, { alignItems: 'flex-start' }]}>
                <View style={styles.timelineDotOuter}>
                  <View style={styles.timelineDotInner} />
                </View>

                <Text style={styles.timelineLabel}>Start Date</Text>

                <Text style={styles.timelineDate}>
                  {formatDate(selectedContest?.start_date)}
                </Text>
              </View>

              {/* END DATE */}
              <View
                style={[
                  styles.timelineItem,
                  {
                    alignItems: selectedContest?.voting_open_till_date
                      ? 'center'
                      : 'flex-end',
                  },
                ]}
              >
                <View style={styles.timelineDotOuter}>
                  <View style={styles.timelineDotInner} />
                </View>

                <Text style={styles.timelineLabel}>Deadline</Text>

                <Text style={styles.timelineDate}>
                  {formatDate(selectedContest?.end_date)}
                </Text>
              </View>

              {/* VOTING DATE */}
              {selectedContest?.voting_open_till_date && (
                <View style={[styles.timelineItem, { alignItems: 'flex-end' }]}>
                  <View style={styles.timelineDotOuter}>
                    <View style={styles.timelineDotInner} />
                  </View>

                  <Text style={styles.timelineLabel}>Voting Ends</Text>

                  <Text style={styles.timelineDate}>
                    {formatDate(selectedContest?.voting_open_till_date)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Prize Money */}
          {showSubmission !== true && selectedContest?.prize_money && (
            <PrizeMoneyCard amount={selectedContest?.prize_money} />
          )}

          {showSubmission === true ? (
            <View style={{ marginTop: 24 }}>
              <View style={styles.mySubHeader}>
                <Note size={20} color={themeColors.primary} />
                <Text style={styles.mySubTitle}>My Submissions</Text>
              </View>

              {mySubmissions.map((item: any) => (
                <View key={item?.id} style={styles.mySubCardWrapper}>
                  <SubmissionCard
                    url={item?.image}
                    title={item?.title}
                    subtitle={item?.story}
                    view={item?.views}
                    type={item?.type}
                    onPress={() =>
                      navigation.navigate('ParticipateDetails', {
                        id: item?.id,
                      })
                    }
                    user={item?.user?.name}
                  />
                </View>
              ))}
            </View>
          ) : selectedContest?.publish_winners === true
            ? selectedContest?.winners?.length > 0 && (
                <View
                  style={[
                    styles.section,
                    {
                      paddingHorizontal: 0,
                      paddingVertical: 0,
                      borderRadius: 22,
                      borderWidth: 0.4,
                      borderColor: themeColors.primary,
                    },
                  ]}
                >
                  <ContestWinnerPodium
                    first={first}
                    second={second}
                    third={third}
                    others={others}
                    onWinnerPress={winner =>
                      navigation.navigate('ParticipateDetails', {
                        id: winner.id,
                      })
                    }
                  />
                </View>
              )
            : selectedContest?.top_five_submissions?.length > 0 && (
                <View style={[styles.section]}>
                  <View style={styles.headerWrapper}>
                    <FastImage
                      source={require('../../assets/images/trophy.2c38b3d7.png')}
                      style={styles.badgeTwo}
                    />
                    <Text
                      style={[
                        styles.sectionTitle,
                        {
                          color: isDark ? themeColors.white : themeColors.black,
                        },
                      ]}
                    >
                      Top 5 Participants
                    </Text>
                    <FastImage
                      source={require('../../assets/images/trophy.2c38b3d7.png')}
                      style={styles.badgeTwo}
                    />
                  </View>

                  {selectedContest?.top_five_submissions.map(
                    (item: any, index: number) => (
                      <ParticipantCard
                        key={item.id}
                        item={item}
                        index={index}
                        onPress={() =>
                          navigation.navigate('ParticipateDetails', {
                            id: item?.id, // ✅ FULL DATA
                          })
                        }
                      />
                    ),
                  )}
                </View>
              )}
        </View>
      </ScrollView>
      {/* 🔥 BOTTOM CTA */}
      {!selectedContest?.publish_winners && !isExpired && (
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
            title="View Submissions"
            onPress={handleViewSubmissions}
            style={{ flex: 1 }}
            variant="outline"
            disabled={contestStatus === 'upcoming'}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default ContestDetails;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  scroll: {
    paddingHorizontal: 10,
  },

  imageWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
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

  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    zIndex: 1,
  },

  titleContainer: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
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

  image: {
    width: '100%',
    height: 400,
  },

  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: 6,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 18,
  },

  overlayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },

  overlayParticipants: {
    fontSize: 14,
    fontFamily: Fonts.Bold,
  },

  overlayLabel: {
    fontSize: 12,
    color: themeColors.gray,
    fontFamily: Fonts.Regular,
  },

  divider: {
    width: 1,
    height: 34,
    marginHorizontal: 16,
  },

  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 30,
    backgroundColor: themeColors.card2,
    padding: 12,
    marginTop: 10,
  },

  actionText: {
    fontSize: 13,
    fontFamily: Fonts.Medium,
  },

  contentContainer: {
    marginTop: 14,
    paddingHorizontal: 10,
  },

  title: {
    fontSize: Platform.OS === 'ios' ? 28 : 28,
    fontFamily: Fonts.Black,
    // lineHeight: 32,
    color: themeColors.white,
  },

  subTitle: {
    fontFamily: Fonts.Regular,
    fontSize: 16,
    color: themeColors.white,
  },

  description: {
    fontSize: 14,
    // lineHeight: 26,
    fontFamily: Fonts.Regular,
    color: themeColors.white,
  },

  // Participant style
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    justifyContent: 'center',
    marginBottom: 12,
    borderBottomColor: themeColors.primary,
    borderBottomWidth: 0.4,
    paddingBottom: 6,
  },

  badgeTwo: {
    width: 30,
    height: 30,
  },

  section: {
    marginTop: 20,
    paddingHorizontal: 10,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 0.4,
    borderColor: themeColors.primary,
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.Black,
  },

  infoContainer: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
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

  winnerWrapper: {
    width: 320,
    marginRight: 14,
  },

  // My submissions
  mySubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 6,
  },
  mySubTitle: {
    fontFamily: Fonts.Bold,
    fontSize: 20,
    color: themeColors.white,
  },
  mySubCardWrapper: {
    marginHorizontal: -10,
    marginBottom: 4,
  },

  // Timeline
  timelineContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },

  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },

  timelineTitle: {
    fontFamily: Fonts.Bold,
    fontSize: 20,
    color: '#fff',
  },

  timelineWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
  },

  timelineLine: {
    position: 'absolute',
    top: 7,
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: '#D89B00',
    borderRadius: 10,
  },

  timelineItem: {
    width: '33.33%',
  },

  timelineDotOuter: {
    width: 16,
    height: 16,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#FFB800',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
    zIndex: 10,
  },

  timelineDotInner: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#fff',
  },

  timelineLabel: {
    marginTop: 12,
    fontSize: 12,
    // textAlign: 'center',
    color: '#fff',
    fontFamily: Fonts.SemiBold,
    lineHeight: 20,
  },

  timelineDate: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    fontFamily: Fonts.Regular,
    // textAlign: 'center',
  },
});
