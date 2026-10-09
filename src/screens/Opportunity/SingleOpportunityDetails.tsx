import {
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import React, { useCallback, useMemo, useState } from 'react';
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
import { Fonts } from '../../constants/Fonts';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import StatusBadge from '../../components/Badges/StatusBadge';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteOpportunity,
  getOpportunityDetailsByIdThunk,
  toggleBookmarkLocal,
  toggleContestBookmark,
  updateOpportunityReportedLocal,
  updateOpportunityStatus,
  updateOpportunityStatusLocal,
} from '../../redux/slices/opportunitySlice';
import { formatDate } from '../../utils/date';

import { useToast } from '../../components/Toast/ToastProvider';
import ContentNotFound from '../../components/NotFound/ContentNotFound';
import OpportunityDetailsSkeleton from '../../components/skeleton/OpportunityDetailsSkeleton';
import { createReport, getReports } from '../../redux/slices/reportSlice';
import ReportModal from '../../components/Modals/ReportModal';
import TagChip from '../../components/Tags/TagChip';
import UserTwo from '../../assets/SVG/UserTwo';
import Calendar from '../../assets/SVG/Calendar';
import Bag from '../../assets/SVG/Bag';
import Avatar from '../../components/Avatar/Avatar';
import Email from '../../assets/SVG/Email';
import BuildingTwo from '../../assets/SVG/BuildingTwo';
import Wifi from '../../assets/SVG/Wifi';
import MapPin from '../../assets/SVG/MapPin';
import RenderHtml from 'react-native-render-html';
import truncate from 'truncate-html';
import HtmlRenderer from '../../components/HtmlRenderer/HtmlRenderer';
import { isHtmlContent } from '../../utils/html';
import { useShare } from '../../hooks/useShare';
import Eye from '../../assets/SVG/Eye';

