import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Dimensions,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import FastImage from 'react-native-fast-image';
import { themeColors } from '../../../../theme/colors';
import Avatar from '../../../../components/Avatar/Avatar';
import { Fonts } from '../../../../constants/Fonts';
import Heart from '../../../../assets/SVG/Heart';
import EyeTwo from '../../../../assets/SVG/EyeTwo';
import Share from '../../../../assets/SVG/Share';
import BookMark from '../../../../assets/SVG/BookMark';
import {
  useEmojiReaction,
  ReactionType,
} from '../../../../hooks/useEmojiReaction';
import { getDisplayTime } from '../../../../utils/timeAgo';
import EmbeddedMedia from '../../../../components/Media/EmbeddedMedia';
import Star from '../../../../assets/SVG/Star';

type Props = {
  url: string;
  title: string;
  avatar?: string;
  name?: string;
  user_name?: string;
  likes?: any;
  views?: number | any;
  rating?: number;
  type?:
  | 'youtube'
  | 'instagram'
  | 'facebook'
  | 'vimeo'
  | 'google-drive'
  | 'google-docs'
  | 'x'
  | 'image'
  | string;
  link?: string;
  isActive?: boolean;
  isScrolling?: boolean;
  bookmarked?: boolean;
  liked?: boolean;
  onSaved?: () => void;
  onPress?: () => void;
  handleUser?: () => void;
  time?: any;
  onMenuPress?: (event: any) => void;
  onReactionSelect?: (
    reaction: ReactionType | undefined,
  ) => void;
  emoji_type?: ReactionType;
  style?: any;
  isReported?: boolean;
  reactionPopupVisible?: boolean;
  onOpenReaction?: () => void;
  onCloseReaction?: () => void;
  onShare?: () => void;
};

export type VisionCardHandle = {
  checkMediaVisibility: () => void;
};

