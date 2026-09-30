import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Pressable,
  useColorScheme,
  Easing,
  Keyboard,
  Platform,
  StatusBar,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { themeColors } from '../../../../theme/colors';
import Reject from '../../../../assets/SVG/Reject';
import PrimaryButton from '../../../../components/Buttons/PrimaryButton';
import { Fonts } from '../../../../constants/Fonts';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit?: () => void;
};

const RemoveConnectionModal = ({ visible, onClose, onSubmit }: Props) => {
  const isDark = true;
  const insets = useSafeAreaInsets();

  const slideAnim = useRef(new Animated.Value(350)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleRemoveConnection = () => {
    onSubmit?.();
  };

  // Animation
  useEffect(() => {
    if (visible) {
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

  const bgColor = isDark ? themeColors.black : themeColors.white;
  const textColor = isDark ? themeColors.white : themeColors.black;

  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      statusBarTranslucent
    >
      <StatusBar hidden translucent backgroundColor="transparent" />

      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            marginBottom: Platform.OS === 'ios' ? 10 : 5 + insets.bottom,
            backgroundColor: bgColor,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Pressable onPress={e => e.stopPropagation()}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>
              Remove Connection?
            </Text>

            <TouchableOpacity onPress={onClose}>
              <Reject size={22} color={textColor} />
            </TouchableOpacity>
          </View>

          {/* Message */}
          <Text style={[styles.message, { color: textColor }]}>
            Are you sure you want to remove this connection?
          </Text>

          {/* Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={[styles.cancelText, { color: textColor }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <PrimaryButton
              title="Remove Connection"
              onPress={handleRemoveConnection}
            />
          </View>
        </Pressable>
      </Animated.View>
    </Modal>
  );
};

export default RemoveConnectionModal;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },

  sheet: {
    position: 'absolute',
    bottom: 0, // 🔥 IMPORTANT
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

  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 12,
  },

  closeBtn: {
    marginLeft: 0,
    marginTop: 0,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  title: {
    fontSize: 18,
    fontFamily: Fonts.Bold,
  },

  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 10,
  },

  message: {
    fontSize: 14,
    marginBottom: 20,
    fontFamily: Fonts.Regular,
  },

  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  cancelBtn: {
    flex: 1,
    height: 45, // ✅ fixed height (IMPORTANT)
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },

  cancelText: {
    fontSize: 14,
    fontFamily: Fonts.Medium,
  },
});
