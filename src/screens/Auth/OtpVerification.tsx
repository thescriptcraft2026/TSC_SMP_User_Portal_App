import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  Image,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
  Keyboard,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { OtpInput } from 'react-native-otp-entry';
import LottieView from 'lottie-react-native';
import Feather from '@react-native-vector-icons/feather';
import { useForm, Controller } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import PrimaryButton from '../../components/Buttons/PrimaryButton';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import { useDispatch, useSelector } from 'react-redux';
import {
  getUserThunk,
  resendOtp,
  verifyForgotOtp,
  verifyOtp,
} from '../../redux/slices/authSlice';
import { useToast } from '../../components/Toast/ToastProvider';
import { scaleSize, verticalScaleSize } from '../../utils/responsive';

const OtpVerification = ({ navigation, route }: any) => {
  const isDark = useColorScheme() === 'dark';
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const { flow } = route.params || {};
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const { show } = useToast();

  const cardBg = 'rgba(27,27,27,0.9)';
  const textColor = '#fff';
  const subText = '#aaa';

  const dispatch = useDispatch<any>();
  const { loading } = useSelector((state: any) => state.auth);

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

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      otp: '',
    },
  });

  const handleVerify = async (data: any) => {
    try {
      // ================= SIGNUP FLOW =================
      if (flow === 'signup') {
        if (!route?.params?.email) {
          Alert.alert('Error', 'Identifier missing');
          return;
        }

        const payload = {
          code: data.otp,
          email: route.params.email,
        };

        console.log('SIGNUP PAYLOAD:', payload);

        // Verify OTP
        await dispatch(verifyOtp(payload)).unwrap();

        // Wait for token persistence
        await new Promise(resolve => setTimeout(resolve, 800));

        // Get latest user
        const userRes: any = await dispatch(getUserThunk()).unwrap();

        console.log('GET USER RES:', userRes);

        show({
          type: 'success',
          title: 'OTP Verified Successfully',
        });

        // ================= NAVIGATION =================

        // Bio not completed
        if (!userRes?.bio?.trim()) {
          navigation.replace('BioSetup');
          return;
        }

        // Roles not completed
        if (!userRes?.added_primary_roles || !userRes?.added_secondary_roles) {
          navigation.replace('RoleSetup');
          return;
        }

        // Setup completed
        navigation.reset({
          index: 0,
          routes: [{ name: 'App' }],
        });

        return;
      }

      // ================= FORGOT PASSWORD FLOW =================
      if (flow === 'forgotPassword') {
        if (!route?.params?.user_id) {
          Alert.alert('Error', 'User ID missing');
          return;
        }

        const payload = {
          user_id: route.params.user_id,
          otp: String(data.otp),
        };

        const res = await dispatch(verifyForgotOtp(payload)).unwrap();

        show({
          type: 'success',
          title: 'OTP Verified Successfully',
        });

        navigation.navigate('ResetPassword', {
          token: res?.data,
        });

        return;
      }
    } catch (error: any) {
      console.log('OTP ERROR:', error);

      show({
        type: 'error',
        title:
          error?.response?.data?.message ||
          error?.message ||
          'Something went wrong',
      });
    }
  };

  const handleResend = async () => {
    try {
      let payload;

      if (flow === 'signup') {
        // 🔥 SIGNUP FLOW
        if (!route?.params?.email) {
          Alert.alert('Error', 'Email missing');
          return;
        }

        payload = {
          email: route.params.email,
          type: 'register',
        };
      } else if (flow === 'forgotPassword') {
        // 🔥 FORGOT PASSWORD FLOW
        if (!route?.params?.user_id) {
          Alert.alert('Error', 'User ID missing');
          return;
        }

        payload = {
          user_id: route.params.user_id,
          type: 'forgot_password',
        };
      }

      console.log('RESEND PAYLOAD:', payload);

      let res = await dispatch(resendOtp(payload)).unwrap();
      console.log('res', res);

      setTimer(30);
      setCanResend(false);
      show({
        type: 'success',
        title: 'OTP Resent Successfully',
      });
    } catch (error: any) {
      console.log('RESEND ERROR:', error);

      show({
        type: 'error',
        title: error,
      });
    }
  };

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

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
              Verify your identity{'\n'}
              <Text style={{ fontFamily: Fonts.Bold, }}>
                enter the code{'\n'}we sent you.
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
              OTP Verification
            </Text>

            <Text style={[styles.description, { color: subText }]}>
              Enter the 6-digit verification code sent to your email or phone.
            </Text>

            <Controller
              control={control}
              name="otp"
              rules={{
                required: 'OTP is required',
                minLength: {
                  value: 6,
                  message: 'Enter 6 digit OTP',
                },
              }}
              render={({ field: { onChange, value } }) => (
                <OtpInput
                  numberOfDigits={6}
                  focusColor={themeColors.primary}
                  onTextChange={onChange}
                  theme={{
                    pinCodeContainerStyle: styles.otpBox,
                    pinCodeTextStyle: styles.otpText,
                  }}
                />
              )}
            />
            {errors.otp && (
              <Text style={{ color: 'red', marginTop: 10 }}>
                {errors.otp.message}
              </Text>
            )}

            <PrimaryButton
              title={loading ? 'Verifying...' : 'Verify Code'}
              onPress={handleSubmit(handleVerify)}
              disabled={loading}
              loading={loading}
            />

            {/* Resend */}
            <View style={styles.bottomRow}>
              <Text style={[styles.bottomText, { color: subText }]}>
                Didn’t receive the code?
              </Text>
              <TouchableOpacity
                style={{ marginLeft: 5 }}
                onPress={handleResend}
                disabled={!canResend}
              >
                <Text
                  style={[styles.resendText, { opacity: canResend ? 1 : 0.5 }]}
                >
                  {canResend ? 'Resend' : `Resend in ${timer}s`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default OtpVerification;

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

  otpBox: {
    width: 45,
    height: 45,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#ccc',
  },

  otpText: {
    fontSize: 20,
    fontFamily: Fonts.Bold,
    color: themeColors.primary,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },

  bottomText: {
    fontFamily: Fonts.Regular,
  },

  resendText: {
    color: themeColors.primary,
    fontFamily: Fonts.Bold,
  },
});
