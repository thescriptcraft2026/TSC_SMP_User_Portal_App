import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Pressable,
  Keyboard,
  Platform,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Reject from '../../assets/SVG/Reject';
import PrimaryButton from '../Buttons/PrimaryButton';
import FloatingInputTwo from '../Input/FloatingInputTwo';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';

type Props = {
  visible: boolean;
  initialValue?: string;
  loading?: boolean;
  onClose: () => void;
  onUpdate: (text: string) => void;
};

export default function EditThoughtModal({
  visible,
  initialValue = '',
  loading = false,
  onClose,
  onUpdate,
}: Props) {
  const [thought, setThought] = useState('');

  const slideAnim = useRef(new Animated.Value(350)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const keyboardTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setThought(initialValue);

      slideAnim.setValue(350);
      fadeAnim.setValue(0);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 18,
          stiffness: 180,
          mass: 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
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
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, initialValue]);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardWillShow', e => {
      Animated.timing(keyboardTranslateY, {
        toValue: -e.endCoordinates.height + 40,
        duration: e.duration || 250,
        useNativeDriver: true,
      }).start();
    });

    const hide = Keyboard.addListener('keyboardWillHide', e => {
      Animated.timing(keyboardTranslateY, {
        toValue: 0,
        duration: e.duration || 250,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (!visible) return null;

  return (
    <SafeAreaView edges={['left', 'right']}>
      <Modal transparent animationType="none">
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <Pressable
            style={{ flex: 1 }}
            onPress={() => {
              Keyboard.dismiss();
              onClose();
            }}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [
                {
                  translateY: Animated.add(slideAnim, keyboardTranslateY),
                },
              ],
            },
          ]}
        >
          <Pressable onPress={() => Keyboard.dismiss()}>
            <View style={styles.handle} />

            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Edit Post</Text>
              </View>

              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Reject size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            <FloatingInputTwo
              label="Your Thoughts"
              value={thought}
              onChangeText={setThought}
              multiline
              height={120}
            />

            <PrimaryButton
              title="Update Thoughts"
              loading={loading}
              disabled={!thought.trim()}
              onPress={() => onUpdate(thought.trim())}
            />
          </Pressable>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },

  sheet: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 13 : 10,
    left: 10,
    right: 10,
    backgroundColor: themeColors.black,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: Platform.OS === 'ios' ? 50 : 20,
    borderBottomRightRadius: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 30,
  },

  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#888',
    alignSelf: 'center',
    marginBottom: 12,
  },

  header: {
    flexDirection: 'row',
    marginBottom: 18,
    alignItems: 'flex-start',
  },

  title: {
    color: '#fff',
    fontSize: 20,
    fontFamily: Fonts.Bold,
  },

  subtitle: {
    color: '#888',
    marginTop: 5,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.Regular,
  },

  closeBtn: {
    marginTop: -8,
  },
});
