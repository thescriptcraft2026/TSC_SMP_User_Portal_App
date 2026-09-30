import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Animated,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';

import Feather from '@react-native-vector-icons/feather';
import { useDispatch } from 'react-redux';

import { themeColors } from '../../../../theme/colors';
import { Fonts } from '../../../../constants/Fonts';

import PrimaryButton from '../../../../components/Buttons/PrimaryButton';
import KeyboardAvoider from '../../../../components/Keyboard/KeyboardAvoider';
import FloatingInput from '../../../../components/Input/FloatingInput';

import api from '../../../../../Instance/Instance';
import { useToast } from '../../../../components/Toast/ToastProvider';
import { getUserNameSuggestion, getUserThunk } from '../../../../redux/slices/authSlice';
import { getUserProfile } from '../../../../redux/slices/bookSlice';

const ChangeUserNameModal = ({
  visible,
  onClose,
  currentUsername = '',
}: any) => {
  const slideAnim = useRef(new Animated.Value(350)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const isDark = true;

  const dispatch = useDispatch<any>();
  const { show } = useToast();

  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const dismissingKeyboard = useRef(false);
  const [usernameError, setUsernameError] = useState('');

  // ================= ANIMATION =================

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(350);
      fadeAnim.setValue(0);

      setUsername('');

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

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );

    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);

        setTimeout(() => {
          dismissingKeyboard.current = false;
        }, 50);
      },
    );

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  // ================= SAVE USERNAME =================

  const handleSave = async () => {
    const trimmedUsername = username?.trim()?.toLowerCase()?.replace(/\s/g, '');

    if (!trimmedUsername) {
      return;
    }

    // ❌ new username cannot be same as current username
    if (trimmedUsername === currentUsername?.trim()?.toLowerCase()) {
      show({
        type: 'error',
        title: 'New username cannot be the same as current username',
      });

      return;
    }


    // ❌ cannot start with special character
    if (!/^[a-zA-Z0-9]/.test(trimmedUsername)) {
      show({
        type: 'error',
        title: 'Username cannot start with special characters',
      });

      return;
    }

    // ❌ only allow letters numbers underscore dot
    if (!/^[a-zA-Z0-9._]+$/.test(trimmedUsername)) {
      show({
        type: 'error',
        title: 'Only letters, numbers, . and _ allowed',
      });

      return;
    }

    // ❌ prevent consecutive special chars
    if (/(\.\.)|(__)|(\._)|(_\.)/.test(trimmedUsername)) {
      show({
        type: 'error',
        title: 'Consecutive special characters are not allowed',
      });

      return;
    }

    // ❌ cannot end with . or _
    if (/[._]$/.test(trimmedUsername)) {
      show({
        type: 'error',
        title: 'Username cannot end with . or _',
      });

      return;
    }

    // ❌ minimum length
    if (trimmedUsername.length < 3) {
      show({
        type: 'error',
        title: 'Username must be at least 3 characters',
      });

      return;
    }

    try {
      setLoading(true);

      await api.post('/profile/username', {
        username: trimmedUsername,
      });
      await Promise.all([
        dispatch(getUserThunk()).unwrap(),
        dispatch(getUserProfile(trimmedUsername)).unwrap(),
      ]);

      show({
        type: 'success',
        title: 'Username updated successfully',
      });

      onClose();
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
    } finally {
      setLoading(false);
    }
  };

  // ================= RETURN =================

  return (
    <Modal transparent visible={visible} animationType="none">
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => {
          if (loading) return;

          if (keyboardVisible) {
            dismissingKeyboard.current = true;
            Keyboard.dismiss();
            return;
          }

          if (dismissingKeyboard.current) {
            dismissingKeyboard.current = false;
            return;
          }

          onClose();
        }}
      >
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </Pressable>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 5 : 0}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Animated.View
            style={[
              styles.sheet,
              {
                transform: [{ translateY: slideAnim }],
                backgroundColor: isDark
                  ? themeColors.background
                  : themeColors.white,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={onClose}
              disabled={loading}
            >
              <Feather name="x" size={23} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>

            <View style={styles.handle} />

            {/* HEADER */}
            <View style={styles.header}>
              <Text
                style={[
                  styles.title,
                  {
                    color: isDark ? themeColors.white : themeColors.text,
                  },
                ]}
              >
                Change Username
              </Text>

              <Text style={styles.subtitle}>
                Choose a unique username for your profile
              </Text>
            </View>

            {/* INPUT */}
            <FloatingInput
              label="Username"
              value={username}
              onChangeText={(text: string) => {
                const cleaned = text?.toLowerCase()?.replace(/\s/g, '');
                setUsername(cleaned);

                if (cleaned?.trim() === currentUsername?.trim()?.toLowerCase()) {
                  setUsernameError('New username cannot be the same as current username');
                } else {
                  setUsernameError('');
                }
              }}
              error={usernameError}
              checkUsername
              onUsernameCheck={async (username: string) => {
                const cleaned = username?.trim()?.toLowerCase();

                // ✅ skip the availability check entirely for the user's own current username
                if (cleaned === currentUsername?.trim()?.toLowerCase()) {
                  return { available: true }; // or whatever shape FloatingInput expects for "no error"
                }

                return await dispatch(getUserNameSuggestion(username)).unwrap();
              }}
              style={{ borderRadius: 12, height: 45 }}
            />

            <Text style={{ color: themeColors.neutral, fontFamily: Fonts.Regular, fontSize: 13, marginBottom: 10 }}>Current Username: @{currentUsername}</Text>


            {/* USERNAME GUIDELINES */}
            <View style={styles.guidelinesBox}>
              <View style={styles.guidelineHeader}>
                <Feather name="check-circle" size={16} color="#3B82F6" />

                <Text style={styles.guidelineTitle}>Username Guidelines:</Text>
              </View>

              <View style={styles.guidelineList}>
                <Text style={styles.guidelineText}>• 3-20 characters long</Text>

                <Text style={styles.guidelineText}>
                  • Can contain letters, numbers, dots, and underscores
                </Text>

                <Text style={styles.guidelineText}>
                  • Must be unique across the platform
                </Text>

                <Text style={styles.guidelineText}>
                  • Cannot be changed frequently
                </Text>
              </View>
            </View>

            {/* BUTTON */}
            <PrimaryButton
              title={loading ? 'Saving...' : 'Save Username'}
              onPress={handleSave}
              loading={loading}
              disabled={
                loading ||
                username?.length < 3 ||
                username?.trim()?.toLowerCase() === currentUsername?.trim()?.toLowerCase()
              }
            />
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ChangeUserNameModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },

  sheet: {
    marginHorizontal: 8,
    marginBottom: Platform.OS === 'ios' ? 5 : 5,

    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,

    borderBottomLeftRadius: Platform.OS === 'ios' ? 50 : 20,
    borderBottomRightRadius: Platform.OS === 'ios' ? 50 : 20,

    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 24,
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
    width: 32,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 4,
    alignSelf: 'center',
    marginBottom: 16,
  },

  header: {
    alignItems: 'center',
    marginBottom: 10,
  },

  title: {
    fontSize: 22,
    fontFamily: Fonts.Bold,
  },

  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#999',
    fontFamily: Fonts.Regular,
  },

  currentUsername: {
    color: '#8A8A8A',
    fontSize: 13,
    marginTop: 10,
    marginBottom: 16,
    fontFamily: Fonts.Medium,
  },

  guidelinesBox: {
    backgroundColor: '#071329',
    borderRadius: 16,
    padding: 16,
    marginTop: 5,
  },

  guidelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },

  guidelineTitle: {
    color: '#60A5FA',
    fontSize: 14,
    fontFamily: Fonts.SemiBold,
  },

  guidelineList: {
    gap: 8,
    paddingLeft: 4,
  },

  guidelineText: {
    color: '#93C5FD',
    fontSize: 13,
    lineHeight: 20,
    fontFamily: Fonts.Regular,
  },
});
