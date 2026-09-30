import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Animated,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  useColorScheme,
  Alert,
  Platform,
  Keyboard,
  StatusBar,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import Feather from '@react-native-vector-icons/feather';
import { themeColors } from '../../../../theme/colors';
import { Fonts } from '../../../../constants/Fonts';
import FloatingInputTwo from '../../../../components/Input/FloatingInputTwo';
import PrimaryButton from '../../../../components/Buttons/PrimaryButton';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { changePassword } from '../../../../redux/slices/profileSettingSlice';
import { logoutUser } from '../../../../redux/slices/authSlice';
import { useToast } from '../../../../components/Toast/ToastProvider';
import { useNavigation } from '@react-navigation/native';

const ChangePasswordModal = ({ visible, onClose }: any) => {
  const slideAnim = useRef(new Animated.Value(350)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();
  const isDark = true;
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<any>();
  const { show } = useToast();
  const navigation = useNavigation<any>();

  // const [loading, setLoading] = useState(false);

  const keyboardTranslateY = useRef(new Animated.Value(0)).current;
  const bgColor = isDark ? themeColors.background : themeColors.white;
  const textColor = isDark ? themeColors.white : themeColors.black;

  const { loading } = useSelector((state: any) => state.profileSetting);
  const [isLogout, setIsLogout] = useState(false);

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // ================= API CALLS =================
  const onSubmit = async (data: any) => {
    try {
      if (data.newPassword !== data.confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }

      await dispatch(
        changePassword({
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
          isLogout,
        }),
      ).unwrap();

      if (isLogout) {
        // Try logout but don't stop if it fails
        try {
          await dispatch(logoutUser()).unwrap();
        } catch (err) {
          console.log('Logout failed:', err);
        }

        navigation.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        });

        show({
          type: 'success',
          title: 'Password updated. Please login again.',
        });

        return;
      }

      // ✅ Normal password change
      show({
        type: 'success',
        title: 'Password updated successfully.',
      });

      reset();
      onClose();
    } catch (error: any) {
      console.log('error', error);
      show({
        type: 'error',
        title:
          error ||
          error?.message ||
          error?.error ||
          error?.response?.data?.message ||
          'Incorrect old password',
      });
    }
  };
  // ================= UI =================

  const renderContent = () => {
    return (
      <>
        {/* OLD PASSWORD */}
        <Controller
          control={control}
          name="oldPassword"
          rules={{ required: 'Old password required' }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <FloatingInputTwo
              value={value}
              onChangeText={onChange}
              label="Old Password"
              error={error?.message}
              secureTextEntry
              // backgroundColor={'transparent'}
            />
          )}
        />

        {/* NEW PASSWORD */}
        <Controller
          control={control}
          name="newPassword"
          rules={{
            required: 'New password required',

            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },

            maxLength: {
              value: 50,
              message: 'Password too long',
            },

            validate: {
              hasUpperCase: value =>
                /[A-Z]/.test(value) ||
                'Must contain at least one uppercase letter',

              hasLowerCase: value =>
                /[a-z]/.test(value) ||
                'Must contain at least one lowercase letter',

              hasNumber: value =>
                /[0-9]/.test(value) || 'Must contain at least one number',

              hasSpecialChar: value =>
                /[@$!%*?&]/.test(value) ||
                'Must contain at least one special character',

              notSameAsOld: value =>
                value !== getValues('oldPassword') ||
                'New password cannot be same as old password',
            },
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <FloatingInputTwo
              value={value}
              onChangeText={onChange}
              label="New Password"
              error={error?.message}
              secureTextEntry
            />
          )}
        />

        {/* CONFIRM PASSWORD */}
        <Controller
          control={control}
          name="confirmPassword"
          rules={{
            required: 'Confirm your password',
            validate: value =>
              value === getValues('newPassword') || 'Passwords do not match',
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <FloatingInputTwo
              value={value}
              onChangeText={onChange}
              label="Confirm Password"
              error={error?.message}
              secureTextEntry
              // backgroundColor={'transparent'}
            />
          )}
        />

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setIsLogout(prev => !prev)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderWidth: 1,
              borderColor: '#666',
              borderRadius: 4,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 10,
            }}
          >
            {isLogout && (
              <Feather name="check" size={14} color={themeColors.primary} />
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: themeColors.white,
                fontSize: 15,
                fontFamily: Fonts.Medium,
              }}
            >
              Logout of all devices
            </Text>

            <Text
              style={{
                color: '#888',
                marginTop: 2,
                fontSize: 13,
              }}
            >
              Ends all active sessions after password is created
            </Text>
          </View>
        </TouchableOpacity>

        <PrimaryButton
          title="Update Password"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
        />
      </>
    );
  };
  // ================= ANIMATION =================
  // ✅ FIX: Android keyboard support
  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, e => {
      Animated.timing(keyboardTranslateY, {
        toValue: -e.endCoordinates.height + 40,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      Animated.timing(keyboardTranslateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // ✅ Animation
  useEffect(() => {
    if (visible) {
      reset();

      // 🔥 RESET VALUES BEFORE ANIMATION
      slideAnim.setValue(350);
      fadeAnim.setValue(0);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 18,
          stiffness: 180,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 350,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // ================= RETURN =================

  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      statusBarTranslucent
      key={visible ? 'open' : 'closed'}
    >
      <StatusBar hidden translucent backgroundColor="transparent" />
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <Pressable
          style={{ flex: 1 }}
          onPress={() => {
            Keyboard.dismiss();
            // onClose();
          }}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          {
            marginBottom: Platform.OS === 'ios' ? 0 : 5 + insets.bottom, // 🔥 key fix
            backgroundColor: bgColor,
            transform: [
              {
                translateY: Animated.add(slideAnim, keyboardTranslateY),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
          <Feather name="x" size={23} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>

        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>
            Update Password
          </Text>
        </View>

        {renderContent()}
      </Animated.View>
    </Modal>
  );
};

export default ChangePasswordModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  scrollContent: {
    paddingBottom: 10,
  },
  sheet: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 10 : 5, // 🔥 IMPORTANT
    left: 10,
    right: 10,
    borderBottomLeftRadius: Platform.OS === 'ios' ? 50 : 20,
    borderBottomRightRadius: Platform.OS === 'ios' ? 50 : 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 20, // base padding
  },

  closeIcon: {
    position: 'absolute',
    top: 14,
    right: 10,
    zIndex: 20,
    backgroundColor: `${String(themeColors.primary)}15`,
    padding: 5,
    borderRadius: 100,
  },
  handle: {
    width: 42,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 4,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: { alignItems: 'center', marginBottom: 18 },
  walletIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: { fontSize: 20, fontFamily: Fonts.Bold },
  buttonRow: {
    marginTop: 15,
  },
  addBtn: {
    flex: 1,
    backgroundColor: themeColors.primary,
    paddingVertical: 12,
    borderRadius: 6,
  },
  addText: {
    textAlign: 'center',
    color: themeColors.white,
    fontSize: 17,
    fontFamily: Fonts.SemiBold,
  },
  passwordToggleIcon: {
    fontSize: 16,
  },

  otpLabel: {
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
    color: '#888',
  },

  otpBox: {
    width: 45,
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 4,
  },

  otpText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
