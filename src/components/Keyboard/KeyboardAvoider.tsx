import React, { useEffect, useRef } from 'react';
import { View, Keyboard, Animated, TextInput, Platform } from 'react-native';

const KeyboardAvoider = ({ children }: any) => {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', e => {
      const input = TextInput.State.currentlyFocusedInput();
      if (!input) return;

      input.measure((x, y, width, height, pageX, pageY) => {
        const inputBottom = pageY + height;
        const keyboardTop = e.endCoordinates.screenY;

        const overlap = inputBottom - keyboardTop;

        if (overlap > 0) {
          Animated.timing(translateY, {
            toValue: -overlap - 20, // small spacing
            duration: 250,
            useNativeDriver: true,
          }).start();
        }
      });
    });

    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(translateY, {
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

  return (
    <Animated.View style={{ flex: 1, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
};

export default KeyboardAvoider;
