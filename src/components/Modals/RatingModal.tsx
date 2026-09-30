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

import { themeColors } from '../../theme/colors';
import Reject from '../../assets/SVG/Reject';
import { Fonts } from '../../constants/Fonts';
import PrimaryButton from '../Buttons/PrimaryButton';
import FloatingInputTwo from '../Input/FloatingInputTwo';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Star from '../../assets/SVG/Star';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (rating: number) => void;
  initialRating?: number;
};

const RatingModal = ({
  visible,
  onClose,
  onSubmit,
  initialRating = 0,
}: Props) => {
  const isDark = true;
  const insets = useSafeAreaInsets();

  const { handleSubmit, reset } = useForm({
    defaultValues: {
      message: '',
    },
  });

  const slideAnim = useRef(new Animated.Value(350)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const keyboardTranslateY = useRef(new Animated.Value(0)).current;

  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  // ✅ FIX: Android keyboard support
  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, e => {
      Animated.timing(keyboardTranslateY, {
        toValue: -e.endCoordinates.height + 40,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      Animated.timing(keyboardTranslateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // ✅ Animation
  useEffect(() => {
    if (visible) {
      reset();
      setLoading(false);

      slideAnim.setValue(350);
      fadeAnim.setValue(0);

      setRating(initialRating);

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
  }, [visible, initialRating]);

  const onSubmitForm = async () => {
    if (loading) return;

    try {
      setLoading(true);

      await onSubmit?.(rating);

      onClose();
    } finally {
      setLoading(false);
    }
  };

  const bgColor = isDark ? themeColors.background : themeColors.white;
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
        <Pressable
          style={{ flex: 1 }}
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}
        />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            marginBottom: Platform.OS === 'ios' ? 10 : 5 + insets.bottom, // 🔥 key fix
            backgroundColor: bgColor,
            transform: [
              {
                translateY: Animated.add(slideAnim, keyboardTranslateY),
              },
            ],
          },
        ]}
      >
        <Pressable
          onPress={e => {
            e.stopPropagation();
            Keyboard.dismiss();
          }}
        >
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View>

            <Text style={[styles.title, { color: textColor }]}>
              Rate your experience
            </Text>

            <Text style={[styles.desc]}>
              Please select a rating from 1 to 5 stars
            </Text>
            </View>

            <TouchableOpacity onPress={onClose}>
              <Reject size={22} color={textColor} />
            </TouchableOpacity>
          </View>

          {/* Stars */}
          {/* Stars */}
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map(i => (
              <TouchableOpacity key={i} onPress={() => setRating(i)}>
                <Star
                  size={32}
                  filled={i <= rating}
                  fillColor={themeColors.primary}
                  color={i <= rating ? themeColors.primary : '#808080ff'}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Submit */}
          <PrimaryButton
            title="Submit"
            onPress={handleSubmit(onSubmitForm)}
            disabled={rating === 0 || loading}
            loading={loading}
          />
        </Pressable>
      </Animated.View>
    </Modal>
  );
};

export default RatingModal;

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

  desc:{
    fontSize:12,
    fontFamily: Fonts.Regular,
    color:themeColors.gray
  },

  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 10,
  },
});
