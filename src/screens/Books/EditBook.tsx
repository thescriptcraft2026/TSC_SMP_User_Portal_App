import React, { useEffect, useMemo, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Switch,
  Platform,
} from 'react-native';

import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import AuthHeader from '../../components/Header/AuthHeader';
import ImageUploader from '../../components/ImageUploader/ImageUploader';
import FloatingInputTwo from '../../components/Input/FloatingInputTwo';
import FloatingDropdown from '../../components/DropDown/FloatingDropdown';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import TagInput from '../../components/Input/TagInput';

import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';

import { useDispatch, useSelector } from 'react-redux';
import { getGeneres } from '../../redux/slices/genresSlice';
import { searchTags } from '../../redux/slices/publicSlice';
import { getBookByIdThunk, updateBook } from '../../redux/slices/bookSlice';

type FormData = {
  title: string;
  description: string;
  content: string;
  images: any[];
  genere: string;
};

const EditBook = () => {
  const dispatch = useDispatch<any>();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { bookId } = route.params || {};

  const isDark = true;
  const insets = useSafeAreaInsets();

  const { generes } = useSelector((state: any) => state.genre);
  const { selectedBook } = useSelector((state: any) => state.book);
  const { tags: tagResults } = useSelector((state: any) => state.tags);

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [publish, setPublish] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      content: '',
      images: [],
      genere: '',
    },
  });

  useEffect(() => {
    if (bookId) {
      dispatch(getBookByIdThunk(bookId));
    }
  }, [bookId]);

  useEffect(() => {
    dispatch(getGeneres());
  }, []);

  useEffect(() => {
    if (!tagInput.trim()) return;
    const timer = setTimeout(() => {
      dispatch(searchTags(tagInput.trim()));
    }, 400);
    return () => clearTimeout(timer);
  }, [tagInput]);

  useEffect(() => {
    if (selectedBook) {
      setValue('title', selectedBook.title);
      setValue('description', selectedBook.story || '');
      setValue('content', selectedBook.story);
      setValue('genere', selectedBook.genre?.id);
      if (selectedBook.image) {
        setValue('images', [{ uri: selectedBook.image }]);
      }
      setTags(selectedBook.tags || []);
      setPublish(selectedBook.sendto_feed === 'yes');
    }
  }, [selectedBook]);

  const backgroundColor = useMemo(
    () => (isDark ? themeColors.black : themeColors.appBackground),
    [isDark],
  );

  const cardBg = isDark ? '#1c1c1e' : themeColors.white;

  const onSubmit = async (data: FormData) => {
    if (submitting || !bookId) return;

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append('title', data.title.trim());
      formData.append('story', data.content.trim());
      formData.append('type', 'book');
      formData.append('status', publish ? 'publish' : 'draft');
      formData.append('send_to_feed', publish ? 'yes' : 'no');

      if (data.description?.trim()) {
        formData.append('description', data.description.trim());
      }

      if (data.genere) {
        formData.append('genre_id', data.genere);
      }

      if (data.images?.length) {
        const img: any = data.images[0];
        const imageFile = {
          uri: img?.uri || img,
          type: img?.type || 'image/jpeg',
          name: img?.fileName || `image_${Date.now()}.jpg`,
        };
        formData.append('image', imageFile as any);
      }

      const allTags = [...tags];
      if (tagInput.trim() && !allTags.includes(tagInput.trim())) {
        allTags.push(tagInput.trim());
      }

      allTags.forEach(tag => {
        formData.append('tags[]', tag);
      });

      const result = await dispatch(
        updateBook({
          id: bookId,
          data: formData,
        }),
      );

      if (updateBook.fulfilled.match(result)) {
        navigation.goBack();
      }
    } catch (e) {
      console.log(e);
    } finally {
      setSubmitting(false);
    }
  };

  const genereOptions = generes?.map((g: any) => ({
    label: g.name,
    value: g.id,
  }));

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <StatusBar
        translucent
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      <AuthHeader
        showBack
        title="Edit Book"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAwareScrollView
        contentContainerStyle={{
          padding: 10,
          paddingBottom: insets.bottom + 20,
        }}
      >
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <FloatingInputTwo
                label="Title"
                value={value}
                onChangeText={onChange}
                error={errors.title?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <FloatingInputTwo
                label="Description"
                value={value}
                onChangeText={onChange}
                multiline
                height={80}
              />
            )}
          />
        </View>

        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Controller
            control={control}
            name="genere"
            render={({ field: { value, onChange } }) => (
              <FloatingDropdown
                label="Genre"
                value={value}
                onChange={onChange}
                options={genereOptions}
              />
            )}
          />
        </View>

        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Controller
            control={control}
            name="images"
            render={({ field: { value, onChange } }) => (
              <ImageUploader images={value} onChange={onChange} />
            )}
          />
        </View>

        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Controller
            control={control}
            name="content"
            render={({ field: { onChange, value } }) => (
              <FloatingInputTwo
                label="Content"
                value={value}
                onChangeText={onChange}
                multiline
                height={160}
              />
            )}
          />
        </View>

      <View style={[styles.card, { backgroundColor: cardBg }]}>
  <View style={styles.publishRow}>
    <View style={{ flex: 1 }}>
      <Text
        style={[
          styles.publishTitle,
          { color: isDark ? themeColors.white : themeColors.black },
        ]}
      >
        Post on Feed
      </Text>

      <Text
        style={[
          styles.publishSubtitle,
          { color: isDark ? '#aaa' : '#666' },
        ]}
      >
        Make this book visible to readers
      </Text>
    </View>

    <Switch
      value={publish}
      onValueChange={setPublish}
      trackColor={{ false: '#ccc', true: themeColors.primary }}
      thumbColor={publish ? '#fff' : '#f4f3f4'}
    />
  </View>
</View>

        {publish && (
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <TagInput
              label="Tags"
              value={tagInput}
              onChangeText={setTagInput}
              tags={tags}
              setTags={setTags}
              suggestions={tagResults?.map((t: any) => t.name)}
            />
          </View>
        )}

        <PrimaryButton title="Update Book" onPress={handleSubmit(onSubmit)} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default EditBook;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  marginTop: 2,
},
});
