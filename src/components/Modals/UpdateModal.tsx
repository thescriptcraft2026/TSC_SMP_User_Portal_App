import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Pressable,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';

import { themeColors } from '../../theme/colors';
import Ionicons from '@react-native-vector-icons/ionicons';
import { Fonts } from '../../constants/Fonts';
import PrimaryButton from '../Buttons/PrimaryButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  onClose: () => void;
  onUpdate: () => void;
  isForceUpdate: boolean;
  latestVersion: string;
  releaseNotes?: string;
};

const UpdateModal = ({
  visible,
  onClose,
  onUpdate,
  isForceUpdate,
  latestVersion,
  releaseNotes,
}: Props) => {
  const isDark = true; // Match app theme
  const insets = useSafeAreaInsets();

  const slideAnim = useRef(new Animated.Value(450)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animation
  useEffect(() => {
    if (visible) {
      slideAnim.setValue(450);
      fadeAnim.setValue(0);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 150,
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
          toValue: 450,
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

  const bgColor = isDark ? themeColors.card5 || '#1A1D24' : themeColors.white;
  const textColor = isDark ? themeColors.white : themeColors.black;
  const secondaryTextColor = isDark ? '#A0A0A5' : '#636366';

  const handleBackdropPress = () => {
    if (!isForceUpdate) {
      onClose();
    }
  };

  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      statusBarTranslucent
      onRequestClose={isForceUpdate ? () => {} : onClose}
    >
      <StatusBar hidden={false} translucent backgroundColor="transparent" />

      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <Pressable style={{ flex: 1 }} onPress={handleBackdropPress} />
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
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: textColor }]}>
                Update Available!
              </Text>
              <Text style={[styles.subtitle, { color: secondaryTextColor }]}>
                Version {latestVersion} is ready to install.
              </Text>
            </View>

            {!isForceUpdate && (
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Ionicons name="close-circle-sharp" size={24} color={textColor} />
              </TouchableOpacity>
            )}
          </View>

          {/* Illustration/Icon Container */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <Ionicons
                name="rocket-sharp"
                size={48}
                color={themeColors.primary as string || '#EB9D08'}
              />
            </View>
          </View>

          {/* Content (Release Notes) */}
          <View style={styles.contentContainer}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              What's New:
            </Text>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {releaseNotes ? (
                <Text style={[styles.releaseNotes, { color: secondaryTextColor }]}>
                  {releaseNotes}
                </Text>
              ) : (
                <Text style={[styles.releaseNotes, { color: secondaryTextColor }]}>
                  • Performance improvements and general optimization.{'\n'}
                  • Fixes bugs and improves stability.{'\n'}
                  • Experience a smoother and faster user interface.
                </Text>
              )}
            </ScrollView>
          </View>

          {/* Buttons */}
          <View style={styles.btnRow}>
            {!isForceUpdate && (
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={[styles.cancelText, { color: textColor }]}>
                  Later
                </Text>
              </TouchableOpacity>
            )}

            <View style={{ flex: 1 }}>
              <PrimaryButton
                title="Update Now"
                marginTop={0}
                icon={<Ionicons name="cloud-download-sharp" color="#fff" size={18} />}
                onPress={onUpdate}
              />
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </Modal>
  );
};

export default UpdateModal;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },

  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 10,
    right: 10,
    borderBottomLeftRadius: Platform.OS === 'ios' ? 50 : 24,
    borderBottomRightRadius: Platform.OS === 'ios' ? 50 : 24,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 20,
  },

  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3A3F45',
    alignSelf: 'center',
    marginBottom: 12,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },

  titleContainer: {
    flex: 1,
  },

  title: {
    fontSize: 20,
    fontFamily: Fonts.Bold,
  },

  subtitle: {
    fontSize: 13,
    fontFamily: Fonts.Medium,
    marginTop: 4,
  },

  closeBtn: {
    padding: 2,
  },

  iconContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },

  iconBackground: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EB9D0820', // Opacity background
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EB9D0840',
  },

  contentContainer: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 15,
    fontFamily: Fonts.SemiBold,
    marginBottom: 8,
  },

  scrollView: {
    maxHeight: 120,
    backgroundColor: '#09090d20',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#49505730',
  },

  scrollContent: {
    paddingBottom: 5,
  },

  releaseNotes: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.Regular,
  },

  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },

  cancelBtn: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#3A3F45',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cancelText: {
    fontSize: 14,
    fontFamily: Fonts.Medium,
  },
});
