import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Pressable,
  Linking,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

import { themeColors } from '../../theme/colors';
import PostCarousel from './PostCarousel';
import { Fonts } from '../../constants/Fonts';
import Heart from '../../assets/SVG/Heart';
import Share from '../../assets/SVG/Share';
import BookMark from '../../assets/SVG/BookMark';
import Avatar from '../Avatar/Avatar';
import { useLikeAnimation } from '../../hooks/useLikeAnimation';
import TagChip from '../Tags/TagChip';
import { formatCount } from '../../utils/date';
import Repost from '../../assets/SVG/Repost';
import { ReactionType, usePostReaction } from '../../hooks/usePostReaction';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { getDisplayTime } from '../../utils/timeAgo';
import { isHtmlContent } from '../../utils/html';
import HtmlRenderer from '../HtmlRenderer/HtmlRenderer';
import EmbeddedMedia from '../Media/EmbeddedMedia';
import ArrowUpRight from '../../assets/SVG/ArrowUpRight';

type MediaType = {
  type: 'image' | 'video';
  url: string;
};
export type Props = {
  id: string;
  userName: string;
  user_name?: string;
  userAvatar: string;
  time: string;
  caption: string;
  tags?: string[];
  media: MediaType[];
  likeCount?: number | any;
  repostCount?: number | any;
  comments: number;
  onMenuPress?: (event: any) => void;
  isVisible?: boolean;
  onCommentPress?: () => void;
  onRepostPress?: () => void;

  liked?: boolean;
  onLike?: () => void;
  onShare?: () => void;
  bookmarked?: boolean; // ✅ ADD
  onBookmark?: () => void; // ✅ ADD

  postType?: 'normal' | 'book' | 'script' | 'visionx';
  onReadPress?: (post?: any) => void;
  onPress?: () => void;
  onProfilepPress?: () => void;

  reactionPopupVisible?: boolean;
  onOpenReaction?: () => void;
  onCloseReaction?: () => void;
  onReactionSelect?: (reaction: ReactionType) => void;
  emoji_type?: ReactionType;

  isRepost?: boolean;
  repostedUser?: any;
  originalPost?: any;
  link?: string;
  platform?: string;
  image?: string;

  isReported?: boolean;
};

const CHARS_PER_LINE = 45;
const INITIAL_LINES = 5;
const LINES_PER_STEP = 10;
const INITIAL_CHARS = CHARS_PER_LINE * INITIAL_LINES; // 225
const CHARS_PER_STEP = CHARS_PER_LINE * LINES_PER_STEP; // 450

