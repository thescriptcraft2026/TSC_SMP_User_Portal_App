import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  ImageBackground,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller, useForm } from 'react-hook-form';
import FloatingInput from '../../components/Input/FloatingInput';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import FastImage from 'react-native-fast-image';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch } from 'react-redux';
import {
  appleLogin,
  getUserThunk,
  googleLogin,
  login,
  sendLoginPhoneOtp,
  updateProfile,
  verifyLoginPhoneOtp,
} from '../../redux/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useToast } from '../../components/Toast/ToastProvider';
import api from '../../../Instance/Instance';
import { CommonActions } from '@react-navigation/native';
import { reset as resetRoot } from '../../../navigationRef';
import {
  clearPendingDeepLink,
  getPendingDeepLink,
} from '../../utils/deepLinkStore';
import { handleDeepLink } from '../../utils/handleDeepLink';
import Google from '../../assets/SVG/Google';
import AppleLogo from '../../assets/SVG/AppleLogo';
import {
  signInWithGoogle,
  statusCodes,
} from '../../services/googleAuthService';
import { signInWithApple } from '../../services/appleAuthService';
import { getFcmToken } from '../../services/notificationService';

import { Dimensions } from 'react-native';
import { scaleSize, verticalScaleSize } from '../../utils/responsive';
import MobileVerificationModal from './components/MobileVerificationModal';

const { height } = Dimensions.get('window');

const guidelineBaseHeight = 812;

export const verticalScale = (size: number) =>
  (height / guidelineBaseHeight) * size;

