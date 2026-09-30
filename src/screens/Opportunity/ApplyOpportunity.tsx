import { StatusBar, StyleSheet, Text, View, ScrollView } from 'react-native';
import React, { useMemo, useState } from 'react';
import AuthHeader from '../../components/Header/AuthHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { themeColors } from '../../theme/colors';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import KeyboardAvoider from '../../components/Keyboard/KeyboardAvoider';
import FloatingInputTwo from '../../components/Input/FloatingInputTwo';
import { Fonts } from '../../constants/Fonts';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { applyOpportunity } from '../../redux/slices/opportunitySlice';
import { useToast } from '../../components/Toast/ToastProvider';
import FileUploader, {
  FileType,
} from '../../components/ImageUploader/FileUploader';

const ApplyOpportunity = () => {
  const navigation = useNavigation<any>();
  const isDark = true;
  const dispatch = useDispatch<any>();
  const route = useRoute<any>();
  const { opp_id } = route.params;
  const { show } = useToast();
  const [file, setFile] = useState<FileType | null>(null);
  const [loading, setLoading] = useState(false);

  // Colors
  const backgroundColor = useMemo(
    () => (isDark ? '#0b0b0d' : themeColors.appBackground),
    [isDark],
  );
  const cardBg = isDark ? '#1c1c1e' : themeColors.white;
  const textColor = isDark ? '#fff' : '#000';

  // Redux
  const { selectedOpportunity } = useSelector(
    (state: any) => state.opportunity,
  );
  const { user } = useSelector((state: any) => state.auth);

  const questions = selectedOpportunity?.questions || [];

  const formSetting = selectedOpportunity?.form_setting || {};

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      answers: ['', '', ''],
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      link: '',
      description: '',
    },
  });

  const onSubmit = async (data: any) => {
    if (loading) return;

    const description = data.description?.trim() || '';

    // Description is mandatory
    if (!description) {
      show({
        type: 'error',
        title: 'Description is required',
        // or message: 'Description is required'
        // depending on your ToastProvider implementation
      });
      return;
    }

    // Minimum 50 characters
    if (description.length < 50) {
      show({
        type: 'error',
        title: 'Description must be at least 50 characters',
      });
      return;
    }

    setLoading(true);

    try {
      const formattedAnswers = questions.map((q: any, index: number) => ({
        question_id: q.id,
        answer: data.answers[index] || '',
      }));

      const formData = new FormData();

      formData.append('answers', JSON.stringify(formattedAnswers));
      formData.append('description', description);
      formData.append('work_link', data.link?.trim() || '');

      formData.append(
        'contact_details',
        formSetting?.has_contact_details ? data.phone : '',
      );

      if (file) {
        formData.append('application_media', {
          uri: file.uri,
          type: file.type || 'application/octet-stream',
          name: file.fileName || 'attachment',
        } as any);
      }

      const res = await dispatch(
        applyOpportunity({
          formData,
          opp_id,
        }),
      ).unwrap();

      show({
        type: 'success',
        title: res.message || 'Opportunity submitted successfully',
      });

      navigation.goBack();
    } catch (error: any) {
      show({
        type: 'error',
        title: error || 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
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
        title="Apply Opportunity"
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoider>
        <View style={{ flex: 1 }}>
          {/* 🔥 SCROLL CONTENT */}
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 14,
              paddingBottom: 150,
            }}
            showsVerticalScrollIndicator={false}
            bounces={false}
            overScrollMode="never"
            keyboardShouldPersistTaps="handled"
          >
            {/* QUESTIONS */}
            {questions?.length > 0 && (
              <View style={[styles.card, { backgroundColor: cardBg }]}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>
                  Questions
                </Text>

                {questions.map((q: any, index: any) => (
                  <View key={index} style={{ marginBottom: 16 }}>
                    <Text style={[styles.label, { color: textColor }]}>
                      {q.question}
                      {q.is_required && (
                        <Text style={{ color: 'red' }}> *</Text>
                      )}
                    </Text>

                    <Controller
                      control={control}
                      name={`answers.${index}`}
                      rules={{
                        required: q.is_required
                          ? 'This field is required'
                          : false,
                      }}
                      render={({ field: { onChange, value } }) => (
                        <>
                          <FloatingInputTwo
                            label="Write Answer Here"
                            value={value}
                            onChangeText={onChange}
                            error={errors.answers?.[index]?.message}
                          />
                        </>
                      )}
                    />
                  </View>
                ))}
              </View>
            )}

            {/* CONTACT INFO */}
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Contact Information
              </Text>
              <Controller
                control={control}
                name="name"
                rules={{
                  required: formSetting?.is_contact_mandatory
                    ? 'Name is required'
                    : false,
                }}
                render={({ field: { onChange, value } }) => (
                  <FloatingInputTwo
                    label="Name"
                    value={value}
                    onChangeText={onChange}
                    error={errors.name?.message as string | undefined}
                  />
                )}
              />

              <Controller
                control={control}
                name="email"
                rules={{
                  required: formSetting?.is_contact_mandatory
                    ? 'Email is required'
                    : false,
                }}
                render={({ field: { onChange, value } }) => (
                  <FloatingInputTwo
                    label="Email"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="email-address"
                    error={errors.email?.message as string | undefined}
                  />
                )}
              />

              <Controller
                control={control}
                name="phone"
                rules={{
                  required: formSetting?.is_contact_mandatory
                    ? 'Phone is required'
                    : false,
                }}
                render={({ field: { onChange, value } }) => (
                  <FloatingInputTwo
                    label="Phone Number"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="phone-pad"
                    error={errors.phone?.message as string | undefined}
                    maxLength={10}
                  />
                )}
              />
            </View>

            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Description{' '}
                {formSetting?.is_description_mandatory && (
                  <Text style={{ color: 'red' }}> *</Text>
                )}
              </Text>

              <Controller
                control={control}
                name="description"
                rules={{
                  required: 'Description is required',
                  minLength: {
                    value: 50,
                    message: 'Description must be at least 50 characters',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FloatingInputTwo
                    label="Write something..."
                    value={value}
                    onChangeText={onChange}
                    // onBlur={onBlur}
                    multiline
                    height={150}
                    maxLength={500}
                    showCharacterCount
                    error={errors.description?.message as string | undefined}
                    showBottomText
                    bottomText="Minimum 50 characters"
                  />
                )}
              />
            </View>

            {/* WORK LINK */}
            {formSetting?.has_work_link && (
              <View style={[styles.card, { backgroundColor: cardBg }]}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>
                  Work Link{' '}
                  {formSetting?.is_work_link_mandatory && (
                    <Text style={{ color: 'red' }}>*</Text>
                  )}
                </Text>

                <Controller
                  control={control}
                  name="link"
                  rules={{
                    required: formSetting?.is_work_link_mandatory
                      ? 'Link is required'
                      : false,
                  }}
                  render={({ field: { onChange, value } }) => (
                    <FloatingInputTwo
                      label="Portfolio / GitHub / Resume URL"
                      value={value}
                      onChangeText={onChange}
                      error={errors.link?.message as string | undefined}
                    />
                  )}
                />
              </View>
            )}

            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Attach File <Text style={{fontSize:12, fontFamily:Fonts.Regular}}>(optional)</Text>
              </Text>

              <FileUploader
                file={file}
                onChange={setFile}
                maxSizeMB={5}
                onError={message =>
                  show({
                    type: 'error',
                    message,
                  })
                }
              />
            </View>

            <PrimaryButton
              title="Submit Application"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              disabled={loading}
            />
          </ScrollView>
        </View>
      </KeyboardAvoider>
    </SafeAreaView>
  );
};

export default ApplyOpportunity;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  card: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 20,
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.SemiBold,
    marginBottom: 12,
  },

  label: {
    fontSize: 14,
    marginBottom: 6,
    fontFamily: Fonts.Bold,
  },
});
