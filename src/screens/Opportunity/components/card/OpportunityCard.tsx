import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import React from 'react';
import { Fonts } from '../../../../constants/Fonts';
import StatusBadge from '../../../../components/Badges/StatusBadge';
import FastImage from 'react-native-fast-image';
import { themeColors } from '../../../../theme/colors';
import { useNavigation } from '@react-navigation/native';
import Avatar from '../../../../components/Avatar/Avatar';
import { getDisplayTime } from '../../../../utils/timeAgo';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateOpportunityStatus,
  updateOpportunityStatusLocal,
} from '../../../../redux/slices/opportunitySlice';
import Location from '../../../../assets/SVG/Location';
import RenderHtml from 'react-native-render-html';

type Props = {
  data: any;
  onPress: () => void;
};

const OpportunityCard = ({ data, onPress }: Props) => {
  const isDark = true;
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const { width } = useWindowDimensions();

  const bg = isDark ? '#0f0f10' : '#ebebeb'; // darker background
  const cardBg = isDark ? '#1a1a1c' : '#ffffff'; // less bright card
  const textPrimary = isDark ? '#f5f5f7' : themeColors.black;
  const textSecondary = isDark ? '#8e8e93' : '#666';

  const { user } = useSelector((state: any) => state.auth);

  const getOpportunityStatus = (openTill: string) => {
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

  const isOwnPost = user?.id === data?.posted_user?.id;
  const status = getOpportunityStatus(data?.open_till);
  const isClosed = getOpportunityStatus(data?.open_till) === 'closed';
  const Statuss = data?.status;

  const handleStatusChange = async () => {
    const oldStatus = data?.status;

    let newStatus = 'published';

    if (oldStatus === 'draft') {
      newStatus = 'published';
    } else if (oldStatus === 'published') {
      newStatus = 'closed';
    } else if (oldStatus === 'closed') {
      newStatus = 'published';
    }

    // 🔥 instant UI update
    dispatch(
      updateOpportunityStatusLocal({
        opp_id: data?.opp_id,
        status: newStatus,
      }),
    );

    // 🔥 API call
    const res: any = await dispatch(
      updateOpportunityStatus({
        opp_id: data?.opp_id,
        status: newStatus,
      }),
    );

    // ❌ rollback
    if (res?.meta?.requestStatus !== 'fulfilled') {
      dispatch(
        updateOpportunityStatusLocal({
          opp_id: data?.opp_id,
          status: oldStatus,
        }),
      );
    }
  };

  const isApplied = data?.isSubmitted === 1;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.wrapper, { backgroundColor: bg }]}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: cardBg, borderColor: isDark ? '#2a2a2d' : '#eee' },
        ]}
      >
        {/* Top Row */}
        <View style={styles.topRow}>
          <View style={styles.companyRow}>
            <Avatar
              uri={data?.posted_user?.profile_photo_path}
              name={data?.posted_user?.name || "Unknown"}
              size={36}
            />

            <View>
              <Text style={[styles.companyName, { color: textPrimary }]}>
                {data?.posted_user?.name || "Unknown"}
              </Text>
              <Text style={[styles.timeText, { color: textSecondary }]}>
                {getDisplayTime(data?.createdAt, data?.updatedAt)}
              </Text>
            </View>
          </View>
          <StatusBadge status={status} />
        </View>

        <View>
          {/* Title */}
          <Text style={[styles.title, { color: textPrimary }]}>
            {data?.title}
          </Text>

          {/* Tags */}
          <View style={styles.tagRow}>
            {data?.role?.display_name ? (
              <View
                style={[
                  styles.tag,
                  { backgroundColor: isDark ? '#2a2a2d' : '#eaeaea' },
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: isDark ? '#d1d1d6' : '#333' },
                  ]}
                >
                  {data.role.display_name}
                </Text>
              </View>
            ) : null}

            {data?.location_type ? (
              <View
                style={[
                  styles.tag,
                  { backgroundColor: isDark ? '#2a2a2d' : '#eaeaea' },
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    { color: isDark ? '#d1d1d6' : '#333' },
                  ]}
                >
                  {data?.location_type}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={{ marginTop: 6 }}>
            <RenderHtml
              contentWidth={width}
              source={{
                html: `
        <div>
          ${
            data?.description?.length > 180
              ? data?.description?.slice(0, 180) + '...'
              : data?.description || ''
          }
        </div>
      `,
              }}
              tagsStyles={{
                body: {
                  margin: 0,
                  padding: 0,
                },

                p: {
                  marginTop: 0,
                  marginBottom: 0,
                  color: textPrimary,
                  fontSize: 12,
                  lineHeight: 20,
                  fontFamily: Fonts.Regular,
                },

                div: {
                  color: textPrimary,
                  fontSize: 12,
                  lineHeight: 20,
                  fontFamily: Fonts.Regular,
                },

                li: {
                  color: textPrimary,
                  fontSize: 12,
                  lineHeight: 20,
                  marginBottom: 4,
                  fontFamily: Fonts.Regular,
                },

                ul: {
                  marginTop: 0,
                  marginBottom: 0,
                  paddingLeft: 16,
                },

                h1: {
                  fontSize: 15,
                  color: textPrimary,
                  marginBottom: 4,
                  fontFamily: Fonts.Bold,
                },

                h2: {
                  fontSize: 14,
                  color: textPrimary,
                  marginBottom: 4,
                  fontFamily: Fonts.Bold,
                },

                strong: {
                  fontFamily: Fonts.Bold,
                  color: textPrimary,
                },
              }}
              renderersProps={{
                li: {
                  enableExperimentalMarginCollapsing: true,
                },
              }}
              defaultTextProps={{
                numberOfLines: 2,
              }}
            />
          </View>
        </View>

        {/* Footer */}
        <View
          style={[styles.footer, { borderColor: isDark ? '#2c2c2e' : '#ddd' }]}
        >
          <View style={{ flex: 1 }}>
            {data?.location ? (
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <Location size={14} color={textSecondary} />
                <Text style={[styles.location, { color: textSecondary }]}>
                  {data?.location}
                </Text>
              </View>
            ) : null}
          </View>

          {/* 🔥 If NOT my post → show Apply */}
          {!isOwnPost && (
            <TouchableOpacity
              style={[
                styles.applyBtn,
                {
                  opacity: isClosed || isApplied ? 0.5 : 1,
                  backgroundColor:
                    isClosed || isApplied ? '#999' : themeColors.primary,
                },
              ]}
              activeOpacity={0.8}
              onPress={onPress}
              disabled={isClosed || isApplied}
            >
              <Text style={styles.applyText}>
                {isClosed ? 'Closed' : isApplied ? 'Applied' : 'View Details'}
              </Text>
            </TouchableOpacity>
          )}

          {/* 🔥 If MY post → show Publish / Close */}
          {isOwnPost && (
            <TouchableOpacity
              style={styles.applyBtn}
              activeOpacity={0.8}
              onPress={handleStatusChange}
            >
              <Text style={styles.applyText}>
                {Statuss === 'draft'
                  ? 'Publish'
                  : Statuss === 'published'
                  ? 'Close Application'
                  : 'Publish'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default OpportunityCard;

const styles = StyleSheet.create({
  wrapper: {
    padding: 2,
    borderRadius: 20,
    marginBottom: 6,
  },

  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },

  banner: {
    width: '100%',
    height: 120,
    marginTop: 10,
  },

  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },

  companyName: {
    fontSize: 14,
    fontFamily: Fonts.Bold,
  },

  timeText: {
    fontSize: 11,
    marginTop: 2,
  },

  saveBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },

  saveText: {
    fontSize: 12,
    fontFamily: Fonts.SemiBold,
  },

  title: {
    fontSize: 21,
    fontFamily: Fonts.Bold,
    marginTop: 12,
  },

  desc: {
    fontFamily: Fonts.Regular,
    fontSize: 12,
    marginTop: 6,
  },

  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },

  tag: {
    // backgroundColor: '#eaeaea',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  tagText: {
    fontSize: 11,
    fontFamily: Fonts.SemiBold,
    // color: '#333',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    borderTopWidth: 0.5,
    paddingTop: 12,
  },

  salary: {
    fontSize: 14,
    fontFamily: Fonts.Bold,
  },

  location: {
    fontSize: 12,
    marginTop: 2,
  },

  applyBtn: {
    backgroundColor: themeColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
  },

  applyText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: Fonts.Bold,
  },
});
