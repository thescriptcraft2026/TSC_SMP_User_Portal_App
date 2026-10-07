import React, { useEffect, useMemo, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  Platform,
  Switch,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { useRoute } from '@react-navigation/native';

import AuthHeader from '../../components/Header/AuthHeader';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';

import FloatingInputTwo from '../../components/Input/FloatingInputTwo';
import CharacterCount from '../../components/Input/CharacterCount';
import { Limits } from '../../constants/Limits';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import ImageUploader from '../../components/ImageUploader/ImageUploader';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import FloatingDropdown from '../../components/DropDown/FloatingDropdown';
import { useDispatch, useSelector } from 'react-redux';
import { getGeneres } from '../../redux/slices/genresSlice';
import { AppDispatch } from '../../redux/store';
import {
  createVisionXThunk,
  updateVisionXThunk,
} from '../../redux/slices/visionXSlice';
import { useToast } from '../../components/Toast/ToastProvider';
import { getBookByIdThunk } from '../../redux/slices/bookSlice';
import { keyboardAwareProps } from '../../utils/keyboard';
import { sanitizeTitle } from '../../utils/sanitizeTitle';

type VisionXFormData = {
  title: string;
  description: string;
  link: string;
  images: any[];
  genere: string;
  platform: string;
};

const AddVisionX = () => {
  const { show } = useToast();
  const route = useRoute<any>();
  const { vision, visionId } = route.params || {};
  const isEdit = !!vision;
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const isDark = true;
  const insets = useSafeAreaInsets();
  const { generes } = useSelector((state: any) => state.genre);
  const { createLoading, updateLoading, loading } = useSelector(
    (state: any) => state.visionx,
  );
  const [publish, setPublish] = useState(false);

  useEffect(() => {
    if (!generes || generes.length === 0) {
      dispatch(getGeneres());
    }
  }, [generes, dispatch]);

  useEffect(() => {
    if (visionId) {
      dispatch(getBookByIdThunk(visionId));
    }
  }, [visionId]);


  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<VisionXFormData>({
    defaultValues: {
      title: vision?.title || '',
      description: vision?.story || '',
      link: vision?.link || '',
      images: vision?.image ? [{ uri: vision.image }] : [],
      genere: vision?.genre?.id || '',
      platform: vision?.platform || 'youtube',
    },
  });

  useEffect(() => {
    if (!vision) return;

    reset({
      title: vision?.title || '',
      description: vision?.story || '',
      link: vision?.link || '',
      images: vision?.image ? [{ uri: vision.image }] : [],
      genere: vision?.genre?.id || '',
      platform: vision?.platform || 'youtube',
    });

    setPublish(vision?.sendto_feed === 'yes');

    setPublish(vision?.sendto_feed === 'yes');
  }, [vision, reset]);

  const backgroundColor = useMemo(
    () => (isDark ? '#0b0b0d' : themeColors.appBackground),
    [isDark],
  );

  const genereOptions = (generes || []).map((item: any) => ({
    label: item.name,
    value: item.id,
  }));

  const platformOptions = [
    { label: 'YouTube', value: 'youtube' },
    { label: 'Instagram', value: 'instagram' },
    { label: 'Facebook', value: 'facebook' },
    { label: 'Vimeo', value: 'vimeo' },
    { label: 'Google Drive', value: 'google-drive' },
    { label: 'X (Twitter)', value: 'x' },
  ];

  const cardBg = isDark ? '#1c1c1e' : themeColors.white;
  const textColor = isDark ? '#fff' : '#000';

  const onSubmit = async (data: VisionXFormData) => {
    if (loading) return;

    try {
      const formData = new FormData();

      formData.append('title', data.title.trim());
      formData.append('story', data.description?.trim() || '');
      formData.append('type', 'visionx');
      formData.append('send_to_feed', publish ? 'yes' : 'no');
      formData.append('status', 'publish');

      if (data.genere) {
        formData.append('genre_id', String(data.genere));
      }

      if (data.platform) {
        formData.append('platform', data.platform);
      }

      if (data.link) {
        formData.append('link', data.link.trim());
      }

      const img: any = data.images?.[0];

      if (img && !img?.uri?.startsWith('http')) {
        formData.append('image', {
          uri: img.uri,
          type: img.type || 'image/jpeg',
          name: img.fileName || `image_${Date.now()}.jpg`,
        } as any);
      }
      if (isEdit) {
        await dispatch(
          updateVisionXThunk({
            id: vision.id,
            data: formData,
          }),
        ).unwrap();

        show({
          type: 'success',
          title: 'Vision Updated!!',
        });
      } else {
        await dispatch(createVisionXThunk(formData)).unwrap();
        show({ type: 'success', title: 'Vision Created!!' });
      }

      navigation.goBack();
    } catch (error: any) {
      console.log('❌ Error:', error);
    }
  };

  const selectedPlatform = watch('platform');

  const getPlatformConfig = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return {
          label: 'Paste YouTube Link',
          placeholder: 'https://youtube.com/watch?v=...',
          error: 'Please enter a valid YouTube link',
          regex: /(youtube\.com|youtu\.be)/i,
        };

      case 'instagram':
        return {
          label: 'Paste Instagram Link',
          placeholder: 'https://www.instagram.com/...',
          error: 'Please enter a valid Instagram link',
          regex: /instagram\.com/i,
        };

      case 'facebook':
        return {
          label: 'Paste Facebook Link',
          placeholder: 'https://www.facebook.com/...',
          error: 'Please enter a valid Facebook link',
          regex: /facebook\.com|fb\.watch/i,
        };

      case 'vimeo':
        return {
          label: 'Paste Vimeo Link',
          placeholder: 'https://vimeo.com/...',
          error: 'Please enter a valid Vimeo link',
          regex: /vimeo\.com/i,
        };

      case 'google-drive':
        return {
          label: 'Paste Google Drive Link',
          placeholder: 'https://drive.google.com/...',
          error: 'Please enter a valid Google Drive link',
          regex: /drive\.google\.com/i,
        };

      case 'x':
        return {
          label: 'Paste X (Twitter) Link',
          placeholder: 'https://x.com/...',
          error: 'Please enter a valid X (Twitter) link',
          regex: /(x\.com|twitter\.com)/i,
        };

      default:
        return {
          label: 'Embedded Link',
          placeholder: 'Paste your link',
          error: 'Please enter a valid link',
          regex: null,
        };
    }
  };

  const platformConfig = getPlatformConfig(selectedPlatform);

  const buttonLoading = isEdit ? updateLoading : createLoading;

  const isValidEmbeddedUrl = (
    value: string,
    platform: string,
  ): string | true => {
    if (!value?.trim()) {
      return 'Link is required';
    }

    const url = value.trim();

    // Must be a valid URL
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      return 'Enter a valid URL';
    }

    // Only HTTP/HTTPS
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return 'Only HTTP or HTTPS links are allowed';
    }

    const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');

    switch (platform) {
      case 'youtube':
        if (
          hostname !== 'youtube.com' &&
          hostname !== 'youtu.be' &&
          hostname !== 'm.youtube.com'
        ) {
          return 'Please enter a valid YouTube link';
        }

        // YouTube must contain a video ID
        if (
          hostname === 'youtu.be' &&
          !parsedUrl.pathname.replace('/', '').trim()
        ) {
          return 'Please enter a valid YouTube video link';
        }

        if (
          (hostname === 'youtube.com' || hostname === 'm.youtube.com') &&
          !(
            parsedUrl.searchParams.get('v') ||
            parsedUrl.pathname.startsWith('/shorts/') ||
            parsedUrl.pathname.startsWith('/embed/')
          )
        ) {
          return 'Please enter a valid YouTube video link';
        }

        break;

      case 'instagram':
        if (hostname !== 'instagram.com') {
          return 'Please enter a valid Instagram link';
        }

        if (
          !/^\/(p|reel|reels|tv)\/[^/]+/i.test(parsedUrl.pathname)
        ) {
          return 'Please enter a valid Instagram post or reel link';
        }

        break;

      case 'facebook':
        if (
          hostname !== 'facebook.com' &&
          hostname !== 'fb.watch' &&
          !hostname.endsWith('.facebook.com')
        ) {
          return 'Please enter a valid Facebook link';
        }

        break;

      case 'vimeo':
        if (hostname !== 'vimeo.com' && hostname !== 'player.vimeo.com') {
          return 'Please enter a valid Vimeo link';
        }

        if (!/\d+/.test(parsedUrl.pathname)) {
          return 'Please enter a valid Vimeo video link';
        }

        break;

      case 'google-drive':
        if (
          hostname !== 'drive.google.com' &&
          hostname !== 'docs.google.com'
        ) {
          return 'Please enter a valid Google Drive link';
        }

        break;

      case 'x':
        if (
          hostname !== 'x.com' &&
          hostname !== 'twitter.com' &&
          hostname !== 'mobile.twitter.com'
        ) {
          return 'Please enter a valid X (Twitter) link';
        }

        break;

      default:
        break;
    }

    return true;
  };

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
        title={isEdit ? 'Edit Creators Zone' : 'Create Creators Zone'}
        onBack={() => navigation.goBack()}
        fontSize={20}
      />

      <KeyboardAwareScrollView
        {...keyboardAwareProps}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingBottom: insets.bottom + 10,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="auto"
      >
        {/* Vision Info */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Title & Description <Text>*</Text>
          </Text>

          <Controller
            control={control}
            name="title"
            rules={{ required: 'Title is required' }}
            render={({ field: { value, onChange } }) => (
              <>
                <FloatingInputTwo
                  label="Title"
                  value={value || ''}
                  onChangeText={(text) => onChange(sanitizeTitle(text))}
                  error={errors.title?.message as string | undefined}
                  maxLength={Limits.TitleMax}
                />
                <CharacterCount value={value} limit={Limits.TitleMax} />
              </>
            )}
          />

          <Controller
            control={control}
            name="description"
            rules={{
              required: 'Description is required',
              minLength: {
                value: 250,
                message: 'Minimum 250 characters required',
              },
            }}
            render={({ field: { value, onChange } }) => (
              <>
                <FloatingInputTwo
                  label="Description"
                  value={value || ''}
                  onChangeText={onChange}
                  multiline
                  height={120}
                  error={errors.description?.message as string | undefined}
                />
                <CharacterCount
                  value={value}
                  limit={Limits.ContentMin}
                  hint={`Minimum ${Limits.ContentMin} characters is required`}
                />
              </>
            )}
          />
        </View>

        {/* ── Genres ───────────────────────────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Genre <Text>*</Text>
          </Text>
          <Controller
            control={control}
            name="genere"
            rules={{ required: 'Genre is required' }}
            render={({ field: { value, onChange } }: any) => (
              <FloatingDropdown
                label="Category"
                value={value}
                onChange={onChange}
                options={genereOptions}
                error={errors.genere?.message as string | undefined}
              />
            )}
          />
        </View>

        {/* Images */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? themeColors.white : themeColors.black },
            ]}
          >
            Poster <Text>*</Text>
          </Text>

          <Controller
            control={control}
            name="images"
            rules={{
              validate: value =>
                Array.isArray(value) && value.length > 0
                  ? true
                  : 'Poster is required',
            }}
            render={({ field: { value, onChange } }: any) => (
              <>
                <ImageUploader
                  images={value}
                  onChange={(imgs: any) => {
                    onChange(imgs);
                  }}
                  maxImages={1}
                  maxSizeMB={5}
                  onError={(message: string) => {
                    show({
                      type: 'error',
                      title: message,
                    });
                  }}
                  error={errors.images?.message as string | undefined}
                />
              </>
            )}
          />
        </View>

        {/* ── Platform ───────────────────────────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Content Type
          </Text>
          <Controller
            control={control}
            name="platform"
            rules={{ required: 'Platform is required' }}
            render={({ field: { value, onChange } }: any) => (
              <FloatingDropdown
                label="Platform"
                value={value || null}
                onChange={onChange}
                options={platformOptions}
                error={errors.platform?.message as string | undefined}
              />
            )}
          />
        </View>

        {/* Embedded Link */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Embedded Link <Text>*</Text>
          </Text>

          <Controller
            control={control}
            name="link"
            rules={{
              validate: value =>
                isValidEmbeddedUrl(value, selectedPlatform),
            }}
            render={({ field: { value, onChange } }) => (
              <FloatingInputTwo
                label={platformConfig.label}
                value={value || ''}
                onChangeText={onChange}
                error={errors.link?.message as string | undefined}
              />
            )}
          />
        </View>

        {/* ── Publish toggle ───────────────────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={styles.publishRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[styles.publishTitle, { color: textColor }]}>
                Post on feed
              </Text>
              <Text style={[styles.publishSubtitle, { color: textColor }]}>
                Make this visible to readers
              </Text>
            </View>

            <Switch
              value={publish}
              onValueChange={setPublish}
              trackColor={{ false: '#ccc', true: themeColors.primary }}
              thumbColor={
                Platform.OS === 'android'
                  ? publish
                    ? themeColors.primary
                    : '#f4f3f4'
                  : undefined
              }
            />
          </View>
        </View>

        {/* Submit */}
        <PrimaryButton
          title={isEdit ? 'Update' : 'Submit'}
          onPress={handleSubmit(onSubmit)}
          disabled={buttonLoading}
          loading={buttonLoading}
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default AddVisionX;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  container: {
    paddingHorizontal: 14,
    paddingBottom: 40,
  },

  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.Bold,
    marginBottom: 14,
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
