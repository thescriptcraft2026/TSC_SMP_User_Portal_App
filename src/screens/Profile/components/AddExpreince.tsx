import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import React, { useEffect, useMemo } from 'react';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import AuthHeader from '../../../components/Header/AuthHeader';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native';
import { themeColors } from '../../../theme/colors';
import { Fonts } from '../../../constants/Fonts';
import { useForm, Controller, useWatch } from 'react-hook-form';
import FloatingDropdown from '../../../components/DropDown/FloatingDropdown';
import PrimaryButton from '../../../components/Buttons/PrimaryButton';
import FloatingInputTwo from '../../../components/Input/FloatingInputTwo';
import { useDispatch, useSelector } from 'react-redux';
import { handleExperience } from '../../../redux/slices/profileSlice';
import { useToast } from '../../../components/Toast/ToastProvider';

const AddExpreince = () => {
  const navigation = useNavigation<any>();
  const isDark = true;
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<any>();
  const { show } = useToast();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: '',
      experience_years: '',
      experience_months: '',
      description: '',
    },
  });

  const selectedRole = useWatch({ control, name: 'role' });

  const { user: profileUser, loading } = useSelector(
    (state: any) => state.book,
  );
  const { loading: addLoading } = useSelector(
    (state: any) => state.book,
  );

  const backgroundColor = useMemo(
    () => (isDark ? themeColors.black : themeColors.appBackground),
    [isDark],
  );

  const cardBg = isDark ? '#1c1c1e' : themeColors.white;

  // ✅ Roles mapping
  const roleOptions = useMemo(() => {
    if (!profileUser?.roles?.length) return [];

    return profileUser.roles.map((item: any) => {
      const ur = item.UserRole;

      const hasExperience =
        ur &&
        (ur.description !== null ||
          ur.experience_years !== null ||
          ur.experience_months !== null);

      const suffix = hasExperience
        ? `Current: ${ur.experience_years ?? 0}y ${ur.experience_months ?? 0}m`
        : 'No experience';

      return {
        label: item.display_name || item.name,
        sublabel: suffix, // 👈 rendered separately in gray
        value: item.id,
      };
    });
  }, [profileUser?.roles]);

  // ✅ Auto-fill edit data
  useEffect(() => {
    if (!selectedRole || !profileUser?.roles?.length) return;

    const roleId = Number(selectedRole);

    // 🔥 ALWAYS get fresh data from Redux
    const selected = profileUser.roles.find((item: any) => item.id === roleId);

    console.log('✅ FINAL ROLE FROM REDUX 👉', selected);

    if (selected?.UserRole) {
      setValue(
        'experience_years',
        selected.UserRole.experience_years?.toString() || '',
      );
      setValue(
        'experience_months',
        selected.UserRole.experience_months?.toString() || '',
      );
      setValue('description', selected.UserRole.description || '');
    } else {
      setValue('experience_years', '');
      setValue('experience_months', '');
      setValue('description', '');
    }
  }, [selectedRole, profileUser?.roles]);

  // ✅ Submit
  const onSubmit = async (formData: any) => {
    try {
      const roleId =
        typeof formData.role === 'object' ? formData.role.id : formData.role;

      const payload = {
        experience_years: Number(formData.experience_years || 0),
        experience_months: Number(formData.experience_months || 0),
        description: formData.description,
      };

      await dispatch(
        handleExperience({
          role_id: roleId,
          data: payload,
        }),
      ).unwrap();

      show({ title: 'Experience saved successfully', type: 'success' });
      navigation.goBack();
    } catch (error: any) {
      show({
        title: error || 'Something went wrong',
        type: 'error',
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
        title="Add / Edit Experience"
        onBack={() => navigation.goBack()}
        fontSize={20}
      />

      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={Platform.OS === 'ios' ? 0 : 20}
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingBottom: insets.bottom + 10,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ROLE */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text style={styles.sectionTitle}>Role</Text>

          <Controller
            control={control}
            name="role"
            rules={{ required: 'Role is required' }}
            render={({ field: { onChange, value } }) => (
              <FloatingDropdown
                label="Select Role"
                value={value}
                onChange={(val: any) => {
                  const id = typeof val === 'object' ? val.id : val;
                  onChange(id);
                }}
                options={roleOptions}
                error={errors.role?.message}
              />
            )}
          />
        </View>

        {/* EXPERIENCE */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text style={styles.sectionTitle}>Years of Experience</Text>

          <Controller
            control={control}
            name="experience_years"
            render={({ field: { onChange, value } }) => (
              <FloatingInputTwo
                label="Enter years"
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
              />
            )}
          />

          <Controller
            control={control}
            name="experience_months"
            render={({ field: { onChange, value } }) => (
              <FloatingInputTwo
                label="Enter months"
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
              />
            )}
          />

          {errors.experience_years && (
            <Text style={styles.error}>{errors.experience_years.message}</Text>
          )}
          {errors.experience_months && (
            <Text style={styles.error}>{errors.experience_months.message}</Text>
          )}
        </View>

        {/* DESCRIPTION */}
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text style={styles.sectionTitle}>Description</Text>

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <FloatingInputTwo
                label="Enter Description"
                value={value}
                onChangeText={onChange}
                multiline
                height={100}
              />
            )}
          />

          {errors.description && (
            <Text style={styles.error}>{errors.description.message}</Text>
          )}
        </View>
      </KeyboardAwareScrollView>

      {/* BUTTON */}
      <View style={{ padding: 10, paddingBottom: insets.bottom }}>
        <PrimaryButton
          title={addLoading ? 'Saving...' : 'Save Experience'}
          onPress={handleSubmit(onSubmit)}
          disabled={addLoading}
          loading={addLoading}
        />
      </View>
    </SafeAreaView>
  );
};

export default AddExpreince;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.Bold,
    marginBottom: 12,
    color: '#fff',
  },

  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
});
