import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { OtpInput } from 'react-native-otp-entry';
import Feather from '@react-native-vector-icons/feather';
import PrimaryButton from '../../../components/Buttons/PrimaryButton';
import { Fonts } from '../../../constants/Fonts';
import { themeColors } from '../../../theme/colors';

type Props = {
  visible: boolean;
  userId?: number | null;
  initialPhone?: string;
  initialCountryCode?: string;
  onSendOtp?: (phone: string, countryCode: string) => Promise<any>;
  onVerifyOtp?: (code: string) => Promise<any>;
  onSaveInternational?: (phone: string, countryCode: string) => Promise<any>;
  onVerified?: () => void;
  onError?: (message: string) => void;
  onClose?: () => void;
};

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

const MobileVerificationModal = ({
  visible,
  userId,
  initialPhone = '',
  initialCountryCode = '+91',
  onSendOtp,
  onVerifyOtp,
  onSaveInternational,
  onVerified,
  onError,
  onClose,
}: Props) => {
  const [phone, setPhone] = useState(initialPhone);
  const [countryCode, setCountryCode] = useState(initialCountryCode);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const [verified, setVerified] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [loading, setLoading] = useState(false);
  const isIndiaMobile = countryCode === '+91';

  const showError = (message: string) => {
    setOtpError(message);
    onError?.(message);
  };

  useEffect(() => {
    if (!visible) return;

    setPhone(initialPhone);
    setCountryCode(initialCountryCode);
    setOtpSent(false);
    setOtp('');
    setTimer(0);
    setVerified(false);
    setOtpError('');
    setLoading(false);
  }, [visible, initialPhone, initialCountryCode]);

  useEffect(() => {
    if (!timer) return;

    const interval = setInterval(() => {
      setTimer(prev => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const sendOtp = async () => {
    Keyboard.dismiss();
    if (!/^\+[0-9]{1,4}$/.test(countryCode) || !/^[0-9]{6,15}$/.test(phone)) {
      showError('Enter a valid mobile number');
      return;
    }

    if (!isIndiaMobile) {
      try {
        setLoading(true);
        setOtpError('');
        await onSaveInternational?.(phone, countryCode);
        setVerified(true);
        onVerified?.();
      } catch (error: any) {
        showError(String(error?.message || error || 'Failed to save mobile number'));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!userId) {
      showError('User session missing. Please login again.');
      return;
    }

    try {
      setLoading(true);
      await onSendOtp?.(phone, countryCode);
      setOtpSent(true);
      setVerified(false);
      setOtp('');
      setOtpError('');
      setTimer(RESEND_SECONDS);
    } catch (error: any) {
      showError(String(error?.message || error || 'Failed to send OTP'));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpCode = async (codeToVerify?: string) => {
    Keyboard.dismiss();
    const finalCode = (codeToVerify ?? otp).trim();

    if (finalCode.length !== OTP_LENGTH) {
      showError('Enter 6 digit OTP');
      return;
    }

    try {
      setLoading(true);
      setOtpError('');
      await onVerifyOtp?.(finalCode);
      setVerified(true);
      onVerified?.();
    } catch (error: any) {
      showError(String(error?.message || error || 'Mobile verification failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleEditPhone = () => {
    setOtpSent(false);
    setOtp('');
    setOtpError('');
    setTimer(0);
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.backdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
            style={styles.keyboardAvoid}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
                <View style={styles.card}>
                  {onClose && (
                    <TouchableOpacity
                      style={styles.closeBtn}
                      onPress={() => {
                        Keyboard.dismiss();
                        onClose();
                      }}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                      <Feather name="x" size={20} color="#888" />
                    </TouchableOpacity>
                  )}

                  <View style={styles.iconWrap}>
                    <Feather
                      name={otpSent ? 'shield' : 'phone'}
                      size={24}
                      color={themeColors.primary}
                    />
                  </View>

                  <Text style={styles.title}>
                    {otpSent ? 'Enter OTP' : 'Verify Mobile Number'}
                  </Text>

                  {!otpSent ? (
                    <>
                      <Text style={styles.subtitle}>
                        {isIndiaMobile
                          ? 'Please verify your mobile number to continue.'
                          : 'Mobile verification is not required outside India. Save your number to continue.'}
                      </Text>

                      <View style={styles.mobileRow}>
                        <View style={styles.countryCodeBox}>
                          <TextInput
                            value={countryCode}
                            onChangeText={text => {
                              const digits = text.replace(/[^0-9]/g, '').slice(0, 4);
                              const nextCountryCode = digits ? `+${digits}` : '+';
                              if (nextCountryCode === countryCode) return;
                              setCountryCode(nextCountryCode);
                              setOtpSent(false);
                              setVerified(false);
                              setOtpError('');
                            }}
                            keyboardType="phone-pad"
                            style={styles.countryCodeInput}
                            maxLength={5}
                          />
                        </View>
                        <TextInput
                          value={phone}
                          onChangeText={text => {
                            const nextPhone = text.replace(/[^0-9]/g, '').slice(0, 15);
                            if (nextPhone === phone) return;
                            setPhone(nextPhone);
                            setOtpSent(false);
                            setVerified(false);
                            setOtpError('');
                          }}
                          keyboardType="phone-pad"
                          placeholder="Mobile number"
                          placeholderTextColor="#777"
                          style={styles.phoneInput}
                        />
                      </View>

                      {otpError ? <Text style={styles.otpError}>{otpError}</Text> : null}

                      <PrimaryButton
                        title={
                          loading
                            ? isIndiaMobile
                              ? 'Sending OTP...'
                              : 'Saving...'
                            : isIndiaMobile
                              ? 'Send OTP'
                              : 'Save & Continue'
                        }
                        onPress={sendOtp}
                        disabled={
                          loading ||
                          !/^\+[0-9]{1,4}$/.test(countryCode) ||
                          !/^[0-9]{6,15}$/.test(phone)
                        }
                        marginTop={16}
                        fontSize={15}
                      />
                    </>
                  ) : (
                    <>
                      <View style={styles.phoneSummaryRow}>
                        <Text style={styles.sentToText}>
                          Code sent to{' '}
                          <Text style={styles.phoneHighlight}>
                            {countryCode} {phone}
                          </Text>
                        </Text>
                        <TouchableOpacity
                          style={styles.editPhoneBtn}
                          onPress={handleEditPhone}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Feather name="edit-2" size={13} color={themeColors.primary} />
                          <Text style={styles.editPhoneText}>Edit</Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.otpSection}>
                        <Text style={styles.otpHint}>
                          Enter the 6-digit code sent to your mobile:
                        </Text>

                        <OtpInput
                          numberOfDigits={OTP_LENGTH}
                          focusColor={themeColors.primary}
                          autoFocus={true}
                          blurOnFilled={true}
                          onTextChange={text => {
                            setOtp(text);
                            setOtpError('');
                          }}
                          onFilled={code => {
                            setOtp(code);
                            verifyOtpCode(code);
                          }}
                          theme={{
                            containerStyle: styles.otpContainer,
                            pinCodeContainerStyle: styles.otpBox,
                            pinCodeTextStyle: styles.otpText,
                            focusedPinCodeContainerStyle: styles.otpBoxFocused,
                          }}
                        />

                        {otpError ? <Text style={styles.otpError}>{otpError}</Text> : null}

                        <PrimaryButton
                          title={
                            loading
                              ? 'Verifying...'
                              : verified
                                ? 'Verified'
                                : 'Verify & Continue'
                          }
                          onPress={() => verifyOtpCode()}
                          disabled={loading || otp.length !== OTP_LENGTH}
                          marginTop={16}
                          fontSize={15}
                        />

                        <View style={styles.resendRow}>
                          <Text style={styles.didntReceiveText}>
                            Didn't receive the code?{' '}
                          </Text>
                          <TouchableOpacity onPress={sendOtp} disabled={timer > 0 || loading}>
                            <Text
                              style={[
                                styles.resendText,
                                (timer > 0 || loading) && styles.resendMuted,
                              ]}
                            >
                              {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default MobileVerificationModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.78)',
  },

  keyboardAvoid: {
    flex: 1,
    justifyContent: 'center',
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: '#1b1b1b',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 22,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },

  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247,183,51,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },

  title: {
    color: '#fff',
    fontSize: 20,
    fontFamily: Fonts.Bold,
    textAlign: 'center',
  },

  subtitle: {
    color: '#aaa',
    fontSize: 13,
    fontFamily: Fonts.Regular,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 18,
  },

  phoneSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 12,
    gap: 8,
  },

  sentToText: {
    color: '#aaa',
    fontSize: 12,
    fontFamily: Fonts.Regular,
  },

  phoneHighlight: {
    color: '#fff',
    fontFamily: Fonts.SemiBold,
  },

  editPhoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(247,183,51,0.12)',
  },

  editPhoneText: {
    color: themeColors.primary,
    fontSize: 11,
    fontFamily: Fonts.SemiBold,
  },

  mobileRow: {
    flexDirection: 'row',
    gap: 10,
  },

  countryCodeBox: {
    width: 64,
    height: 46,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },

  countryCodeInput: {
    color: themeColors.primary,
    fontSize: 14,
    fontFamily: Fonts.SemiBold,
    textAlign: 'center',
    padding: 0,
    width: '100%',
  },

  phoneInput: {
    flex: 1,
    height: 46,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: '#222',
    color: '#fff',
    paddingHorizontal: 18,
    fontFamily: Fonts.Regular,
    fontSize: 14,
  },

  otpSection: {
    marginTop: 4,
  },

  otpHint: {
    color: '#b8b8b8',
    fontSize: 12,
    fontFamily: Fonts.Regular,
    marginBottom: 12,
    textAlign: 'center',
  },

  otpContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },

  otpBox: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: '#222',
  },

  otpBoxFocused: {
    borderColor: themeColors.primary,
    backgroundColor: '#272727',
  },

  otpText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: Fonts.Bold,
  },

  otpError: {
    color: '#ff4d4f',
    fontSize: 12,
    fontFamily: Fonts.Regular,
    marginTop: 8,
    textAlign: 'center',
  },

  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },

  didntReceiveText: {
    color: '#888',
    fontSize: 12,
    fontFamily: Fonts.Regular,
  },

  resendText: {
    color: themeColors.primary,
    fontSize: 12,
    fontFamily: Fonts.SemiBold,
  },

  resendMuted: {
    color: '#666',
  },
});
