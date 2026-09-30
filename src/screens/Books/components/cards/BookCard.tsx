import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';

import { themeColors } from '../../../../theme/colors';
import { Fonts } from '../../../../constants/Fonts';

import BookMark from '../../../../assets/SVG/BookMark';
import Star from '../../../../assets/SVG/Star';
import Like from '../../../../assets/SVG/Like';
import EyeTwo from '../../../../assets/SVG/EyeTwo';

import {
  useEmojiReaction,
  ReactionType,
} from '../../../../hooks/useEmojiReaction';
import { formatCount } from '../../../../utils/date';
import {
  responsiveFont,
  responsiveHeight,
  responsiveWidth,
} from '../../../../utils/responsive';
import Heart from '../../../../assets/SVG/Heart';

type Props = {
  image: string;
  width?: number;
  height: number;
  ribbonText: string;
  onPress?: () => void;
  bookmarked?: boolean;
  onBookmark?: () => void;
  likes?: number | any;
  rating?: string;
  title?: string;
  author?: string;
  views?: number | any;

  handleLike?: (reaction?: ReactionType) => void;

  isLiked?: any;
  marginRight?: number;

  emoji_type?: ReactionType;

  reactionPopupVisible?: boolean;
  onOpenReaction?: () => void;
  onCloseReaction?: () => void;
};

