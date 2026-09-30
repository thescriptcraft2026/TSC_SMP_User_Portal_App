import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

import FastImage from 'react-native-fast-image';

import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import Share from '../../assets/SVG/Share';
import Calendar from '../../assets/SVG/Calendar';
import Clock from '../../assets/SVG/Clock';
import BookMark from '../../assets/SVG/BookMark';
import { formatCount } from '../../utils/date';
import UserThree from '../../assets/SVG/UserThree';
import FallbackImage from '../../assets/images/fallback.png';

type Props = {
  title: string;
  image: string;
  startDate: string;
  endDate: string;
  participants: any;
  avatars?: string[] | any;
  status?: 'ongoing' | 'upcoming' | 'completed';
  onPress?: () => void;
  onParticipate?: () => void;
  onShare?: () => void;
  onBookMark?: () => void;
  bookmarked?: boolean;
  daysLeft?: string;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HORIZONTAL_MARGIN = Math.max(10, SCREEN_WIDTH * 0.02);

const ContestCard = ({
  title,
  image,
  startDate,
  endDate,
  participants,
  avatars = [],
  onPress,
  onParticipate,
  onShare,
  status,
  onBookMark,
  bookmarked,
  daysLeft
}: Props) => {
  const isDark = true;

  const scale = useRef(new Animated.Value(1)).current;
  const ripple = useRef(new Animated.Value(0)).current;
  const extraCount = avatars.length - 3;

  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // 🎨 Dynamic Colors
  const bgColor = themeColors.card;
  const textPrimary = isDark ? themeColors.white : themeColors.black;
  const textSecondary = isDark ? themeColors.white : themeColors.black;
  const pillBg = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,1)';
  const pillText = isDark ? '#000' : '#000';

  const iconBg = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.6)';

  // 🔥 Press animation
  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  // 🔴 Ripple animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(ripple, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const getBadgeConfig = () => {
    switch (status) {
      case 'ongoing':
        return {
          bg: '#22C55E',
          text: 'Ongoing',
        };

      case 'upcoming':
        return {
          bg: '#3B82F6',
          text: 'Upcoming',
        };

      case 'completed':
        return {
          bg: '#FF4D4F',
          text: 'Completed',
        };

      default:
        return {
          bg: '#999',
          text: '',
        };
    }
  };

  const badgeConfig = getBadgeConfig();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.container, { backgroundColor: bgColor }]}
    >
      {/* IMAGE */}
      <View style={{ padding: 3.5 }}>
        <FastImage
          source={
            imageError
              ? FallbackImage
              : {
                uri: image,
                priority: FastImage.priority.high,
              }
          }
          style={styles.image}
          resizeMode={FastImage.resizeMode.cover}
          onLoadStart={() => {
            setImageLoading(true);
            setImageError(false);
          }}
          onLoad={() => {
            setImageLoading(false);
          }}
          onError={() => {
            setImageLoading(false);
            setImageError(true);
          }}
        />

        {imageLoading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color={themeColors.primary} />
          </View>
        )}
      </View>

      {/* PARTICIPANTS */}
      {participants > 0 && (
        <View
          style={[
            styles.overlayRow,
            {
              backgroundColor: pillBg,
            },
          ]}
        >
          <UserThree size={15} />

          <Text
            style={[styles.overlayParticipants, { color: pillText }]}
            numberOfLines={1}
          >
            {formatCount(participants)} participated
          </Text>
        </View>
      )}

      {/* OVERLAY CONTENT */}
      <View style={styles.overlayContent}>
        {/* TITLE */}
        <Text
          style={[styles.overlayTitle, { color: textPrimary }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>

        {/* DATE */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 3,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Calendar
              size={18}
              color={isDark ? themeColors.white : themeColors.gray}
            />
            <Text style={[styles.meta, { color: textSecondary }]}>
              {startDate}
            </Text>
          </View>
          {status !== 'completed' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Clock
                size={18}
                color={isDark ? themeColors.white : themeColors.gray}
              />
              <Text style={[styles.meta, { color: textSecondary }]}>
                {endDate}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* LIVE BADGE */}
      <View style={[styles.badge, { backgroundColor: badgeConfig.bg }]}>
        <View style={styles.liveRow}>
          <Text style={styles.badgeText}>{badgeConfig.text}</Text>
        </View>
      </View>

      {/* ACTION BUTTONS */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.actionBtn}
          onPress={onBookMark}
        >
          {bookmarked ? (
            <BookMark
              width={20}
              height={20}
              color={themeColors.primary}
              bookmarked
            />
          ) : (
            <BookMark
              width={20}
              height={20}
              color="#FFFFFF"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.actionBtn}
          onPress={onShare}
        >
          <Share
            size={20}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(ContestCard);

const styles = StyleSheet.create({
  container: {
    borderRadius: 22,
    overflow: 'hidden',
    marginHorizontal: HORIZONTAL_MARGIN,
    marginBottom: 6,
    height: 220,

    // iOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 8,

    // Android
    elevation: 1,
  },

  image: {
    width: '100%',
    height: 140,
    borderRadius: 22,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },

  overlayContent: {
    paddingHorizontal: 15,
    marginTop: 10,
  },

  overlayTitle: {
    fontSize: 20,
    fontFamily: Fonts.Bold,
  },

  overlayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,

    alignSelf: 'flex-start',
    position: 'absolute',
    bottom: 60,
    left: 10,

    // iOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },

    // Android shadow
    elevation: 0,
  },

  overlayParticipants: {
    fontSize: 10,
    marginLeft: 8,
    fontFamily: Fonts.Medium,
  },

  avatarStack: {
    flexDirection: 'row',
  },

  avatar: {
    width: 20,
    height: 15,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#fff',
  },

  badge: {
    position: 'absolute',
    top: 15,
    left: 14,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 30,
    elevation: 6,
  },

  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontFamily: Fonts.SemiBold,
  },

  meta: {
    fontSize: 12,
    fontFamily: Fonts.Medium,
  },

  actionRow: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 20,
    elevation: 20,
    alignItems: 'center',
  },

  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 7,

    zIndex: 20,
    elevation: 20,
  },

  shareBtn: {
    padding: 6,
    borderRadius: 20,
    marginBottom: 6,
  },

  extraAvatar: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -10,
  },

  extraText: {
    fontSize: 9,
    fontFamily: Fonts.SemiBold,
    color: '#333',
  },

  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 22,
  },
});
