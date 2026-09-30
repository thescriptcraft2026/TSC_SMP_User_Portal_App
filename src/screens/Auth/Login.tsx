import React, {  useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  ImageBackground,
  StatusBar,
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
  getUserThunk,
  login,
} from '../../redux/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useToast } from '../../components/Toast/ToastProvider';
import api from '../../../Instance/Instance';
import { CommonActions } from '@react-navigation/native';

import { Dimensions } from 'react-native';
import { scaleSize, verticalScaleSize } from '../../utils/responsive';

const { height } = Dimensions.get('window');

const guidelineBaseHeight = 812;

export const verticalScale = (size: number) =>
  (height / guidelineBaseHeight) * size;

const Login = ({ navigation }: any) => {
  const dispatch = useDispatch<any>();
  const { show } = useToast();
  const [loginLoading, setLoginLoading] = useState(false);

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

  const onSubmit = async (data: any) => {
    if (loginLoading) return;

    setLoginLoading(true);
    try {
      const payload = {
        identifier: data.identifier,
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

      const user = userRes?.data;

      // ==================================================
      // ✅ PROFILE VALIDATIONS
      // ==================================================
      const hasPrimaryRoles = user?.added_primary_roles === true;
      const hasSecondaryRoles = user?.added_secondary_roles === true;
      const hasUserName = user?.user_name;

      if (!hasUserName) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'AddUserName' }],
          }),
        );

        return;
      }



      // ==================================================
      // ROLES
      // ==================================================

      if (!hasPrimaryRoles || !hasSecondaryRoles) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'RoleSetup' }],
          }),
        );

        return;
      }

      // ==================================================
      // PROFILE COMPLETE
      // ==================================================

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'App' }],
        }),
      );

      show({
        type: 'success',
        title: 'Login Successful',
      });
    } catch (error: any) {
      console.log('FULL ERROR =>', error);
      show({
        type: 'error',
        title: error,
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
          </View>
        </View>
      </KeyboardAwareScrollView>
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
    height:
      Platform.OS === 'ios' ? verticalScaleSize(450) : verticalScaleSize(350),
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
    top: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  logo: {
    width: 220,
    height: 220,
  },

  cameraImage: {
    width: 180,
    height: 220,
    resizeMode: 'contain',
    alignSelf: 'flex-end',
    position: 'absolute',
    top: -55,
    left: -40,
    transform: [
      { rotate: '45deg' },
      // { scale: 1.1 },
      { scaleX: 1 },
    ],
    opacity: 0.45,
  },
  worldImage: {
    width: 280,
    height: 280,
    resizeMode: 'contain',
    alignSelf: 'flex-end',
    position: 'absolute',
    bottom: -70,
    left: -75,
    opacity: 0.15,
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
    marginVertical: 30,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  orText: {
    marginHorizontal: 40,
    fontSize: 12,
    fontFamily: Fonts.Medium,
  },

  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },

  googleBtn: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
