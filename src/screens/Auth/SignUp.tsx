import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
  useColorScheme,
  Image,
  ImageBackground,
  Linking,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';

import { SafeAreaView } from 'react-native-safe-area-context';

import FloatingInput from '../../components/Input/FloatingInput';
import PrimaryButton from '../../components/Buttons/PrimaryButton';

import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import Feather from '@react-native-vector-icons/feather';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch, useSelector } from 'react-redux';
import {
  getUserNameSuggestion,
  signup,
} from '../../redux/slices/authSlice';
import { useToast } from '../../components/Toast/ToastProvider';

const SignUp = ({ navigation }: any) => {
  const isDark = useColorScheme() === 'dark';
  const cardBg = 'rgba(27,27,27,0.9)';
  const textColor = '#fff';
  const subText = '#aaa';
  const dispatch = useDispatch<any>();
  const { loading } = useSelector((state: any) => state.auth);
  const { show } = useToast();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const handleSignup = async (data: any) => {
    try {
      const payload = {
        name: data.name,
        email: data.email,
        user_name: data.username,
        password: data.password,
        confirm_password: data.confirmPassword,
      };

      const res = await dispatch(signup(payload)).unwrap();

      console.log('sign up res', res?.data);

      navigation.navigate('OTP', { flow: 'signup', email: data.email });
      show({
        type: 'success',
        title: 'Otp Sent successfully!',
      });
    } catch (error: any) {
      console.log('sign up', error);
      show({
        type: 'error',
        title: error,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar translucent={false} barStyle={'light-content'} />
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
            Join the community{'\n'}
            <Text style={{ fontWeight: 'bold' }}>
              connect and grow{'\n'}your network.
            </Text>
          </Text>

          <Image
            source={require('../../assets/images/camera.png')}
            style={styles.phoneImage}
          />
        </ImageBackground>
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          enableOnAndroid
          extraScrollHeight={30}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          overScrollMode="auto"
        >
          {/* CARD */}
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.title, { color: textColor }]}>
              Create Account
            </Text>

            <Text style={[styles.description, { color: subText }]}>
              Sign up to start connecting with professionals.
            </Text>

            <Controller
              control={control}
              name="name"
              rules={{
                required: 'Full name is required',

                validate: value => {
                  const name = value?.trim();

                  // ❌ empty spaces only
                  if (!name) {
                    return 'Full name is required';
                  }

                  // ❌ minimum length
                  if (name.length < 2) {
                    return 'Name must be at least 2 characters';
                  }

                  // ❌ only letters and spaces
                  if (!/^[a-zA-Z\s]+$/.test(name)) {
                    return 'Only letters allowed';
                  }

                  return true;
                },
              }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <FloatingInput
                  label="Full Name"
                  value={value}
                  onChangeText={onChange}
                  error={error?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="username"
              rules={{
                required: 'Username is required',

                validate: value => {
                  const username = value?.trim();

                  // ❌ cannot start with special character
                  if (!/^[a-zA-Z0-9]/.test(username)) {
                    return 'Username cannot start with special characters';
                  }

                  // ❌ only allow letters numbers underscore dot
                  if (!/^[a-zA-Z0-9._]+$/.test(username)) {
                    return 'Only letters, numbers, . and _ allowed';
                  }

                  // ❌ prevent consecutive special chars
                  if (/(\.\.)|(__)|(\._)|(_\.)/.test(username)) {
                    return 'Consecutive special characters are not allowed';
                  }

                  // ❌ minimum length
                  if (username.length < 3) {
                    return 'Minimum 3 characters required';
                  }

                  return true;
                },
              }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <FloatingInput
                  label="Username"
                  value={value}
                  onChangeText={onChange}
                  error={error?.message}
                  checkUsername
                  onUsernameCheck={async (username: string) => {
                    return await dispatch(
                      getUserNameSuggestion(username),
                    ).unwrap();
                  }}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: 'Enter a valid email',
                },
              }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <FloatingInput
                  label="Email"
                  value={value}
                  onChangeText={onChange}
                  error={error?.message}
                />
              )}
            />

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
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <FloatingInput
                  label="Password"
                  value={value}
                  onChangeText={text => onChange(text.replace(/\s/g, ''))}
                  secure
                  error={error?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              rules={{
                required: 'Confirm password is required',
                validate: value => {
                  const confirm = value?.trim();

                  if (!confirm) {
                    return 'Confirm password is required';
                  }

                  if (confirm !== password) {
                    return 'Passwords do not match';
                  }

                  return true;
                },
              }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <FloatingInput
                  label="Confirm Password"
                  value={value}
                  onChangeText={text => onChange(text.replace(/\s/g, ''))}
                  secure
                  error={error?.message}
                />
              )}
            />

            <PrimaryButton
              title={loading ? 'Creating Account...' : 'Create Account'}
              onPress={handleSubmit(handleSignup)}
              disabled={loading}
              loading={loading}
            />

            {/* Login */}
            <View style={styles.bottomRow}>
              <Text style={[styles.bottomText, { color: subText }]}>
                Already have an account?
              </Text>

              <Text
                style={styles.loginText}
                onPress={() => navigation.goBack()}
              >
                {' '}
                Login
              </Text>
            </View>

            {/* Terms */}
            <Text
              style={[styles.footerText, { color: isDark ? '#bbb' : '#888' }]}
            >
              By signing up, you agree to our{' '}
              <Text
                style={styles.footerLink}
                onPress={() =>
                  Linking.openURL('https://thescriptcraft.com/terms-conditions')
                }
              >
                Terms
              </Text>{' '}
              and{' '}
              <Text
                style={styles.footerLink}
                onPress={() =>
                  Linking.openURL('https://thescriptcraft.com/privacy-policy')
                }
              >
                Privacy Policy
              </Text>
              .
            </Text>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </SafeAreaView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  topSection: {
    height: Platform.OS === 'ios' ? 200 : 200,
    justifyContent: 'flex-start',
  },

  bgImage: {
    opacity: 0.25,
  },

  heading: {
    color: '#fff',
    fontSize: 22,
    fontFamily: Fonts.Bold,
    lineHeight: 22,
    marginTop: 110,
    paddingHorizontal: 25,
    zIndex: 999,
  },

  phoneImage: {
    width: 150,
    height: 180,
    resizeMode: 'contain',
    position: 'absolute',
    bottom: -50,
    right: -25,
    transform: [{ rotate: '16deg' }, { scaleX: -1 }],
    opacity: 0.45,
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

  card: {
    minHeight: Platform.OS === 'ios' ? '100%' : '100%',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 25,

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',

    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },

    elevation: 10,
  },

  title: {
    fontSize: 28,
    fontFamily: Fonts.Bold,
    textAlign: 'center',
  },

  description: {
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 14,
    fontFamily: Fonts.Regular,
  },

  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },

  orText: {
    marginHorizontal: 10,
    fontSize: 12,
    fontFamily: Fonts.Medium,
  },

  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },

  socialBtn: {
    flex: 1,
    borderWidth: 0.5,
    padding: 12,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  socialText: {
    marginLeft: 6,
    fontFamily: Fonts.Medium,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },

  bottomText: {
    fontFamily: Fonts.Regular,
  },

  loginText: {
    color: themeColors.primary,
    fontFamily: Fonts.Bold,
  },

  footerText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
    fontFamily: Fonts.Regular,
  },

  footerLink: {
    color: themeColors.primary,
    fontFamily: Fonts.Bold,
  },
});
