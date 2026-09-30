import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, useColorScheme } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type Props = {
  width?: number;
  height?: number;
};

const CardSkeleton = ({ width, height = 260 }: Props) => {
  const isDark = true;
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  const baseColor = isDark ? '#1E1E1E' : '#E5E7EB';
  const highlight = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)';

  return (
    <View style={[styles.card, { width, height, backgroundColor: baseColor }]}>
      {/* shimmer */}
      <Animated.View
        style={[styles.shimmerWrapper, { transform: [{ translateX }] }]}
      >
        <LinearGradient
          colors={[highlight, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>

      {/* ❤️ bookmark */}
      <View style={styles.heart} />

      {/* 🏷 badge (NEW UI) */}
      <View style={styles.badge} />

      {/* 🔽 bottom content */}
      <View style={styles.bottom}>
        <View style={styles.title} />
        <View style={styles.author} />

        <View style={styles.statsRow}>
          <View style={styles.stat} />
          <View style={styles.stat} />
          <View style={styles.stat} />
        </View>
      </View>
    </View>
  );
};

export default CardSkeleton;

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
    marginBottom:10
  },

  shimmerWrapper: {
    ...StyleSheet.absoluteFillObject,
  },

  gradient: {
    width: '60%',
    height: '100%',
  },

  heart: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 60,
    height: 16,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  bottom: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },

  title: {
    width: '70%',
    height: 12,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 6,
  },

  author: {
    width: '50%',
    height: 10,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 8,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  stat: {
    width: 35,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});
