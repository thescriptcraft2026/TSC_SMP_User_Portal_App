import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import BookMark from '../../../assets/SVG/BookMark';
import Play from '../../../assets/SVG/Play';
import { Fonts } from '../../../constants/Fonts';
import { themeColors } from '../../../theme/colors';
import Star from '../../../assets/SVG/Star';
import { Dimensions } from 'react-native';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const isSmall = SCREEN_WIDTH < 360;
const isMedium = SCREEN_WIDTH >= 360 && SCREEN_WIDTH < 400;
const isLarge = SCREEN_WIDTH >= 400;

interface CardOneProps {
  image: string;
  width?: number; // ✅ ADD THIS
  height?: number;
  title: string;
  onPress?: () => void;
  style?: any;
  bookmarked?: boolean;
  onBookmark?: () => void;
  rating?: any;
  type?: any;
}

const MovieCard = ({
  image,
  width,
  height,
  title,
  onPress,
  style,
  type,
  bookmarked = false,
  onBookmark,
  rating,
}: CardOneProps) => {
  const isDark = useColorScheme();
  const iconBg = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.6)';
  const formattedRating = rating ? `${Number(rating).toFixed(1)}` : '0/5';
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const imageSource =
    imageError || !image
      ? require('../../../assets/images/fallback.png')
      : {
          uri: image,
          priority: FastImage.priority.high,
        };
  const showLoader = imageLoading && !imageError && !!image;
  return (
    <View style={{ position: 'relative' }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={[styles.card, { width, height }, style]}
      >
        {/* 🎬 IMAGE */}
        <View style={styles.imageWrapper}>
          <FastImage
            style={styles.image}
            source={imageSource}
            resizeMode={FastImage.resizeMode.cover}
            onLoadStart={() => {
              setImageLoading(true);
            }}
            fallback={Platform.OS === 'android'}
            onLoad={() => {
              // console.log('Loaded');
            }}
            onLoadEnd={() => {
              setImageLoading(false);
            }}
            onError={() => {
              console.log('Error');
              setImageError(true);
              setImageLoading(false);
            }}
          />
          {showLoader && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="small" color={themeColors.primary} />
            </View>
          )}
        </View>
        {/* BADGE */}
        {type && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{type}</Text>
          </View>
        )}

        {/* 🌑 GRADIENT OVERLAY */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={styles.bottomOverlay}
        >
          {/* 🎬 TITLE */}
          <View style={styles.info}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: iconBg,
                paddingHorizontal: SCREEN_WIDTH * 0.02,
                paddingVertical: 2,
                borderRadius: 12,
                alignSelf: 'flex-start',
              }}
            >
              <Star size={10} color={themeColors.white} rating={rating ? Number(rating) : 0}/>
              <Text style={styles.likeText}>{formattedRating}</Text>
            </View>
            <Text numberOfLines={1} style={styles.titleTxt}>
              {title}
            </Text>
          </View>

          {/* 👉 RIGHT ACTIONS */}
          <View style={styles.actions}>
            {/* ▶️ RATE BUTTON */}
            <TouchableOpacity
              onPress={onPress}
              style={[styles.rateBtn, { backgroundColor: themeColors.primary }]}
              activeOpacity={0.8}
            >
              {/* <Play size={14} color={themeColors.white} /> */}
              <Text style={styles.rateTxt}>Rate & Review</Text>
            </TouchableOpacity>

            {/* ❤️ BOOKMARK */}
            <TouchableOpacity onPress={onBookmark} activeOpacity={0.8}>
              <View style={[styles.saveInner, { backgroundColor: iconBg }]}>
                {bookmarked ? (
                  <BookMark
                    width={isSmall ? 16 : 20}
                    height={isSmall ? 16 : 20}
                    color={bookmarked ? themeColors.primary : themeColors.white}
                    bookmarked={bookmarked}
                  />
                ) : (
                  <BookMark
                    width={isSmall ? 16 : 20}
                    height={isSmall ? 16 : 20}
                    color={themeColors.white}
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default MovieCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    backgroundColor: themeColors.card2,
    overflow: 'hidden',
    position: 'relative',

    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 4,
  },

  imageWrapper: {
    height: '100%',
    borderRadius: 15,
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },

  info: {
    flex: 1,
    marginRight: 10,
    paddingHorizontal: 10,
  },

  titleTxt: {
    fontFamily: Fonts.Bold,
    fontSize: isSmall ? 14 : isMedium ? 15 : 16,
    color: '#fff',
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    paddingVertical: SCREEN_WIDTH * 0.018,
  },

  rateBtn: {
    flex: 1,
    marginRight: SCREEN_WIDTH * 0.03,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SCREEN_WIDTH * 0.018,
    borderRadius: 30,
  },

  rateTxt: {
    color: '#fff',
    fontSize: isSmall ? 10 : isMedium ? 11 : 12,
    fontFamily: Fonts.Medium,
  },

  saveInner: {
    width: SCREEN_WIDTH * 0.09,
    height: SCREEN_WIDTH * 0.09,
    borderRadius: SCREEN_WIDTH * 0.045,
    justifyContent: 'center',
    alignItems: 'center',
  },

  likeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    zIndex: 10,
    borderRadius: 10,
  },

  likeText: {
    color: '#fff',
    fontSize: 10,
    marginLeft: 4,
    fontFamily: Fonts.Medium,
  },

  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: themeColors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  badgeText: {
    fontSize: 8,
    fontFamily: Fonts.Medium,
    textTransform: 'capitalize',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});
