import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TouchableOpacity,
  Switch,
  Platform,
  Pressable,
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
import FloatingInputTwo from '../../components/Input/FloatingInputTwo';
import FloatingDropdown from '../../components/DropDown/FloatingDropdown';
import DatePickerr from '../../components/Input/DatePicker';
import ImageUploader from '../../components/ImageUploader/ImageUploader';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import Ionicons from '@react-native-vector-icons/ionicons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Feather from '@react-native-vector-icons/feather';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../components/Toast/ToastProvider';
import {
  createOpportunity,
  getAllOpportunityRoles,
  getOpportunityDetailsByIdThunk,
  updateOpportunity,
} from '../../redux/slices/opportunitySlice';
import Plus from '../../assets/SVG/Plus';
import AppLoader from '../../components/Loader/AppLoader';
import {
  RichEditor,
  RichToolbar,
  actions,
} from 'react-native-pell-rich-editor';
import { keyboardAwareProps } from '../../utils/keyboard';
import { sanitizeTitle } from '../../utils/sanitizeTitle';

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

type FormData = {
  title: string;
  category: string;
  description: string;
  poster: { uri: string; fileName?: string; type?: string }[];
  openTill: Date | null;
};

const AddOpportunity = () => {
  const navigation = useNavigation<any>();
  const isDark = true;
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<any>();
  const { show } = useToast();
  const route = useRoute<any>();
  const { opp_id } = route.params || {};
  const isEdit = !!opp_id;

  const [linkEnabled, setLinkEnabled] = useState(false);
  const [linkMandatory, setLinkMandatory] = useState(false);
  const [contactEnabled, setContactEnabled] = useState(false);
  const [questions, setQuestions] = useState<string[]>(['']);
  const [workMode, setWorkMode] = useState<'onsite' | 'hybrid' | 'remote' | ''>(
    '',
  );
  const [location, setLocation] = useState('');
  const [contactMandatory, setContactMandatory] = useState(false);
  const [questionMandatory, setQuestionMandatory] = useState<boolean[]>([
    false,
  ]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tagsTouched, setTagsTouched] = useState(false);
  const richText = useRef<any>(null);

  const placeholderColor = isDark ? '#666' : '#999';
  const toolbarBg = isDark ? '#2c2c2e' : '#f5f5f5';
  const toolbarBorder = isDark ? '#3a3a3c' : '#e0e0e0';

  const { selectedOpportunity, createLoading, loading } = useSelector(
    (state: any) => state.opportunity,
  );
  const editData = selectedOpportunity;

  useEffect(() => {
    if (opp_id) {
      dispatch(getOpportunityDetailsByIdThunk(opp_id));
    }
  }, [opp_id]);

  const isSubmitting = createLoading || loading;

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      category: '',
      description: '',
      poster: [],
      openTill: null,
    },
  });

  const descriptionLength = (watch('description') ?? '')
    .replace(/<[^>]*>/g, '')
    .trim().length;

  useEffect(() => {
    if (!isEdit || !editData) return;

    setValue('title', editData.title);
    setValue('category', editData.role?.id);
    setValue('description', editData.description);
    setValue('openTill', new Date(editData.open_till));

    setWorkMode(editData.location_type);
    setLocation(editData.location || '');

    setLinkEnabled(editData.form_setting?.has_work_link);
    setLinkMandatory(editData.form_setting?.is_work_link_mandatory);
    setContactEnabled(editData.form_setting?.has_contact_details);
    setContactMandatory(editData.form_setting?.is_contact_mandatory);

    if (editData.questions?.length > 0) {
      setQuestions(editData.questions.map((q: any) => q.question));
      setQuestionMandatory(editData.questions.map((q: any) => q.is_required));
    }

    setTags(
      editData.tags?.map((t: any) => (typeof t === 'string' ? t : t.name)) ||
        [],
    );

    if (editData.poster_url) {
      setValue('poster', [{ uri: editData.poster_url }]);
    }
  }, [editData, isEdit]);

  // Coloes
  const backgroundColor = useMemo(
    () => (isDark ? '#0b0b0d' : themeColors.zinc),
    [isDark],
  );
  const cardBg = isDark ? '#1c1c1e' : themeColors.white;
  const textColor = isDark ? '#fff' : '#000';

  // Redux
  const { roles } = useSelector((state: any) => state.opportunity);

  useEffect(() => {
    dispatch(getAllOpportunityRoles());
  }, []);

  // 🔥 Logic
  const addQuestion = () => {
    if (questions.length < 3) {
      setQuestions([...questions, '']);
      setQuestionMandatory([...questionMandatory, false]);
    }
  };

  const updateQuestion = (text: string, index: number) => {
    const updated = [...questions];
    updated[index] = text;
    setQuestions(updated);
  };

  const updateQuestionMandatory = (index: number) => {
    const updated = [...questionMandatory];
    updated[index] = !updated[index];
    setQuestionMandatory(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
    setQuestionMandatory(questionMandatory.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
      setTagsTouched(true); // 🔥 IMPORTANT
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
    setTagsTouched(true); // 🔥 IMPORTANT
  };

  const roleOptions = useMemo(() => {
    return (
      roles?.map((item: any) => ({
        label: item.display_name,
        value: item.id,
      })) || []
    );
  }, [roles]);

  const handleSubmitWithStatus = (status: 'draft' | 'published') => {
    handleSubmit(async data => {
      if (workMode === 'onsite' && !location.trim()) {
        show({
          type: 'error',
          title: 'Location is required',
        });
        return;
      }

      if (!workMode) {
        show({
          type: 'error',
          title: 'Please select work mode',
        });
        return;
      }
      const formData = new FormData();

      // 🔹 Basic Fields
      formData.append('title', data.title);
      formData.append('role_id', String(data.category));
      formData.append('description', data.description);

      if (data.openTill) {
        formData.append('open_till', new Date(data.openTill).toISOString());
      }

      formData.append('status', status);
      formData.append('location_type', workMode);

      if (workMode === 'onsite') {
        formData.append('location', location);
      }

      // 🔹 Form Settings
      formData.append(
        'form_setting',
        JSON.stringify({
          has_work_link: linkEnabled,
          is_work_link_mandatory: linkMandatory,
          has_contact_details: contactEnabled,
          is_contact_mandatory: contactMandatory,
        }),
      );

      // 🔹 Questions
      formData.append(
        'questions',
        JSON.stringify(
          questions
            .filter(q => q.trim() !== '')
            .map((q, i) => ({
              question: q,
              is_mandatory: questionMandatory[i] || false,
            })),
        ),
      );

      // 🔹 Tags=
      const finalTags = tagsTouched
        ? tags
        : editData?.tags?.map((t: any) =>
            typeof t === 'string' ? t : t.name,
          ) || [];

      // ✅ CORRECT WAY
      finalTags.forEach((tag: any) => {
        formData.append('tags[]', tag);
      });

      console.log('FINAL TAGS:', finalTags);
      // ✅ Debug (remove later)
      console.log('EDIT TAGS:', editData?.tags);
      console.log('STATE TAGS:', tags);
      console.log('FINAL TAGS:', finalTags);

      // 🔥 IMAGE (handle edit properly)
      if (data.poster?.length > 0) {
        const img: any = data.poster[0];

        // ✅ Always send image field
        formData.append('image', {
          uri: img.uri,
          name: img.fileName || 'image.jpg',
          type: img.type || 'image/jpeg',
        });
      }

      try {
        let res;

        if (isEdit) {
          // 🔥 UPDATE
          res = await dispatch(
            updateOpportunity({
              opp_id: opp_id,
              formData,
            }),
          ).unwrap();
          console.log('ipdated res', res?.data);
        } else {
          // 🔥 CREATE
          res = await dispatch(createOpportunity(formData)).unwrap();
        }

        console.log('✅ Success:', res);

        show({
          type: 'success',
          title: isEdit
            ? 'Opportunity updated successfully ✏️'
            : 'Opportunity created successfully 🚀',
        });

        navigation.goBack();
      } catch (error: any) {
        console.log('❌ Error:', error);

        show({
          type: 'error',
          title: error,
        });
      }
    })();
  };

  const isDataReady = !isEdit || (isEdit && editData);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={['top', 'left', 'right']}
    >
      {(createLoading || loading) && <AppLoader visible />}
      <StatusBar translucent barStyle={'light-content'} />

      <AuthHeader
        showBack
        title={isEdit ? 'Edit Opportunity' : 'Create Opportunity'}
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
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      >
        {/* Info */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Opportunity Info <Text>*</Text>
          </Text>

          <Controller
            control={control}
            name="title"
            rules={{
              required: 'Opportunity title is required',
              minLength: {
                value: 3,
                message: 'Minimum 3 characters required',
              },
            }}
            render={({ field: { value, onChange } }) => (
              <FloatingInputTwo
                label="Title"
                value={value}
                onChangeText={text => onChange(sanitizeTitle(text))}
                backgroundColor={'transparent'}
                labelBG={isDark ? cardBg : themeColors.white}
                error={errors.title?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="category"
            rules={{
              required: 'Category is required',
            }}
            render={({ field: { value, onChange } }) => (
              <FloatingDropdown
                label="Category"
                value={value}
                onChange={onChange}
                options={roleOptions}
                error={errors.category?.message}
              />
            )}
          />
        </View>

        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <View style={{ marginTop: 10 }}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: textColor,
                  marginBottom: 10,
                },
              ]}
            >
              Opportunity Description <Text>*</Text>
            </Text>

            {/* Toolbar */}
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

            {/* Editor */}
            <Controller
              control={control}
              name="description"
              rules={{
                required: 'Description is required',
                validate: value => {
                  const text = value?.replace(/<[^>]*>/g, '').trim() ?? '';

                  return (
                    text.length >= 20 ||
                    'Description must be at least 20 characters'
                  );
                },
              }}
              render={({ field: { onChange, value } }) => (
                <>
                  <RichEditor
                    ref={richText}
                    placeholder="Write opportunity details..."
                    initialHeight={300}
                    scrollEnabled={false}
                    androidHardwareAccelerationDisabled
                    style={[
                      styles.richEditor,
                      {
                        borderColor: errors.description
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
            `,
                    }}
                    initialContentHTML={value}
                    onChange={onChange}
                    useContainer
                    pasteAsPlainText
                  />

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 6,
                    }}
                  >
                    <Text style={{ color: '#ff4d4f', fontSize: 12, flex: 1 }}>
                      {errors.description?.message}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color:
                          descriptionLength >= 20
                            ? '#52c41a'
                            : placeholderColor,
                      }}
                    >
                      Minimum characters: {descriptionLength} / 20
                    </Text>
                  </View>
                </>
              )}
            />
          </View>
        </View>

        {/* Date */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Open Till Date <Text>*</Text>
          </Text>

          <Controller
            control={control}
            name="openTill"
            rules={{
              required: 'Open till date is required',
            }}
            render={({ field: { value, onChange } }) => (
              <DatePickerr
                label="Open Till Date"
                value={value}
                onChange={onChange}
                error={errors.openTill?.message}
              />
            )}
          />
        </View>

        {/* Poster */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Poster <Text>*</Text>
          </Text>

          <Controller
            control={control}
            name="poster"
            rules={{
              validate: value =>
                value?.length > 0 || 'Poster image is required',
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
                />

                {errors.poster?.message && (
                  <Text
                    style={{
                      color: 'red',
                      fontSize: 12,
                      marginTop: 5,
                    }}
                  >
                    {errors.poster?.message}
                  </Text>
                )}
              </>
            )}
          />
        </View>

        {/* Work Mode */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Work Mode <Text>*</Text>
          </Text>

          <View style={styles.workRow}>
            {['onsite', 'hybrid', 'remote'].map(mode => {
              const isSelected = workMode === mode;

              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setWorkMode(mode as any)}
                  style={[
                    styles.workCard,
                    {
                      borderColor: isSelected
                        ? themeColors.primary
                        : isDark
                        ? '#333'
                        : '#ddd',
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: isSelected ? themeColors.primary : textColor,
                      fontFamily: Fonts.Medium,
                    }}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 🔥 Show location only for onsite */}
          {workMode === 'onsite' && (
            <View style={{ marginTop: 14 }}>
              <FloatingInputTwo
                label="Location"
                value={location}
                onChangeText={setLocation}
                labelBG={isDark ? cardBg : themeColors.white}
                error={
                  workMode === 'onsite' && !location.trim()
                    ? 'Location is required'
                    : ''
                }
              />
            </View>
          )}
        </View>

        {/* Settings */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Application Settings
          </Text>

          {/* 🔗 Work Link */}
          <View style={styles.settingBox}>
            <View style={styles.settingHeader}>
              <Text style={[styles.label, { color: textColor }]}>
                Work Link Field
              </Text>
              <Switch
                value={linkEnabled}
                onValueChange={setLinkEnabled}
                style={styles.smallSwitch}
                trackColor={{ false: '#ccc', true: themeColors.primary }}
                thumbColor={'#fff'}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={[styles.subLabel, { color: textColor }]}>
                Is Work Link Mandatory?
              </Text>
              <Switch
                value={linkMandatory}
                onValueChange={setLinkMandatory}
                disabled={!linkEnabled}
                style={styles.smallSwitch}
                trackColor={{ false: '#ccc', true: themeColors.primary }}
                thumbColor={'#fff'}
              />
            </View>
          </View>

          {/* 📞 Contact */}
          <View style={styles.settingBox}>
            <View style={styles.settingHeader}>
              <Text style={[styles.label, { color: textColor }]}>
                Contact Details Field
              </Text>
              <Switch
                value={contactEnabled}
                onValueChange={setContactEnabled}
                style={styles.smallSwitch}
                trackColor={{ false: '#ccc', true: themeColors.primary }}
                thumbColor={'#fff'}
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={[styles.subLabel, { color: textColor }]}>
                Is Contact Details Mandatory?
              </Text>
              <Switch
                value={contactMandatory}
                onValueChange={setContactMandatory}
                disabled={!contactEnabled}
                style={styles.smallSwitch}
                trackColor={{ false: '#ccc', true: themeColors.primary }}
                thumbColor={'#fff'}
              />
            </View>
          </View>

          {/* ❓ Questions */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 10,
            }}
          >
            <Text style={[styles.label, { color: textColor }]}>
              Questions (Max 3)
            </Text>

            {questions.length < 3 && (
              <TouchableOpacity
                onPress={addQuestion}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Plus color={isDark ? themeColors.white : themeColors.black} />
                <Text
                  style={{
                    color: themeColors.primary,
                    fontFamily: Fonts.Medium,
                  }}
                >
                  Add Question
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {questions.map((q, i) => (
            <View key={i} style={styles.questionCard}>
              {/* 🔥 Top Row (Label + Delete) */}
              <View style={styles.questionHeaderRow}>
                <Text style={styles.questionTitle}>Question {i + 1}</Text>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  {/* Bottom Row */}
                  <View style={styles.questionFooter}>
                    {/* Mandatory */}
                    <TouchableOpacity
                      onPress={() => updateQuestionMandatory(i)}
                      style={styles.mandatoryBtn}
                    >
                      <Feather
                        name={questionMandatory[i] ? 'check-circle' : 'circle'}
                        size={18}
                        color={
                          questionMandatory[i] ? themeColors.primary : '#999'
                        }
                      />
                      <Text style={styles.mandatoryText}>Mandatory</Text>
                    </TouchableOpacity>
                  </View>

                  {questions.length > 1 && (
                    <TouchableOpacity onPress={() => removeQuestion(i)}>
                      <Feather name="trash-2" size={14} color="red" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Input */}
              <FloatingInputTwo
                label="Enter question"
                value={q}
                onChangeText={text => updateQuestion(text, i)}
                labelBG={isDark ? cardBg : themeColors.white}
                enableMentions={false}
              />
            </View>
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Tags <Text>*</Text>
          </Text>

          {/* Input Row */}
          <View style={styles.tagInputRow}>
            <View style={{ flex: 1 }}>
              <FloatingInputTwo
                label="Add tag"
                value={tagInput}
                onChangeText={setTagInput}
                labelBG={isDark ? cardBg : themeColors.white}
                onSubmitEditing={addTag}
              />
            </View>

            <TouchableOpacity onPress={addTag} style={styles.tagAddBtn}>
              <Ionicons name="add" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Tags List */}
          <View style={styles.tagContainer}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
                <TouchableOpacity onPress={() => removeTag(index)}>
                  <Feather name="x" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            marginBottom: insets.bottom + 10, // ✅ FIX overflow
          }}
        >
          <PrimaryButton
            title="Save Draft"
            onPress={() => handleSubmitWithStatus('draft')}
            variant="outline"
            style={{ flex: 1 }}
            loading={isSubmitting}
            disabled={loading || !isDataReady}
          />

          <PrimaryButton
            title={isEdit ? 'Update' : 'Publish'}
            onPress={() => handleSubmitWithStatus('published')}
            style={{ flex: 1 }}
            loading={isSubmitting}
            disabled={loading || !isDataReady}
          />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default AddOpportunity;

const styles = StyleSheet.create({
  safeArea: { flex: 1, paddingBottom: 0 },

  container: {
    paddingHorizontal: 10,
  },

  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 18,
    // shadowColor: '#000',
    // shadowOpacity: 0.05,
    // shadowRadius: 10,
    // elevation: 3,
  },

  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.Bold,
    marginBottom: 14,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    alignItems: 'center',
  },

  label: {
    fontSize: 14,
    fontFamily: Fonts.Medium,
  },

  subLabel: {
    fontSize: 12,
    opacity: 0.6,
  },

  deleteBtn: {
    marginLeft: 10,
    marginTop: -20, // aligns with input nicely
  },

  workRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },

  workCard: {
    flex: 1,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
  },

  settingBox: {
    borderWidth: 1,
    borderColor: themeColors.card2,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  questionCard: {
    marginTop: 12,
  },

  questionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginTop: -10,
  },

  mandatoryText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#666',
  },

  mandatoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  addBtn: {
    backgroundColor: themeColors.primary,
    padding: 6,
    borderRadius: 100,
  },

  smallSwitch: {
    transform: [
      { scaleX: Platform.OS === 'ios' ? 0.8 : 0.7 },
      { scaleY: Platform.OS === 'ios' ? 0.8 : 0.7 },
    ],
  },

  questionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  questionTitle: {
    fontSize: 13,
    fontFamily: Fonts.Medium,
    color: '#666',
  },

  // Tags
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  tagAddBtn: {
    backgroundColor: themeColors.primary,
    padding: 10,
    borderRadius: 10,
    marginTop: -15,
  },

  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: themeColors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },

  tagText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: Fonts.Medium,
  },

  toolbarWrapper: {
    borderBottomWidth: 0,
    overflow: 'hidden',
  },

  richEditor: {
    overflow: 'hidden',
    minHeight: 300,
  },
});