const BookCard = ({
  image,
  width,
  height,
  ribbonText,
  onPress,
  bookmarked = false,
  onBookmark,
  likes,
  rating,
  title,
  author,
  views,
  handleLike,
  isLiked,
  marginRight,
  emoji_type,

  reactionPopupVisible = false,
  onOpenReaction,
  onCloseReaction,
}: Props) => {
  const formattedRating = rating ? `${Number(rating).toFixed(1)}` : '0/5';

  const [imageError, setImageError] = useState(false);
  const showReactions = reactionPopupVisible;


  const {
    reactions,
    showReactions: _,
    submitReaction,
    handleLongPress: hookHandleLongPress,
    closeReactions: hookCloseReactions,
  } = useEmojiReaction({
    onSubmit: async reaction => {
      handleLike?.(reaction);
    },
  });

  const handleLongPress = () => {
    if (!showReactions) {
      onOpenReaction?.();
    }
  };

  const closeReactions = () => {
    onCloseReaction?.();
  };

  const handleReactionSubmit = (reaction: ReactionType) => {
    submitReaction(reaction);
    closeReactions();
  };



  return (
    <View style={{ position: 'relative' }}>
      <TouchableOpacity
        style={[styles.card, { height, width, marginRight }]}
        activeOpacity={0.9}
        onPress={() => {
          // Close reactions if open when pressing outside
          if (showReactions) {
            closeReactions();
          }
          onPress?.();
        }}
      >
        {/* IMAGE */}
        <View style={styles.imageWrapper}>
          <FastImage
            source={
              imageError || !image
                ? require('../../../../assets/images/book-1.png')
                : { uri: image, priority: FastImage.priority.high }
            }
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        </View>

        {/* GRADIENT */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />

        {/* BOOKMARK */}
        <TouchableOpacity style={styles.heart} onPress={onBookmark}>
          {bookmarked ? (
            <BookMark
              width={responsiveWidth(4.5)}
              height={responsiveWidth(4.5)}
              color={themeColors.primary}
              bookmarked
            />
          ) : (
            <BookMark width={18} height={18} color="#fff" />
          )}
        </TouchableOpacity>

        {/* BADGE */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{ribbonText}</Text>
        </View>

        {/* REACTION PICKER */}
        {showReactions && (
          <>
            <Pressable
              style={StyleSheet.absoluteFillObject}
              onPress={closeReactions}
            />
            <View style={styles.reactionContainer}>
              {reactions.map(item => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={() => handleReactionSubmit(item.id as ReactionType)}
                >
                  <FastImage
                    source={item.active}
                    style={styles.reactionIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* BOTTOM */}
        <View style={styles.bottomContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>

          <Text style={styles.author} numberOfLines={1}>
            By {author}
          </Text>

          <View style={styles.likeBadge}>
            {/* LIKE */}
            <TouchableOpacity
              onPress={() => {
                if (!showReactions) {
                  handleLike?.();
                }
              }}
              onLongPress={handleLongPress}
              delayLongPress={200}
              activeOpacity={0.8}
              style={styles.row}
            >
              {isLiked ? (
                <FastImage
                  source={
                    emoji_type === 'Love'
                      ? require('../../../../assets/Likes/heart_eyes.png')
                      : emoji_type === 'Claps'
                        ? require('../../../../assets/Likes/clap.png')
                        : emoji_type === 'Laugh'
                          ? require('../../../../assets/Likes/joy.png')
                          : emoji_type === 'Joy'
                            ? require('../../../../assets/Likes/partying_face.png')
                            : require('../../../../assets/Likes/heart.png')
                  }
                  style={{
                    width: responsiveWidth(4.5),
                    height: responsiveWidth(4.5),
                  }}
                  resizeMode="contain"
                />
              ) : (
                <Heart size={responsiveWidth(4)} color={themeColors.white} />
              )}

              <Text style={styles.likeText}>{formatCount(likes)}</Text>
            </TouchableOpacity>

            {/* VIEWS */}
            <View style={styles.row}>
              <EyeTwo size={responsiveWidth(4.2)} color={themeColors.white} />

              <Text style={styles.likeText}>{formatCount(views)}</Text>
            </View>

            {/* RATING */}
            <View style={styles.row}>
              <Star
                size={responsiveWidth(3.5)}
                color={themeColors.white}
                rating={rating ? Number(rating) : 0}
              />

              <Text style={styles.likeText}>{formattedRating}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default BookCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: responsiveWidth(4),
    backgroundColor: themeColors.card2,
    overflow: 'hidden',
    position: 'relative',
  },

  imageWrapper: {
    padding: responsiveWidth(0.8),
    height: '100%',
    borderRadius: responsiveWidth(4),
  },

  image: {
    width: '100%',
    height: '100%',
    borderRadius: responsiveWidth(4),
  },

  gradient: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '45%',
  },

  heart: {
    position: 'absolute',
    top: responsiveHeight(1.2),
    right: responsiveWidth(2.5),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: responsiveWidth(1.6),
    borderRadius: responsiveWidth(6),
  },

  badge: {
    position: 'absolute',
    top: responsiveHeight(1.2),
    left: responsiveWidth(2.5),
    backgroundColor: themeColors.primary,
    paddingHorizontal: responsiveWidth(2.2),
    paddingVertical: responsiveHeight(0.35),
    borderRadius: responsiveWidth(1.8),
  },

  badgeText: {
    color: '#000',
    fontSize: responsiveFont(8),
    fontFamily: Fonts.SemiBold,
  },

  bottomContainer: {
    position: 'absolute',
    bottom: responsiveHeight(1),
    left: responsiveWidth(3),
    right: responsiveWidth(3),
  },

  title: {
    color: '#fff',
    fontSize: responsiveFont(14),
    fontFamily: Fonts.Bold,
  },

  author: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: responsiveFont(10),
    marginTop: responsiveHeight(0.2),
    fontFamily: Fonts.Regular,
  },

  likeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    backgroundColor: 'rgba(0,0,0,0.72)',

    paddingHorizontal: responsiveWidth(2.5),
    paddingVertical: responsiveHeight(0.7),

    borderRadius: responsiveWidth(3),

    marginTop: responsiveHeight(0.8),
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  likeText: {
    color: '#fff',
    fontSize: responsiveFont(10),
    marginLeft: responsiveWidth(1),
    fontFamily: Fonts.Medium,
  },

  reactionContainer: {
    position: 'absolute',
    bottom: responsiveHeight(5),
    left: responsiveWidth(3),

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#111',

    paddingHorizontal: responsiveWidth(3.2),
    paddingVertical: responsiveHeight(0.8),

    borderRadius: responsiveWidth(10),

    gap: responsiveWidth(2.5),

    zIndex: 999,

    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 10,
  },

  reactionIcon: {
    width: responsiveWidth(5),
    height: responsiveWidth(5),
  },
});
