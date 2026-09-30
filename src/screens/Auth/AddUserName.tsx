import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AuthHeader from '../../components/Header/AuthHeader';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../components/Toast/ToastProvider';
import FloatingInput from '../../components/Input/FloatingInput';
import api from '../../../Instance/Instance';
import {
  getUserNameSuggestion,
  getUserThunk,
  logoutUser,
} from '../../redux/slices/authSlice';
import LogoutModal from '../../components/Modals/LogoutModal';

const AddUserName = ({ navigation, route }: any) => {
  const { show } = useToast();
  const bgColor = themeColors.black;
  const dispatch = useDispatch<any>();

  const { loading } = useSelector((state: any) => state.auth);

  const [username, setUsername] = React.useState('');
  const [logoutModal, setLogoutModal] = useState(false);

  const handleSave = async () => {
    const trimmedUsername = username?.trim()?.toLowerCase()?.replace(/\s/g, '');

    if (!trimmedUsername) {
      show({
        type: 'error',
        title: 'Username is required',
      });

      return;
    }

    // ❌ cannot start special char
    if (!/^[a-zA-Z0-9]/.test(trimmedUsername)) {
      show({
        type: 'error',
        title: 'Username cannot start with special characters',
      });

      return;
    }

    // ❌ allowed chars only
    if (!/^[a-zA-Z0-9._]+$/.test(trimmedUsername)) {
      show({
        type: 'error',
        title: 'Only letters, numbers, . and _ allowed',
      });

      return;
    }

    // ❌ consecutive special chars
    if (/(\.\.)|(__)|(\._)|(_\.)/.test(trimmedUsername)) {
      show({
        type: 'error',
        title: 'Consecutive special characters are not allowed',
      });

      return;
    }

    // ❌ cannot end
    if (/[._]$/.test(trimmedUsername)) {
      show({
        type: 'error',
        title: 'Username cannot end with . or _',
      });

      return;
    }

    // ❌ min length
    if (trimmedUsername.length < 3) {
      show({
        type: 'error',
        title: 'Username must be at least 3 characters',
      });

      return;
    }

    try {
      const res = await api.post('/profile/username', {
        username: trimmedUsername,
      });

      console.log('USERNAME SAVE RES =>', res?.data);

      // ✅ refresh user
      await dispatch(getUserThunk());

      show({
        type: 'success',
        title: 'Username updated successfully',
      });

      const nextStep = route?.params?.nextStep;

      // ✅ CONTINUE ONBOARD FLOW
      if (nextStep === 'ChooseInterests') {
        navigation.replace('ChooseInterests', {
          step: 2,
        });

        return;
      }

      navigation.goBack();
    } catch (error: any) {
      console.log('USERNAME UPDATE ERROR => ', error);

      show({
        type: 'error',
        title:
          error?.response?.data?.errors?.message ||
          error?.response?.data?.message ||
          error?.message ||
          'Failed to update username',
      });
    }
  };

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar translucent={false} barStyle={'light-content'} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <View style={styles.innerContainer}>
              <AuthHeader title="Username Setup" fontSize={20} showBack={false} showLogout onLogout={() => {
                setLogoutModal(true);
              }} />
              <FloatingInput
                label="Username"
                value={username}
                onChangeText={(text: string) => {
                  const cleaned = text?.toLowerCase()?.replace(/\s/g, '');

                  setUsername(cleaned);
                }}
                checkUsername
                onUsernameCheck={async (username: string) => {
                  return await dispatch(
                    getUserNameSuggestion(username),
                  ).unwrap();
                }}
                style={{
                  borderRadius: 12,
                  height: 50,
                  marginTop: 20,
                }}
              />
            </View>
            <View>
              <PrimaryButton
                title={'Continue'}
                disabled={loading}
                onPress={handleSave}
                loading={loading}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <LogoutModal
        visible={logoutModal}
        onClose={() => {
          setLogoutModal(false);
        }}
        onSubmit={confirmLogout} // ✅ correct function
      />
    </SafeAreaView>
  );
};

export default AddUserName;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },

  innerContainer: {
    flex: 1,
  },

  title: {
    fontSize: 20,
    fontFamily: Fonts.Bold,
    // textAlign: 'center',
  },

  subTitle: {
    fontFamily: Fonts.Regular,
    fontSize: 16,
  },

  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 20,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },

  stepText: {
    fontSize: 14,
    fontWeight: '600',
  },

  stepLine: {
    width: 50,
    height: 2,
  },

  bioInput: {
    borderRadius: 10,
    padding: 12,
    height: 150,
    marginTop: 5,
    textAlignVertical: 'top',
    borderWidth: 0.6,
    borderColor: '#ccc',
  },

  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 100,
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 3,
    paddingHorizontal: 14,
    borderRadius: 20,
  },

  chipText: {
    fontSize: 14,
    fontFamily: Fonts.Medium,
  },

  skeletonChip: {
    width: 100,
    height: 36,
    borderRadius: 20,
    overflow: 'hidden',
  },

  shimmer: {
    width: 80,
    height: '100%',
    position: 'absolute',
  },

  customRoleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    width: '100%',
  },

  customRoleInput: {
    flex: 1,
    height: 40,
    borderRadius: 24,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 18,
    color: '#fff',
    fontFamily: Fonts.Medium,
  },

  addBtn: {
    height: 40,
    paddingHorizontal: 22,
    borderRadius: 24,
    backgroundColor: themeColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  addBtnText: {
    color: '#000',
    fontFamily: Fonts.Bold,
    fontSize: 15,
  },

  addCustomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
    paddingHorizontal: 16,
    borderRadius: 22,
    backgroundColor: themeColors.card,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },

  addCustomChipText: {
    color: themeColors.white,
    fontSize: 14,
    fontFamily: Fonts.Medium,
  },
});