const Login = ({ navigation, route }: any) => {
  const dispatch = useDispatch<any>();
  const { show } = useToast();
  const [loginLoading, setLoginLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [showMobileVerification, setShowMobileVerification] = useState(false);
  const [pendingRouteName, setPendingRouteName] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);
  const [pendingPhone, setPendingPhone] = useState('');
  const [pendingCountryCode, setPendingCountryCode] = useState('+91');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const cardBg = 'rgba(27,27,27,0.9)';
  const textColor = '#fff';
  const subText = '#aaa';

  const normalizeUser = (payload: any) =>
    payload?.data?.user || payload?.user || payload?.data || payload;

  const getUserId = (user: any) => {
    const rawId = user?.id || user?.user_id || user?.userId || user?.UserId;
    const parsedId = Number(rawId);
    return Number.isFinite(parsedId) && parsedId > 0 ? parsedId : null;
  };

  const isPhoneVerified = (user: any) =>
    user?.phone_verified === true ||
    user?.phone_verified === 1 ||
    user?.phone_verified === '1' ||
    String(user?.phone_verified).toLowerCase() === 'true';

  const extractPhoneDetails = (user: any) => {
    const rawPhone =
      user?.mobile ||
      user?.phone ||
      user?.phone_number ||
      user?.mobile_number ||
      '';
    const country =
      user?.country_code ||
      user?.countryCode ||
      user?.mobile_country_code ||
      user?.country ||
      '+91';

    return {
      phone: String(rawPhone).replace(/[^0-9]/g, '').slice(0, 15),
      countryCode: String(country).startsWith('+')
        ? String(country)
        : `+${String(country).replace(/[^0-9]/g, '').slice(0, 4) || '91'}`,
    };
  };

  useEffect(() => {
    const params = route?.params;
    if (!params?.requireMobileVerification) return;

    const user = params.verificationUser || {};
    const { phone, countryCode } = extractPhoneDetails(user);

    setPendingRouteName('App');
    setPendingUserId(getUserId(user));
    setPendingPhone(phone);
    setPendingCountryCode(countryCode);
    setShowMobileVerification(true);

    navigation.setParams({
      requireMobileVerification: undefined,
      verificationUser: undefined,
    });
  }, [navigation, route?.params]);

  const requestMobileVerification = (routeName: string, user: any) => {
    const { phone, countryCode } = extractPhoneDetails(user);
    const userId = getUserId(user);

    if (phone && (countryCode !== '+91' || isPhoneVerified(user))) {
      if (routeName === 'App') {
        resetRoot('App', {
          screen: 'BottomTab',
          params: { screen: 'Feed' },
        });

        const pendingUrl = getPendingDeepLink();
        if (pendingUrl) {
          clearPendingDeepLink();
          setTimeout(() => {
            handleDeepLink(pendingUrl);
          }, 400);
        }

        show({
          type: 'success',
          title: 'Login Successful',
        });
        return;
      }

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: routeName }],
        }),
      );

      show({
        type: 'success',
        title: 'Login Successful',
      });
      return;
    }

    setPendingRouteName(routeName);
    setPendingUserId(userId);
    setPendingPhone(phone);
    setPendingCountryCode(countryCode);
    setShowMobileVerification(true);
  };

  const routeAfterLogin = (user: any) => {
    const hasPrimaryRoles = user?.added_primary_roles === true;
    const hasSecondaryRoles = user?.added_secondary_roles === true;
    const hasUserName = user?.user_name;

    if (!hasUserName) {
      requestMobileVerification('AddUserName', user);
      return;
    }

    if (!hasPrimaryRoles || !hasSecondaryRoles) {
      requestMobileVerification('RoleSetup', user);
      return;
    }

    if (!user?.bio?.trim()) {
      requestMobileVerification('BioSetup', user);
      return;
    }

    requestMobileVerification('App', user);
  };

  const continueAfterMobileVerification = async () => {
    setShowMobileVerification(false);

    try {
      await dispatch(getUserThunk()).unwrap();
    } catch (error) {
      console.log('GET USER AFTER MOBILE VERIFICATION FAILED =>', error);
    }

    if (!pendingRouteName) return;

    if (pendingRouteName === 'App') {
      resetRoot('App', {
        screen: 'BottomTab',
        params: { screen: 'Feed' },
      });

      const pendingUrl = getPendingDeepLink();
      if (pendingUrl) {
        clearPendingDeepLink();
        setTimeout(() => {
          handleDeepLink(pendingUrl);
        }, 400);
      }

      show({
        type: 'success',
        title: 'Login Successful',
      });
      return;
    }

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: pendingRouteName }],
      }),
    );

    show({
      type: 'success',
      title: 'Login Successful',
    });
  };

  const sendExistingUserMobileOtp = async (
    phone: string,
    countryCode: string,
  ) => {
    if (!pendingUserId) {
      throw new Error('User session missing. Please login again.');
    }

    return await dispatch(
      sendLoginPhoneOtp({
        user_id: pendingUserId,
        phone,
        country_code: countryCode,
      }),
    ).unwrap();
  };

  const verifyExistingUserMobileOtp = async (code: string) => {
    if (!pendingUserId) {
      throw new Error('User session missing. Please login again.');
    }

    const res = await dispatch(
      verifyLoginPhoneOtp({
        user_id: pendingUserId,
        code,
      }),
    ).unwrap();

    const accessToken = res?.data?.accessToken || res?.accessToken;
    const refreshToken = res?.data?.refreshToken || res?.refreshToken;

    if (accessToken && refreshToken) {
      await AsyncStorage.setItem('userAccessToken', accessToken);
      await AsyncStorage.setItem('userRefreshToken', refreshToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }

    return res;
  };

  const saveInternationalMobile = async (
    phone: string,
    countryCode: string,
  ) => {
    await dispatch(
      updateProfile({
        phone,
        country_code: countryCode,
        country: countryCode,
      }),
    ).unwrap();
  };

  const showMobileVerificationError = (message: string) => {
    show({
      type: 'error',
      title: message,
    });
  };

  const handleGoogleLogin = async () => {
    if (loginLoading || googleLoading) return;

    try {
      setGoogleLoading(true);

      const idToken = await signInWithGoogle();
      console.log('Google Sign-In returned idToken, calling backend...');

      const res = await dispatch(
        googleLogin({ id_token: idToken }),
      ).unwrap();

      const accessToken = res?.data?.accessToken || res?.accessToken;
      const refreshToken = res?.data?.refreshToken || res?.refreshToken;

      if (!accessToken || !refreshToken) {
        throw new Error(res?.message || 'Google authentication failed.');
      }

      await AsyncStorage.setItem('userAccessToken', accessToken);
      await AsyncStorage.setItem('userRefreshToken', refreshToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      getFcmToken().catch(err =>
        console.log('Error registering FCM token on Google login:', err),
      );

      const profileRes = await dispatch(getUserThunk()).unwrap();
      const user = profileRes?.data || profileRes;

      const hasPrimary = user?.added_primary_roles === true;
      const hasSecondary = user?.added_secondary_roles === true;
      const hasUserName = !!user?.user_name;
      const hasBio = !!user?.bio?.trim();

      if (!isPhoneVerified(user)) {
        requestMobileVerification('App', user);
        return;
      }

      if (!hasUserName) {
        resetRoot('Auth', { screen: 'AddUserName' });
        return;
      }

      if (!hasPrimary) {
        resetRoot('Auth', { screen: 'RoleSetup' });
        return;
      }

      if (!hasSecondary) {
        resetRoot('Auth', {
          screen: 'RoleSetup',
          params: { step: 3 },
        });
        return;
      }

      if (!hasBio) {
        resetRoot('Auth', { screen: 'BioSetup' });
        return;
      }

      resetRoot('App', {
        screen: 'BottomTab',
        params: { screen: 'Feed' },
      });

      const pendingUrl = getPendingDeepLink();
      if (pendingUrl) {
        clearPendingDeepLink();
        setTimeout(() => {
          handleDeepLink(pendingUrl);
        }, 400);
      }

      show({
        type: 'success',
        title: 'Login Successful',
      });
    } catch (error: any) {
      console.log('Google login error:', error);

      if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
        return;
      }

      if (error?.code === statusCodes.IN_PROGRESS) {
        return;
      }

      if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        show({
          type: 'error',
          title: 'Google Play Services is not available or outdated.',
        });
        return;
      }

      const errorMessage =
        error?.message ||
        error?.data?.message ||
        error?.payload?.message ||
        'Google Login failed';

      show({
        type: 'error',
        title: errorMessage,
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    if (loginLoading || googleLoading || appleLoading) return;

    try {
      setAppleLoading(true);

      const applePayload = await signInWithApple();
      console.log('Apple Sign-In returned payload, calling backend...');

      const res = await dispatch(appleLogin(applePayload)).unwrap();

      const accessToken = res?.data?.accessToken || res?.accessToken;
      const refreshToken = res?.data?.refreshToken || res?.refreshToken;

      if (!accessToken || !refreshToken) {
        throw new Error(res?.message || 'Apple authentication failed.');
      }

      await AsyncStorage.setItem('userAccessToken', accessToken);
      await AsyncStorage.setItem('userRefreshToken', refreshToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      getFcmToken().catch(err =>
        console.log('Error registering FCM token on Apple login:', err),
      );

      const profileRes = await dispatch(getUserThunk()).unwrap();
      const user = profileRes?.data || profileRes;

      const hasPrimary = user?.added_primary_roles === true;
      const hasSecondary = user?.added_secondary_roles === true;
      const hasUserName = !!user?.user_name;
      const hasBio = !!user?.bio?.trim();

      if (!isPhoneVerified(user)) {
        requestMobileVerification('App', user);
        return;
      }

      if (!hasUserName) {
        resetRoot('Auth', { screen: 'AddUserName' });
        return;
      }

      if (!hasPrimary) {
        resetRoot('Auth', { screen: 'RoleSetup' });
        return;
      }

      if (!hasSecondary) {
        resetRoot('Auth', {
          screen: 'RoleSetup',
          params: { step: 3 },
        });
        return;
      }

      if (!hasBio) {
        resetRoot('Auth', { screen: 'BioSetup' });
        return;
      }

      resetRoot('App', {
        screen: 'BottomTab',
        params: { screen: 'Feed' },
      });

      const pendingUrl = getPendingDeepLink();
      if (pendingUrl) {
        clearPendingDeepLink();
        setTimeout(() => {
          handleDeepLink(pendingUrl);
        }, 400);
      }

      show({
        type: 'success',
        title: 'Login Successful',
      });
    } catch (error: any) {
      console.log('Apple login error:', error);

      if (
        error?.code === '1001' ||
        error?.message?.includes('cancelled') ||
        error?.message?.includes('canceled')
      ) {
        return;
      }

      const errorMessage =
        error?.message ||
        error?.data?.message ||
        error?.payload?.message ||
        'Apple Login failed';

      show({
        type: 'error',
        title: errorMessage,
      });
    } finally {
      setAppleLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    if (loginLoading) return;

    setLoginLoading(true);
    try {
      const payload = {
        identifier: data.identifier.trim(),
        password: data.password,
      };

      // ✅ LOGIN API
      const res = await dispatch(login(payload)).unwrap();

      console.log('LOGIN RESPONSE =>', res);

      // ✅ TOKEN EXTRACTION
      const accessToken = res?.data?.accessToken || res?.accessToken;

      const refreshToken = res?.data?.refreshToken || res?.refreshToken;

      if (!accessToken || !refreshToken) {
        throw new Error('Tokens not found in response');
      }

      // ✅ SAVE TOKENS
      await AsyncStorage.setItem('userAccessToken', accessToken);

      await AsyncStorage.setItem('userRefreshToken', refreshToken);

      // ✅ SET AUTH HEADER
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      // ✅ small delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // ✅ retry mechanism
      let userRes;

      try {
        userRes = await dispatch(getUserThunk()).unwrap();
      } catch (e) {
        console.log('FIRST GET USER FAILED, RETRYING...');

        await new Promise(resolve => setTimeout(resolve, 800));

        userRes = await dispatch(getUserThunk()).unwrap();
      }

      const user = normalizeUser(userRes);

      routeAfterLogin(user);
    } catch (error: any) {
      console.log('FULL ERROR =>', error);
      const verificationData = error?.data;
      if (verificationData?.requires_phone_verification) {
        setPendingRouteName('App');
        setPendingUserId(getUserId(verificationData));
        setPendingPhone(
          String(verificationData.phone || '').replace(/[^0-9]/g, '').slice(0, 15),
        );
        setPendingCountryCode(verificationData.country_code || '+91');
        setShowMobileVerification(true);
        return;
      }

      const message =
        typeof error === 'string'
          ? error
          : error?.message || 'Unable to login. Please try again.';
      show({
        type: 'error',
        title: message,
      });
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar translucent={false} barStyle={'light-content'} />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={verticalScale(30)}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        overScrollMode="auto"
      >
        <View style={{ flex: 1 }}>
          <ImageBackground
            style={styles.topSection}
            source={require('../../assets/images/freepik__talk__6414-removebg-preview.png')}
            imageStyle={styles.bgImage}
            resizeMode="cover"
          >
            <View style={styles.logoContainer}>
              <FastImage
                source={require('../../assets/Logo/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <FastImage
              source={require('../../assets/images/camera.png')}
              style={styles.cameraImage}
            />
            <FastImage
              source={require('../../assets/images/world.png')}
              style={styles.worldImage}
            />
          </ImageBackground>

          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.loginTitle, { color: textColor }]}>Login</Text>

            <Text style={[styles.subText, { color: subText }]}>
              Don't Have An Account?
              <Text
                style={{ color: themeColors.primary }}
                onPress={() => navigation.navigate('Signup')}
              >
                {' '}
                Sign Up
              </Text>
            </Text>

            {/* EMAIL */}
            <Controller
              control={control}
              name="identifier"
              rules={{ required: 'Email is required' }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <FloatingInput
                  label="Email / Username"
                  value={value}
                  onChangeText={onChange}
                  error={error?.message}
                />
              )}
            />

            {/* PASSWORD */}
            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Password is required',
              }}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <FloatingInput
                  label="Password"
                  value={value}
                  onChangeText={onChange}
                  secure
                  error={error?.message}
                />
              )}
            />

            <TouchableOpacity
              style={styles.forgotRow}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <PrimaryButton
              onPress={handleSubmit(onSubmit)}
              title={loginLoading ? 'Logging In...' : 'Login'}
              disabled={loginLoading}
              loading={loginLoading}
            />

            {/* DIVIDER */}
            <View style={styles.orContainer}>
              <View style={styles.line} />
              <Text style={[styles.orText, { color: subText }]}>
                or continue with
              </Text>
              <View style={styles.line} />
            </View>

            {/* APPLE SIGN IN BUTTON (iOS Only) */}
            {Platform.OS === 'ios' && (
              <TouchableOpacity
                style={[
                  styles.socialBtn,
                  appleLoading && { opacity: 0.7 },
                ]}
                onPress={handleAppleLogin}
                disabled={loginLoading || googleLoading || appleLoading}
                activeOpacity={0.8}
              >
                {appleLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <AppleLogo size={19} color="#FFFFFF" />
                    <Text style={styles.socialBtnText}>Continue with Apple</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* GOOGLE SIGN IN BUTTON */}
            <TouchableOpacity
              style={[
                styles.socialBtn,
                googleLoading && { opacity: 0.7 },
              ]}
              onPress={handleGoogleLogin}
              disabled={loginLoading || googleLoading || appleLoading}
              activeOpacity={0.8}
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Google size={19} />
                  <Text style={styles.socialBtnText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
      <MobileVerificationModal
        visible={showMobileVerification}
        userId={pendingUserId}
        initialPhone={pendingPhone}
        initialCountryCode={pendingCountryCode}
        onSendOtp={sendExistingUserMobileOtp}
        onVerifyOtp={verifyExistingUserMobileOtp}
        onSaveInternational={saveInternationalMobile}
        onVerified={continueAfterMobileVerification}
        onError={showMobileVerificationError}
      />
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  scrollContent: {
    flexGrow: 1,
  },

  topSection: {
    height: verticalScaleSize(220),
    justifyContent: 'flex-start',
    position: 'relative',
  },

  bgImage: {
    opacity: 0.25,
  },

  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 52,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: themeColors.primary,
  },

  logoContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? verticalScaleSize(35) : verticalScaleSize(25),
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  logo: {
    width: scaleSize(150),
    height: scaleSize(150),
  },

  cameraImage: {
    width: 140,
    height: 170,
    resizeMode: 'contain',
    alignSelf: 'flex-end',
    position: 'absolute',
    top: -35,
    left: -30,
    transform: [
      { rotate: '45deg' },
      // { scale: 1.1 },
      { scaleX: 1 },
    ],
    opacity: 0.35,
  },
  worldImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    alignSelf: 'flex-end',
    position: 'absolute',
    bottom: -40,
    left: -50,
    opacity: 0.12,
  },

  lottie: {
    width: 270,
    height: 270,
    alignSelf: 'flex-end',
    position: 'absolute',
    bottom: -50,
    right: -80,
  },

  heading: {
    color: '#fff',
    fontSize: 26,
    fontFamily: Fonts.Bold,
    lineHeight: 36,
    marginTop: 80,
    paddingHorizontal: 30,
  },

  card: {
    minHeight: Platform.OS === 'ios' ? '100%' : '100%',
    padding: scaleSize(25),
    borderTopLeftRadius: scaleSize(40),
    borderTopRightRadius: scaleSize(40),

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',

    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },

    elevation: 10,
  },

  loginTitle: {
    fontSize: 30,
    fontFamily: Fonts.Bold,
    textAlign: 'center',
  },

  subText: {
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 5,
    fontFamily: Fonts.Regular,
  },

  forgotRow: {
    alignItems: 'flex-end',
  },

  forgotText: {
    color: themeColors.primary,
    fontFamily: Fonts.Medium,
    fontSize: 13,
  },

  loginBtn: {
    backgroundColor: '#38B2AC',
    padding: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 15,
  },

  loginText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Fonts.SemiBold,
  },

  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scaleSize(18),
    marginBottom: scaleSize(12),
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  orText: {
    marginHorizontal: 16,
    fontSize: 12,
    fontFamily: Fonts.Medium,
    color: '#aaa',
  },

  socialBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.45)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },

  socialBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: Fonts.SemiBold,
  },
});