const PostCard = React.memo(
  ({
    id,
    userName,
    user_name,
    userAvatar,
    caption,
    tags = [],
    likeCount,
    repostCount,
    time,
    onMenuPress,
    media,
    onLike,
    liked = false,
    onShare,
    bookmarked = false,
    onBookmark,
    postType,
    onReadPress,
    onProfilepPress,
    onRepostPress,
    onReactionSelect,
    isRepost,
    repostedUser,
    originalPost,
    emoji_type,
    link,
    isVisible = false,
    platform,
    image,
    isReported = false,
    reactionPopupVisible,
    onOpenReaction,
    onCloseReaction,
  }: Props) => {
    const navigation = useNavigation<any>();
    const [visibleChars, setVisibleChars] = useState(INITIAL_CHARS);
    // const [reactionVisible, setReactionVisible] = useState(false);
    const reactionVisible = reactionPopupVisible || false;
    const [originalVisibleChars, setOriginalVisibleChars] =
      useState(INITIAL_CHARS);
    const textColor = themeColors.white;
    const iconColor = themeColors.white;
    const [originalLinkPreviews, setOriginalLinkPreviews] = useState<any[]>([]);

    const [linkPreviews, setLinkPreviews] = useState<any[]>([]);

    const extractUrls = (text?: string) => {
      if (!text) return [];

      const urlRegex = /https?:\/\/[^\s<>"']+/g;

      return (
        text.match(urlRegex)?.map(url =>
          url.replace(/[),.!?;:'"]+$/, ''),
        ) || []
      );
    };
    const handleOpenReaction = () => {
      onOpenReaction?.();
    };

    const handleCloseReaction = () => {
      onCloseReaction?.();
    };

    useEffect(() => {
      const fetchPreviews = async () => {
        const captionUrls = extractUrls(caption);

        const urls = [
          ...(link ? [normalizeUrl(link)] : []),
          ...captionUrls.map(normalizeUrl),
        ].filter(Boolean) as string[];

        // Remove duplicate URLs
        const uniqueUrls = [...new Set(urls)];

        if (uniqueUrls.length === 0) {
          setLinkPreviews([]);
          return;
        }

        try {
          const results = await Promise.all(
            uniqueUrls.map(async url => {
              try {
                const response = await fetch(
                  `https://api.microlink.io/?url=${encodeURIComponent(url)}`,
                );

                const data = await response.json();

                if (data?.status === 'success') {
                  return {
                    url,
                    ...data.data,
                  };
                }

                return null;
              } catch (error) {
                console.log('Preview error:', url, error);
                return null;
              }
            }),
          );

          setLinkPreviews(results.filter(Boolean));
        } catch (error) {
          console.log('Microlink Error:', error);
          setLinkPreviews([]);
        }
      };

      fetchPreviews();
    }, [caption, link]);

    useEffect(() => {
      const fetchOriginalPreview = async () => {
        const url =
          originalPost?.link || extractUrls(originalPost?.story || '');

        if (!url) {
          setOriginalLinkPreviews([]);
          return;
        }

        try {
          const res = await fetch(
            `https://api.microlink.io/?url=${encodeURIComponent(url)}`,
          );

          const json = await res.json();

          if (json?.status === 'success') {
            setOriginalLinkPreviews(json.data);
          }
        } catch (e) {
          setOriginalLinkPreviews([]);
        }
      };

      fetchOriginalPreview();
    }, [originalPost]);

    const { user } = useSelector((state: any) => state.auth);

    const currentUser = user;

    const repostThoughts = caption || '';

    const hasOriginalPost = isRepost && originalPost;
    const isSimpleRepost = isRepost && !caption?.trim();

    const hasMedia =
      !hasOriginalPost &&
      ((Array.isArray(media) && media.length > 0) ||
        (!!platform && !!link) ||
        !!image);

    const isLong = repostThoughts.length > INITIAL_CHARS;
    const hasMoreText = repostThoughts.length > visibleChars;
    const displayText = hasMoreText
      ? repostThoughts.slice(0, visibleChars) + '...'
      : repostThoughts;

    const openWordLink = (word: string) => {
      const cleanUrl = word.replace(/[),.!?]+$/, '');
      const url = cleanUrl.startsWith('http')
        ? cleanUrl
        : `https://${cleanUrl}`;
      Linking.openURL(url).catch(err => {
        console.log('OPEN ERROR:', err);
      });
    };

    const normalizeUrl = (value?: string | null) => {
      if (!value) return null;

      let url = value.trim();

      // Remove punctuation attached to URL
      url = url.replace(/[),.!?;:'"]+$/, '');

      // Add https when protocol is missing
      if (!/^https?:\/\//i.test(url)) {
        url = `https://${url}`;
      }

      return url;
    };

    const openUrl = async (value?: string | null) => {
      try {
        const url = normalizeUrl(value);

        console.log('🔗 Opening URL:', url);

        if (!url) return;

        await Linking.openURL(url);
      } catch (error) {
        console.log('❌ URL open error:', error);
      }
    };

    const renderedCaptionWords = useMemo(() => {
      return displayText.split(/(\s+)/).map((word: string, index: number) => {
        const isMention = word.startsWith('@');
        const isHashtag = word.startsWith('#');
        const isLink =
          word.startsWith('http://') ||
          word.startsWith('https://') ||
          word.includes('.com') ||
          word.includes('youtu.be');

        if (isMention) {
          return (
            <Text
              key={index}
              style={{ color: themeColors.primary, fontFamily: Fonts.Bold }}
              onPress={() =>
                navigation.navigate('Profile', {
                  username: word.replace('@', ''),
                })
              }
            >
              {word}
            </Text>
          );
        }

        if (isHashtag) {
          const match = word.match(/^#([A-Za-z0-9_]+)/);
          const tag = match ? match[1] : '';

          return (
            <Text
              key={index}
              style={{
                color: themeColors.primary,
                fontFamily: Fonts.Medium,
              }}
              onPress={() => {
                console.log('NAV PARAM:', tag);
                navigation.navigate('Search', {
                  initialQuery: tag,
                });
              }}
            >
              {word}
            </Text>
          );
        }

        if (isLink) {
          return (
            <Text
              key={index}
              style={{
                color: themeColors.primary,
                textDecorationLine: 'underline',
              }}
              onPress={() => openWordLink(word)}
            >
              {word}
            </Text>
          );
        }

        return <Text key={index}>{word}</Text>;
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [displayText]);

    const { likeScale, particleAnims, animateLike, animateParticles } =
      useLikeAnimation();

    const shouldShowReadButton = useMemo(() => {
      // Check both originalPost and regular post
      const typeToCheck = originalPost?.type || postType || 'normal';

      // Show button if the type is book or script
      return typeToCheck === 'book' || typeToCheck === 'script';
    }, [originalPost, postType]);

    const { reactions, submitReaction, handleLongPress, getReactionAsset } =
      usePostReaction({
        isOpen: reactionVisible,
        onOpen: handleOpenReaction,
        onClose: handleCloseReaction,
        onSubmit: async reaction => {
          onReactionSelect?.(reaction);
        },
      });

    const storyTags = useMemo(() => {
      const text = caption ?? '';
      const matches = text.match(/#([A-Za-z0-9_]+)/g) || [];

      return matches.map(tag => tag.replace('#', '').toLowerCase());
    }, [caption]);

    const filteredTags = useMemo(() => {
      return tags.filter(tag => !storyTags.includes(tag.toLowerCase()));
    }, [tags, storyTags]);


    const getEmbeddedMediaHeight = () => {
      switch (platform) {
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

    const embeddedMediaHeight = getEmbeddedMediaHeight();

    return (
      <Pressable
        style={{ flex: 1 }}
        onPress={() => {
          if (reactionVisible) {
            handleCloseReaction();
          }
        }}
      >
        <View
          shouldRasterizeIOS
          renderToHardwareTextureAndroid
          style={[
            styles.container,
            {
              backgroundColor: themeColors.black,
              marginHorizontal: 10,
              paddingBottom: hasMedia ? 0 : 0,
              borderWidth: 1,
              borderColor: '#2A2F3A',
            },
          ]}
        >
          {isRepost && !caption?.trim() && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderBottomColor: themeColors.card2,
                borderBottomWidth: 1,
              }}
            >
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
                activeOpacity={0.7}
                onPress={() => {
                  navigation.navigate('Profile', {
                    username: repostedUser?.user_name,
                  });
                }}
              >
                <Avatar
                  size={18}
                  name={repostedUser?.name}
                  uri={repostedUser?.profile_photo_path}
                />

                <Text
                  style={{
                    color: themeColors.white,
                    fontSize: 12,
                    fontFamily: Fonts.Medium,
                    maxWidth: 200
                  }}
                  numberOfLines={1} ellipsizeMode='tail'
                >
                  {currentUser?.user_name === repostedUser?.user_name
                    ? 'You reposted this post'
                    : `${repostedUser?.name} reposted`}
                </Text>

                <Text style={styles.time}>{getDisplayTime(time)}</Text>

              </TouchableOpacity>
              {!isReported && (
                <TouchableOpacity
                  onPress={e => {
                    e.persist?.();
                    onMenuPress?.(e);
                  }}
                  style={{
                    padding: 6,
                    borderRadius: 100,
                    backgroundColor: themeColors.card2,
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
          )}
          {/* HEADER */}
          <View>
            {!isSimpleRepost && (
              <View>
                <View style={styles.header}>
                  <TouchableOpacity
                    onPress={onProfilepPress}
                    activeOpacity={0.6}
                  >

                    <Avatar uri={userAvatar} name={userName} size={35} />
                  </TouchableOpacity>
                  <View style={styles.userRow}>
                    <TouchableOpacity
                      onPress={onProfilepPress}
                      activeOpacity={0.6}
                    >
                      <Text style={[styles.userName, { color: textColor }]} numberOfLines={1} ellipsizeMode='tail'>
                        {userName}
                      </Text>
                      <View style={styles.nameRow}>
                        <Text style={[styles.user_Name]}>@{user_name}</Text>
                        <Text style={{ color: "#7f7f7fff" }}>•</Text>
                        <Text style={styles.time}>{getDisplayTime(time)}</Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  {!isReported && (
                    <TouchableOpacity
                      onPress={e => {
                        e.persist?.();
                        onMenuPress?.(e);
                      }}
                      style={{
                        padding: 6,
                        borderRadius: 100,
                        backgroundColor: themeColors.card2,
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
              </View>
            )}
            {/* CAPTION CARD */}
            <View
              style={[
                styles.captionCard,
                {
                  marginTop: isSimpleRepost ? 0 : 0,
                  marginBottom: hasMedia ? 0 : 6,
                  paddingTop: isSimpleRepost ? 0 : 10,
                  paddingBottom: 10,
                },
              ]}
            >
              {isHtmlContent(displayText) ? (
                <HtmlRenderer html={displayText} maxCharacters={visibleChars} />
              ) : (
                <Text style={[styles.caption, { color: textColor }]}>
                  {renderedCaptionWords}

                  {hasMoreText && (
                    <Text
                      style={styles.moreText}
                      onPress={() =>
                        setVisibleChars(prev => prev + CHARS_PER_STEP)
                      }
                    >
                      {' '}
                      Show more{' '}
                      <Ionicons
                        name="chevron-down"
                        size={12}
                        color={themeColors.primary}
                      />
                    </Text>
                  )}

                  {!hasMoreText && isLong && (
                    <Text
                      style={styles.moreText}
                      onPress={() => setVisibleChars(INITIAL_CHARS)}
                    >
                      {' '}
                      Show less{' '}
                      <Ionicons
                        name="chevron-up"
                        size={12}
                        color={themeColors.primary}
                      />
                    </Text>
                  )}
                </Text>
              )}

              {link && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => openUrl(link)}
                >
                  <Text
                    style={{
                      color: themeColors.primary,
                      fontSize: 14,
                    }}
                  >
                    {link}
                  </Text>
                </TouchableOpacity>
              )}

              {/* LINK PREVIEW */}
              {!platform && linkPreviews.length > 0 && (
                <View style={{ marginTop: 14, gap: 10 }}>
                  {linkPreviews.map((preview, index) => (
                    <TouchableOpacity
                      key={`${preview.url}-${index}`}
                      activeOpacity={0.9}
                      style={styles.previewCard}
                      onPress={() => openUrl(preview.url)}
                    >
                      <FastImage
                        source={{
                          uri:
                            preview?.image?.url ||
                            preview?.logo?.url ||
                            'https://via.placeholder.com/120x120.png',
                        }}
                        style={styles.previewImage}
                        resizeMode={FastImage.resizeMode.cover}
                      />

                      <View style={styles.previewContent}>
                        <Text style={styles.previewSite} numberOfLines={1}>
                          {preview?.publisher || preview?.url}
                        </Text>

                        <Text style={styles.previewTitle} numberOfLines={2}>
                          {preview?.title || 'Open link'}
                        </Text>

                        {!!preview?.description && (
                          <Text style={styles.previewDesc} numberOfLines={2}>
                            {preview.description}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {filteredTags.length > 0 && (
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 10,
                    flexWrap: 'wrap',
                  }}
                >
                  {filteredTags.map((tag, index) => (
                    <TagChip
                      key={`${tag}-${index}`}
                      label={tag}
                      onPress={selectedTag => {
                        navigation.navigate('Search', {
                          initialQuery: selectedTag,
                        });
                      }}
                    />
                  ))}
                </View>
              )}

              {shouldShowReadButton && !hasOriginalPost && (
                <View
                  style={{
                    flex: 1,
                    alignItems: 'flex-start',
                    marginTop: 10,
                  }}
                >
                  <TouchableOpacity
                    style={styles.applyBtn}
                    activeOpacity={0.8}
                    onPress={() => {
                      console.log('📚 Read button pressed for type:', postType);
                      onReadPress?.();
                    }}
                  >
                    <Text style={styles.applyText}>
                      {postType === 'book' ? 'View Book' : 'View Synopsis'}
                    </Text>
                    <ArrowUpRight size={16} color={themeColors.primary} />
                  </TouchableOpacity>
                </View>
              )}

              {hasOriginalPost && (
                <TouchableOpacity
                  disabled={isSimpleRepost}
                  onPress={
                    isSimpleRepost
                      ? undefined
                      : () =>
                        navigation.navigate('SinglePostDetailes', {
                          postId: originalPost?.id,
                        })
                  }
                  style={[
                    styles.originalPostContainer,
                    {
                      marginTop: caption?.trim() ? 10 : 0,
                    },
                  ]}
                >
                  {/* HEADER */}
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('Profile', {
                        username: originalPost?.user?.user_name,
                      });
                    }}
                    style={styles.repostHeader}
                  >
                    <Avatar
                      uri={originalPost?.user?.profile_photo_path}
                      name={originalPost?.user?.name}
                      size={34}
                    />

                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={styles.repostUser} numberOfLines={1} ellipsizeMode='tail'>
                        {originalPost?.user?.name}
                      </Text>
                      <View style={styles.nameRow}>
                        <Text style={[styles.user_Name]}>@{originalPost?.user?.user_name}</Text>
                        <Text style={{ color: "#7f7f7fff" }}>•</Text>
                        <Text style={styles.time}>
                          {hasOriginalPost
                            ? getDisplayTime(originalPost?.createdAt)
                            : getDisplayTime(time)}
                        </Text>
                      </View>

                    </View>
                  </TouchableOpacity>

                  {/* CAPTION */}
                  {(() => {
                    const originalCaption =
                      originalPost?.type === 'book' ||
                        originalPost?.type === 'script'
                        ? originalPost?.title || originalPost?.story || ''
                        : originalPost?.story || '';

                    const isOriginalLong =
                      originalCaption.length > INITIAL_CHARS;
                    const hasMoreOriginalText =
                      originalCaption.length > originalVisibleChars;

                    const originalDisplayText = hasMoreOriginalText
                      ? originalCaption.slice(0, originalVisibleChars) + '...'
                      : originalCaption;

                    const originalWords = originalDisplayText
                      .split(/(\s+)/)
                      .map((word: string, index: number) => {
                        const isMention = word.startsWith('@');
                        const isHashtag = word.startsWith('#');
                        const isLink =
                          word.startsWith('http://') ||
                          word.startsWith('https://') ||
                          word.includes('.com');

                        if (isMention) {
                          return (
                            <Text
                              key={index}
                              style={{
                                color: themeColors.primary,
                                fontFamily: Fonts.Bold,
                              }}
                              onPress={() => {
                                navigation.navigate('Profile', {
                                  username: word.replace('@', ''),
                                });
                              }}
                            >
                              {word}
                            </Text>
                          );
                        }

                        if (isHashtag) {
                          const match = word.match(/^#([A-Za-z0-9_]+)/);

                          const tag = match ? match[1] : '';

                          return (
                            <Text
                              key={index}
                              style={{
                                color: themeColors.primary,
                                fontFamily: Fonts.Medium,
                              }}
                              onPress={() =>
                                navigation.navigate('Search', {
                                  initialQuery: tag,
                                })
                              }
                            >
                              {word}
                            </Text>
                          );
                        }

                        if (isLink) {
                          return (
                            <Text
                              key={index}
                              style={{
                                color: themeColors.primary,
                                textDecorationLine: 'underline',
                              }}
                              onPress={() => openWordLink(word)}
                            >
                              {word}
                            </Text>
                          );
                        }

                        return <Text key={index}>{word}</Text>;
                      });

                    return (
                      <>
                        {!!originalCaption && (
                          <Text style={styles.repostCaption}>
                            {originalWords}

                            {hasMoreOriginalText && (
                              <Text
                                style={styles.moreText}
                                onPress={() =>
                                  setOriginalVisibleChars(
                                    prev => prev + CHARS_PER_STEP,
                                  )
                                }
                              >
                                {' '}
                                Show more{' '}
                                <Ionicons
                                  name="chevron-down"
                                  size={12}
                                  color={themeColors.primary}
                                />
                              </Text>
                            )}

                            {!hasMoreOriginalText && isOriginalLong && (
                              <Text
                                style={styles.moreText}
                                onPress={() =>
                                  setOriginalVisibleChars(INITIAL_CHARS)
                                }
                              >
                                {' '}
                                Show less{' '}
                                <Ionicons
                                  name="chevron-up"
                                  size={12}
                                  color={themeColors.primary}
                                />
                              </Text>
                            )}
                          </Text>
                        )}

                        {!!originalPost?.link && (
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={async () => {
                              const url = originalPost?.link?.startsWith('http')
                                ? originalPost?.link
                                : `https://${originalPost?.link}`;

                              const supported = await Linking.canOpenURL(url);

                              if (supported) {
                                Linking.openURL(url);
                              }
                            }}
                          >
                            <Text
                              style={{
                                color: themeColors.primary,
                                fontSize: 14,
                                paddingHorizontal: 12,
                                paddingTop: 10,
                              }}
                            >
                              {originalPost?.link}
                            </Text>
                          </TouchableOpacity>
                        )}
                        {originalLinkPreviews?.length > 0 && (
                          <View style={{ marginTop: 14, gap: 10 }}>
                            {originalLinkPreviews.map((preview, index) => (
                              <TouchableOpacity
                                key={`${preview.url}-${index}`}
                                activeOpacity={0.9}
                                onPress={() => openUrl(preview.url)}
                                style={styles.previewCard}
                              >
                                <FastImage
                                  source={{
                                    uri:
                                      preview?.image?.url ||
                                      preview?.logo?.url ||
                                      'https://via.placeholder.com/120x120.png',
                                  }}
                                  style={styles.previewImage}
                                  resizeMode={FastImage.resizeMode.cover}
                                />

                                <View style={styles.previewContent}>
                                  <Text style={styles.previewSite} numberOfLines={1}>
                                    {preview?.publisher || preview?.url}
                                  </Text>

                                  <Text style={styles.previewTitle} numberOfLines={2}>
                                    {preview?.title || 'Open link'}
                                  </Text>

                                  {!!preview?.description && (
                                    <Text style={styles.previewDesc} numberOfLines={2}>
                                      {preview?.description}
                                    </Text>
                                  )}
                                </View>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </>
                    );
                  })()}

                  {shouldShowReadButton && hasOriginalPost && (
                    <View
                      style={{
                        flex: 1,
                        alignItems: 'flex-start',
                        marginTop: 10,
                      }}
                    >
                      <TouchableOpacity
                        style={[
                          styles.applyBtn,
                          { marginLeft: 12, marginBottom: 10 },
                        ]}
                        activeOpacity={0.8}
                        onPress={() => {
                          console.log(
                            '📚 Read button pressed for repost original type:',
                            originalPost?.type,
                          );
                          onReadPress?.(originalPost);
                        }}
                      >
                        <Text style={styles.applyText}>
                          {originalPost?.type === 'book'
                            ? 'View Book'
                            : 'View Synopsis'}
                        </Text>
                        <ArrowUpRight size={10} color={themeColors.primary} />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* IMAGE */}
                  {originalPost?.platform && originalPost?.link ? (
                    <EmbeddedMedia
                      platform={originalPost.platform}
                      link={originalPost.link}
                      image={originalPost.image}
                      height={getEmbeddedMediaHeight()}
                      isVisible={isVisible}
                    />
                  ) : originalPost?.medias?.length > 0 ? (
                    <PostCarousel
                      key={`${originalPost.id}-${originalPost.medias.length}`}
                      media={originalPost.medias.map((item: any) => ({
                        type:
                          item.mediable_type === 'video' ? 'video' : 'image',
                        url: item.image,
                      }))}
                      isVisible={isVisible}
                    />
                  ) : (
                    !!originalPost?.image && (
                      <PostCarousel
                        key={`${originalPost.id}-single-image`}
                        media={[{ type: 'image', url: originalPost.image }]}
                        isVisible={isVisible}
                      />
                    )
                  )}
                </TouchableOpacity>
              )}

              {isRepost && !originalPost && (
                <View
                  style={[
                    styles.repostPreview,
                    {
                      padding: 14,
                      marginTop: caption ? 12 : 0,
                      backgroundColor: '#16181D',
                      borderStyle: 'dashed',
                    },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons
                      name="alert-circle-outline"
                      size={20}
                      color="#8E8E93"
                    />

                    <Text
                      style={{
                        color: '#8E8E93',
                        marginLeft: 8,
                        fontSize: 14,
                        fontFamily: Fonts.Medium,
                        flex: 1,
                      }}
                    >
                      This post was deleted or unavailable
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* ACTION BAR FOR TEXT POSTS */}
            {!hasMedia && (
              <View
                style={{
                  backgroundColor: '#2A2D38',
                  borderBottomLeftRadius: 12,
                  borderBottomRightRadius: 12,
                }}
              >
                <View
                  style={[
                    styles.floatingActions,
                    {
                      marginVertical: 10,
                      marginHorizontal: 15,
                    },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 15,
                    }}
                  >
                    <View style={{ position: 'relative' }}>
                      {/* REACTION POPUP */}
                      {reactionVisible && (
                        <View style={styles.reactionPopup}>
                          {reactions.map(item => (
                            <Pressable
                              key={item.id}
                              onPress={() =>
                                submitReaction(item.id as ReactionType)
                              }
                              style={styles.reactionItem}
                            >
                              <FastImage
                                source={item.active}
                                style={styles.reactionImage}
                              />
                            </Pressable>
                          ))}
                        </View>
                      )}

                      <Pressable
                        onPress={e => {
                          e.stopPropagation();
                          if (!liked) {
                            animateLike();
                            animateParticles();
                          }
                          onReactionSelect?.(emoji_type || 'Heart');
                          // Close popup after selecting
                          if (reactionVisible) {
                            handleCloseReaction();
                          }
                        }}
                        onLongPress={e => {
                          e.stopPropagation();
                          // Call the hook's handleLongPress which will trigger the popup
                          handleLongPress();
                        }}
                        delayLongPress={180}
                        style={styles.iconRow}
                      >
                        <View
                          style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {/* <LikeParticles particleAnims={particleAnims} /> */}

                          <Animated.View
                            style={{
                              transform: [{ scale: likeScale }],
                              zIndex: 2,
                            }}
                          >
                            {liked ? (
                              <FastImage
                                source={getReactionAsset(
                                  (emoji_type as ReactionType) || 'Heart',
                                )}
                                style={{ width: 22, height: 22 }}
                              />
                            ) : (
                              <Heart size={22} color={iconColor} />
                            )}
                          </Animated.View>
                        </View>

                        <Text
                          style={[styles.floatingText, { color: textColor }]}
                        >
                          {formatCount(likeCount)}
                        </Text>
                      </Pressable>
                    </View>

                    <TouchableOpacity
                      style={styles.iconRow}
                      onPress={onRepostPress}
                    >
                      <Repost size={22} color={iconColor} />
                      <Text style={[styles.floatingText, { color: textColor }]}>
                        {formatCount(repostCount)}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.iconRow} onPress={onShare}>
                      <Share size={22} color={iconColor} />
                    </TouchableOpacity>
                  </View>
                  {/* BOOKMARK */}
                  <TouchableOpacity
                    onPress={onBookmark}
                  >
                    {bookmarked ? (
                      <BookMark
                        width={24}
                        height={24}
                        color={themeColors.primary}
                        bookmarked
                      />
                    ) : (
                      <BookMark width={24} height={24} color={iconColor} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* MEDIA */}
          {hasMedia && (
            <>
              <View style={styles.imageContainer}>
                {platform && link ? (
                  <EmbeddedMedia
                    platform={platform}
                    link={link}
                    image={image}
                    height={embeddedMediaHeight}
                    onPress={() => { }}
                    isVisible={isVisible}
                  />
                ) : (
                  <PostCarousel
                    media={media}
                    isVisible={isVisible}
                  />
                )}
              </View>
              <View
                style={{
                  // borderTopWidth: 0.4,
                  // borderColor: themeColors.neutral,
                  backgroundColor: '#2A2D38',
                  borderBottomLeftRadius: 12,
                  borderBottomRightRadius: 12,
                }}
              >
                <View
                  style={[
                    styles.floatingActions,
                    {
                      marginVertical: 10,
                      marginHorizontal: 15,
                    },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 14,
                    }}
                  >
                    <View style={{ position: 'relative' }}>
                      {/* REACTION POPUP */}
                      {reactionVisible && (
                        <View style={styles.reactionPopup}>
                          {reactions.map(item => (
                            <Pressable
                              key={item.id}
                              onPress={() =>
                                submitReaction(item.id as ReactionType)
                              }
                              style={styles.reactionItem}
                            >
                              <FastImage
                                source={item.active}
                                style={styles.reactionImage}
                              />
                            </Pressable>
                          ))}
                        </View>
                      )}

                      <TouchableOpacity
                        style={styles.iconRow}
                        delayLongPress={180}
                        onLongPress={handleLongPress}
                        onPress={() => {
                          if (!liked) {
                            animateLike();
                            animateParticles();
                          }
                          onReactionSelect?.(emoji_type || 'Heart');
                          // Close reaction popup if it is open
                          if (reactionVisible) {
                            handleCloseReaction();
                          }
                        }}
                      >
                        <View
                          style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {/* <LikeParticles particleAnims={particleAnims} /> */}

                          <Animated.View
                            style={{
                              transform: [{ scale: likeScale }],
                              zIndex: 2,
                            }}
                          >
                            {liked ? (
                              <FastImage
                                source={getReactionAsset(
                                  (emoji_type as ReactionType) || 'Heart',
                                )}
                                style={{ width: 22, height: 22 }}
                              />
                            ) : (
                              <Heart size={22} color={iconColor} />
                            )}
                          </Animated.View>
                        </View>

                        <Text
                          style={[styles.floatingText, { color: textColor }]}
                        >
                          {formatCount(likeCount)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      style={styles.iconRow}
                      onPress={onRepostPress}
                    >
                      <Repost size={22} color={iconColor} />
                      <Text style={[styles.floatingText, { color: textColor }]}>
                        {formatCount(repostCount)}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.iconRow} onPress={onShare}>
                      <Share size={22} color={iconColor} />
                    </TouchableOpacity>
                  </View>

                  {/* BOOKMARK */}
                  <TouchableOpacity
                    onPress={onBookmark}
                  >
                    {bookmarked ? (
                      <BookMark
                        width={24}
                        height={24}
                        color={themeColors.primary}
                        bookmarked
                      />
                    ) : (
                      <BookMark width={24} height={24} color={iconColor} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </Pressable>
    );
  },
);

PostCard.displayName = 'PostCard';

export default PostCard;

const styles = StyleSheet.create({
  container: {
    marginBottom: 6,
    // marginHorizontal: 10,

    borderRadius: 12, // 🔥 smoother corners
    overflow: 'visible',

    // iOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 8,

    // Android
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 4,
  },

  userRow: {
    flex: 1,
    marginLeft: 10,
  },

  nameRow: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
  },

  userName: {
    fontSize: 16,
    fontFamily: Fonts.Bold,
    maxWidth:200
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

  imageContainer: {
    // borderRadius: 10,
    // padding: 4,
    overflow: 'hidden',
  },

  heartOverlay: {
    position: 'absolute',
    top: '30%',
    left: '40%',
    transform: [{ translateX: -45 }, { translateY: -45 }],
  },

  floatingActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14,
  },

  floatingText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: Fonts.Medium,
  },

  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  bookmark: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    padding: 6,
    borderRadius: 100,
  },

  captionCard: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    // marginHorizontal: 6,
    // borderRadius: 10,
  },

  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.Regular,
  },

  captionUser: {
    fontFamily: Fonts.Bold,
  },

  moreText: {
    color: themeColors.primary,
    fontSize: 13,
  },

  particleContainer: {
    position: 'absolute',
    top: -10, // 🔥 center correction
    left: -10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1, // 🔥 IMPORTANT
  },

  particle: {
    position: 'absolute',
    width: 8, // bigger
    height: 8,
    borderRadius: 4,
  },

  applyBtn: {
    borderColor: themeColors.primary,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 100,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1
  },

  applyText: {
    color: themeColors.primary,
    fontSize: 10,
    fontFamily: Fonts.Bold,
  },

  reactionPopup: {
    position: 'absolute',
    bottom: 38,
    left: -5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2D38',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 40,
    zIndex: 999,
    elevation: 12,
  },

  reactionItem: {
    marginHorizontal: 4,
  },

  reactionImage: {
    width: 30,
    height: 30,
  },

  repostPreview: {
    // marginHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#121318',
  },

  repostHeader: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingHorizontal: 12,
    paddingTop: 12,
  },

  repostUser: {
    color: themeColors.white,
    fontFamily: Fonts.Bold,
    fontSize: 14,
    maxWidth: 200
  },

  repostUsername: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },

  repostCaption: {
    color: themeColors.white,

    paddingHorizontal: 12,
    paddingTop: 12,

    lineHeight: 20,
    fontSize: 14,
    marginBottom: 10,
    fontFamily: Fonts.Regular,
  },

  repostImage: {
    width: '100%',
    height: 260,
    marginTop: 14,
    backgroundColor: '#000',
  },

  previewCard: {
    flexDirection: 'row',
    alignItems: "center",
    marginTop: 14,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A2F3A',
    backgroundColor: '#0F1117',
  },

  previewImage: {
    width: 80,
    height: 80,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
    backgroundColor: '#1A1D26',
  },

  previewContent: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    justifyContent: 'center',
  },

  previewSite: {
    color: '#777',
    fontSize: 12,
    marginBottom: 6,
    fontFamily: Fonts.Medium,
  },

  previewTitle: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Fonts.Bold,
  },

  previewDesc: {
    color: '#999',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
    fontFamily: Fonts.Regular,
  },

  originalPostContainer: {
    borderWidth: 1,
    borderColor: '#2A2F3A',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#16181D',
  },
});
