import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Pressable,
  Platform,
  StatusBar,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Ionicons from '@react-native-vector-icons/ionicons';

import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';

import Reject from '../../assets/SVG/Reject';
import Pen from '../../assets/SVG/Pen';
import Repost from '../../assets/SVG/Repost';

import FloatingInputTwo from '../Input/FloatingInputTwo';
import PrimaryButton from '../Buttons/PrimaryButton';
import Avatar from '../Avatar/Avatar';
import { getConnectionsThunk } from '../../redux/slices/connectionSlice';
import KeyboardAvoider from '../Keyboard/KeyboardAvoider';
import FastImage from 'react-native-fast-image';
import PostCarousel from '../Post/PostCarousel';

type Props = {
  visible: boolean;
  onClose: () => void;

  post?: any;

  onInstantRepost?: () => void;

  onThoughtsRepost?: (data: any) => void;
};

const RepostModal = ({
  visible,
  onClose,
  post,
  onInstantRepost,
  onThoughtsRepost,
}: Props) => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<any>();

  const slideAnim = useRef(new Animated.Value(350)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [showThoughtInput, setShowThoughtInput] = useState(false);

  const [mentionSuggestions, setMentionSuggestions] = useState<any[]>([]);

  const [mentions, setMentions] = useState<number[]>([]);

  const [showMentions, setShowMentions] = useState(false);

  const { connections } = useSelector((state: any) => state.connection);
  const { user } = useSelector((state: any) => state.auth);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      story: '',
    },
  });

  useEffect(() => {
    if (user?.user_name) {
      dispatch(getConnectionsThunk(user?.user_name));
    }
  }, [user?.user_name]);

  /* ---------------- ANIMATION ---------------- */

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(350);
      fadeAnim.setValue(0);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 18,
          stiffness: 180,
          useNativeDriver: true,
        }),

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 350,
          duration: 200,
          useNativeDriver: true,
        }),

        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      setShowThoughtInput(false);
      setMentions([]);
      setShowMentions(false);

      reset();
    }
  }, [visible]);

  /* ---------------- INSTANT REPOST ---------------- */

  const handleInstantRepost = () => {
    onInstantRepost?.();

    onClose();
  };

  /* ---------------- MENTION HANDLER ---------------- */

  const handleStoryChange = (text: string, onChange: any) => {
    onChange(text);

    const words = text.split(' ');
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith('@')) {
      const keyword = lastWord.replace('@', '').toLowerCase();

      const filtered = connections.filter(
        (item: any) =>
          item?.name?.toLowerCase()?.includes(keyword) ||
          item?.user_name?.toLowerCase()?.includes(keyword),
      );

      setMentionSuggestions(filtered);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  /* ---------------- SELECT MENTION ---------------- */

  const handleSelectMention = (user: any, value: string, onChange: any) => {
    const words = value.split(' ');

    words[words.length - 1] = `@${user.user_name}`;

    const updatedText = words.join(' ') + ' ';

    onChange(updatedText);

    setMentions(prev => {
      if (prev.includes(user.id)) {
        return prev;
      }

      return [...prev, user.id];
    });

    setShowMentions(false);
  };

  const previewName = post?.userName || post?.user?.name || post?.originalPost?.user?.name;

  const previewUsername =
    post?.user_name || post?.user?.user_name || post?.originalPost?.user?.user_name;

  const previewCaption = post?.caption || post?.story || post?.originalPost?.story;

  const previewAvatar =
    post?.userAvatar ||
    post?.user?.profile_photo_path ||
    post?.user?.avatar ||
    post?.avatar ||
    post?.originalPost?.user?.profile_photo_path ||
    post?.originalPost?.user?.avatar ||
    post?.originalPost?.avatar;

  type PreviewMediaItem = {
    type: 'image' | 'video';
    url: string;
  };

  const previewMedia = useMemo<PreviewMediaItem[]>(() => {
    const rawList: any[] =
      (post?.medias?.length ? post.medias : null) ||
      (post?.media?.length ? post.media : null) ||
      (post?.originalPost?.medias?.length ? post.originalPost.medias : null) ||
      (post?.originalPost?.media?.length ? post.originalPost.media : null) ||
      [];

    if (rawList.length > 0) {
      return rawList.map((m: any) => ({
        type:
          m?.mediable_type === 'video' || m?.type === 'video'
            ? 'video'
            : 'image',
        url: m?.image || m?.url,
      }));
    }

    const singleImage = post?.image || post?.originalPost?.image;

    return singleImage ? [{ type: 'image', url: singleImage }] : [];
  }, [post]);


  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      statusBarTranslucent
    >
      <StatusBar hidden translucent backgroundColor="transparent" />

      {/* BACKDROP */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* SHEET */}
      <KeyboardAvoider>
        {/* SHEET */}
        <Animated.View
          style={[
            styles.sheet,
            {
              marginBottom: Platform.OS === 'ios' ? 10 : 5 + insets.bottom,

              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
              {/* HANDLE */}
              <View style={styles.handle} />

              {/* HEADER */}
              <View style={styles.header}>
                <Text style={styles.title}>Repost</Text>

                <TouchableOpacity onPress={onClose}>
                  <Reject size={22} color={themeColors.white} />
                </TouchableOpacity>
              </View>

              {/* SUBTITLE */}
              {!showThoughtInput && (
                <Text style={styles.subtitle}>
                  Choose how you want to repost this content
                </Text>
              )}

              {/* OPTIONS */}
              {!showThoughtInput && (
                <>
                  {/* THOUGHTS */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={[
                      styles.repostCard,
                      {
                        borderColor: themeColors.primary,
                      },
                    ]}
                    onPress={() => {
                      setShowThoughtInput(true);
                    }}
                  >
                    <View
                      style={[
                        styles.iconWrap,
                        {
                          backgroundColor: 'rgba(255,184,0,0.12)',
                        },
                      ]}
                    >
                      <Pen size={20} color={themeColors.primary} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>Repost with thoughts</Text>

                      <Text style={styles.cardDesc}>
                        Repost with your commnents.
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={themeColors.neutral}
                    />
                  </TouchableOpacity>

                  {/* INSTANT */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.repostCard}
                    onPress={handleInstantRepost}
                  >
                    <View
                      style={[
                        styles.iconWrap,
                        {
                          backgroundColor: 'rgba(255,255,255,0.06)',
                        },
                      ]}
                    >
                      <Repost size={20} color={themeColors.white} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>Instant repost</Text>

                      <Text style={styles.cardDesc}>
                        Instantly repost this post
                      </Text>
                    </View>

                    <Ionicons
                      name="flash"
                      size={16}
                      color={themeColors.primary}
                    />
                  </TouchableOpacity>
                </>
              )}

              {/* THOUGHT UI */}
              {showThoughtInput && (
                <View style={{ marginTop: 5 }}>
                  {/* POST PREVIEW */}
                  <View style={styles.previewCard}>
                    <ScrollView
                      nestedScrollEnabled
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={styles.previewCardContent}
                    >

                      <View style={styles.previewHeader}>
                        <Avatar
                          uri={previewAvatar}
                          name={previewName}
                          size={42}
                        />

                        <View style={{ flex: 1 }}>
                          <Text style={styles.previewName}>{previewName}</Text>

                          <Text style={styles.previewUsername}>
                            @{previewUsername}
                          </Text>
                        </View>
                      </View>

                      {!!previewCaption && (
                        <Text style={styles.previewCaption}>
                          {previewCaption}
                        </Text>
                      )}

                      {previewMedia.length > 0 && (
                        <View style={styles.previewMediaWrap}>
                          <PostCarousel
                            media={previewMedia}
                            isVisible={true}
                          />
                        </View>
                      )}
                    </ScrollView>
                  </View>

                  {/* INPUT */}
                  <Controller
                    control={control}
                    name="story"
                    render={({ field: { onChange, value } }) => (
                      <>
                        <FloatingInputTwo
                          label="Add your thoughts..."
                          value={value}
                          multiline
                          height={160}
                          onChangeText={(text: string) =>
                            handleStoryChange(text, onChange)
                          }
                        />

                        {/* MENTIONS */}
                        {showMentions && mentionSuggestions.length > 0 && (
                          <View style={styles.mentionDropdown}>
                            <Text style={styles.mentionTitle}>
                              Suggested Connections
                            </Text>

                            <ScrollView
                              nestedScrollEnabled
                              showsVerticalScrollIndicator={false}
                              style={{
                                maxHeight: 260,
                              }}
                            >
                              {mentionSuggestions.map(
                                (item: any, index: number) => (
                                  <TouchableOpacity
                                    key={item.id}
                                    activeOpacity={0.8}
                                    style={[
                                      styles.mentionRow,

                                      index ===
                                      mentionSuggestions.length - 1 && {
                                        borderBottomWidth: 0,
                                      },
                                    ]}
                                    onPress={() =>
                                      handleSelectMention(item, value, onChange)
                                    }
                                  >
                                    <Avatar
                                      uri={item?.profile_photo_path}
                                      name={item?.user_name}
                                      size={48}
                                    />

                                    <View
                                      style={{
                                        flex: 1,
                                      }}
                                    >
                                      <Text
                                        style={styles.mentionName}
                                        numberOfLines={1}
                                      >
                                        {item?.name}
                                      </Text>

                                      <Text style={styles.mentionUsername}>
                                        @{item?.user_name}
                                      </Text>
                                    </View>
                                  </TouchableOpacity>
                                ),
                              )}
                            </ScrollView>
                          </View>
                        )}
                      </>
                    )}
                  />

                  {/* BUTTONS */}
                  <View style={styles.actionRow}>
                    <PrimaryButton
                      variant="outline"
                      title="Back"
                      style={{
                        flex: 1,
                      }}
                      onPress={() => {
                        setShowThoughtInput(false);
                      }}
                    />

                    <PrimaryButton
                      title="Repost"
                      style={{
                        flex: 1,
                      }}
                      onPress={handleSubmit(data => {
                        onThoughtsRepost?.({
                          story: data?.story,
                          mentions,
                        });

                        onClose();
                      })}
                    />
                  </View>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </KeyboardAvoider>
    </Modal>
  );
};

export default RepostModal;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },

  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 10,
    right: 10,

    backgroundColor: '#0F0F10',

    borderBottomLeftRadius: Platform.OS === 'ios' ? 50 : 20,

    borderBottomRightRadius: Platform.OS === 'ios' ? 50 : 20,

    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,

    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 20,
  },

  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4A4A4A',
    alignSelf: 'center',
    marginBottom: 12,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
  },

  keyboardContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.Bold,
    color: themeColors.white,
  },

  subtitle: {
    color: '#8E8E93',
    fontSize: 13,
    marginBottom: 18,
    fontFamily: Fonts.Regular,
  },

  repostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,

    borderRadius: 18,
    padding: 16,

    backgroundColor: themeColors.card2,
    marginBottom: 14,

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardTitle: {
    fontSize: 15,
    fontFamily: Fonts.Bold,
    marginBottom: 4,
    color: themeColors.white,
  },

  cardDesc: {
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 18,
  },

  previewCard: {
    backgroundColor: themeColors.card2,
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    maxHeight: 300,
    overflow: "hidden"
  },

  previewCardContent: {
    // padding: 14,
  },

  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  previewName: {
    color: themeColors.white,
    fontFamily: Fonts.Bold,
    fontSize: 15,
  },

  previewUsername: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },

  previewCaption: {
    color: themeColors.white,
    marginTop: 14,
    lineHeight: 22,
    fontSize: 14,
    fontFamily: Fonts.Regular,
  },

  previewMediaWrap: {
    marginTop: 14,
    borderRadius: 14,
    overflow: 'hidden',
  },

  previewImage: {
    width: '100%',
    height: 120,
    borderRadius: 14,
    marginTop: 14,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },

  mentionDropdown: {
    backgroundColor: '#18181A',

    borderRadius: 22,

    marginTop: 10,

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',

    overflow: 'hidden',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.35,
    shadowRadius: 20,

    elevation: 20,
  },

  mentionTitle: {
    color: '#8E8E93',

    fontSize: 12,

    fontFamily: Fonts.Medium,

    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 10,

    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  mentionRow: {
    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 16,
    paddingVertical: 14,

    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',

    gap: 14,
  },

  mentionName: {
    color: themeColors.white,

    fontSize: 15,

    fontFamily: Fonts.Bold,
  },

  mentionUsername: {
    color: themeColors.primary,

    fontSize: 13,

    marginTop: 4,

    fontFamily: Fonts.Medium,
  },

  addMentionBtn: {
    width: 32,
    height: 32,

    borderRadius: 16,

    backgroundColor: 'rgba(255,184,0,0.12)',

    justifyContent: 'center',
    alignItems: 'center',
  },
});