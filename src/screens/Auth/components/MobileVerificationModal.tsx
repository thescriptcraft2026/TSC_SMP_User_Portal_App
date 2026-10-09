import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
  const isPhoneLocked = otpSent || verified;

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
  }, [visible]);

  useEffect(() => {
    if (!timer) return;

    const interval = setInterval(() => {
      setTimer(prev => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const sendOtp = async () => {
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
        showError(String(error || 'Failed to save mobile number'));
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
      showError(String(error || 'Failed to send OTP'));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== OTP_LENGTH) {
      showError('Enter 6 digit OTP');
      return;
    }

    try {
      setLoading(true);
      await onVerifyOtp?.(otp);
      setVerified(true);
      setOtpError('');
      onVerified?.();
    } catch (error: any) {
      showError(String(error || 'Mobile verification failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Feather name="phone" size={24} color={themeColors.primary} />
          </View>

          <Text style={styles.title}>Verify Mobile Number</Text>
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
                  if (isPhoneLocked) return;
                  const digits = text.replace(/[^0-9]/g, '').slice(0, 4);
                  const nextCountryCode = digits ? `+${digits}` : '+';
                  if (nextCountryCode === countryCode) return;
                  setCountryCode(nextCountryCode);
                  setOtpSent(false);
                  setVerified(false);
                  setOtpError('');
                }}
                editable={!isPhoneLocked}
                keyboardType="phone-pad"
                style={styles.countryCodeInput}
                maxLength={5}
              />
            </View>
            <TextInput
              value={phone}
              onChangeText={text => {
                if (isPhoneLocked) return;
                const nextPhone = text.replace(/[^0-9]/g, '').slice(0, 15);
                if (nextPhone === phone) return;
                setPhone(nextPhone);
                setOtpSent(false);
                setVerified(false);
                setOtpError('');
              }}
              editable={!isPhoneLocked}
              keyboardType="phone-pad"
              placeholder="Mobile number"
              placeholderTextColor="#777"
              style={styles.phoneInput}
            />
          </View>

          <PrimaryButton
            title={
              loading
                ? isIndiaMobile
                  ? 'Sending...'
                  : 'Saving...'
                : otpSent
                  ? 'OTP Sent'
                  : isIndiaMobile
                    ? 'Verify'
                    : 'Save & Continue'
            }
            onPress={sendOtp}
            disabled={
              loading ||
              otpSent ||
              !/^\+[0-9]{1,4}$/.test(countryCode) ||
              !/^[0-9]{6,15}$/.test(phone)
            }
            marginTop={12}
            fontSize={15}
          />

          {otpError && !otpSent ? (
            <Text style={styles.otpError}>{otpError}</Text>
          ) : null}

          {otpSent && (
            <View style={styles.otpPanel}>
              <Text style={styles.otpHint}>
                Enter the 6-digit code sent to your mobile.
              </Text>

              <OtpInput
                numberOfDigits={OTP_LENGTH}
                focusColor={themeColors.primary}
                onTextChange={text => {
                  setOtp(text);
                  setOtpError('');
                }}
                theme={{
                  containerStyle: styles.otpContainer,
                  pinCodeContainerStyle: styles.otpBox,
                  pinCodeTextStyle: styles.otpText,
                }}
              />

              {otpError ? (
                <Text style={styles.otpError}>{otpError}</Text>
              ) : null}

              <View style={styles.otpActions}>
                <TouchableOpacity
                  style={[
                    styles.verifyButton,
                    otp.length !== OTP_LENGTH && styles.disabledButton,
                  ]}
                  onPress={verifyOtp}
                  disabled={loading || otp.length !== OTP_LENGTH}
                >
                  <Text style={styles.verifyText}>
                    {loading ? 'Verifying...' : verified ? 'Verified' : 'Verify Code'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={sendOtp} disabled={timer > 0}>
                  <Text
                    style={[
                      styles.resendText,
                      timer > 0 && styles.resendMuted,
                    ]}
                  >
                    {timer > 0 ? `Resend in ${timer}s` : 'Resend'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default MobileVerificationModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },

  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: '#1b1b1b',
    padding: 22,
  },

  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247,183,51,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },

  title: {
    color: '#fff',
    fontSize: 22,
    fontFamily: Fonts.Bold,
    textAlign: 'center',
  },

  subtitle: {
    color: '#aaa',
    fontSize: 14,
    fontFamily: Fonts.Regular,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 18,
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
  },

  otpPanel: {
    marginTop: 16,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },

  verifyButton: {
    height: 32,
    borderRadius: 18,
    backgroundColor: themeColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  disabledButton: {
    opacity: 0.55,
  },

  verifyText: {
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
});
