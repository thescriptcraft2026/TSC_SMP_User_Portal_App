import React, { useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  useColorScheme,
  Platform,
} from 'react-native';

import FastImage from 'react-native-fast-image';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { themeColors } from '../../../../theme/colors';
import YoutubePlayer from 'react-native-youtube-iframe';
import { WebView } from 'react-native-webview';

// ─── Inline SVG-less Bookmark (no custom SVG needed) ─────────────────────────
const BookmarkIcon = ({
  filled,
  color,
  size = 18,
}: {
  filled?: boolean;
  color: string;
  size?: number;
}) => (
  <Ionicons
    name={filled ? 'bookmark' : 'bookmark-outline'}
    size={size}
    color={color}
  />
);

// ─── Types ────────────────────────────────────────────────────────────────────
type Props = {
  url: string;
  title: string;
  subtitle: string;
  rating?: string | number;
  type?: 'youtube' | 'instagram' | string;
  link?: string;
  bookmarked?: boolean;
  onSaved?: () => void;
  onPress?: () => void;
  isActive?: boolean;
};

// ─── Component ────────────────────────────────────────────────────────────────
const VisionXCard = ({
  url,
  title,
  subtitle,
  rating = '4.5',
  type = 'youtube',
  link,
  isActive = false,
  bookmarked = false,
  onSaved,
  onPress,
}: Props) => {
  const scale = useRef(new Animated.Value(1)).current;
  const bookmarkScale = useRef(new Animated.Value(1)).current;
  const isDark = useColorScheme() === 'dark';

  const cardHeight = type === 'instagram' ? 520 : 210;

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const t = useMemo(
    () => ({
      card: isDark ? '#111214' : '#FFFFFF',
      surface: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
      surfaceBorder: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)',
      textPrimary: '#FFFFFF',
      textMuted: 'rgba(255,255,255,0.70)',
      accent: themeColors.primary as string, // #EB9D08
      ratingBg: 'rgba(235,157,8,0.18)',
      bookmarkFill: themeColors.primary as string,
      bookmarkEmpty: '#FFFFFF',
      bookmarkContainer: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.20)',
      shadow: isDark ? '#000' : '#00000030',
    }),
    [isDark],
  );

  // ── Press animation ───────────────────────────────────────────────────────
  const onPressIn = () =>
    Animated.spring(scale, {
      toValue: 0.965,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();

  const onPressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();

  // ── Bookmark animation ────────────────────────────────────────────────────
  const handleSaved = () => {
    Animated.sequence([
      Animated.spring(bookmarkScale, {
        toValue: 1.35,
        useNativeDriver: true,
        speed: 50,
        bounciness: 8,
      }),
      Animated.spring(bookmarkScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 6,
      }),
    ]).start();
    onSaved?.();
  };

  const isReel = type === 'reel';
  const ratingNum = Number(rating).toFixed(1);

  const getYoutubeId = (url: string) => {
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?v=))([^#&?]*).*/;

    const match = url?.match(regExp);

    return match && match[7].length === 11 ? match[7] : null;
  };

  const youtubeId = getYoutubeId(link || '');

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.card,
          { height: cardHeight },
          {
            // Cross-platform shadow
            ...Platform.select({
              ios: {
                shadowColor: t.shadow,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.28,
                shadowRadius: 16,
              },
              android: { elevation: 10 },
            }),
          },
        ]}
      >
        {/* ── Background image ── */}
        {/* YOUTUBE */}
        {type === 'youtube' && youtubeId ? (
          <YoutubePlayer
            height={210}
            play={isActive}
            videoId={youtubeId}
            mute={false}
            webViewStyle={{
              opacity: 0.99,
            }}
          />
        ) : type === 'instagram' && link ? (
          /* INSTAGRAM */
          <WebView
            source={{ uri: link }}
            style={styles.webview}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            scrollEnabled={false}
          />
        ) : (
          <FastImage
            source={{ uri: url }}
            style={StyleSheet.absoluteFillObject}
            resizeMode={FastImage.resizeMode.cover}
          />
        )}

        {/* ── Gradient vignette ── */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.72)']}
          locations={[0.3, 0.6, 1]}
          style={styles.gradient}
        />

        {/* ── Top row: type badge + bookmark ── */}
        <View style={styles.topRow}>
          {/* Type badge */}
          {/* <View
            style={[
              styles.typeBadge,
              isReel
                ? { backgroundColor: t.accent }
                : {
                    backgroundColor: 'rgba(0,0,0,0.50)',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.20)',
                  },
            ]}
          >
            {isReel && (
              <Ionicons
                name="play"
                size={9}
                color="#fff"
                style={{ marginRight: 3 }}
              />
            )}
            <Text style={[styles.typeBadgeText, isReel && { color: '#fff' }]}>
              {isReel ? 'Reel' : 'Post'}
            </Text>
          </View> */}

          {/* Bookmark */}
          <TouchableOpacity
            onPress={handleSaved}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[
              styles.bookmarkBtn,
              { backgroundColor: t.bookmarkContainer },
            ]}
          >
            <Animated.View style={{ transform: [{ scale: bookmarkScale }] }}>
              <BookmarkIcon
                filled={bookmarked}
                color={bookmarked ? t.bookmarkFill : t.bookmarkEmpty}
                size={17}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* ── Bottom info ── */}
        <View style={styles.info}>
          {/* Title */}
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Text>

          {/* Subtitle row */}
          <View style={styles.metaRow}>
            <Ionicons
              name="person-circle-outline"
              size={13}
              color="rgba(255,255,255,0.65)"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>

            {/* Spacer */}
            <View style={{ flex: 1 }} />

            {/* Rating pill */}
            <View style={[styles.ratingPill, { backgroundColor: t.ratingBg }]}>
              <Ionicons name="star" size={10} color={t.accent} />
              <Text style={[styles.ratingText, { color: t.accent }]}>
                {ratingNum}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default VisionXCard;

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_H = 210;
const RADIUS = 18;

const styles = StyleSheet.create({
  wrapper: {
    // marginHorizontal: 10,
    // marginVertical: 4,
  },

  card: {
    height: CARD_H,
    borderRadius: RADIUS,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },

  gradient: {
    ...StyleSheet.absoluteFillObject,
  },

  // ── Top row ──────────────────────────────────────────────────────────────
  topRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  typeBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  webview: {
    flex: 1,
    backgroundColor: 'black',
  },

  bookmarkBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    // Subtle border for glass feel
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },

  // ── Bottom info ───────────────────────────────────────────────────────────
  info: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 8,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.15,
    marginBottom: 5,
    // Cross-platform text shadow for readability
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  subtitle: {
    color: 'rgba(255,255,255,0.70)',
    fontSize: 12,
    fontWeight: '500',
    maxWidth: '55%',
  },

  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 3,
  },

  ratingText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
