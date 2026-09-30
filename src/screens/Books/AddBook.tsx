import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Switch,
  Platform,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import {
  RichEditor,
  RichToolbar,
  actions,
} from 'react-native-pell-rich-editor';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import type { AppDispatch, RootState } from '../../redux/store';
import AuthHeader from '../../components/Header/AuthHeader';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import ImageUploader from '../../components/ImageUploader/ImageUploader';
import FloatingInputTwo from '../../components/Input/FloatingInputTwo';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import FloatingDropdown from '../../components/DropDown/FloatingDropdown';
import { useDispatch, useSelector } from 'react-redux';
import { getGeneres } from '../../redux/slices/genresSlice';
import { searchTags } from '../../redux/slices/publicSlice';
import TagInput from '../../components/Input/TagInput';
import { createBook, getBookByIdThunk } from '../../redux/slices/bookSlice';
import { useToast } from '../../components/Toast/ToastProvider';
import { updateBookApi } from '../../services/bookApi';
import { keyboardAwareProps } from '../../utils/keyboard';
import { sanitizeTitle } from '../../utils/sanitizeTitle';

type FormData = {
  title: string;
  description: string;
  content: string;
  images: string[] | any;
  genere: string;
};

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

const AddBook = () => {
  const { show } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const { generes } = useSelector((state: any) => state.genre);
  const { tags: tagResults } = useSelector((state: RootState) => state.tags);
  const navigation = useNavigation<any>();
  const isDark = true;
  const handleBack = () => navigation.goBack();
  const insets = useSafeAreaInsets();

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [publish, setPublish] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const route = useRoute<any>();
  const { book, bookId } = route.params || {};
  const isEdit = !!book;

  useEffect(() => {
    if (bookId) {
      dispatch(getBookByIdThunk(bookId));
    }
  }, [bookId]);

  const richText = useRef<any>(null);
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      title: book?.title || '',
      description: book?.description || '',
      content: book?.story || '',
      images: book?.image ? [{ uri: book.image }] : [],
      genere: book?.genre?.id || '',
    },
  });

  const backgroundColor = useMemo(
    () => (isDark ? themeColors.black : themeColors.appBackground),
    [isDark],
  );

  const cardBg = isDark ? '#1c1c1e' : themeColors.white;
  const textColor = isDark ? themeColors.white : themeColors.black;
  const placeholderColor = isDark ? '#666' : '#999';
  const toolbarBg = isDark ? '#2c2c2e' : '#f5f5f5';
  const toolbarBorder = isDark ? '#3a3a3c' : '#e0e0e0';

  useEffect(() => {
    if (!generes || generes.length === 0) {
      dispatch(getGeneres());
    }
  }, [generes]);

  useEffect(() => {
    if (!tagInput.trim()) return;
    const timer = setTimeout(() => {
      dispatch(searchTags(tagInput.trim()));
    }, 400);
    return () => clearTimeout(timer);
  }, [tagInput]);

  const handleEditorChange = useCallback(
    (html: string) => {
      const isEmpty =
        !html ||
        html === '<br>' ||
        html === '<p><br></p>' ||
        html.replace(/<[^>]*>/g, '').trim() === '';

      setValue('content', isEmpty ? '' : html, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue],
  );

  const extractTagsFromHTML = (html: string) => {
    const text = html.replace(/<[^>]*>/g, ' '); // remove HTML
    const matches = text.match(/#\w+/g) || [];

    // remove # and duplicates
    return [...new Set(matches.map(tag => tag.replace('#', '').toLowerCase()))];
  };

  const onSubmit = async (data: FormData) => {
    if (submitting) return;

    try {
      setSubmitting(true);

      if (!data.title?.trim()) {
        show({ type: 'error', title: 'Title is required' });
        return;
      }

      if (!data.content?.trim()) {
        show({ type: 'error', title: 'Content is required' });
        return;
      }

      if (!data.images || data.images.length === 0) {
        show({ type: 'error', title: 'Image is required' });
        return;
      }

      const formData = new FormData();

      formData.append('title', data.title.trim());
      formData.append('story', data.content.trim());
      formData.append('type', 'book');
      formData.append('status', 'publish');
      formData.append('send_to_feed', publish ? 'yes' : 'no');

      if (data.description?.trim()) {
        formData.append('description', data.description.trim());
      }

      if (data.genere) {
        formData.append('genre_id', String(data.genere));
      }

      // 🔥 IMAGE FIX (IMPORTANT)
      const img: any = data.images[0];

      if (!img?.uri?.startsWith('http')) {
        formData.append('image', {
          uri: img?.uri,
          type: img?.type || 'image/jpeg',
          name: img?.fileName || `image_${Date.now()}.jpg`,
        } as any);
      }

      // 🔥 TAGS
      // const extractedTags = extractTagsFromHTML(data.content);
      // console.log('TAGS:', extractedTags);
      // formData.append('tags', JSON.stringify(extractedTags));

      formData.append('tags', JSON.stringify(tags));

      // 🔥 MAIN FIX
      if (isEdit) {
        await updateBookApi(book.id, formData);
        show({ type: 'success', title: 'Book Updated!!' });
      } else {
        await dispatch(createBook(formData)).unwrap();
        show({ type: 'success', title: 'Book Created!!' });
      }

      navigation.goBack();
    } catch (error: any) {
      console.log('UPDATE ERROR:', error);

      show({
        type: 'error',
        title: error,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const genereOptions = generes?.map((item: any) => ({
    label: item.name,
    value: item.id,
  }));

  useEffect(() => {
    if (book?.tags?.length) {
      setTags(book.tags.map((t: any) => t.name));
    }
  }, [book]);

  // 🔥 PREFILL EVERYTHING (BEST WAY)
  useEffect(() => {
    if (!book) return;

    // ✅ reset form
    reset({
      title: book?.title || '',
      description: book?.description || '',
      content: book?.story || '',
      images: book?.image ? [{ uri: book.image }] : [],
      genere: book?.genre?.id || '',
    });

    setPublish(book?.sendto_feed === 'yes');

    // ✅ tags
    if (book?.tags?.length) {
      setTags(book.tags.map((t: any) => t.name));
    }
  }, [book]);

  return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor }]}
        edges={['top', 'left', 'right']}
      >
        <StatusBar
          translucent
          barStyle={isDark ? 'light-content' : 'dark-content'}
        />

        <AuthHeader
          showBack
          title={isEdit ? 'Edit Book' : 'Create Book'}
          onBack={handleBack}
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
          nestedScrollEnabled={true}
        >
          {/* ── Book Info ─────────────────────────────────────────────────── */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Book Info <Text>*</Text>
            </Text>
            <Controller
              control={control}
              rules={{ required: 'Title is required' }}
              name="title"
              render={({ field: { onChange, value } }) => (
                <FloatingInputTwo
                  label="Title"
                  value={value}
                  onChangeText={(text) => onChange(sanitizeTitle(text))}
                  error={errors.title?.message}
                />
              )}
            />
          </View>

          {/* ── Genres ───────────────────────────────────────────────────── */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Genres <Text>*</Text>
            </Text>
            <Controller
              control={control}
              name="genere"
              rules={{
                required: 'Genre is required',
              }}
              render={({ field: { value, onChange } }) => (
                <>
                  <FloatingDropdown
                    label="Category"
                    value={value}
                    onChange={onChange}
                    options={genereOptions}
                    error={errors.genere?.message?.toString()}
                  />
                </>
              )}
            />
          </View>

          {/* ── Book Cover Image ───────────────────────────────────────────────── */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Book Cover <Text>*</Text>
            </Text>

            <Controller
              control={control}
              name="images"
              rules={{
                validate: value =>
                  (value && value.length > 0) ||
                  'At least one image is required',
              }}
              render={({ field: { value, onChange } }: any) => (
                <>
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
                    error={errors.images?.message?.toString()}
                  />
                </>
              )}
            />
          </View>

          {/* ── Book Content (Rich Editor) ────────────────────────────────── */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Book Content <Text>*</Text>
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
              name="content"
              rules={{
                required: 'Content is required',
                validate: value => {
                  const text = value?.replace(/<[^>]*>/g, '').trim() ?? '';

                  if (!text.length) {
                    return 'Content is required';
                  }

                  if (text.length < 250) {
                    return 'Content must contain at least 250 characters';
                  }

                  return true;
                },
              }}
              render={() => {
                const storyHTML =
                  typeof book?.story === 'string' ? book.story : '';

                return (
                  <>
                    <RichEditor
                      key={book?.id ? `edit-${book.id}` : 'new'}
                      ref={richText}
                      placeholder="Write your story here…"
                      initialHeight={300}
                      scrollEnabled={false}
                      // Prevent WebView crash on older Android
                      androidHardwareAccelerationDisabled={true}
                      style={[
                        styles.richEditor,
                        {
                          borderColor: errors.content
                            ? '#ff4d4f'
                            : toolbarBorder,
                        },
                      ]}
                      editorStyle={{
                        backgroundColor: cardBg,
                        color: textColor,
                        placeholderColor,
                        contentCSSText: `
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    font-size: 15px;
                    line-height: 1.7;
                    padding: 12px;
                    caret-color: themeColors.primary;
                  `,
                      }}
                      onChange={handleEditorChange}
                      useContainer
                      pasteAsPlainText={true}
                      initialContentHTML={storyHTML} // 🔥 ADD THIS
                    />
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        marginTop: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          color: '#eae17f',
                        }}
                      >
                        Minimum 250 characters required
                      </Text>
                    </View>
                  </>
                );
              }}
            />

            {errors.content && (
              <Text style={styles.errorText}>{errors.content.message}</Text>
            )}
          </View>

          {/* ── Publish toggle ───────────────────────────────────────────── */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <View style={styles.publishRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={[styles.publishTitle, { color: textColor }]}>
                  Post in feed
                </Text>
                <Text style={[styles.publishSubtitle, { color: textColor }]}>
                  Make this book visible to readers
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

          {/* ── Tags (only when publishing) ──────────────────────────────── */}
          {publish && (
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <TagInput
                label="Tags"
                value={tagInput}
                onChangeText={setTagInput}
                tags={tags}
                setTags={setTags}
                suggestions={tagResults?.map((t: any) => t.name)}
                onSelectSuggestion={tag => {
                  if (!tags.includes(tag)) {
                    setTags(prev => [...prev, tag]);
                  }
                }}
              />
            </View>
          )}

          <PrimaryButton
            title={isEdit ? 'Update' : 'Submit'}
            onPress={handleSubmit(onSubmit)}
            loading={submitting}
            disabled={submitting}
          />
        </KeyboardAwareScrollView>
      </SafeAreaView>
  );
};

export default AddBook;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  card: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.Bold,
    marginBottom: 12,
  },

  toolbarWrapper: {
    // borderTopLeftRadius: 10,
    // borderTopRightRadius: 10,
    // borderWidth: 1,
    borderBottomWidth: 0,
    overflow: 'hidden',
  },

  richEditor: {
    // borderWidth: 1,
    // borderTopWidth: 0,
    // borderBottomLeftRadius: 10,
    // borderBottomRightRadius: 10,
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
  errorText: {
    color: '#ff4d4f',
    fontSize: 12,
    marginTop: 6,
  },
});
