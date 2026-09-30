import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
  Keyboard,
  useColorScheme,
  Image,
  ImageBackground,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@react-native-vector-icons/feather';

import FloatingInput from '../../components/Input/FloatingInput';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import { Fonts } from '../../constants/Fonts';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword } from '../../redux/slices/authSlice';
import { useToast } from '../../components/Toast/ToastProvider';
import { scaleSize, verticalScaleSize } from '../../utils/responsive';

const ResetPassword = ({ navigation, route }: any) => {
  const isDark = useColorScheme() === 'dark';
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const dispatch = useDispatch<any>();
  const { loading } = useSelector((state: any) => state.auth);
  const { token } = route.params || {};
  const { show } = useToast();

  console.log('TOKEN:', route?.params?.token);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password');

  const cardBg = 'rgba(27,27,27,0.9)';
  const textColor = '#fff';
  const subText = '#aaa';

  const onSubmit = async (data: any) => {
    try {
      if (!route?.params?.token) {
        Alert.alert('Error', 'Token missing. Please try again.');
        return;
      }

      const payload = {
        token: token, // ✅ correct
        password: data.password, // 🔥 FIXED (not new_password)
        confirm_password: data.confirmPassword,
      };

      console.log('RESET PAYLOAD:', payload);

      let res = await dispatch(resetPassword(payload)).unwrap();
      console.log('reset password res', res?.data);

      show({
        type: 'success',
        title: 'Password reset successfully',
      });

      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error: any) {
      console.log('RESET ERROR:', error);
      show({
        type: 'error',
        title: error,
      });
    }
  };

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });

    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={verticalScaleSize(30)}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        overScrollMode="auto"
      >
        <View style={{ flex: 1 }}>
          {/* HEADER */}
          <ImageBackground
            style={styles.topSection}
            source={require('../../assets/images/freepik__talk__6414-removebg-preview.png')}
            imageStyle={styles.bgImage}
          >
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Feather name="arrow-left" size={22} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.heading}>
              Create new password{'\n'}
              <Text style={{ fontWeight: 'bold' }}>
                secure your{'\n'}account again.
              </Text>
            </Text>

            <Image
              source={require('../../assets/images/camera.png')}
              style={styles.phoneImage}
            />
          </ImageBackground>

          {/* CARD */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.title, { color: textColor }]}>
              Reset Password
            </Text>

            <Text style={[styles.description, { color: subText }]}>
              Your new password must be different from previously used
              passwords.
            </Text>

            {/* PASSWORD */}
            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Password is required',
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
                },
              }}
              render={({ field: { onChange, value } }) => (
                <>
                  <FloatingInput
                    label="New Password"
                    value={value}
                    onChangeText={onChange}
                    secure
                  />
                  {errors.password && (
                    <Text style={styles.error}>{errors.password.message}</Text>
                  )}
                </>
              )}
            />

            {/* CONFIRM PASSWORD */}
            <Controller
              control={control}
              name="confirmPassword"
              rules={{
                required: 'Confirm your password',
                validate: value =>
                  value === passwordValue || 'Passwords do not match',
              }}
              render={({ field: { onChange, value } }) => (
                <>
                  <FloatingInput
                    label="Confirm Password"
                    value={value}
                    onChangeText={onChange}
                    secure
                  />
                  {errors.confirmPassword && (
                    <Text style={styles.error}>
                      {errors.confirmPassword.message}
                    </Text>
                  )}
                </>
              )}
            />

            <PrimaryButton
              title={loading ? 'Resetting...' : 'Reset Password'}
              disabled={loading}
              onPress={handleSubmit(onSubmit)}
              loading={loading}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  topSection: {
    height:
      Platform.OS === 'ios' ? verticalScaleSize(450) : verticalScaleSize(350),
    justifyContent: 'flex-start',
  },
  bgImage: {
    opacity: 0.25,
  },

  heading: {
    color: '#fff',
    fontSize: 26,
    fontFamily: Fonts.Bold,
    lineHeight: 36,
    marginTop: 100,
    paddingHorizontal: 30,
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#ddd',

    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  phoneImage: {
    width: 180,
    height: 220,
    resizeMode: 'contain',
    position: 'absolute',
    bottom: -25,
    left: -35,
    transform: [{ rotate: '-12deg' }],
    opacity: 0.45,
  },

  lottie: {
    width: 270,
    height: 270,
    position: 'absolute',
    bottom: -50,
    right: -80,
  },

card: {
  minHeight: '100%',
  borderTopLeftRadius: scaleSize(40),
  borderTopRightRadius: scaleSize(40),
  padding: scaleSize(25),

  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.06)',

  shadowColor: '#000',
  shadowOpacity: 0.3,
  shadowRadius: scaleSize(10),
  shadowOffset: {
    width: 0,
    height: -verticalScaleSize(4),
  },

  elevation: 10,
},

  title: {
    fontSize: 28,
    fontFamily: Fonts.Bold,
    textAlign: 'center',
  },

  description: {
    textAlign: 'center',
    marginVertical: 15,
    fontSize: 14,
    fontFamily: Fonts.Regular,
  },

  error: {
    color: '#ff4d4f',
    fontSize: 12,
    marginBottom: 10,
    marginTop: -6,
    fontFamily: Fonts.Regular,
  },
});
