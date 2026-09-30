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
  Keyboard,
  Platform,
  StatusBar,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { themeColors } from '../../../../theme/colors';
import Star from '../../../../assets/SVG/Star';
import Reject from '../../../../assets/SVG/Reject';
import PrimaryButton from '../../../../components/Buttons/PrimaryButton';
import { Fonts } from '../../../../constants/Fonts';
import FloatingInputTwo from '../../../../components/Input/FloatingInputTwo';

type FormValues = {
  message: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (data: { movieId: string; message: string }) => void;
  movieId: string;
  initialMessage?: string;
};
const MovieRatingModal = ({
  visible,
  onClose,
  onSubmit,
  movieId,
  initialMessage = '',
}: Props) => {
  const isDark = true;
  const insets = useSafeAreaInsets();

  const { handleSubmit, reset, control } = useForm<FormValues>({
    defaultValues: {
      message: '',
    },
  });

  const slideAnim = useRef(new Animated.Value(350)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const keyboardTranslateY = useRef(new Animated.Value(0)).current;

  // const [rating, setRating] = useState(0);

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
      reset({
        message: initialMessage,
      });

      // 🔥 RESET VALUES BEFORE ANIMATION
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

  const onSubmitForm = (data: any) => {
    const payload = {
      movieId,
      message: data.message,
    };

    onSubmit?.(payload);
    onClose();
  };

  const bgColor = isDark ? themeColors.background : themeColors.white;
  const textColor = isDark ? themeColors.white : themeColors.black;

  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      statusBarTranslucent
      key={visible ? 'open' : 'closed'}
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
            <Text style={[styles.title, { color: textColor }]}>
              Write your review
            </Text>

            <TouchableOpacity onPress={onClose}>
              <Reject size={22} color={textColor} />
            </TouchableOpacity>
          </View>

          <Controller
            control={control}
            name="message"
            render={({ field: { onChange, value } }) => (
              <FloatingInputTwo
                label="Message"
                value={value}
                onChangeText={onChange}
                multiline
                height={100}
              />
            )}
          />

          {/* Submit */}
          <PrimaryButton
            title="Submit"
            onPress={handleSubmit(onSubmitForm)}
            disabled={false}
          />
        </Pressable>
      </Animated.View>
    </Modal>
  );
};

export default MovieRatingModal;

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
    marginVertical: 10,
    gap: 10,
  },
});
