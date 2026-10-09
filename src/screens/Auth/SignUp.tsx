import React, { useEffect, useState } from 'react';
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
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useForm, Controller } from 'react-hook-form';
import { OtpInput } from 'react-native-otp-entry';

import { SafeAreaView } from 'react-native-safe-area-context';

import FloatingInput from '../../components/Input/FloatingInput';
import PrimaryButton from '../../components/Buttons/PrimaryButton';

import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import Feather from '@react-native-vector-icons/feather';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch, useSelector } from 'react-redux';
import {
  createTestRegistrationAccount,
  getUserThunk,
  getUserNameSuggestion,
  sendRegistrationEmailOtp,
  sendRegistrationPhoneOtp,
  startRegistration,
  signup,
  verifyRegistrationEmailOtp,
  verifyRegistrationPhoneOtp,
} from '../../redux/slices/authSlice';
import { useToast } from '../../components/Toast/ToastProvider';
import api from '../../../Instance/Instance';
import { reset } from '../../../navigationRef';

type VerificationKind = 'email' | 'mobile';
type VerificationStatus = 'idle' | 'sending' | 'sent' | 'verified';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

const SignUp = ({ navigation }: any) => {
  const isDark = useColorScheme() === 'dark';
  const cardBg = 'rgba(27,27,27,0.9)';
  const textColor = '#fff';
  const subText = '#aaa';
  const dispatch = useDispatch<any>();
  const { loading } = useSelector((state: any) => state.auth);
  const { show } = useToast();
  const [emailStatus, setEmailStatus] = useState<VerificationStatus>('idle');
  const [mobileStatus, setMobileStatus] = useState<VerificationStatus>('idle');
  const [emailOtp, setEmailOtp] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [emailTimer, setEmailTimer] = useState(0);
  const [mobileTimer, setMobileTimer] = useState(0);
  const [emailOtpError, setEmailOtpError] = useState('');
  const [mobileOtpError, setMobileOtpError] = useState('');
  const [countryCode, setCountryCode] = useState('+91');

  const {
    control,
    handleSubmit,
    getValues,
    trigger,
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
  const name = watch('name');
  const username = watch('username');
  const email = watch('email');
  const phone = watch('phone');
  const isIndiaMobile = countryCode === '+91';
  const isMobileLocked = mobileStatus === 'sent' || mobileStatus === 'verified';
  const [registrationTempId, setRegistrationTempId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (emailStatus !== 'idle') {
      setEmailStatus('idle');
      setEmailOtp('');
      setEmailOtpError('');
      setEmailTimer(0);
    }
    setRegistrationTempId(null);
  }, [name, username, email]);

  useEffect(() => {
    if (mobileStatus !== 'idle') {
      setMobileStatus('idle');
      setMobileOtp('');
      setMobileOtpError('');
      setMobileTimer(0);
    }
  }, [phone, countryCode]);

  useEffect(() => {
    if (isIndiaMobile) return;

    setMobileStatus('idle');
    setMobileOtp('');
    setMobileOtpError('');
    setMobileTimer(0);
  }, [isIndiaMobile]);

  useEffect(() => {
    if (!emailTimer) return;

    const interval = setInterval(() => {
      setEmailTimer(prev => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [emailTimer]);

  useEffect(() => {
    if (!mobileTimer) return;

    const interval = setInterval(() => {
      setMobileTimer(prev => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [mobileTimer]);

  const beginVerification = async (kind: VerificationKind) => {
    const isEmail = kind === 'email';

    if (isEmail) {
      const trimmedEmail = email?.trim();
      const values = getValues();

      if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
        setEmailOtpError('Enter a valid email first');
        show({
          type: 'error',
          title: 'Enter a valid email first',
        });
        return;
      }

      const hasRequiredBasicInfo = await trigger(['name', 'username', 'email']);

      if (!hasRequiredBasicInfo) {
        setEmailOtpError('Complete full name, username and email first');
        show({
          type: 'error',
          title: 'Complete full name, username and email first',
        });
        return;
      }

      setEmailStatus('sending');
      setEmailOtpError('');

      try {
        const startRes = await dispatch(
          startRegistration({
            name: values.name.trim(),
            user_name: values.username.trim(),
          }),
        ).unwrap();
        const tempId = startRes?.data?.temp_id;

        if (!tempId) {
          throw new Error('Registration session was not created');
        }

        setRegistrationTempId(tempId);

        await dispatch(
          sendRegistrationEmailOtp({ temp_id: tempId, email: trimmedEmail }),
        ).unwrap();

        setEmailStatus('sent');
        setEmailTimer(RESEND_SECONDS);
        show({
          type: 'success',
          title: 'Email OTP sent successfully!',
        });
      } catch (error: any) {
        setEmailStatus('idle');
        setEmailOtpError(String(error || 'Failed to send email OTP'));
        show({
          type: 'error',
          title: String(error || 'Failed to send email OTP'),
        });
      }
      return;
    }

    if (emailStatus !== 'verified' || !registrationTempId) {
      const message = 'Please verify your email first';
      setMobileOtpError(message);
      show({
        type: 'error',
        title: message,
      });
      return;
    }

    const cleanPhone = phone?.replace(/\D/g, '');

    if (!cleanPhone || cleanPhone.length < 10) {
      const message = isIndiaMobile
        ? 'Enter a valid mobile number first'
        : 'Enter a mobile number to verify, or skip this optional step';
      setMobileOtpError(message);
      show({
        type: 'error',
        title: message,
      });
      return;
    }

    setMobileStatus('sending');
    setMobileOtpError('');

    try {
      await dispatch(
        sendRegistrationPhoneOtp({
          temp_id: registrationTempId,
          phone: cleanPhone,
        }),
      ).unwrap();

      setMobileStatus('sent');
      setMobileTimer(RESEND_SECONDS);
      show({
        type: 'success',
        title: 'Mobile OTP sent successfully!',
      });
    } catch (error: any) {
      setMobileStatus('idle');
      setMobileOtpError(String(error || 'Failed to send mobile OTP'));
      show({
        type: 'error',
        title: String(error || 'Failed to send mobile OTP'),
      });
    }
  };

  const verifyCode = async (kind: VerificationKind) => {
    const isEmail = kind === 'email';
    const otp = isEmail ? emailOtp : mobileOtp;

    if (otp.length !== OTP_LENGTH) {
      if (isEmail) {
        setEmailOtpError('Enter 6 digit OTP');
      } else {
        setMobileOtpError('Enter 6 digit OTP');
      }
      return;
    }

    if (isEmail) {
      if (!registrationTempId) {
        setEmailOtpError('Please request an email OTP first');
        return;
      }

      try {
        const res = await dispatch(
          verifyRegistrationEmailOtp({
            temp_id: registrationTempId,
            code: otp,
          }),
        ).unwrap();

        const verified = res?.data?.email_verified === true;

        if (!verified) {
          throw new Error(res?.message || 'Email verification failed');
        }

        setRegistrationTempId(res?.data?.temp_id || registrationTempId);
        setEmailStatus('verified');
        setEmailOtpError('');
        setEmailTimer(0);
        show({
          type: 'success',
          title: res?.message || 'Email verified successfully',
        });
      } catch (error: any) {
        setEmailOtpError(String(error || 'Email verification failed'));
        show({
          type: 'error',
          title: String(error || 'Email verification failed'),
        });
      }
      return;
    }

    if (!registrationTempId) {
      setMobileOtpError('Please request a mobile OTP first');
      return;
    }

    try {
      const res = await dispatch(
        verifyRegistrationPhoneOtp({
          temp_id: registrationTempId,
          code: otp,
        }),
      ).unwrap();

      const verified = res?.data?.phone_verified === true;

      if (!verified) {
        throw new Error(res?.message || 'Mobile verification failed');
      }

      setRegistrationTempId(res?.data?.temp_id || registrationTempId);
      setMobileStatus('verified');
      setMobileOtpError('');
      setMobileTimer(0);
      show({
        type: 'success',
        title: res?.message || 'Mobile verified successfully',
      });
    } catch (error: any) {
      setMobileOtpError(String(error || 'Mobile verification failed'));
      show({
        type: 'error',
        title: String(error || 'Mobile verification failed'),
      });
    }
  };

  const resendCode = async (kind: VerificationKind) => {
    const isEmail = kind === 'email';

    if (isEmail) {
      const trimmedEmail = email?.trim();
      const values = getValues();

      if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
        setEmailOtpError('Enter a valid email first');
        return;
      }

      setEmailOtp('');
      setEmailOtpError('');

      try {
        setEmailStatus('sending');
        let tempId = registrationTempId;

        if (!tempId) {
          const hasRequiredBasicInfo = await trigger([
            'name',
            'username',
            'email',
          ]);

          if (!hasRequiredBasicInfo) {
            throw new Error('Complete full name, username and email first');
          }

          const startRes = await dispatch(
            startRegistration({
              name: values.name.trim(),
              user_name: values.username.trim(),
            }),
          ).unwrap();

          tempId = startRes?.data?.temp_id;

          if (!tempId) {
            throw new Error('Registration session was not created');
          }

          setRegistrationTempId(tempId);
        }

        await dispatch(
          sendRegistrationEmailOtp({ temp_id: tempId, email: trimmedEmail }),
        ).unwrap();

        setEmailStatus('sent');
        setEmailTimer(RESEND_SECONDS);
        show({
          type: 'success',
          title: 'Email OTP sent successfully!',
        });
      } catch (error: any) {
        setEmailStatus('sent');
        setEmailOtpError(String(error || 'Failed to resend email OTP'));
        show({
          type: 'error',
          title: String(error || 'Failed to resend email OTP'),
        });
      }
      return;
    }

    if (emailStatus !== 'verified' || !registrationTempId) {
      const message = 'Please verify your email first';
      setMobileOtpError(message);
      show({
        type: 'error',
        title: message,
      });
      return;
    }

    const cleanPhone = phone?.replace(/\D/g, '');

    if (!cleanPhone || cleanPhone.length < 10) {
      const message = 'Enter a valid mobile number first';
      setMobileOtpError(message);
      show({
        type: 'error',
        title: message,
      });
      return;
    }

    setMobileOtp('');
    setMobileOtpError('');

    try {
      setMobileStatus('sending');
      await dispatch(
        sendRegistrationPhoneOtp({
          temp_id: registrationTempId,
          phone: cleanPhone,
        }),
      ).unwrap();

      setMobileStatus('sent');
      setMobileTimer(RESEND_SECONDS);
      show({
        type: 'success',
        title: 'Mobile OTP sent successfully!',
      });
    } catch (error: any) {
      setMobileStatus('sent');
      setMobileOtpError(String(error || 'Failed to resend mobile OTP'));
      show({
        type: 'error',
        title: String(error || 'Failed to resend mobile OTP'),
      });
    }
  };

  const renderVerificationAction = (kind: VerificationKind) => {
    const isEmail = kind === 'email';
    const status = isEmail ? emailStatus : mobileStatus;

    if (!isEmail && !isIndiaMobile) {
      return null;
    }

    if (status === 'verified') {
      return (
        <View style={styles.verifiedPill}>
          <Feather name="check-circle" size={13} color="#19B846" />
          <Text style={styles.verifiedText}>Verified</Text>
        </View>
      );
    }

    if (status === 'sent') {
      return (
        <View style={styles.otpSentPill}>
          <Text style={styles.otpSentText}>OTP Sent</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[
          styles.verifyPill,
          status === 'sending' && styles.disabledVerifyPill,
        ]}
        onPress={() => beginVerification(kind)}
        disabled={status === 'sending'}
      >
        <Text style={styles.verifyText}>
          {status === 'sending' ? 'Sending...' : 'Verify'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderInlineOtp = (kind: VerificationKind) => {
    const isEmail = kind === 'email';
    const status = isEmail ? emailStatus : mobileStatus;

    if (!isEmail && !isIndiaMobile) return null;

    if (status !== 'sent') return null;

    const otp = isEmail ? emailOtp : mobileOtp;
    const timer = isEmail ? emailTimer : mobileTimer;
    const error = isEmail ? emailOtpError : mobileOtpError;

    return (
      <View style={styles.otpPanel}>
        <Text style={styles.otpHint}>
          Enter the 6-digit code sent to your {isEmail ? 'email' : 'mobile'}.
        </Text>
        <OtpInput
          numberOfDigits={OTP_LENGTH}
          focusColor={themeColors.primary}
          onTextChange={text => {
            if (isEmail) {
              setEmailOtp(text);
              setEmailOtpError('');
            } else {
              setMobileOtp(text);
              setMobileOtpError('');
            }
          }}
          theme={{
            containerStyle: styles.otpContainer,
            pinCodeContainerStyle: styles.otpBox,
            pinCodeTextStyle: styles.otpText,
          }}
        />
        {error ? <Text style={styles.otpError}>{error}</Text> : null}
        <View style={styles.otpActions}>
          <TouchableOpacity
            style={styles.verifyCodeButton}
            onPress={() => verifyCode(kind)}
          >
            <Text style={styles.verifyCodeText}>Verify Code</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => resendCode(kind)}
            disabled={timer > 0}
          >
            <Text style={[styles.resendText, timer > 0 && styles.resendMuted]}>
              {timer > 0 ? `Resend in ${timer}s` : 'Resend'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleSignup = async (data: any) => {
    try {
      if (emailStatus !== 'verified') {
        show({
          type: 'error',
          title: 'Please verify your email before creating account',
        });
        return;
      }

      if (isIndiaMobile && mobileStatus !== 'verified') {
        show({
          type: 'error',
          title: 'Please verify your mobile number',
        });
        return;
      }

      if (!registrationTempId) {
        show({
          type: 'error',
          title: 'Registration session missing. Please verify email again',
        });
        return;
      }

      const payload = {
        temp_id: registrationTempId,
        password: data.password,
        confirm_password: data.confirmPassword,
      };

      const res = await dispatch(createTestRegistrationAccount(payload)).unwrap();

      console.log('sign up res', res?.data);

      const accessToken = res?.data?.accessToken || res?.accessToken;
      const refreshToken = res?.data?.refreshToken || res?.refreshToken;

      if (!accessToken || !refreshToken) {
        throw new Error('Tokens not found in response');
      }

      await AsyncStorage.setItem('userAccessToken', accessToken);
      await AsyncStorage.setItem('userRefreshToken', refreshToken);

      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      await new Promise(resolve => setTimeout(resolve, 500));

      let userRes;

      try {
        userRes = await dispatch(getUserThunk()).unwrap();
      } catch (e) {
        await new Promise(resolve => setTimeout(resolve, 800));
        userRes = await dispatch(getUserThunk()).unwrap();
      }

      const user = userRes?.data;

      show({
        type: 'success',
        title: res?.message || 'Account created successfully',
      });

      if (!user?.user_name) {
        navigation.replace('AddUserName');
        return;
      }

      if (!user?.added_primary_roles || !user?.added_secondary_roles) {
        navigation.replace('RoleSetup');
        return;
      }

      if (!user?.bio?.trim()) {
        navigation.replace('BioSetup');
        return;
      }

      reset('App', {
        screen: 'BottomTab',
        params: { screen: 'Feed' },
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
                <View>
                  <View style={styles.verifiableField}>
                    <View style={styles.verifiableInput}>
                      <FloatingInput
                        label="Email"
                        value={value}
                        onChangeText={onChange}
                        error={error?.message}
                        editable={emailStatus !== 'verified'}
                        style={
                          emailStatus === 'verified'
                            ? styles.verifiedInput
                            : undefined
                        }
                      />
                    </View>
                    {renderVerificationAction('email')}
                  </View>
                  {renderInlineOtp('email')}
                </View>
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <View>
                  <View style={styles.verifiableField}>
                    <View style={styles.mobileInputShell}>
                      <View style={styles.countryCodeBox}>
                        <TextInput
                          value={countryCode}
                          onChangeText={text => {
                            const digits = text.replace(/[^0-9]/g, '').slice(0, 4);
                            setCountryCode(digits ? `+${digits}` : '+');
                          }}
                          editable={!isMobileLocked}
                          keyboardType="phone-pad"
                          style={[
                            styles.countryCodeInput,
                            isMobileLocked &&
                              styles.disabledCountryCodeInput,
                          ]}
                          maxLength={5}
                        />
                      </View>
                      <View style={styles.mobileField}>
                        <FloatingInput
                          label="Mobile"
                          value={value}
                          onChangeText={text =>
                            onChange(text.replace(/[^0-9]/g, '').slice(0, 15))
                          }
                          error={error?.message}
                          editable={!isMobileLocked}
                          style={[
                            styles.mobileFloatingInput,
                            isMobileLocked &&
                              styles.verifiedInput,
                          ]}
                        />
                      </View>
                    </View>
                    {renderVerificationAction('mobile')}
                  </View>
                  {renderInlineOtp('mobile')}
                </View>
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

  verifiableField: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },

  verifiableInput: {
    flex: 1,
  },

  verifyPill: {
    minWidth: 76,
    height: 34,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: themeColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 10,
  },

  verifyText: {
    color: themeColors.primary,
    fontSize: 12,
    fontFamily: Fonts.SemiBold,
  },

  disabledVerifyPill: {
    opacity: 0.65,
  },

  otpSentPill: {
    minWidth: 82,
    height: 34,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 10,
  },

  otpSentText: {
    color: '#b8b8b8',
    fontSize: 12,
    fontFamily: Fonts.SemiBold,
  },

  verifiedPill: {
    minWidth: 86,
    height: 34,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#19B846',
    backgroundColor: 'rgba(25,184,70,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 10,
  },

  verifiedText: {
    color: '#19B846',
    fontSize: 12,
    fontFamily: Fonts.SemiBold,
  },

  verifiedInput: {
    borderColor: '#19B846',
    backgroundColor: 'rgba(25,184,70,0.08)',
  },

  mobileInputShell: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },

  countryCodeBox: {
    width: 62,
    height: 50,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: '#1e1e1e',
    alignItems: 'center',
    justifyContent: 'center',
  },

  countryCodeInput: {
    color: themeColors.primary,
    fontSize: 14,
    fontFamily: Fonts.SemiBold,
    textAlign: 'center',
    padding: 0,
  },

  disabledCountryCodeInput: {
    color: '#19B846',
    opacity: 0.72,
  },

  mobileField: {
    flex: 1,
  },

  mobileFloatingInput: {
    paddingRight: 16,
  },

  otpPanel: {
    marginTop: -2,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(247,183,51,0.22)',
    backgroundColor: 'rgba(247,183,51,0.07)',
    padding: 12,
  },

  otpHint: {
    color: '#b8b8b8',
    fontSize: 12,
    fontFamily: Fonts.Regular,
    marginBottom: 10,
  },

  otpContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },

  otpBox: {
    width: 38,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: '#1e1e1e',
  },

  otpText: {
    color: '#fff',
    fontSize: 17,
    fontFamily: Fonts.SemiBold,
  },

  otpError: {
    color: '#ff4d4f',
    fontSize: 12,
    fontFamily: Fonts.Regular,
    marginTop: 8,
  },

  otpActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  verifyCodeButton: {
    height: 32,
    borderRadius: 18,
    backgroundColor: themeColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  verifyCodeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: Fonts.SemiBold,
  },

  resendText: {
    color: themeColors.primary,
    fontSize: 12,
    fontFamily: Fonts.SemiBold,
  },

  resendMuted: {
    color: '#999',
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
