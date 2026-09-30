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
import { useSelector } from 'react-redux';
import StatusBadge from '../../../../components/Badges/StatusBadge';
import CheckTwo from '../../../../assets/SVG/CheckTwo';
import Email from '../../../../assets/SVG/Email';
import Bag from '../../../../assets/SVG/Bag';
import { OtpInput } from 'react-native-otp-entry';

const ChangeGooglePasswordModal = ({
  visible,
  onClose,
  sendOtp,
  verifyOtp,
  handlePasswordSet,
}: any) => {
  const slideAnim = useRef(new Animated.Value(350)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();
  const isDark = true;
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [apiLoading, setApiLoading] = useState(false);

  const keyboardTranslateY = useRef(new Animated.Value(0)).current;
  const bgColor = isDark ? themeColors.background : themeColors.white;
  const textColor = isDark ? themeColors.white : themeColors.black;
  const cardBg = isDark ? '#1c1c1e' : themeColors.card2;

  const { loading } = useSelector((state: any) => state.profileSetting);

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
    if (data.newPassword !== data.confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }

    try {
      setApiLoading(true);

      await handlePasswordSet({
        password: data.newPassword,
      }); // 🔥 from parent

      Alert.alert('Password created successfully 🎉');
      reset();
      onClose();
    } catch (e) {
      Alert.alert('Failed to set password');
    } finally {
      setApiLoading(false);
    }
  };

  // ================= UI =================
  const renderContent = () => {
    // STEP 1
    if (step === 1) {
      return (
        <View>
          <StatusBadge status="Signed in with Google" />

          <View style={[styles.cardOne, { backgroundColor: cardBg }]}>
            <Text style={[styles.content, { color: textColor }]}>
              You currently sign in using your Google account. Creating a
              password lets you also log in with your email and password
              directly - your Google login will still work too.
            </Text>
          </View>

          <PrimaryButton
            title="Create Password"
            onPress={() => setStep(2)}
            loading={loading}
          />
        </View>
      );
    }

    // STEP 2
    if (step === 2) {
      return (
        <>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              marginBottom: 8,
            }}
          >
            <View style={[styles.iconBg, { backgroundColor: cardBg }]}>
              <CheckTwo size={20} color={themeColors.primary}/>
            </View>
            <Text
              style={[styles.contentTwo, { color: textColor }]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              Your Google login keeps working — you're just adding an extra
              sign-in method.
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              marginBottom: 8,
            }}
          >
            <View style={[styles.iconBg, { backgroundColor: cardBg }]}>
              <Email size={20} color={themeColors.primary}/>
            </View>
            <Text
              style={[styles.contentTwo, { color: textColor, fontSize: 13 }]}
            >
              We’ll send a one-time code to your Google email to confirm it’s
              you.
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={[styles.iconBg, { backgroundColor: cardBg }]}>
              <Bag size={20} color={themeColors.primary}/>
            </View>
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              style={[styles.contentTwo, { color: textColor }]}
            >
              Then choose a strong password — changeable anytime from Settings.
            </Text>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                title="Cancel"
                onPress={onClose}
                variant="outline"
              />
            </View>

            <View style={{ flex: 1 }}>
              <PrimaryButton
                title="Send OTP"
                loading={apiLoading}
                disabled={apiLoading}
                onPress={async () => {
                  try {
                    setApiLoading(true);

                    await sendOtp();

                    setStep(3);
                  } catch (e) {
                    Alert.alert('Failed to send OTP');
                  } finally {
                    setApiLoading(false);
                  }
                }}
              />
            </View>
          </View>
        </>
      );
    }

    // STEP 3 (OTP)
    if (step === 3) {
      return (
        <>
          <Text style={styles.otpLabel}>
            A 6-digit code was sent to your.email@gmail.com
          </Text>

          <OtpInput
            numberOfDigits={6}
            focusColor={themeColors.primary}
            onTextChange={text => setOtp(text)} // ✅ capture OTP
            theme={{
              pinCodeContainerStyle: styles.otpBox,
              pinCodeTextStyle: styles.otpText,
            }}
            autoFocus
          />

          <TouchableOpacity>
            <Text style={styles.resend}>Resend code</Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                title="Back"
                onPress={() => setStep(2)}
                variant="outline"
              />
            </View>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                title="Verify & continue"
                loading={apiLoading}
                disabled={apiLoading || otp.length !== 6}
                onPress={async () => {
                  try {
                    setApiLoading(true);

                    await verifyOtp(otp); // 🔥 from parent

                    setStep(4);
                  } catch (e) {
                    Alert.alert('Invalid OTP');
                  } finally {
                    setApiLoading(false);
                  }
                }}
              />
            </View>
          </View>
        </>
      );
    }

    // STEP 4 (PASSWORD)
    if (step === 4) {
      return (
        <>
          <Controller
            control={control}
            name="newPassword"
            render={({ field: { onChange, value } }) => (
              <FloatingInputTwo
                label="New password"
                value={value}
                onChangeText={onChange}
                secureTextEntry
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <FloatingInputTwo
                label="Confirm password"
                value={value}
                onChangeText={onChange}
                secureTextEntry
              />
            )}
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                title="Back"
                onPress={() => setStep(3)}
                variant="outline"
              />
            </View>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                loading={apiLoading}
                disabled={apiLoading}
                title="Create password"
                onPress={handleSubmit(onSubmit)}
              />
            </View>
          </View>
        </>
      );
    }

    return null;
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
                backgroundColor: isDark
                  ? themeColors.background
                  : themeColors.white,
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
            Create Password
          </Text>
        </View>

        {renderContent()}
      </Animated.View>
    </Modal>
  );
};

export default ChangeGooglePasswordModal;

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
  cardOne: {
    padding: 10,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: themeColors.primary,
    marginTop: 10,
  },
  content: {
    fontFamily: Fonts.Medium,
  },
  contentTwo: {
    fontFamily: Fonts.Medium,
    fontSize: 14,
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
    color: themeColors.white,
  },

  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  outlineBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#555',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 15,
  },

  resend: {
    textAlign: 'center',
    marginTop: 10,
    color: themeColors.primary,
  },

  iconBg: {
    padding: 8,
    borderRadius: 12,
  },
});
