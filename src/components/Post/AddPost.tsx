import React, { useEffect, useMemo, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';

import AuthHeader from '../../components/Header/AuthHeader';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import ImageUploader from '../../components/ImageUploader/ImageUploader';
import FloatingInputTwo from '../../components/Input/FloatingInputTwo';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../Toast/ToastProvider';
import { createPost, editPost } from '../../redux/slices/postSlice';
import { getConnectionsThunk } from '../../redux/slices/connectionSlice';
import Avatar from '../Avatar/Avatar';
import { getLinkPreview } from 'link-preview-js';
import FastImage from 'react-native-fast-image';
import { fetchFeed, resetFeed } from '../../redux/slices/feedSlice';

type FormData = {
  story: string;
  image: string[] | any;
};

const AddPost = () => {
  const navigation = useNavigation<any>();
  const isDark = true;
  const handleBack = () => navigation.goBack();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<any>();
  const { show } = useToast();

  const route = useRoute<any>();
  const editPostData = route.params?.post || null;
  const isEdit = !!editPostData;

  const [mentionSuggestions, setMentionSuggestions] = useState<any[]>([]);
  const [mentions, setMentions] = useState<number[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [linkPreview, setLinkPreview] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      story: '',
      image: [],
    },
  });

  const { createLoading, updateLoading } = useSelector(
    (state: any) => state.post,
  );
  const { connections, loading } = useSelector(
    (state: any) => state.connection,
  );
  const { user } = useSelector((state: any) => state.auth);

  useEffect(() => {
    const identifier = user?.user_name || user?.user_id || user?.id;

    if (!identifier) return;

    dispatch(
      getConnectionsThunk({
        user_name: identifier,
        page: 1,
      }),
    );
  }, [user?.user_name, user?.user_id, user?.id, dispatch]);

  const backgroundColor = useMemo(
    () => (isDark ? themeColors.black : themeColors.zinc),
    [isDark],
  );

  const cardBg = isDark ? '#1c1c1e' : themeColors.white;

  useEffect(() => {
    if (isEdit && editPostData) {
      // ✅ HANDLE STORY / CAPTION
      setValue('story', editPostData?.story || editPostData?.caption || '');

      let existingImages: any[] = [];

      // ✅ CASE 1: API medias
      if (
        Array.isArray(editPostData?.medias) &&
        editPostData.medias.length > 0
      ) {
        existingImages = editPostData?.medias?.map((m: any) => ({
          id: m.id,
          uri: m?.image,
          isOld: true,
        }));
      }

      // ✅ CASE 2: API single image
      else if (editPostData?.image) {
        existingImages = [
          {
            uri: editPostData.image,
            isOld: true,
          },
        ];
      }

      // 🔥 ✅ CASE 3: HOME SCREEN mapped media (THIS IS YOUR CASE)
      else if (
        Array.isArray(editPostData?.media) &&
        editPostData.media.length > 0
      ) {
        existingImages = editPostData?.medias?.map((m: any) => ({
          id: m.id, // IMPORTANT
          uri: m.image,
          isOld: true,
        }));
      }

      setValue('image', existingImages);
    }
  }, [editPostData]);

  const extractUrl = (text: string) => {
    const urlRegex = /((https?:\/\/)|(www\.))[^\s]+/g;

    const matches = text.match(urlRegex);

    return matches ? matches[0] : null;
  };

  const fetchPreview = async (text: string) => {
    const url = extractUrl(text);

    if (!url) {
      setLinkPreview(null);
      return;
    }

    try {
      setLoadingPreview(true);

      const data: any = await getLinkPreview(url);

      console.log('PREVIEW DATA =>', data);

      setLinkPreview(data);
    } catch (error) {
      console.log('LINK PREVIEW ERROR =>', error);

      setLinkPreview(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleStoryChange = (text: string, onChange: any) => {
    onChange(text);

    const words = text.split(' ');
    const lastWord = words[words.length - 1];

    // detect @typing
    if (lastWord.startsWith('@')) {
      const keyword = lastWord.replace('@', '').toLowerCase();

      const filtered = connections.filter((item: any) =>
        item?.name?.toLowerCase().includes(keyword),
      );

      setMentionSuggestions(filtered);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const handleSelectMention = (user: any, value: string, onChange: any) => {
    const words = value.split(' ');

    words[words.length - 1] = `@${user.user_name}`;

    const updatedText = words.join(' ') + ' ';

    onChange(updatedText);

    // store mention ids
    setMentions(prev => {
      if (prev.includes(user.id)) {
        return prev;
      }

      return [...prev, user.id];
    });

    setShowMentions(false);
  };

  const story = watch('story');
  const images = watch('image');

  const isSubmitDisabled =
    !story?.trim()?.length && (!images || images.length === 0);

  const onSubmit = async (data: FormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    const hasText = data.story?.trim()?.length > 0;
    const hasImages = data.image?.length > 0;

    if (!hasText && !hasImages) {
      show({
        type: 'error',
        title: 'Please add text or image',
      });

      return;
    }

    const formData = new FormData();

    formData.append('story', data.story.trim());
    formData.append('type', 'post');
    formData.append('send_to_feed', 'yes');
    formData.append('status', 'publish');
    formData.append('mentions', JSON.stringify(mentions));

    const keepMediaIds: number[] = [];

    data.image.forEach((img: any, index: number) => {
      if (img.isOld) {
        // old image -> keep it
        if (img.id) {
          keepMediaIds.push(img.id);
        }
      } else {
        // new image -> upload
        formData.append('image', {
          uri: img.uri,
          type: img.type || 'image/jpeg',
          name: img.fileName || `image_${index}.jpg`,
        } as any);
      }
    });

    formData.append('keepMediaIds', JSON.stringify(keepMediaIds));

    console.log('keepMediaIds =>', keepMediaIds);

    try {
      if (isEdit) {
        await dispatch(
          editPost({
            id: editPostData.id,
            formData,
          }),
        ).unwrap();

        show({
          type: 'success',
          title: 'Post Updated Successfully!',
        });
      } else {
        await dispatch(createPost(formData)).unwrap();

        show({
          type: 'success',
          title: 'Post Created Successfully!',
        });
      }

      // Reset immediately
      dispatch(resetFeed());

      // Refresh in background
      await dispatch(fetchFeed()).unwrap();

      // Go back immediately
      navigation.goBack();
    } catch (err) {
      setIsSubmitting(false);
      show({
        type: 'error',
        title: isEdit ? 'Update failed' : 'Post failed',
      });
    }
  };

  return (


    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        translucent
        backgroundColor={backgroundColor}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      <AuthHeader
        showBack
        title={isEdit ? 'Edit Post' : 'Create Post'}
        onBack={handleBack}
        fontSize={20}
      />

      {/* 👇 MAIN CONTAINER */}
      <View style={{ flex: 1 }}>
        {/* 👇 SCROLLABLE CONTENT */}
        <KeyboardAwareScrollView
          enableOnAndroid
          extraScrollHeight={Platform.OS === 'ios' ? 0 : 20}
          extraHeight={Platform.OS === 'ios' ? 120 : 100}
          keyboardOpeningTime={0}
          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingBottom: 20,
          }}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        >
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? themeColors.white : themeColors.black },
              ]}
            >
              Post Content
            </Text>

            <Controller
              control={control}
              // rules={{ required: 'Content is required' }}
              name="story"
              render={({ field: { onChange, value } }) => (
                <>
                  <FloatingInputTwo
                    label="What's on your mind?"
                    value={value}
                    onChangeText={text => {
                      handleStoryChange(text, onChange);

                      fetchPreview(text);
                    }}
                    multiline
                    height={160}
                    error={errors.story?.message}
                    maxLength={10000}
                    showBottomText
                    bottomText={`${value.length}/10000`}
                    bottomTextStyle={{
                      alignSelf: 'flex-end',
                      marginTop: 10,
                    }}
                  />

                  {linkPreview && (
                    <TouchableOpacity
                      activeOpacity={0.9}
                      style={{
                        marginTop: 14,
                        borderRadius: 14,
                        overflow: 'hidden',
                        borderWidth: 1,
                        borderColor: '#23232a',
                        backgroundColor: '#151518',
                      }}
                    >
                      {/* IMAGE */}
                      {!!linkPreview?.images?.[0] && (
                        <FastImage
                          source={{
                            uri: linkPreview.images[0],
                          }}
                          style={{
                            width: '100%',
                            height: 180,
                          }}
                          resizeMode={FastImage.resizeMode.cover}
                        />
                      )}

                      {/* CONTENT */}
                      <View
                        style={{
                          padding: 12,
                        }}
                      >
                        <Text
                          numberOfLines={1}
                          style={{
                            color: '#8E8E93',
                            fontSize: 12,
                            marginBottom: 4,
                            fontFamily: Fonts.Medium,
                          }}
                        >
                          {linkPreview?.siteName ||
                            linkPreview?.hostname ||
                            'Preview'}
                        </Text>

                        <Text
                          numberOfLines={2}
                          style={{
                            color: themeColors.white,
                            fontSize: 15,
                            fontFamily: Fonts.Bold,
                          }}
                        >
                          {linkPreview?.title}
                        </Text>

                        {!!linkPreview?.description && (
                          <Text
                            numberOfLines={2}
                            style={{
                              color: '#A1A1AA',
                              fontSize: 13,
                              marginTop: 6,
                              lineHeight: 18,
                              fontFamily: Fonts.Regular,
                            }}
                          >
                            {linkPreview?.description}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  )}

                  {showMentions && mentionSuggestions.length > 0 && (
                    <View
                      style={{
                        backgroundColor: '#222',
                        borderRadius: 12,
                        marginTop: 8,
                        paddingVertical: 6,
                      }}
                    >
                      {mentionSuggestions.map((item: any) => (
                        <TouchableOpacity
                          key={item.id}
                          style={{
                            paddingHorizontal: 14,
                            paddingVertical: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 10,
                          }}
                          onPress={() =>
                            handleSelectMention(item, value, onChange)
                          }
                        >
                          <Avatar
                            uri={item?.profile_photo_path}
                            name={item?.user_name}
                          />
                          <View>
                            <Text
                              style={{
                                color: themeColors.white,
                                fontSize: 15,
                                fontFamily: Fonts.Bold,
                              }}
                            >
                              {item?.name}
                            </Text>
                            <Text
                              style={{
                                color: themeColors.primary,
                                fontSize: 12,
                                opacity: 0.9,
                                fontFamily: Fonts.Medium,
                              }}
                            >
                              @{item?.user_name}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </>
              )}
            />
          </View>

          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? themeColors.white : themeColors.black },
              ]}
            >
              Post Images
            </Text>

            <Controller
              control={control}
              name="image"
              render={({ field: { value, onChange } }) => (
                <>
                  <ImageUploader
                    images={value}
                    onChange={onChange}
                    maxImages={10}
                    maxSizeMB={5}
                    onError={(message: string) => {
                      show({
                        type: 'error',
                        title: message,
                      });
                    }}
                  />
                </>
              )}
            />
          </View>
        </KeyboardAwareScrollView>

        {/* 👇 FIXED BOTTOM BUTTON (NO POSITION USED) */}
        <View
          style={{
            paddingHorizontal: 10,
            paddingBottom:
              Platform.OS === 'ios' ? insets.bottom - 10 : insets.bottom + 10,
            backgroundColor,
          }}
        >
          <PrimaryButton
            title={
              createLoading
                ? isEdit
                  ? 'Updating...'
                  : 'Posting...'
                : isEdit
                  ? 'Update'
                  : 'Post'
            }
            onPress={handleSubmit(onSubmit)}
            disabled={
              createLoading ||
              updateLoading ||
              isSubmitDisabled ||
              isSubmitting
            }
            loading={
              createLoading ||
              updateLoading ||
              isSubmitting
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AddPost;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  container: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 40,
  },

  card: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    // paddingBottom: 10,
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.Bold,
    marginBottom: 12,
  },

  publishRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  publishTitle: {
    fontSize: 15,
    fontFamily: Fonts.Bold,
  },

  publishSubtitle: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
});
