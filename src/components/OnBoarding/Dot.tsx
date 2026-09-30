import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';

type Props = {
  index: number;
  x: Animated.Value; // 👈 Animated.Value instead of SharedValue
};

const Dot = ({ index, x }: Props) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  // Width animation
  const widthAnim = x.interpolate({
    inputRange: [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ],
    outputRange: [10, 20, 10],
    extrapolate: 'clamp',
  });

  // Opacity animation
  const opacityAnim = x.interpolate({
    inputRange: [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ],
    outputRange: [0.5, 1, 0.5],
    extrapolate: 'clamp',
  });

  // Background color animation
  const backgroundColorAnim = x.interpolate({
    inputRange: [0, SCREEN_WIDTH, 2 * SCREEN_WIDTH],
    outputRange: ['#000', '#000', '#fff'],
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          width: widthAnim,
          opacity: opacityAnim,
          backgroundColor: backgroundColorAnim,
        },
      ]}
    />
  );
};

export default Dot;

const styles = StyleSheet.create({
  dot: {
    height: 8,
    borderRadius: 50,
    marginHorizontal: 10,
  },
});
