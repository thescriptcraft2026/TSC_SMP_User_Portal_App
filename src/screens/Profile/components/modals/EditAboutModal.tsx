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
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
} from 'react-native';
import Feather from '@react-native-vector-icons/feather';
import { themeColors } from '../../../../theme/colors';
import { Fonts } from '../../../../constants/Fonts';
import PrimaryButton from '../../../../components/Buttons/PrimaryButton';
import KeyboardAvoider from '../../../../components/Keyboard/KeyboardAvoider';
import FloatingInputTwo from '../../../../components/Input/FloatingInputTwo';

import { useForm, Controller } from 'react-hook-form';

const EditAboutModal = ({
  visible,
  onClose,
  onSave,
  initialValue,
  loading,
}: any) => {
  const slideAnim = useRef(new Animated.Value(350)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isDark = true;
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // ✅ Hook Form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      bio: '',
    },
  });

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(350);
      fadeAnim.setValue(0);

      // ✅ SET FORM VALUE HERE
      reset({
        bio: initialValue || '',
      });

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
      reset({ bio: '' });

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
  }, [visible, initialValue]);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true),
    );

    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false),
    );

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const onSubmit = (data: any) => {
    onSave?.(data.bio); // ✅ clean data
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="none">
      {/* Backdrop */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => {
          if (keyboardVisible) {
            Keyboard.dismiss();
          } else {
            onClose();
          }
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
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Close */}
              <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
                <Feather name="x" size={22} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>

              <View style={styles.handle} />

              <Text style={[styles.title, { color: isDark ? '#fff' : '#111' }]}>
                Edit Bio
              </Text>

              {/* ✅ Controller */}
              <Controller
                control={control}
                name="bio"
                rules={{
                  required: 'Bio is required',

                  minLength: {
                    value: 200,
                    message: 'Bio at least 200 characters long !',
                  },

                  maxLength: {
                    value: 500,
                    message: 'Max 500 characters',
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <FloatingInputTwo
                    value={value}
                    onChangeText={onChange}
                    multiline
                    height={150}
                    label="Write something about yourself..."
                    backgroundColor={themeColors.background}
                    labelBG={themeColors.background}
                    maxLength={500}
                    showBottomText
                    bottomText={`${value.length}/500`}
                    bottomTextStyle={{
                      alignSelf: 'flex-end',
                      marginTop: 10,
                    }}
                    error={errors.bio?.message}
                  />
                )}
              />


              <PrimaryButton
                title={loading ? 'Saving...' : 'Update Bio'}
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
                loading={loading}
              />
            </ScrollView>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditAboutModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  scrollContent: {
    paddingBottom: 10,
  },
  sheet: {
    marginHorizontal: 10,
    marginBottom: Platform.OS === 'ios' ? 5 : 5,

    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: Platform.OS === 'ios' ? 50 : 20,
    borderBottomRightRadius: Platform.OS === 'ios' ? 50 : 20,

    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 20,
  },
  closeIcon: {
    position: 'absolute',
    top: 14,
    right: 10,
    zIndex: 20,
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
  title: { fontSize: 20, fontFamily: Fonts.Bold, marginBottom: 12 },
});
