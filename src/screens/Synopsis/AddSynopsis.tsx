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
import AuthHeader from '../../components/Header/AuthHeader';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import ImageUploader from '../../components/ImageUploader/ImageUploader';
import FloatingInputTwo from '../../components/Input/FloatingInputTwo';
import CharacterCount from '../../components/Input/CharacterCount';
import { Limits } from '../../constants/Limits';
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
  images: any;
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

const AddSynopsis = () => {
  const { show } = useToast();
  const dispatch = useDispatch<any>();
  const { generes } = useSelector((state: any) => state.genre);
  const { tags: tagResults } = useSelector((state: any) => state.tags);

  const navigation = useNavigation<any>();
  const isDark = true;
  const insets = useSafeAreaInsets();

  const route = useRoute<any>();
  const { book, bookId } = route.params || {};
  const isEdit = !!book;

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [publish, setPublish] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const richText = useRef<any>(null);

  useEffect(() => {
    if (bookId) {
      dispatch(getBookByIdThunk(bookId));
    }
  }, [bookId]);

  console.log('edot screen synopses data', book);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
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

  const handleEditorChange = useCallback((html: string) => {
    const clean = html.replace(/<[^>]*>/g, '').trim();
    setValue('content', clean ? html : '', { shouldValidate: true });
  }, []);

  const extractTagsFromHTML = (html: string) => {
    const text = html.replace(/<[^>]*>/g, ' ');
    const matches = text.match(/#\w+/g) || [];
    return [...new Set(matches.map(t => t.replace('#', '').toLowerCase()))];
  };

  const onSubmit = async (data: FormData) => {
    if (submitting) return;

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append('title', data.title.trim());
      formData.append('story', data.content.trim());
      formData.append('type', 'script'); // 🔥 ONLY DIFFERENCE
      formData.append('status', 'publish');
      formData.append('send_to_feed', publish ? 'yes' : 'no');

      if (data.description) {
        formData.append('description', data.description.trim());
      }

      if (data.genere) {
        formData.append('genre_id', String(data.genere));
      }

      const img: any = data.images[0];
      if (!img?.uri?.startsWith('http')) {
        formData.append('image', {
          uri: img.uri,
          type: 'image/jpeg',
          name: `image_${Date.now()}.jpg`,
        } as any);
      }

      // const extractedTags = extractTagsFromHTML(data.content);
      // formData.append('tags', JSON.stringify(extractedTags));

      formData.append('tags', JSON.stringify(tags));

      if (isEdit) {
        await updateBookApi(book.id, formData);
        show({ type: 'success', title: 'Synopsis Updated!!' });
      } else {
        await dispatch(createBook(formData)).unwrap();
        show({ type: 'success', title: 'Synopsis Created!!' });
      }

      navigation.goBack();
    } catch (error: any) {
      show({ type: 'error', title: error?.message || 'Error' });
    } finally {
      setSubmitting(false);
    }
  };

  const genereOptions = generes?.map((g: any) => ({
    label: g.name,
    value: g.id,
  }));

  useEffect(() => {
    if (!book) return;

    reset({
      title: book.title || '',
      description: book.description || '',
      content: book.story || '',
      images: book.image ? [{ uri: book.image }] : [],
      genere: book.genre?.id || '',
    });

    setPublish(book.sendto_feed === 'yes');

    if (book.tags?.length) {
      setTags(book.tags.map((t: any) => t.name));
    }
  }, [book, reset]);

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
        title={isEdit ? 'Edit Synopses' : 'Create Synopses'}
        onBack={() => navigation.goBack()}
        fontSize={20}
      />

      <KeyboardAwareScrollView
        {...keyboardAwareProps}
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingBottom: insets.bottom + 10,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="auto"
        nestedScrollEnabled={true} // ✅ ADD THIS
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      >
        {/* ── Book Info ─────────────────────────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Synopses Info <Text>*</Text>
          </Text>
          <Controller
            control={control}
            rules={{
              required: 'Title is required',
              minLength: {
                value: Limits.TitleMin,
                message: `Title must be at least ${Limits.TitleMin} characters`,
              },
            }}
            name="title"
            render={({ field: { onChange, value } }) => (
              <>
                <FloatingInputTwo
                  label="Title"
                  value={value}
                  onChangeText={(text) => onChange(sanitizeTitle(text))}
                  error={errors.title?.message}
                  maxLength={Limits.TitleMax}
                />
                <CharacterCount
                  value={value}
                  limit={Limits.TitleMax}
                  hint={`Minimum ${Limits.TitleMin} characters, Maximum ${Limits.TitleMax} characters`}
                />
              </>
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

        {/* ── Book Cover Image ───────────────────────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Synopses Cover <Text>*</Text>
          </Text>

          <Controller
            control={control}
            name="images"
            rules={{
              validate: value =>
                (value && value.length > 0) || 'At least one image is required',
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
                  error={errors.images?.message as string | undefined}
                />
                <Text style={[styles.helperText, { color: themeColors.secondary }]}>
                  Recommended size: 400 × 600 px or similar cover ratio
                </Text>
              </>
            )}
          />
        </View>

        {/* ── Book Content (Rich Editor) ────────────────────────────────── */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Synopses Content <Text>*</Text>
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
                return text.length > 0 || 'Content cannot be empty';
              },
            }}
            render={() => (
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
                      borderColor: errors.content ? '#ff4d4f' : toolbarBorder,
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
                  initialContentHTML={book?.story || ''} // 🔥 ADD THIS
                />
                <CharacterCount
                      value={watch('content')}
                      limit={Limits.ContentMin}
                      stripHtml
                      hint={`Minimum ${Limits.ContentMin} characters required`}
                      style={{ marginTop: 8, marginBottom: 0 }}
                    />
              </>
            )}
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
                Post on feed
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

        <Text style={[styles.helperText, { color: themeColors.secondary }]}>
          Note : We request you to get your script registered in any of the
          recognized writers associations before you upload the synopses on to
          the The Script Craft platform.
        </Text>

        <PrimaryButton
          // title={publish ? 'Publish Book' : 'Post Book'}
          title={isEdit ? 'Update' : 'Submit'}
          onPress={handleSubmit(onSubmit)}
          loading={submitting}
          disabled={submitting}
        />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default AddSynopsis;

const styles = StyleSheet.create({
  helperText: {
    fontSize: 12,
    fontFamily: Fonts.Regular,
    marginTop: 8,
    marginBottom: 12,
  },
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
