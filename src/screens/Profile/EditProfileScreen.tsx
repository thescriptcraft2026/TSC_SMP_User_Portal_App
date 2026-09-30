import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import AuthHeader from '../../components/Header/AuthHeader';
import { themeColors } from '../../theme/colors';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import FloatingInputTwo from '../../components/Input/FloatingInputTwo';
import { Fonts } from '../../constants/Fonts';
import FloatingDropdown from '../../components/DropDown/FloatingDropdown';
import DatePickerr from '../../components/Input/DatePicker';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import { updateProfile } from '../../redux/slices/profileSlice';
import { useToast } from '../../components/Toast/ToastProvider';
import countries from '../../assets/json/countries.json';

type FormValues = {
  name: string;
  short_bio: string;
  mobile: string;
  gender: string;
  dob: string;
  city: string;
  state: string;
  country: string;
  age: string;
};

const EditProfileScreen = () => {
  const navigation = useNavigation<any>();
  const isDark = true;
  const { show } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: any) => state.profile);
  const { loading } = useSelector((state: any) => state.profile);

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
      name: user?.name || '',
      short_bio: user?.short_bio || '',
      mobile: user?.phone || '',
      gender: user?.gender || '',
      dob: user?.dob || '',
      city: user?.city || '',
      state: user?.state || '',
      country: user?.country || '',
      age: '',
    },
  });

  const calculateAge = (dob: string) => {
    if (!dob) return '';

    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age.toString();
  };

  const dobValue = watch('dob');
  useEffect(() => {
    const age = calculateAge(dobValue);
    setValue('age', age);
  }, [dobValue]);

  const formatToISO = (date: any) => {
    if (!date) return null;

    const d = new Date(date);
    return d.toISOString(); // ✅ FULL ISO
  };

  const countryOptions = countries
    .map((item: any) => ({
      label: item.name,
      value: item.name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));


  const onSubmit = async (data: any) => {
    try {
      const payload = {
        name: data.name,
        short_bio: data.short_bio,
        phone: data.mobile,
        gender: data.gender?.toLowerCase(),
        dob: formatToISO(data.dob),
        city: data.city,
        state: data.state,
        country: data.country,
      };

      console.log('FINAL PAYLOAD:', payload);

      const res = await dispatch(updateProfile(payload)).unwrap();

      console.log('update profile res', res);

      show({
        type: 'success',
        title: 'Profile updated successfully!',
      });

      navigation.goBack();
    } catch (error: any) {
      console.log('UPDATE ERROR:', error);

      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        error ||
        'Something went wrong';

      show({
        type: 'error',
        title: errorMessage,
      });

      return;
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
          title="Edit Profile"
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
          <SectionCard title="Basic Info">
            {renderInput(
              'name',
              'Profile Name',
              {},
              {
                required: 'Profile name is required',
              },
            )}

            {renderInput(
              'short_bio',
              'Short Bio',
              {
                multiline: true,
                height: 80,
                maxLength: 100,
                showBottomText:true,
                bottomText:`${watch('short_bio')?.length}/100`,
                bottomTextStyle:{
                  marginTop:5
                }
              },
              {
                required: 'Short bio is required',
                minLength: {
                  value: 10,
                  message: 'Short bio must be at least 10 characters',
                },
              },
            )}

            {renderInput(
              'mobile',
              'Phone Number',
              {
                keyboardType: 'phone-pad',
              },
              {
                required: 'Phone number is required',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Invalid phone number',
                },
              },
            )}
          </SectionCard>

          <SectionCard title="Personal Info">
            <Controller
              control={control}
              name="gender"
              rules={{ required: 'Gender is required' }}
              render={({ field: { onChange, value } }) => (
                <FloatingDropdown
                  label="Gender"
                  value={value}
                  onChange={onChange}
                  options={[
                    { label: 'Male', value: 'Male' },
                    { label: 'Female', value: 'Female' },
                    { label: 'Other', value: 'Other' },
                  ]}
                />
              )}
            />

            <Controller
              control={control}
              name="dob"
              rules={{ required: 'Date of birth is required' }}
              render={({ field: { onChange, value } }) => (
                <DatePickerr
                  label="Date of Birth"
                  value={value}
                  onChange={onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="age"
              render={({ field: { value } }) => (
                <FloatingInputTwo
                  label="Age"
                  value={value}
                  editable={false} // 🔥 readonly
                />
              )}
            />
          </SectionCard>

          <SectionCard title="Location">
            {renderInput(
              'city',
              'City',
              {},
              {
                required: 'City is required',
              },
            )}
            {renderInput(
              'state',
              'State',
              {},
              {
                required: 'State is required',
              },
            )}
            <Controller
              control={control}
              name="country"
              rules={{
                required: 'Country is required',
              }}
              render={({ field: { onChange, value } }) => (
                <FloatingDropdown
                  label="Country"
                  value={value}
                  onChange={onChange}
                  options={countryOptions}
                  error={errors.country?.message}
                  searchable
                />
              )}
            />
          </SectionCard>

          <PrimaryButton
            title="Save"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            disabled={loading}
          />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default EditProfileScreen;

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
    marginBottom: 18,
  },

  cardTitle: {
    fontSize: 16,
    fontFamily: Fonts.Bold,
    marginBottom: 12,
  },
});