const VisionCard = forwardRef<VisionCardHandle, Props>(
  (
    {
      url,
      title,
      avatar,
      name,
      user_name,
      likes,
      views,
      rating,
      type = 'image',
      link,
      isActive = false,
      isScrolling = false,
      bookmarked = false,
      liked = false,
      onSaved,
      onPress,
      handleUser,
      time,
      onMenuPress,
      onReactionSelect,
      emoji_type,
      style,
      isReported = false,
      reactionPopupVisible = false,
      onOpenReaction,
      onCloseReaction,
      onShare,
    },
    ref,
  ) => {
    const [expanded, setExpanded] = useState(false);
    const mediaRef = useRef<View>(null);
    const showReactions = reactionPopupVisible;

    const {
      reactions,
      showReactions: _,
      submitReaction,
      closeReactions: hookCloseReactions,
    } = useEmojiReaction({
      onSubmit: async reaction => {
        onReactionSelect?.(reaction);
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

    const handleReactionSubmit = (
      reaction: ReactionType,
    ) => {
      submitReaction(reaction);
      closeReactions();
    };

    useImperativeHandle(
      ref,
      () => ({
        checkMediaVisibility: () => {
          if (!mediaRef.current) {
            return;
          }

          mediaRef.current.measure(
            (
              x,
              y,
              width,
              height,
              pageX,
              pageY,
            ) => {
              if (!height) {
                return;
              }

              const windowHeight =
                Dimensions.get('window').height;

              const visibleTop = Math.max(pageY, 0);

              const visibleBottom = Math.min(
                pageY + height,
                windowHeight,
              );

              const visibleHeight = Math.max(
                visibleBottom - visibleTop,
                0,
              );

              const ratio =
                visibleHeight / height;

              // setMediaVisible(ratio >= 0.5);
            },
          );
        },
      }),
      [],
    );

    /**
     * ---------------------------------------------------------
     * TEXT
     * ---------------------------------------------------------
     */

    const MAX_LENGTH = 120;

    const isLong =
      title?.length > MAX_LENGTH;

    const displayText =
      !expanded && isLong
        ? title?.slice(0, MAX_LENGTH) + '...'
        : title;

    const formateRating = rating
      ? Number(rating).toFixed(1)
      : '0.0';

    /**
     * ---------------------------------------------------------
     * RENDER
     * ---------------------------------------------------------
     */


    const getHeight = () => {
      switch (type) {
        case 'youtube':
          return 240;

        case 'instagram':
          return 500;

        case 'facebook':
          return 500;

        case 'vimeo':
          return 300;

        case 'google-drive':
          return 450;

        case 'google-docs':
          return 420;

        case 'x':
          return 500;

        case 'image':
          return 450;

        default:
          return 300;
      }
    };

    const mediaHeight = getHeight();

    return (
      <Pressable
        onPress={() => {
          if (showReactions) {
            closeReactions();
          }
        }}
        style={[
          styles.container,
          {
            backgroundColor: '#111119',
            borderWidth: 1,
            borderColor: '#2A2F3A',
          },
          style,
        ]}
      >
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={handleUser}
          >
            <Avatar
              uri={avatar}
              name={name}
              size={35}
            />
          </TouchableOpacity>

          <View style={styles.userRow}>
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={handleUser}
            >
              <Text style={styles.userName}>
                {name}
              </Text>
              <View style={styles.nameRow}>
                {user_name && (
                  <>

                    <Text style={[styles.user_Name]}>@{user_name}</Text>
                    <Text style={{ color: "#7f7f7fff" }}>•</Text>
                  </>
                )}
                <Text style={styles.time}>
                  {getDisplayTime(time)}
                </Text>
              </View>
            </TouchableOpacity>

          </View>

          {!isReported && (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={e => {
                e?.stopPropagation?.();
                onMenuPress?.(e);
              }}
            >
              <Ionicons
                name="ellipsis-vertical"
                size={16}
                color={themeColors.secondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* ================================================= */}
        {/* MEDIA */}
        {/* ================================================= */}

        <View
          ref={mediaRef}
          collapsable={false}
          style={styles.imageContainer}
        >
          <EmbeddedMedia
            platform={type}
            link={link || url}
            image={url}
            height={mediaHeight}
            isVisible={isActive}
            isScrolling={isScrolling}
          />
        </View>

        {/* ================================================= */}
        {/* CAPTION */}
        {/* ================================================= */}

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            if (isLong) {
              setExpanded(prev => !prev);
            }

            onPress?.();
          }}
        >
          <View style={styles.captionCard}>
            <Text style={styles.caption}>
              {displayText}

              {isLong && !expanded && (
                <Text style={styles.moreText}>
                  {' '}
                  more
                </Text>
              )}

              {expanded && (
                <Text style={styles.moreText}>
                  {' '}
                  less
                </Text>
              )}
            </Text>
          </View>
        </TouchableOpacity>

        {/* ================================================= */}
        {/* ACTIONS */}
        {/* ================================================= */}

        <View
          style={{
            borderTopWidth: 0.4,
            borderColor: themeColors.neutral,
          }}
        >
          <View style={styles.floatingActions}>
            <View style={styles.leftActions}>
              {/* ================================================= */}
              {/* LIKE */}
              {/* ================================================= */}

              <View
                style={{
                  position: 'relative',
                }}
              >
                {showReactions && (
                  <>
                    <Pressable
                      style={StyleSheet.absoluteFillObject}
                      onPress={closeReactions}
                    />

                    <View
                      style={styles.reactionPopup}
                    >
                      {reactions.map(item => (
                        <TouchableOpacity
                          key={item.id}
                          activeOpacity={0.8}
                          onPress={() =>
                            handleReactionSubmit(
                              item.id as ReactionType,
                            )
                          }
                        >
                          <FastImage
                            source={item.active}
                            style={
                              styles.reactionImage
                            }
                            resizeMode="contain"
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                <TouchableOpacity
                  style={styles.iconRow}
                  // onPress={() => {
                  //   if (!showReactions) {
                  //     onReactionSelect?.(
                  //       undefined,
                  //     );
                  //   }
                  // }}
                  onPress={() => {
                    // If reaction popup is open, close it first
                    if (showReactions) {
                      closeReactions();
                    }

                    // Normal Like
                    onReactionSelect?.(undefined);
                  }}
                  onLongPress={handleLongPress}
                  delayLongPress={200}
                  activeOpacity={0.8}
                >
                  {liked ? (
                    <FastImage
                      source={
                        emoji_type === 'Love'
                          ? require('../../../../assets/Likes/heart_eyes.png')
                          : emoji_type === 'Claps'
                            ? require('../../../../assets/Likes/clap.png')
                            : emoji_type ===
                              'Laugh'
                              ? require('../../../../assets/Likes/joy.png')
                              : emoji_type ===
                                'Joy'
                                ? require('../../../../assets/Likes/partying_face.png')
                                : require('../../../../assets/Likes/heart.png')
                      }
                      style={{
                        width: 22,
                        height: 22,
                      }}
                      resizeMode="contain"
                    />
                  ) : (
                    <Heart
                      size={22}
                      color={themeColors.white}
                    />
                  )}

                  <Text
                    style={
                      styles.floatingText
                    }
                  >
                    {likes ?? 0}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ================================================= */}
              {/* VIEWS */}
              {/* ================================================= */}

              <View style={styles.iconRow}>
                <EyeTwo
                  size={22}
                  color={themeColors.white}
                />

                <Text
                  style={
                    styles.floatingText
                  }
                >
                  {views ?? 0}
                </Text>
              </View>

              {/* ================================================= */}
              {/* RATING */}
              {/* ================================================= */}

              <View style={styles.iconRow}>
                <Star size={18} color={themeColors.white} rating={rating ? Number(rating) : 0} />

                <Text
                  style={
                    styles.floatingText
                  }
                >
                  {formateRating}
                </Text>
              </View>

              {/* ================================================= */}
              {/* SHARE */}
              {/* ================================================= */}

              <TouchableOpacity
                style={styles.iconRow}
                onPress={onShare}
              >
                <Share
                  size={22}
                  color={themeColors.white}
                />
              </TouchableOpacity>
            </View>

            {/* ================================================= */}
            {/* BOOKMARK */}
            {/* ================================================= */}

            <TouchableOpacity
              onPress={e => {
                e?.stopPropagation?.();
                onSaved?.();
              }}
            >
              {bookmarked ? (
                <BookMark
                  width={24}
                  height={24}
                  color={themeColors.primary}
                  bookmarked
                />
              ) : (
                <BookMark
                  width={24}
                  height={24}
                  color={themeColors.white}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    );
  },
);

export default React.memo(VisionCard);

/* ========================================================= */
/* STYLES */
/* ========================================================= */

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 4,

    marginBottom: 12,
  },

  userRow: {
    flex: 1,
    marginLeft: 10,
  },

  userName: {
    fontSize: 16,
    fontFamily: Fonts.Medium,
    color: '#fff',
  },

  nameRow: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
  },


  user_Name: {
    fontSize: 12,
    color: '#777',
    fontFamily: Fonts.Regular,
  },

  time: {
    fontSize: 10,
    color: '#777',
  },

  menuButton: {
    padding: 6,
    borderRadius: 100,
    backgroundColor: themeColors.card2,
  },

  imageContainer: {
    backgroundColor: '#000',
  },

  image: {
    width: '100%',
    height: 240,
  },

  captionCard: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },

  caption: {
    fontSize: 14,
    lineHeight: 20,
    color: '#fff',
    fontFamily: Fonts.Regular,
  },

  moreText: {
    color: '#888',
    fontSize: 13,
  },

  floatingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    marginVertical: 10,
    marginHorizontal: 15,
  },

  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  floatingText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: Fonts.Medium,
  },

  reactionPopup: {
    position: 'absolute',

    bottom: 38,
    left: -5,

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#2A2D38',

    paddingHorizontal: 14,
    paddingVertical: 6,

    borderRadius: 40,

    gap: 10,

    zIndex: 999,
  },

  reactionImage: {
    width: 32,
    height: 32,
  },
});