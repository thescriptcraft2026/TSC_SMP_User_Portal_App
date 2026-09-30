import {
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  Animated,
  Image,
} from 'react-native';
import React from 'react';
import { OnboardingData } from '../../data/data';
import LottieView from 'lottie-react-native';
import { Fonts } from '../../constants/Fonts';

type Props = {
  item: OnboardingData;
  index: number;
  x: Animated.Value; // ✅ Animated.Value
};

const RenderItem = ({ item, index, x }: Props) => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  /* 🔹 Lottie translateY animation */
  const translateY = x.interpolate({
    inputRange: [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ],
    outputRange: [200, 0, -200],
    extrapolate: 'clamp',
  });

  /* 🔹 Circle scale animation */
  const scale = x.interpolate({
    inputRange: [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ],
    outputRange: [1, 4, 4],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.itemContainer, { width: SCREEN_WIDTH }]}>
      {/* Background Circle */}
      <View style={styles.circleContainer}>
        <Animated.View
          style={[
            {
              width: SCREEN_WIDTH,
              height: SCREEN_WIDTH,
              backgroundColor: item.backgroundColor,
              borderRadius: SCREEN_WIDTH / 2,
              transform: [{ scale }],
            },
          ]}
        />
      </View>

      {/* Illustration */}
      <Animated.View
        style={[styles.imageContainer, { transform: [{ translateY }] }]}
      >
        <Image
          source={item.animation}
          style={{
            width: SCREEN_WIDTH * 0.95,
            height: SCREEN_WIDTH * 0.95,
            resizeMode: 'contain',
          }}
        />
      </Animated.View>

      {/* Text */}
      <Text style={[styles.itemText, { color: item.textColor }]}>
        {item.text}
      </Text>
    </View>
  );
};

export default RenderItem;

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 120,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    fontSize: 24,
    fontFamily: Fonts.Bold,
    marginHorizontal: 16,
    textAlign: 'center',
  },
  circleContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
