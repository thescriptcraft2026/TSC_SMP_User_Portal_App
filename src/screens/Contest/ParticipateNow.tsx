import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useMemo, useRef } from 'react';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import AuthHeader from '../../components/Header/AuthHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import { themeColors } from '../../theme/colors';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import FloatingInputTwo from '../../components/Input/FloatingInputTwo';
import { Controller, useForm } from 'react-hook-form';
import ImageUploader from '../../components/ImageUploader/ImageUploader';
import { Fonts } from '../../constants/Fonts';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch, useSelector } from 'react-redux';
import { participateContest } from '../../redux/slices/contestSlice';
import { useToast } from '../../components/Toast/ToastProvider';
import {
  RichEditor,
  RichToolbar,
  actions,
} from 'react-native-pell-rich-editor';

const TOOLBAR_ACTIONS = [
  actions.heading1,

  // Text styles
  actions.setBold,
  actions.setItalic,
  actions.setUnderline,

  // Lists
  actions.insertBulletsList,
  actions.insertOrderedList,

  // Alignment
  actions.alignLeft,
  actions.alignCenter,
  actions.alignRight,
  actions.alignJustify,
];

const ParticipateNow = () => {
  const navigation = useNavigation<any>();
  const isDark = true;
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const { contest_id } = route.params || {};
  const dispatch = useDispatch<any>();
  const { show } = useToast();
  const richText = useRef<any>(null);

  const cardBg = isDark ? '#1c1c1e' : themeColors.white;
  const textColor = isDark ? themeColors.white : themeColors.black;
  const placeholderColor = isDark ? '#666' : '#999';
  const toolbarBg = isDark ? '#2c2c2e' : '#f5f5f5';
  const toolbarBorder = isDark ? '#3a3a3c' : '#e0e0e0';

  const { participateLoading } = useSelector((state: any) => state.contest);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      title: '',
      story: '',
      contest_story: '',
      link: '',
      status: 'publish',
      submissionMedia: [],
      platform: '',
      image: [],
    },
  });

  const contestStory = watch('contest_story');

  const plainText =
    contestStory
      ?.replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || '';

  const wordCount = plainText ? plainText.split(' ').filter(Boolean).length : 0;

  const MIN_WORDS = 1500;
  const MAX_WORDS = 3500;

  const isLinkRequired =
    contest_id?.submission_type === 'link' ||
    contest_id?.link_type === 'youtube' ||
    contest_id?.link_type === 'instagram' ||
    contest_id?.link_type === 'all';

  const handleBack = () => navigation.goBack();

  const onInvalid = (formErrors: any) => {
    console.log('Form validation errors:', formErrors);
    const firstError = Object.values(formErrors)[0] as any;
    const message =
      firstError?.message || 'Please fill in all required fields correctly.';
    show({
      type: 'error',
      title: message,
    });
  };

  const onSubmit = async (data: any) => {
    try {
      const trimmedTitle = data.title?.trim();
      const trimmedStory = data.story?.trim();
      const trimmedLink = data.link?.trim() || '';
      const normalizedLink = trimmedLink
        ? trimmedLink.startsWith('http://') || trimmedLink.startsWith('https://')
          ? trimmedLink
          : `https://${trimmedLink}`
        : '';

      let detectedPlatform = data.platform || 'all';
      const lowerUrl = normalizedLink.toLowerCase();
      if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
        detectedPlatform = 'youtube';
      } else if (lowerUrl.includes('instagram.com')) {
        detectedPlatform = 'instagram';
      }

      const formData = new FormData();
      formData.append('title', trimmedTitle);
      formData.append('story', trimmedStory);
      if (data.contest_story) {
        formData.append('contest_story', data.contest_story);
      }
      if (normalizedLink) {
        formData.append('link', normalizedLink);
      }
      formData.append('platform', detectedPlatform);
      formData.append('status', data.status || 'publish');

      if (contest_id?.submission_type === 'image') {
        if (data.submissionMedia?.length > 0) {
          const file = data.submissionMedia[0];

          formData.append('submissionMedia', {
            uri: file.uri,
            type: file.type || 'image/jpeg',
            name: file.fileName || file.name || `image_${Date.now()}.jpg`,
          } as any);
        }
      }

      if (data.image?.length > 0) {
        formData.append('image', {
          uri: data.image[0].uri,
          type: data.image[0].type || 'image/jpeg',
          name: data.image[0].fileName || 'image.jpg',
        });
      }

      console.log('Submitting form data:', formData);

      const res = await dispatch(
        participateContest({
          formData,
          contest_id: contest_id?.id,
        }),
      ).unwrap();

      console.log('Submit success', res);
      show({
        type: 'success',
        title: res?.message || res?.data?.message || res?.payload?.message || 'Entry submitted successfully!',
      });

      const participantId =
        res?.data?.id || res?.data?.participant?.id || res?.id;
      const entryTitle = res?.data?.title || trimmedTitle;

      navigation.navigate('SuccessScreen', {
        contestId: contest_id?.id,
        participantId,
        title: entryTitle,
      });
    } catch (error: any) {
      console.log('Submit error', error);
      const errMsg =
        typeof error === 'string'
          ? error
          : error?.message ||
            error?.data?.message ||
            error?.payload?.message ||
            'Failed to submit entry. Please try again.';
      show({
        type: 'error',
        title: errMsg,
      });
    }
  };

  const backgroundColor = useMemo(
    () => (isDark ? themeColors.black : themeColors.appBackground),
    [isDark],
  );

  console.log('link type', contest_id);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        translucent
        barStyle={'light-content'}
      />

      <AuthHeader
        showBack
        title="Submit Your Entry"
        fontSize={20}
        onBack={handleBack}
      />

      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={Platform.OS === 'ios' ? 0 : 20}
        extraHeight={Platform.OS === 'ios' ? 120 : 100}
        keyboardOpeningTime={0}
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingBottom: insets.bottom + 10,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="auto"
      >
        {/* TITLE */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? themeColors.white : themeColors.black },
            ]}
          >
            Title <Text style={{ color: 'red' }}>*</Text>
          </Text>

          <Controller
            control={control}
            rules={{
              required: 'Title is required',
              validate: (val: string) => {
                const trimmed = val?.trim();
                if (!trimmed) return 'Title is required';
                if (trimmed.length < 3) return 'Title must be at least 3 characters';
                if (trimmed.length > 100) return 'Title cannot exceed 100 characters';
                return true;
              },
            }}
            name="title"
            render={({ field: { onChange, value } }) => (
              <FloatingInputTwo
                label="Enter title"
                value={value}
                onChangeText={onChange}
                maxLength={100}
                error={errors.title?.message}
              />
            )}
          />
        </View>

        {/* DESCRIPTION */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? themeColors.white : themeColors.black },
            ]}
          >
            Description <Text style={{ color: 'red' }}>*</Text>
          </Text>

          <Controller
            control={control}
            name="story"
            rules={{
              required: 'Description is required',
              validate: (val: string) => {
                const trimmed = val?.trim();
                if (!trimmed) return 'Description is required';
                if (trimmed.length < 20) return 'Description must be at least 20 characters';
                if (trimmed.length > 2000) return 'Description cannot exceed 2000 characters';
                return true;
              },
            }}
            render={({ field: { onChange, value } }) => (
              <FloatingInputTwo
                label="Write description..."
                value={value}
                onChangeText={onChange}
                multiline
                height={60}
                error={errors.story?.message}
                showCharacterCount
                minLength={20}
                maxLength={2000}
                showBottomText
                bottomText="Minimum 20 characters"
              />
            )}
          />
        </View>

        {/* URL */}
        {isLinkRequired && (
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? themeColors.white : themeColors.black },
              ]}
            >
              Content URL <Text style={{ color: 'red' }}>*</Text>
            </Text>

            <Controller
              control={control}
              name="link"
              rules={{
                required: 'Content URL is required',
                validate: (value: string) => {
                  const url = value?.trim();
                  if (!url) {
                    return 'Content URL is required';
                  }

                  const youtubeRegex =
                    /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|live\/)|youtu\.be\/)[A-Za-z0-9_-]+/i;
                  const instagramRegex =
                    /^(https?:\/\/)?(www\.)?instagram\.com\/(reel|p|tv|stories)\/[A-Za-z0-9_-]+/i;
                  const generalUrlRegex =
                    /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i;

                  const lower = url.toLowerCase();

                  if (
                    contest_id?.link_type === 'youtube' ||
                    lower.includes('youtube.com') ||
                    lower.includes('youtu.be')
                  ) {
                    return (
                      youtubeRegex.test(url) ||
                      'Please enter a valid YouTube video link (e.g. https://youtube.com/watch?v=... or https://youtu.be/...)'
                    );
                  }

                  if (
                    contest_id?.link_type === 'instagram' ||
                    lower.includes('instagram.com')
                  ) {
                    return (
                      instagramRegex.test(url) ||
                      'Please enter a valid Instagram post/reel link (e.g. https://instagram.com/reel/...)'
                    );
                  }

                  return (
                    generalUrlRegex.test(url) ||
                    'Please enter a valid web URL'
                  );
                },
              }}
              render={({ field: { onChange, value } }) => (
                <FloatingInputTwo
                  label={
                    contest_id?.link_type === 'youtube'
                      ? 'Paste your YouTube content link'
                      : contest_id?.link_type === 'instagram'
                        ? 'Paste your Instagram content link'
                        : 'Paste your content link'
                  }
                  value={value}
                  onChangeText={onChange}
                  error={errors.link?.message}
                />
              )}
            />
          </View>
        )}

        {contest_id?.submission_type === 'text' && (
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Content <Text style={{ color: 'red' }}>*</Text>
            </Text>
            <View
              style={[
                styles.toolbarWrapper,
                {
                  backgroundColor: toolbarBg,
                  borderColor: toolbarBorder,
                },
              ]}
            >
              <RichToolbar
                editor={richText}
                actions={TOOLBAR_ACTIONS}
                style={{ backgroundColor: 'transparent' }}
                flatContainerStyle={{ paddingHorizontal: 4 }}
                selectedIconTint={themeColors.primary}
                iconTint={isDark ? '#ccc' : '#444'}
                iconSize={20}
              />
            </View>
            <Controller
              control={control}
              name="contest_story"
              rules={{
                required: 'Content is required',
                validate: (value: string) => {
                  const text =
                    value
                      ?.replace(/<[^>]*>/g, '')
                      .replace(/&nbsp;/g, ' ')
                      .replace(/\s+/g, ' ')
                      .trim() ?? '';

                  const words = text
                    ? text.split(' ').filter(Boolean).length
                    : 0;

                  if (words === 0) {
                    return 'Content is required';
                  }

                  if (words < MIN_WORDS) {
                    return `Content must be at least ${MIN_WORDS} words (currently ${words})`;
                  }

                  if (words > MAX_WORDS) {
                    return `Content cannot exceed ${MAX_WORDS} words (currently ${words})`;
                  }

                  return true;
                },
              }}
              render={({ field: { onChange, value } }) => (
                <>
                  <RichEditor
                    ref={richText}
                    placeholder="Write your content..."
                    initialHeight={300}
                    androidHardwareAccelerationDisabled
                    useContainer
                    pasteAsPlainText
                    initialContentHTML={value || ''}
                    onChange={onChange}
                    style={[
                      styles.richEditor,
                      {
                        borderColor: errors.contest_story
                          ? '#ff4d4f'
                          : toolbarBorder,
                      },
                    ]}
                    editorStyle={{
                      backgroundColor: cardBg,
                      color: textColor,
                      placeholderColor,
                      contentCSSText: `
            font-size:15px;
            line-height:1.7;
            padding:12px;
          `,
                    }}
                  />

                  <View style={styles.characterRow}>
                    <Text style={styles.characterHint}>
                      Minimum {MIN_WORDS} words
                    </Text>

                    <Text
                      style={[
                        styles.characterCount,
                        {
                          color:
                            wordCount > MAX_WORDS
                              ? '#ff4d4f'
                              : wordCount >= MIN_WORDS
                                ? '#22c55e'
                                : '#999',
                        },
                      ]}
                    >
                      {wordCount}/{MAX_WORDS} words
                    </Text>
                  </View>

                  {errors.contest_story && (
                    <Text style={styles.errorText}>
                      {errors.contest_story.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>
        )}

        {/* POSTER */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? themeColors.white : themeColors.black },
            ]}
          >
            Poster Image <Text style={{ color: 'red' }}>*</Text>
          </Text>

          <Controller
            control={control}
            name="image"
            rules={{
              validate: (value: any) =>
                (Array.isArray(value) && value.length > 0) ||
                'Poster image is required',
            }}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <ImageUploader
                images={value}
                onChange={onChange}
                maxImages={1}
                maxSizeMB={5}
                onError={(message: string) => {
                  show({
                    type: 'error',
                    title: message,
                  });
                }}
                error={error?.message}
              />
            )}
          />
        </View>

        {contest_id?.submission_type === 'image' && (
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? themeColors.white : themeColors.black },
              ]}
            >
              Contest Media <Text style={{ color: 'red' }}>*</Text>
            </Text>

            <Controller
              control={control}
              name="submissionMedia"
              rules={{
                validate: (value: any) =>
                  (Array.isArray(value) && value.length > 0) ||
                  'Contest media is required',
              }}
              render={({ field: { value, onChange }, fieldState: { error } }) => (
                <ImageUploader
                  images={value}
                  onChange={onChange}
                  maxImages={1}
                  maxSizeMB={3}
                  onError={(message: string) => {
                    show({
                      type: 'error',
                      title: message,
                    });
                  }}
                  error={error?.message}
                />
              )}
            />
          </View>
        )}

        {/* SUBMIT */}
        <PrimaryButton
          title="Enter Contest"
          onPress={handleSubmit(onSubmit, onInvalid)}
          style={styles.button}
          loading={participateLoading}
          disabled={participateLoading}
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default ParticipateNow;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  container: {
    marginHorizontal: 10,
    paddingBottom: 40,
    marginTop: 10,
  },

  card: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 8,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 15,
    fontFamily: Fonts.Bold,
    marginBottom: 10,
  },

  errorText: {
    color: '#ff4d4f',
    marginTop: 6,
    fontSize: 12,
  },

  button: {
    marginTop: 10,
    height: 52,
    borderRadius: 30,
  },

  toolbarWrapper: {
    borderBottomWidth: 0,
    overflow: 'hidden',
  },

  richEditor: {
    overflow: 'hidden',
    minHeight: 300,
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

  characterRow: {
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  characterHint: {
    fontSize: 12,
    color: '#999',
  },

  characterCount: {
    fontSize: 12,
    fontWeight: '600',
  },
});