const SingleOpportunityDetails = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { opp_id } = route.params || {};
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<any>();
  const { show } = useToast();
  const [reportVisible, setReportVisible] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { width } = useWindowDimensions();
  const { handleShare } = useShare();

  const isDark = true;

  const backgroundColor = useMemo(
    () => (isDark ? themeColors.black : themeColors.appBackground),
    [isDark],
  );
  const textPrimary = isDark ? themeColors.white : themeColors.black;

  const { selectedOpportunity, detailsLoading, bookmarkedIds } = useSelector(
    (state: any) => state.opportunity,
  );
  const { user: authUser } = useSelector((state: any) => state.auth);

  // 🔥 FETCH
  const [fetchDone, setFetchDone] = useState(false);
  useFocusEffect(
    useCallback(() => {
      if (!opp_id) {
        setFetchDone(true);
        return;
      }
      dispatch(getOpportunityDetailsByIdThunk(opp_id)).finally(() =>
        setFetchDone(true),
      );
    }, [opp_id]),
  );

  const isOwnPost = useMemo(
    () => authUser?.id === selectedOpportunity?.posted_user?.id,
    [authUser?.id, selectedOpportunity?.posted_user?.id],
  );

  const getOpportunityStatus = (
    status: string,
    openTill: string,
  ) => {
    // Backend status has highest priority
    if (status?.toLowerCase() === 'closed') {
      return 'closed';
    }

    const now = new Date();
    const end = new Date(openTill);

    const diffTime = end.getTime() - now.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffTime < 0) {
      return 'closed';
    }

    if (diffDays <= 3) {
      return 'closing soon';
    }

    return 'open';
  };
  const status = getOpportunityStatus(
    selectedOpportunity?.status,
    selectedOpportunity?.open_till,
  );
  const isAlreadyReported = !!selectedOpportunity?.isReported;
  const isSubmitted = selectedOpportunity?.isSubmitted === 1;

  // 🔥 BOOKMARK
  const handleBookmark = async (id: string) => {
    if (!id) return;

    const isAlreadyBookmarked = bookmarkedIds?.includes(id);

    dispatch(toggleBookmarkLocal(id));

    try {
      const res: any = await dispatch(
        toggleContestBookmark({
          oppourtunity_id: id,
          type: isAlreadyBookmarked ? 'delete' : 'create',
        }),
      );

      const isSuccess = res?.meta?.requestStatus === 'fulfilled';

      if (!isSuccess) {
        dispatch(toggleBookmarkLocal(id));

        show({
          type: 'error',
          title: res?.payload || 'Something went wrong',
        });
        return;
      }

      show({
        type: 'success',
        title:
          res?.payload?.res?.message ||
          (isAlreadyBookmarked
            ? 'Removed from bookmarks'
            : 'Added to bookmarks'),
      });
    } catch (error) {
      dispatch(toggleBookmarkLocal(id));

      show({
        type: 'error',
        title: 'Something went wrong',
      });
    }
  };

  // 🔥 DELETE
  const handleDelete = async () => {
    if (!selectedOpportunity?.id) return;
    const res: any = await dispatch(
      deleteOpportunity(selectedOpportunity.opp_id),
    );
    if (res?.meta?.requestStatus === 'fulfilled') {
      show({
        type: 'success',
        title: res.message || 'Opportunity delete successfull!',
      });
      navigation.goBack();
    } else {
      show({ type: 'error', title: res.message });
    }
  };

  const confirmDelete = () => {
    Alert.alert(`Delete this ${selectedOpportunity.title}`, 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: handleDelete },
    ]);
  };

  const handleReport = async (data: any) => {
    try {
      if (!selectedOpportunity?.id) return;

      const payload: any = {
        report_id: data.reason, // ✅ already ID from modal
        description: data.message || '',
        synopses_id: null,
        opportunity_id: selectedOpportunity?.id,
        reported_user_id: selectedOpportunity?.user?.id,
        chat_id: null,
        message_id: null,
      };

      console.log('FINAL REPORT PAYLOAD:', payload);

      const res = await dispatch(createReport(payload));
      console.log('report submit res', res);
      show({
        type: 'success',
        title: res?.payload?.message || 'Report submitted',
      });

      dispatch(updateOpportunityReportedLocal(selectedOpportunity.id));

      setReportVisible(false);
    } catch (error: any) {
      show({
        type: 'error',
        title: error,
      });
    }
  };

  const handleCloseAndPublishAgain = async () => {
    try {
      const oldStatus = selectedOpportunity?.status;

      let newStatus = 'published';

      if (oldStatus === 'draft') {
        newStatus = 'published';
      } else if (oldStatus === 'published') {
        newStatus = 'closed';
      } else if (oldStatus === 'closed') {
        newStatus = 'published';
      }

      // 🔥 Optimistic UI
      dispatch(
        updateOpportunityStatusLocal({
          opp_id: selectedOpportunity?.opp_id,
          status: newStatus,
        }),
      );

      // 🔥 Correct API call
      const res: any = await dispatch(
        updateOpportunityStatus({
          opp_id: selectedOpportunity?.opp_id,
          status: newStatus,
        }),
      );

      // ❌ rollback
      if (res?.meta?.requestStatus !== 'fulfilled') {
        dispatch(
          updateOpportunityStatusLocal({
            opp_id: selectedOpportunity?.opp_id,
            status: oldStatus,
          }),
        );

        show({
          type: 'error',
          title: res?.payload || 'Status update failed',
        });

        return;
      }

      // ✅ success
      show({
        type: 'success',
        title:
          newStatus === 'published'
            ? 'Published successfully'
            : 'Closed successfully',
      });
    } catch (error) {
      dispatch(
        updateOpportunityStatusLocal({
          opp_id: selectedOpportunity?.opp_id,
          status: selectedOpportunity?.status,
        }),
      );

      show({
        type: 'error',
        title: 'Something went wrong',
      });
    }
  };

  const isExpired = new Date(selectedOpportunity?.open_till) < new Date();

  const isClosed = selectedOpportunity?.status === 'closed' || isExpired;
  const formattedDescription = selectedOpportunity?.description
    ?.replace(/\r\n/g, '\n')
    ?.replace(/\n{3,}/g, '\n\n')
    ?.trim();
  const decodedHTML = formattedDescription || '';
  const shortHTML =
    decodedHTML.length > 500 ? decodedHTML.slice(0, 500) + '...' : decodedHTML;

  const getWorkTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'remote':
        return <Wifi size={15} color={themeColors.primary} />;

      case 'hybrid':
        return <BuildingTwo size={15} color={themeColors.primary} />;

      case 'onsite':
        return <MapPin size={15} color={themeColors.primary} />;

      default:
        return <Bag size={15} color={themeColors.primary} />;
    }
  };

  // 👇 ADD HERE
  if (fetchDone && !detailsLoading && !selectedOpportunity) {
    return (
      <ContentNotFound
        headerTitle="Opportunity Details"
        title="Opportunity Not Found"
        description="This opportunity doesn't exist, may have been deleted, or is no longer available."
        icon="briefcase-outline"
      />
    );
  }

  if (detailsLoading || !selectedOpportunity) {
    return <OpportunityDetailsSkeleton />;
  }

  return (
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
          { paddingBottom: insets.bottom + 0 },
        ]}
        bounces={false}
        overScrollMode="never"
      >
        {/* IMAGE */}
        <View style={styles.imageWrapper}>
          <FastImage
            source={
              imageError || !selectedOpportunity?.poster_url
                ? require('../../assets/images/fallback.png')
                : {
                  uri: selectedOpportunity?.poster_url,
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
              fontSize={20}
              onBack={() => navigation.goBack()}
              showBookMark
              postId={selectedOpportunity?.id}
              bookmarked={bookmarkedIds?.includes(
                Number(selectedOpportunity?.id),
              )}
              onToggleBookmark={() => handleBookmark(selectedOpportunity?.id)}
              showMenu
              isOwnPost={isOwnPost}
              onEdit={
                isOwnPost && selectedOpportunity?.total_submissions === 0
                  ? () => {
                    navigation.navigate('AddOpportunity', {
                      opp_id: selectedOpportunity?.opp_id,
                    });
                  }
                  : undefined
              }
              isSubmissionThere={selectedOpportunity?.total_submissions > 0}
              onDelete={isOwnPost ? confirmDelete : undefined}
              onReport={
                !isOwnPost && !isAlreadyReported
                  ? () => {
                    dispatch(getReports());
                    setReportVisible(true);
                  }
                  : undefined
              }
              isAlreadyReported={isAlreadyReported}
              showShare
              onShare={() => {
                handleShare({
                  title: selectedOpportunity?.title,
                  value: selectedOpportunity?.opp_id,
                  type: 'opportunity',
                })
              }}
              type={"opportunity"}
            />
          </View>

          {/* TITLE SECTION */}
          <View style={styles.titleContainer}>
            <StatusBadge status={status} />
            <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
              {selectedOpportunity?.title}
            </Text>
          </View>

          {/* ACTION BAR */}
          <View
            style={[
              styles.actionContainer,
              {
                borderColor: 'rgba(200,155,60,0.25)',
                backgroundColor: 'rgba(20,20,20,0.95)',
              },
            ]}
          >
            <View style={styles.overlayRow}>
              <View
                style={{
                  padding: 8,
                  borderRadius: 100,
                  backgroundColor: '#3A2A10',
                  marginBottom: 4,
                }}
              >
                <UserTwo color={themeColors.primary} size={15} />
              </View>
              <Text
                style={[styles.infoLabel, { color: isDark ? '#aaa' : '#555' }]}
              >
                Total Applied
              </Text>
              <Text
                style={[
                  styles.overlayParticipants,
                  { color: isDark ? '#fff' : '#000' },
                ]}
                numberOfLines={1}
                ellipsizeMode='tail'
              >
                {selectedOpportunity?.total_submissions} applied
              </Text>
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
              <View
                style={{
                  padding: 8,
                  borderRadius: 100,
                  backgroundColor: '#3A2A10',
                  marginBottom: 4,
                }}
              >
                <Calendar color={themeColors.primary} size={15} />
              </View>
              <Text
                style={[styles.infoLabel, { color: isDark ? '#aaa' : '#555' }]}
                numberOfLines={1}
                ellipsizeMode='tail'
              >
                Last Date
              </Text>
              <Text
                style={[
                  styles.overlayParticipants,
                  { color: isDark ? '#fff' : '#000' },
                ]}
                numberOfLines={1}
                ellipsizeMode='tail'
              >
                {formatDate(selectedOpportunity?.open_till)}
              </Text>
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
              <View
                style={{
                  padding: 8,
                  borderRadius: 100,
                  backgroundColor: '#3A2A10',
                  marginBottom: 4,
                }}
              >
                <Bag color={themeColors.primary} size={15} />
              </View>
              <Text
                style={[styles.infoLabel, { color: isDark ? '#aaa' : '#555' }]}
              >
                Category
              </Text>
              <Text
                style={[
                  styles.overlayParticipants,
                  { color: isDark ? '#fff' : '#000' },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {selectedOpportunity?.role?.display_name}
              </Text>
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
              <View
                style={{
                  padding: 8,
                  borderRadius: 100,
                  backgroundColor: '#3A2A10',
                  marginBottom: 4,
                }}
              >
                {getWorkTypeIcon(selectedOpportunity?.location_type)}
              </View>
              <Text
                style={[styles.infoLabel, { color: isDark ? '#aaa' : '#555' }]}
              >
                Work Type
              </Text>
              <Text
                style={[
                  styles.overlayParticipants,
                  { color: isDark ? '#fff' : '#000' },
                ]}
              >
                {selectedOpportunity?.location_type}
              </Text>
            </View>
          </View>
        </View>

        {/* CONTENT */}
        <View style={styles.contentContainer}>
          <View style={[styles.descContainer]}>
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
                About Opportunity
              </Text>
              <View style={styles.line} />
            </View>

            {isHtmlContent(selectedOpportunity?.description) ? (
              <HtmlRenderer html={selectedOpportunity?.description} />
            ) : (
              <Text style={styles.description}>
                {selectedOpportunity?.description}
              </Text>
            )}

            <View
              style={[
                styles.headingContainer,
                {
                  borderColor: isDark
                    ? themeColors.card
                    : themeColors.secondary,
                  marginTop: 20,
                },
              ]}
            >
              <Text
                style={[
                  styles.heading,
                  { color: isDark ? themeColors.white : themeColors.black },
                ]}
              >
                Tags
              </Text>
              <View style={styles.line} />
              {selectedOpportunity?.tags.length > 0 && (
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 10,
                    flexWrap: 'wrap',
                  }}
                >
                  {selectedOpportunity?.tags.map((tag: any, index: any) => (
                    <TagChip key={index} label={tag?.name} />
                  ))}
                </View>
              )}
            </View>

            {selectedOpportunity?.posted_user && (
              <View
                style={[
                  styles.headingContainer,
                  {
                    borderColor: isDark
                      ? themeColors.card
                      : themeColors.secondary,
                    marginTop: 20,
                    // backgroundColor: themeColors.card2,
                    // padding: 8,
                    // borderRadius: 12,
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
                <View style={styles.line} />
                <View style={styles.companyRow}>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('Profile', {
                        username: selectedOpportunity?.posted_user?.user_name,
                      });
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <Avatar
                      uri={selectedOpportunity?.posted_user?.profile_photo_path}
                      name={selectedOpportunity?.posted_user?.name}
                      size={32}
                    />
                    <View>
                      <Text style={[styles.companyName, { color: textPrimary }]}>
                        {selectedOpportunity?.posted_user?.name}
                      </Text>
                      <Text
                        style={[
                          styles.companyNameTwo,
                          { color: themeColors.gray },
                        ]}
                      >
                        Posted on {formatDate(selectedOpportunity?.createdAt)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.6}
                      style={[
                        styles.iconContainer,
                        {
                          backgroundColor: isDark
                            ? themeColors.card2
                            : themeColors.card2,
                        },
                      ]}
                      onPress={() => {
                        navigation.navigate('Profile', {
                          username: selectedOpportunity?.posted_user?.user_name,
                        });
                      }}
                    >
                      <Eye
                        size={16}
                        color={isDark ? themeColors.white : themeColors.black}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      {/* 🔥 BUTTON AT BOTTOM */}
      <View
        style={[
          styles.buttonContainer,
          {
            paddingHorizontal: 15,
            paddingBottom:
              Platform.OS === 'ios' ? insets.bottom - 10 : insets.bottom + 10,
          },
        ]}
      >
        {isOwnPost ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {/* 📥 View Submissions */}
            <PrimaryButton
              title="View Submissions"
              variant="outline"
              style={{ flex: 1 }}
              onPress={() =>
                navigation.navigate('ViewMyOpportunitySubmisiions', {
                  opportunity_id: selectedOpportunity?.id,
                })
              }
            />

            {/* ❌ Close Opportunity */}
            <PrimaryButton
              title={
                selectedOpportunity?.status === 'draft'
                  ? 'Publish'
                  : selectedOpportunity?.status === 'published'
                    ? 'Close Application'
                    : 'Publish Again'
              }
              style={{ flex: 1 }}
              onPress={handleCloseAndPublishAgain}
            />
          </View>
        ) : (
          <PrimaryButton
            title={
              isClosed
                ? 'Applications Closed'
                : isSubmitted
                  ? 'Already Applied'
                  : 'Apply Now'
            }
            onPress={() => {
              if (!isSubmitted && !isClosed) {
                navigation.navigate('ApplyOpportunity', {
                  opp_id: selectedOpportunity?.opp_id,
                });
              }
            }}
            disabled={isSubmitted || isClosed}
          />
        )}
      </View>

      <ReportModal
        visible={reportVisible}
        onClose={() => setReportVisible(false)}
        post={selectedOpportunity} // 🔥 important
        onSubmit={handleReport}
        reportType="OPPORTUNITIES"
      />
    </SafeAreaView>
  );
};

export default SingleOpportunityDetails;

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

  image: {
    width: '100%',
    height: 350,
  },

  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    position: 'absolute',
    bottom: -40,
    zIndex: 999,
    marginHorizontal: 12,
    borderColor: themeColors.gray,
    borderWidth: 0.5,
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
    height: 40,
  },

  contentContainer: {
    flex: 1,
    marginTop: 40,
    paddingHorizontal: 12,
  },

  titleContainer: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    zIndex: 999,
  },

  title: {
    fontSize: 24,
    fontFamily: Fonts.Black,
    color: themeColors.white,
    textTransform: "capitalize"
  },

  descContainer: {
    marginTop: 8,
    padding: 12,
    borderRadius: 10,
  },

  headingContainer: {
    flex: 1,
  },

  heading: {
    fontSize: 18,
    fontFamily: Fonts.Bold,
    marginBottom: 4,
  },

  line: {
    backgroundColor: themeColors.primary,
    height: 3,
    width: 30,
    borderRadius: 2,
  },

  description: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: Fonts.Regular,
    color: themeColors.white
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
  companyNameTwo: {
    fontSize: 10,
    fontFamily: Fonts.Bold,
  },

  iconContainer: {
    borderRadius: 100,
    padding: 8,
  },

  buttonContainer: {
    marginTop: 'auto',
  },

  infoContainer: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },

  infoItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },

  infoTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },

  infoLabel: {
    fontSize: 11,
    fontFamily: Fonts.Medium,
  },

  infoValue: {
    fontSize: 13,
    fontFamily: Fonts.Bold,
  },

  overlayRow: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },

  overlayParticipants: {
    fontSize: 13,
    marginLeft: 8,
    fontFamily: Fonts.Regular,
  },
});
