import React, { useEffect, useRef } from 'react';
import {
  Modal,
  Animated,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  useColorScheme,
  Keyboard,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { themeColors } from '../../../../theme/colors';
import { Fonts } from '../../../../constants/Fonts';
import { OtpInput } from 'react-native-otp-entry';
import { useNavigation } from '@react-navigation/native';

interface Props {
  visible: boolean;
  onClose?: () => void;
}

const OtpModal: React.FC<Props> = ({ visible, onClose }: any) => {
  const slideAnim = useRef(new Animated.Value(350)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<any>();

  const isDark = useColorScheme() === 'dark';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: visible ? 1 : 0,
        duration: visible ? 200 : 180,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: visible ? 0 : 350,
        duration: visible ? 260 : 240,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible]);

  const keyboardTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardWillShow', e => {
      Animated.timing(keyboardTranslateY, {
        toValue: -e.endCoordinates.height,
        duration: e.duration ?? 250,
        useNativeDriver: true,
      }).start();
    });

    const hideSub = Keyboard.addListener('keyboardWillHide', e => {
      Animated.timing(keyboardTranslateY, {
        toValue: 0,
        duration: e.duration ?? 250,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <Modal transparent visible={visible} animationType="none">
      {/* BACKDROP */}
      <Pressable style={StyleSheet.absoluteFill} onPress={Keyboard.dismiss}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </Pressable>

    </Modal>
  );
};

export default OtpModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  sheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 32,
    overflow: 'visible',
  },

  closeIcon: {
    position: 'absolute',
    top: 14,
    right: 0,
    zIndex: 10,
  },

  handle: {
    width: 42,
    height: 5,
    backgroundColor: themeColors.primary,
    borderRadius: 4,
    alignSelf: 'center',
    marginBottom: 16,
  },

  title: {
    fontSize: 20,
    fontFamily: Fonts.Bold,
  },
  subtitle: {
    fontSize: 14,
    color: themeColors.stone,
    // marginTop: 6,
    marginBottom: 20,
    fontFamily: Fonts.Regular,
  },

  otpContainer: {
    marginBottom: 25,
  },

  otpBox: {
    width: 55,
    height: 55,
    borderRadius: 10,
    borderWidth: 1,
  },

  verifyButton: {
    backgroundColor: themeColors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 5,
  },

  verifyText: {
    textAlign: 'center',
    color: themeColors.white,
    fontSize: 16,
    fontFamily: Fonts.SemiBold,
  },
});
