import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function AnimatedNetwork() {

  const node1 = useRef(new Animated.Value(0)).current;
  const node2 = useRef(new Animated.Value(0)).current;
  const node3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {

    const animate = (value: any, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: 3000,
            delay,
            useNativeDriver: false,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };

    animate(node1, 0);
    animate(node2, 500);
    animate(node3, 1000);

  }, []);

  const y1 = node1.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 120],
  });

  const y2 = node2.interpolate({
    inputRange: [0, 1],
    outputRange: [80, 160],
  });

  const y3 = node3.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 140],
  });

  return (
    <Svg
      width={width}
      height={250}
      style={{
        position: 'absolute',
        top: 0,
        opacity: 0.35,
      }}
    >

      {/* network lines */}
      <Line x1="40" y1="60" x2="160" y2="120" stroke="white" strokeWidth="1"/>
      <Line x1="160" y1="120" x2="300" y2="80" stroke="white" strokeWidth="1"/>
      <Line x1="300" y1="80" x2="200" y2="160" stroke="white" strokeWidth="1"/>

      {/* animated nodes */}
      <AnimatedCircle cx="40" cy={y1} r="4" fill="white" />
      <AnimatedCircle cx="160" cy={y2} r="4" fill="white" />
      <AnimatedCircle cx="300" cy={y3} r="4" fill="white" />

    </Svg>
  );
}