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
  Platform,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { themeColors } from '../../../../theme/colors';
import { Fonts } from '../../../../constants/Fonts';
import PrimaryButton from '../../../../components/Buttons/PrimaryButton';
import KeyboardAvoider from '../../../../components/Keyboard/KeyboardAvoider';
import ImageUploader from '../../../../components/ImageUploader/ImageUploader';
import FastImage from 'react-native-fast-image';

const ChangeImageModal = ({
  visible,
  onClose,
  type,
  onSave,
  existingImage,
}: any) => {
  const slideAnim = useRef(new Animated.Value(350)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isDark = true;
  const [images, setImages] = useState<any[]>([]);
  const [removed, setRemoved] = useState(false);

  // ================= API CALLS =================

  // ================= ANIMATION =================
  useEffect(() => {
    if (visible) {
      // 🔥 RESET VALUES BEFORE ANIMATION
      setImages([]); // 👈 RESET HERE

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

  const handleSave = () => {
    // ✅ REMOVE EXISTING IMAGE
    if (removed) {
      onSave(null);
      onClose();
      return;
    }

    // ✅ NEW IMAGE
    if (images?.length > 0) {
      onSave(images[0]);
      onClose();
      return;
    }

    // ✅ NOTHING CHANGED
    onClose();
  };

  // ================= RETURN =================

  return (
    <Modal
      key={visible ? 'open' : 'closed'}
      transparent
      visible={visible}
      animationType="none"
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </Pressable>

      <KeyboardAvoider>
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY: slideAnim }],
              backgroundColor: isDark ? themeColors.background : themeColors.white,
            },
          ]}
        >
          <View>
            <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
              <Feather name="x" size={23} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>

            <View style={styles.handle} />
            <View style={styles.header}>
              <Text
                style={[
                  styles.title,
                  { color: isDark ? themeColors.white : themeColors.text },
                ]}
              >
                {type === 'avatar'
                  ? 'Profile Photo'
                  : 'Cover Image'}
              </Text>
            </View>

            {/* EXISTING IMAGE PREVIEW */}
            {!!existingImage && !images?.length && !removed && (
              <View
                style={{
                  marginBottom: 16,
                  alignItems: 'center',
                  position: 'relative',
                }}
              >
                <FastImage
                  source={{ uri: existingImage }}
                  resizeMode="cover"
                  style={{
                    width: type === 'avatar' ? 120 : '100%',
                    height: type === 'avatar' ? 120 : 140,
                    borderRadius: type === 'avatar' ? 100 : 16,
                  }}
                />
                <TouchableOpacity
                  onPress={() => {
                    setRemoved(true);
                    setImages([]);
                    onSave(null);
                    onClose();
                  }}
                  activeOpacity={0.8}
                  style={{
                    marginTop: 12,
                    alignSelf: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: themeColors.red,
                      fontFamily: Fonts.Bold,
                      fontSize: 14,
                    }}
                  >
                    Remove Existing Image
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <ImageUploader
              maxImages={1}
              images={images}
              maxSizeMB={5}
              onChange={imgs => {
                setImages(imgs);

                // if new image selected remove remove-state
                if (imgs?.length) {
                  setRemoved(false);
                }
              }}
            />

            <PrimaryButton title="Save" onPress={handleSave} />
          </View>
        </Animated.View>
      </KeyboardAvoider>
    </Modal>
  );
};

export default ChangeImageModal;

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
    right: 0,
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
  title: { fontSize: 20, fontFamily: Fonts.Bold },

  removeIcon: {
    position: 'absolute',
    top: 0,
    right: 110,
    backgroundColor: themeColors.black,
    padding: 6,
    borderRadius: 100,
  },
});
