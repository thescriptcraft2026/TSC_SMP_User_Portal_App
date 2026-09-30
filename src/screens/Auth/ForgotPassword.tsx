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
import { useForm, Controller } from 'react-hook-form';
import FloatingInput from '../../components/Input/FloatingInput';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import Feather from '@react-native-vector-icons/feather';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPasswordThunk } from '../../redux/slices/authSlice';
import { useToast } from '../../components/Toast/ToastProvider';
import {
  responsiveFont,
  scaleSize,
  verticalScaleSize,
} from '../../utils/responsive';

const ForgotPassword = ({ navigation }: any) => {
  const isDark = useColorScheme() === 'dark';
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const dispatch = useDispatch<any>();
  const { loading } = useSelector((state: any) => state.auth);
  const { show } = useToast();

  const cardBg = 'rgba(27,27,27,0.9)';
  const textColor = '#fff';
  const subText = '#aaa';

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      identifier: '',
    },
  });

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

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        identifier: data.identifier, // 👈 your backend uses this
      };

      const res = await dispatch(forgotPasswordThunk(payload)).unwrap();

      console.log('Forgot Password Res:', res);

      navigation.navigate('OTP', {
        flow: 'forgotPassword',
        user_id: res?.data?.user_id,
        email: data.identifier,
      });
      show({
        type: 'success',
        title: 'OTP Sent Successfully',
      });
    } catch (error: any) {
      console.log('Forgot Error:', error);

      show({
        type: 'error',
        title: error,
      });
    }
  };

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
          {/* HEADER SECTION */}
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
              Reset your password{'\n'}
              <Text style={{ fontWeight: 'bold' }}>
                get back to your{'\n'}network quickly.
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
              Forgot Password
            </Text>

            <Text style={[styles.description, { color: subText }]}>
              Enter your registered email or phone number and we'll send you a
              reset link.
            </Text>

            <Controller
              control={control}
              name="identifier"
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
            <PrimaryButton
              title={loading ? 'Sending...' : 'Send OTP'}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
              loading={loading}
            />

            {/* Back to Login */}
            <View style={styles.bottomRow}>
              <Text style={[styles.bottomText, { color: subText }]}>
                Remember your password?
              </Text>

              <Text
                style={styles.loginText}
                onPress={() => navigation.navigate('Login')}
              >
                {' '}
                Login
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default ForgotPassword;

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
  },

  bgImage: {
    opacity: 0.25,
  },

  heading: {
    color: '#fff',
    fontSize: responsiveFont(26),
    lineHeight: verticalScaleSize(36),
    marginTop: verticalScaleSize(100),
    paddingHorizontal: scaleSize(30),
    fontFamily: Fonts.Bold,
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

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },

  bottomText: {
    fontFamily: Fonts.Regular,
  },

  loginText: {
    color: themeColors.primary,
    fontFamily: Fonts.Bold,
  },
});
