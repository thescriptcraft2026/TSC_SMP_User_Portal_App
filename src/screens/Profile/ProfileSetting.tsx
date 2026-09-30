import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import React, { useState } from 'react';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { themeColors } from '../../theme/colors';
import FontAwesome from '@react-native-vector-icons/fontawesome';
import Entypo from '@react-native-vector-icons/entypo';
import { Fonts } from '../../constants/Fonts';
import ProfileCard from './components/cards/ProfileCard';
import AuthHeader from '../../components/Header/AuthHeader';
import { useNavigation } from '@react-navigation/native';
import ChangePasswordModal from './components/modals/ChangePasswordModal';
import Ionicons from '@react-native-vector-icons/ionicons';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import Logout from '../../assets/SVG/Logout';
import LogoutModal from '../../components/Modals/LogoutModal';
import { useDispatch, useSelector } from 'react-redux';
import { getUserThunk, logoutUser } from '../../redux/slices/authSlice';
import ChangeGooglePasswordModal from './components/modals/ChangeGooglePasswordModal';
import api from '../../../Instance/Instance';
import { useToast } from '../../components/Toast/ToastProvider';
import ChangeEmailModal from './components/modals/ChangeEmailModal';
import ChangeUserNameModal from './components/modals/ChangeUserNameModa';
import DeleteAccountModal from './components/modals/DeleteAccountModal';
import VersionCheck from 'react-native-version-check';

