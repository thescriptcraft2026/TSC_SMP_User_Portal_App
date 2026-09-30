import React, { useRef, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  useColorScheme,
} from 'react-native';

import FastImage from 'react-native-fast-image';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import ArrowUpRight from '../../../assets/SVG/ArrowUpRight';
import { themeColors } from '../../../theme/colors';
import { Fonts } from '../../../constants/Fonts';
import GenreBadge from '../../../components/Badges/GenreBadge';
import BookMark from '../../../assets/SVG/BookMark';
import User from '../../../assets/SVG/User';
import { formatCount } from '../../../utils/date';

type Props = {
  url: string;
  title: string;
  subtitle: string;
  view?: any;
  type: string;
  bookmarked?: boolean;
  onSaved?: () => void;
  onPress?: () => void;
  user?: any;
};

const SubmissionCard = ({
  url,
  title,
  subtitle,
  type,
  bookmarked,
  onSaved,
  onPress,
  view,
  user,
}: Props) => {
  const scale = useRef(new Animated.Value(1)).current;
  const likeScale = useRef(new Animated.Value(1)).current;
  const isDark = true;
  const [imageError, setImageError] = useState(false);

  /* ---------------- THEME ---------------- */
  const colors = useMemo(() => {
    return {
      textPrimary: '#FFFFFF',
      textSecondary: '#BBBBBB',

      glassBg: isDark ? 'rgba(20,20,20,0.65)' : 'rgba(255,255,255,0.80)',

      ratingBg: isDark ? 'rgba(255,255,255,0.1)' : '#FFFFFF',

      ratingText: isDark ? '#FFF' : '#111',

      bookmarkBg: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)',
    };
  }, [isDark]);

  /* ---------------- ANIMATION ---------------- */
  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  const handleSaved = () => {
    Animated.sequence([
      Animated.timing(likeScale, {
        toValue: 1.3,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(likeScale, { toValue: 1, useNativeDriver: true }),
    ]).start();

    onSaved?.(); // 🔥 let parent handle state
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale }],
          backgroundColor: isDark ? '#0f0f10' : themeColors.white,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.card}>
          {/* IMAGE */}
          <FastImage
            source={
              imageError || !url
                ? require('../../../assets/images/fallback.png')
                : { uri: url }
            }
            style={styles.image}
            resizeMode={FastImage.resizeMode.cover}
            onError={() => setImageError(true)}
            defaultSource={require('../../../assets/images/fallback.png')}
          />

          {/* GRADIENT (IMPORTANT FOR DARK MODE READABILITY) */}
          <LinearGradient
            colors={
              isDark
                ? ['transparent', 'rgba(0,0,0,0.7)']
                : ['transparent', 'rgba(0,0,0,0.4)']
            }
            style={styles.gradient}
          />

          {/* CONTENT */}
          <View style={[styles.content, { backgroundColor: colors.glassBg }]}>
            {/* LEFT TEXT */}
            <View style={{ flex: 1, marginRight: 10 }}>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
              >
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                >
                  <User
                    size={14}
                    color={isDark ? themeColors.gray : themeColors.gray}
                  />
                  <Text style={[{ color: colors.textPrimary }]}>{user}</Text>
                </View>
                {/* RATING */}
                <View
                  style={[
                    styles.ratingBox,
                    { backgroundColor: colors.ratingBg },
                  ]}
                >
                  <Ionicons name="eye" size={12} color="#FFD700" />
                  <Text
                    style={[styles.ratingText, { color: colors.ratingText }]}
                  >
                    {formatCount(view)}
                  </Text>
                </View>
              </View>
              <Text
                style={[styles.title, { color: colors.textPrimary }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {title}
              </Text>

              <Text
                style={[styles.subtitle, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            </View>

            <View
              style={[
                styles.arrowContainer,
                { borderColor: isDark ? themeColors.white : themeColors.black },
              ]}
            >
              <ArrowUpRight
                size={22}
                color={isDark ? themeColors.white : themeColors.black}
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default SubmissionCard;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    padding: 3,
    borderRadius: 20,
    // iOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 8,

    // Android
    elevation: 1,
  },

  card: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    // iOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 8,

    // Android
    elevation: 1,
  },

  image: {
    ...StyleSheet.absoluteFillObject,
  },

  gradient: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '65%',
  },

  bookmark: {
    position: 'absolute',
    top: 0,
    right: 15,
    padding: 3,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },

  content: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },

  title: {
    fontSize: 24,
    fontFamily: Fonts.Bold,
    lineHeight: 26,
    letterSpacing: 0.3,
    marginTop: 4,
  },

  subtitle: {
    fontSize: 12,
    fontFamily: Fonts.SemiBold,
  },

  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 1,
    borderRadius: 10,
    maxWidth: 60,
    marginBottom: 4,
  },

  ratingText: {
    marginLeft: 4,
    fontSize: 11,
    fontFamily: Fonts.Bold,
  },

  arrowContainer: {
    borderWidth: 1,
    borderRadius: 100,
    padding: 4,
  },
});
