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
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';

import Feather from '@react-native-vector-icons/feather';

import { themeColors } from '../../../../theme/colors';
import { Fonts } from '../../../../constants/Fonts';

import PrimaryButton from '../../../../components/Buttons/PrimaryButton';
import KeyboardAvoider from '../../../../components/Keyboard/KeyboardAvoider';
import FloatingInputTwo from '../../../../components/Input/FloatingInputTwo';

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onDelete: (password: string) => Promise<void>;
}

const DeleteAccountModal = ({
  visible,
  onClose,
  onDelete,
}: DeleteAccountModalProps) => {
  const slideAnim = useRef(new Animated.Value(350)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const isDark = true;

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const [passwordError, setPasswordError] = useState('');

  // ================= ANIMATION =================

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(350);
      fadeAnim.setValue(0);

      setPassword('');
      setPasswordError('');

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

  // ================= DELETE ACCOUNT =================

  const handleDelete = async () => {
    if (!password?.trim()) {
      return;
    }

    setPasswordError('');

    try {
      setLoading(true);

      await onDelete(password);

      onClose();
    } catch (error: any) {
      console.log('DELETE ACCOUNT ERROR => ', error);

      setPasswordError(
        error?.response?.data?.message ||
        error?.message ||
        'Incorrect password'
      );
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

          Keyboard.dismiss();
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
            {/* Your existing modal content */}

            <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
              <Feather name="x" size={23} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>

            <View style={styles.handle} />

            {/* WARNING ICON */}
            <View style={styles.warningContainer}>
              <View style={styles.warningCircle}>
                <Feather name="trash-2" size={28} color={themeColors.red} />
              </View>
            </View>

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
                Delete Account
              </Text>

              <Text style={styles.subtitle}>
                This action cannot be undone. This will permanently delete your account and remove all your data.
              </Text>
            </View>

            {/* PASSWORD INPUT */}
            <FloatingInputTwo
              label="Enter Password"
              value={password}
              onChangeText={(text: string) => {
                setPassword(text);
                if (passwordError) setPasswordError('');
              }}
              secureTextEntry={secureText}
              error={passwordError}
            />

            {/* WARNING BOX */}
            <View style={styles.warningBox}>
              <View style={styles.warningHeader}>
                <Feather name="alert-triangle" size={18} color="#F59E0B" />

                <Text style={styles.warningTitle}>Warning:</Text>
              </View>

              <View style={styles.warningList}>
                <Text style={styles.warningText}>
                  • Your account will be deleted in 30 days
                </Text>

                <Text style={styles.warningText}>
                  • You can log in anytime within this 30-day period to restore
                  your account
                </Text>

                <Text style={styles.warningText}>
                  • This action cannot be undone after 30 days
                </Text>
              </View>
            </View>

            {/* BUTTONS */}
            <View style={styles.buttonRow}>
              <View style={{ flex: 1 }}>
                <PrimaryButton
                  title="Cancel"
                  onPress={onClose}
                  variant="outline"
                />
              </View>
              <View style={{ flex: 1 }}>
                <PrimaryButton
                  title={loading ? 'Deleting...' : 'Yes, Delete My Account'}
                  onPress={handleDelete}
                  variant="delete"
                  loading={loading}
                  disabled={!password || loading}
                  fontSize={13}
                />
              </View>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default DeleteAccountModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },

  sheet: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 10 : 5,
    left: 5,
    right: 5,

    borderBottomLeftRadius: Platform.OS === 'ios' ? 50 : 20,
    borderBottomRightRadius: Platform.OS === 'ios' ? 50 : 20,

    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,

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

  warningContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },

  warningCircle: {
    width: 70,
    height: 70,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff000052',
  },

  header: {
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontFamily: Fonts.Bold,
  },

  subtitle: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    color: '#999',
    fontFamily: Fonts.Regular,
    paddingHorizontal: 10,
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },

  warningBox: {
    // marginTop: 14,
    borderWidth: 1,
    borderColor: '#7F1D1D',
    backgroundColor: '#2A0B0B',
    borderRadius: 14,
    padding: 14,
  },

  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },

  warningTitle: {
    color: '#FCA5A5',
    fontSize: 15,
    fontFamily: Fonts.SemiBold,
  },

  warningList: {
    gap: 8,
  },

  warningText: {
    color: '#FCA5A5',
    fontSize: 13,
    lineHeight: 20,
    fontFamily: Fonts.Regular,
  },
});
