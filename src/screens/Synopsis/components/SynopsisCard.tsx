import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { themeColors } from '../../../theme/colors';
import BookMark from '../../../assets/SVG/BookMark';
import Like from '../../../assets/SVG/Like';
import Star from '../../../assets/SVG/Star';
import { Fonts } from '../../../constants/Fonts';
import LinearGradient from 'react-native-linear-gradient';
import EyeTwo from '../../../assets/SVG/EyeTwo';
import {
  ReactionType,
  useEmojiReaction,
} from '../../../hooks/useEmojiReaction';
import GenreBadge from '../../../components/Badges/GenreBadge';
import { formatCount, formatDate, formatTime } from '../../../utils/date';
import { getDisplayTime } from '../../../utils/timeAgo';
import Heart from '../../../assets/SVG/Heart';

type Props = {
  image: string;
  width?: number; // ✅ ADD THIS
  height: number;
  ribbonText: string;
  onPress?: () => void;
  bookmarked?: boolean;
  onBookmark?: () => void;
  likes?: number | any;
  rating?: string;
  title?: string;
  author?: string;
  description?: string;
  views?: number | any;
  handleLike?: (reaction?: ReactionType) => void;
  isLiked?: any;
  marginRight?: number;

  createdAt?: any;

  emoji_type?: ReactionType;
  reactionPopupVisible?: boolean;
  onOpenReaction?: () => void;
  onCloseReaction?: () => void;
};

const SynopsisCard = ({
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
  marginRight,
  isLiked,
  emoji_type,
  description,
  reactionPopupVisible = false,
  onOpenReaction,
  onCloseReaction,
  createdAt
}: Props) => {
  const formattedRating = rating ? `${Number(rating).toFixed(1)}` : '0/5';
  const isDark = useColorScheme() === 'dark';
  const [imageLoaded, setImageLoaded] = useState(false);
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


  const showLoader = !!image && !imageLoaded && !imageError;
  return (
    <Pressable
      style={{ flex: 1 }}
      onPress={() => {
        if (showReactions) {
          closeReactions();
        }
      }}
    >
      <TouchableOpacity
        style={[styles.card, { width, marginRight }]}
        activeOpacity={0.9}
        onPress={onPress}
      >
        <View style={styles.contentRow}>
          {/* Book Image */}
          <View style={styles.imageWrapper}>
            {/* Always show fallback first */}
            <FastImage
              source={require('../../../assets/images/book-1.png')}
              style={styles.image}
              resizeMode={FastImage.resizeMode.cover}
            />

            {/* Network image overlays fallback */}
            {!imageError && image ? (
              <FastImage
                source={{
                  uri: image,
                  priority: FastImage.priority.high,
                }}
                style={[
                  styles.image,
                  {
                    position: 'absolute',
                    opacity: imageLoaded ? 1 : 0,
                  },
                ]}
                resizeMode={FastImage.resizeMode.cover}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            ) : null}

            {showLoader && (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="small" color={themeColors.primary} />
              </View>
            )}
          </View>
          <View style={styles.bottomContainer}>
            <GenreBadge label={ribbonText} size="xs" />
            <View>
              <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
                {title}
              </Text>
              <View style={styles.metaRow}>
                <Text
                  style={styles.author}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  By {author}
                </Text>
                <Text style={styles.dot}> • </Text>
                <Text style={styles.dateText} numberOfLines={1}>
                  {getDisplayTime(createdAt)}
                </Text>
              </View>
            </View>

            <Text
              numberOfLines={2}
              style={{
                color: 'rgba(255,255,255,0.55)',
                fontSize: 13,
              }}
            >
              {description}
            </Text>
          </View>
        </View>
        {/* REACTION PICKER */}
        {showReactions && (
          <Pressable
            style={styles.reactionContainer}
            onPress={e => e.stopPropagation()}
          >
            {reactions.map(item => (
              <TouchableOpacity
                key={item?.id}
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
          </Pressable>
        )}
        <View
          style={{
            height: 1,
            backgroundColor: 'rgba(255,255,255,0.08)',
            marginTop: 14,
            marginBottom: 12,
          }}
        />
        <View style={styles.likeBadge}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 22,
            }}
          >
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
                      ? require('../../../assets/Likes/heart_eyes.png')
                      : emoji_type === 'Claps'
                        ? require('../../../assets/Likes/clap.png')
                        : emoji_type === 'Laugh'
                          ? require('../../../assets/Likes/joy.png')
                          : emoji_type === 'Joy'
                            ? require('../../../assets/Likes/partying_face.png')
                            : require('../../../assets/Likes/heart.png')
                  }
                  style={{
                    width: 16,
                    height: 16,
                  }}
                  resizeMode="contain"
                />
              ) : (
                <Heart size={18} color={themeColors.white} />
              )}
              <Text style={styles.likeText}>{formatCount(likes)}</Text>
            </TouchableOpacity>
            <View style={styles.row}>
              <EyeTwo size={22} color={themeColors.white} />
              <Text style={styles.likeText}>{formatCount(views)}</Text>
            </View>

            <View style={styles.row}>
              <Star size={16} color={themeColors.white} rating={rating ? Number(rating) : 0}/>
              <Text style={styles.likeText}>{formattedRating}</Text>
            </View>
          </View>
          {/* Heart */}
          <TouchableOpacity style={styles.heart} onPress={onBookmark}>
            {bookmarked ? (
              <BookMark
                width={20}
                height={20}
                color={themeColors.primary}
                bookmarked
              />
            ) : (
              <BookMark width={20} height={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Pressable>
  );
};

export default React.memo(SynopsisCard);

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    backgroundColor: '#0F0F1A',
    overflow: 'hidden',
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 10
  },

  imageWrapper: {
    width: 100,
    height: 120,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 14,
  },

  image: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },

  heart: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  likeBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  likeText: {
    color: '#fff',
    fontSize: 11,
    marginLeft: 4,
    fontFamily: Fonts.Medium,
  },

  gradient: {
    display: 'none',
  },

  bottomContainer: {
    flex: 1,
    height: 120,
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: {
    color: themeColors.white,
    fontSize: 18,
    fontFamily: Fonts.Bold,
  },

    metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%', // constrains the row so children have something to shrink against
  },

  author: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontFamily: Fonts.Regular,
    flexShrink: 1, // <-- lets long author names truncate instead of pushing content off-screen
  },

  dot: {
    color: '#7f7f7fff',
    flexShrink: 0, // never shrink the separator
  },

  dateText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontFamily: Fonts.Regular,
    flexShrink: 0, // keep the date fully visible, priority over author
  },


  reactionContainer: {
    position: 'absolute',
    bottom: 35,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 40,
    gap: 10,
    zIndex: 999,
  },

  reactionIcon: {
    width: 20,
    height: 20,
  },

  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
});
