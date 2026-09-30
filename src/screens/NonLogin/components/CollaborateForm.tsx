import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';

import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../../components/Toast/ToastProvider';
import { AppDispatch } from '../../../redux/store';
import AuthHeader from '../../../components/Header/AuthHeader';
import { themeColors } from '../../../theme/colors';
import PrimaryButton from '../../../components/Buttons/PrimaryButton';
import { Fonts } from '../../../constants/Fonts';
import FloatingInputTwo from '../../../components/Input/FloatingInputTwo';
import api from '../../../../Instance/Instance';
import { maxLength } from 'zod';

type FormValues = {
  name: string;
  contactNumber: string;
  contactEmail: string;
  brief: any,
  subject: any,
  description: string,
  type: 'profession' | 'company';
};

const CollaborateForm = () => {
  const navigation = useNavigation<any>();
  const isDark = true;
  const { show } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      contactNumber: '',
      contactEmail: '',
      type: 'profession',
      brief: '',
      subject: '',
      description: '',
    },
  });


  const onSubmit = async (data: FormValues) => {
    const payload = {
      name: data.name,
      contactNumber: data.contactNumber,
      contactEmail: data.contactEmail,
      type: data.type,
      brief: data.brief,
      subject: data.subject,
      description: data.description,
    };

    console.log("payload", payload)

    try {
      setLoading(true)
      const response: any = await api.post("/contact/collaboration", payload)

      console.log({ "response": response })

      show({
        type: 'success',
        title: 'Success',
        message: response?.data?.message || response?.message || 'Collaboration request submitted successfully.',
      });

      navigation.goBack();
    } catch (error: any) {
      show({
        type: 'error',
        title: 'Error',
        message: error?.response?.data?.message || error?.response?.message || error?.message || 'Something went wrong.',
      });
    } finally {
      setLoading(false)
    }
  };

  const renderInput = (
    name: keyof FormValues,
    label: string,
    props: any = {},
    rules: any = {},
  ) => (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value } }) => (
        <FloatingInputTwo
          label={label}
          value={value}
          onChangeText={text => {
            onChange(text);
          }}
          error={errors[name]?.message}
          {...props}
        />
      )}
    />
  );

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: isDark ? themeColors.black : themeColors.appBackground,
      }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
    >
      <SafeAreaView style={[styles.container]} edges={['top', 'left', 'right']}>
        <AuthHeader
          showBack
          title="Collaborate With Us"
          fontSize={18}
          onBack={() => navigation.goBack()}
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
          bounces={false}
          overScrollMode="auto"
          contentContainerStyle={{ paddingBottom: 50 }}
          scrollEventThrottle={16}
        >
          <SectionCard title="Collaborate With Us">
            {renderInput(
              'name',
              'Name *',
              {},
              {
                required: 'Name is required',
              },
            )}
            {renderInput(
              'contactNumber',
              'Contact Number *',
              {
                keyboardType: 'phone-pad',
                maxLength:10
              },
              {
                required: 'Phone number is required',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Invalid phone number',
                },
              },
            )}
            {renderInput(
              'contactEmail',
              'Contact Email *',
              {
                keyboardType: 'email-address',
              },
              {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email',
                },
              },
            )}
            <Text style={styles.label}>I am a *</Text>

            <Controller
              control={control}
              name="type"
              rules={{
                required: 'Please select one',
              }}
              render={({ field: { value, onChange } }) => {
                const options = [
                  { label: 'Professional', value: 'profession' },
                  { label: 'Company', value: 'company' },
                ];

                return (
                  <View style={styles.radioRow}>
                    {options.map(item => (
                      <TouchableOpacity
                        key={item.value}
                        style={styles.radioItem}
                        onPress={() => onChange(item.value)}
                      >
                        <View style={styles.radioOuter}>
                          {value === item.value && <View style={styles.radioInner} />}
                        </View>

                        <Text style={styles.radioText}>{item.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              }}
            />
            {errors.type && (
              <Text style={styles.error}>{errors.type.message}</Text>
            )}

            {renderInput(
              'brief',
              'Profession / Company Brief *',
              {
                keyboardType: 'default',
              },
              {
                required: 'Profession / Company Brief is required',
              },
            )}
            {renderInput(
              'subject',
              'Subject *',
              {
                keyboardType: 'default',
              },
              {
                required: 'Subject is required',
              },
            )}

            {renderInput(
              'description',
              'Description *',
              {
                multiline: true,
                height: 120,
                maxLength: 100,
              },
              {
                required: 'Description is required',

              },
            )}
          </SectionCard>



          <PrimaryButton
            title="Submit"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            disabled={loading}
          />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default CollaborateForm;

const SectionCard = ({ title, children }: any) => {
  const isDark = true;
  const cardBg = isDark ? '#1c1c1e' : themeColors.white;
  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      <Text style={[styles.cardTitle, { color: isDark ? '#fff' : '#000' }]}>
        {title}
      </Text>

      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: 14,
  },

  scroll: {
    marginHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
    fontWeight: '600',
  },

  card: {
    borderRadius: 16,
    padding: 16,
    // marginBottom: 18,
  },

  cardTitle: {
    fontSize: 16,
    fontFamily: Fonts.Bold,
    marginBottom: 12,
  },

  label: {
    color: '#fff',
    fontSize: 15,
    marginTop: 10,
    marginBottom: 12,
    fontFamily: Fonts.Medium,
  },

  radioRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },

  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 25,
  },

  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },

  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },

  radioText: {
    color: '#fff',
    marginLeft: 8,
    fontFamily: Fonts.Regular,
  },

  error: {
    color: '#ff4d4f',
    marginTop: -10,
    marginBottom: 12,
    fontSize: 12,
  },
});