const AccountSetting = () => {
  const isDark = true;
  const navigation = useNavigation<any>();
  const [openModal, setOpenModal] = useState(false);
  const [googleModal, setGoogleModal] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch<any>();
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const { show } = useToast();
  const [changeEmailModal, setChangeEmailModal] = useState(false);
  const [changeUserNameModal, setChangeUserNameModal] = useState(false);
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);

  const { user } = useSelector((state: any) => state.auth);
  console.log('user', user);

  const confirmLogout = async () => {
    try {
      setLogoutModal(false);

      await dispatch(logoutUser()).unwrap();

      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      console.log('Logout Error:', error);
    }
  };

  const handleSendOtp = async (email: any) => {
    try {
      const res = await api.post('/auth/google-signup-send-otp', {
        email,
      });

      show({
        type: 'success',
        title: res?.data?.message || 'OTP sent successfully',
      });

      return res.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to send OTP';

      show({
        type: 'error',
        title: msg,
      });

      throw error;
    }
  };

  const handleOtpVerify = async (otp: string) => {
    try {
      const res = await api.post('/auth/google-signup-verify-otp', {
        email: user?.email,
        otp,
      });

      const token = res?.data?.data?.token;
      setOtpToken(token);

      show({
        type: 'success',
        title: res?.data?.message || 'OTP verified successfully',
      });

      return res.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Invalid OTP';

      show({
        type: 'error',
        title: msg,
      });

      throw error;
    }
  };

  const handlePasswordSet = async ({ password }: { password: string }) => {
    try {
      if (!otpToken) {
        throw new Error('Token missing. Please verify OTP again.');
      }

      const res = await api.post('/auth/create-password-from-token', {
        token: otpToken,
        password,
      });

      // ✅ Refresh user details
      await dispatch(getUserThunk()).unwrap();

      show({
        type: 'success',
        title: res?.data?.message || 'Password created successfully',
      });

      setOtpToken(null); // ✅ reset after success

      return res.data;
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to set password';

      show({
        type: 'error',
        title: msg,
      });

      throw error;
    }
  };

  const handleChangeEmailSendOtp = async (email: string) => {
    try {
      const res = await api.post('/settings/change-email', {
        email,
      });

      show({
        type: 'success',
        title: res?.data?.message || 'OTP sent successfully',
      });

      return res.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to send OTP';

      show({
        type: 'error',
        title: msg,
      });

      throw error;
    }
  };

  const handleChangeEmailVerifyOtp = async ({
    email,
    otp,
  }: {
    email: string;
    otp: string;
  }) => {
    try {
      const res = await api.post('/settings/verify-change', {
        email,
        otp,
      });

      show({
        type: 'success',
        title: res?.data?.message || 'Email changed successfully',
      });

      return res.data;
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Invalid OTP';

      show({
        type: 'error',
        title: msg,
      });

      throw error;
    }
  };

  const handleDeleteAccount = async (password: string) => {
    try {
      await api.post('/settings/delete-account-verify', {
        password,
      });

      show({
        type: 'success',
        title: 'Account deleted successfully',
      });

      // Auto logout after account deletion
      await dispatch(logoutUser()).unwrap();

      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete account';

      // show({
      //   type: 'error',
      //   title: msg,
      // });

      throw error;
    }
  };

  return (
    <>
      <SafeAreaView
        style={[
          styles.container,
          {
            marginTop: Platform.OS === 'android' ? 0 : 0,
            backgroundColor: themeColors.black,
          },
        ]}
        edges={['top', 'left', 'right']}
      >
        <AuthHeader
          title="Account Settings"
          showBack
          onBack={() => navigation.goBack()}
        />

        {/* 👇 MAIN CONTENT WRAPPER */}
        <View style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: 20 },
            ]}
            bounces={false}
            overScrollMode="auto"
          >
            <ProfileCard
              icon={
                <Entypo
                  name="lock"
                  size={22}
                  color={isDark ? '#fff' : '#000'}
                />
              }
              title="Update Password"
              subtitle="************"
              onPress={() => {
                if (user?.has_password === 1) {
                  setOpenModal(true);
                  setGoogleModal(false);
                } else if (user?.has_password === null) {
                  setGoogleModal(true);
                  setOpenModal(false);
                } else if (user?.google_id) {
                  setGoogleModal(true);
                  setOpenModal(false);
                } else {
                  setOpenModal(true);
                }
              }}
            />

            <ProfileCard
              icon={
                <Ionicons
                  name="mail-outline"
                  size={22}
                  color={isDark ? '#fff' : '#000'}
                />
              }
              title="Update Email"
              subtitle="Update your email address associated with your account"
              onPress={() => {
                setChangeEmailModal(true);
              }}
            />

            <ProfileCard
              icon={
                <Ionicons
                  name="at-outline"
                  size={22}
                  color={isDark ? '#fff' : '#000'}
                />
              }
              title="Update Username"
              subtitle="Update your username associated with your account"
              onPress={() => {
                setChangeUserNameModal(true);
              }}
            />

            <ProfileCard
              icon={
                <Ionicons
                  name="settings-outline"
                  size={22}
                  color={isDark ? '#fff' : '#000'}
                />
              }
              title="Privacy Settings"
              subtitle="Manage who can see your DP, connections, and content"
              onPress={() => {
                navigation.navigate('PrivacySetting');
              }}
            />

            <ProfileCard
              icon={
                <FontAwesome
                  name="trash"
                  size={22}
                  color={isDark ? themeColors.red : themeColors.red}
                />
              }
              title="Delete Account"
              titleColor={isDark ? themeColors.red : themeColors.red}
              subtitle="Deleting account permenantly"
              onPress={() => {
                setDeleteAccountModal(true);
              }}
            />

            <View
              style={{
                alignItems: 'center',
                marginTop: 20,
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  color: '#8E8E93',
                  fontSize: 14,
                  fontFamily: Fonts.Medium,
                }}
              >
                App Version {VersionCheck.getCurrentVersion()}
              </Text>
            </View>
          </ScrollView>
          <View
            style={[
              styles.logoutContainer,
              {
                   paddingBottom:
                                Platform.OS === 'android' ? insets.bottom + 10 : 20,
              },
            ]}
          >
            <PrimaryButton
              title="Logout"
              icon={<Logout color={themeColors.white} size={20} />}
              onPress={() => {
                setLogoutModal(true);
              }}
            />
          </View>
        </View>
      </SafeAreaView>

      <ChangePasswordModal
        visible={openModal}
        onClose={() => setOpenModal(false)}
      />

      <ChangeGooglePasswordModal
        visible={googleModal}
        onClose={() => setGoogleModal(false)}
        sendOtp={() => handleSendOtp(user?.email)}
        verifyOtp={handleOtpVerify}
        handlePasswordSet={handlePasswordSet}
      />
      <LogoutModal
        visible={logoutModal}
        onClose={() => {
          setLogoutModal(false);
        }}
        onSubmit={confirmLogout} // ✅ correct function
      />

      <ChangeEmailModal
        visible={changeEmailModal}
        onClose={() => setChangeEmailModal(false)}
        onSendOtp={handleChangeEmailSendOtp}
        onVerifyOtp={handleChangeEmailVerifyOtp}
        currentEmail={user?.email}
      />
      <ChangeUserNameModal
        visible={changeUserNameModal}
        onClose={() => setChangeUserNameModal(false)}
        currentUsername={user?.user_name}
      />
      <DeleteAccountModal
        visible={deleteAccountModal}
        onClose={() => setDeleteAccountModal(false)}
        onDelete={handleDeleteAccount}
      />
    </>
  );
};

export default AccountSetting;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    // paddingBottom: 100,
    marginHorizontal: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
  },

  textContainer: {
    flex: 1,
    marginLeft: 30,
  },

  title: {
    fontSize: 18,
    fontFamily: Fonts.Bold,
  },

  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.Regular,
    // marginTop:2,
  },

  arrowContainer: {
    padding: 6,
    borderRadius: 50,
  },

  logoutContainer: {
    padding: 16,
  },
});
