import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, useColorScheme } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const MovieCardSkeleton = ({ height = 260 }: any) => {
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
    outputRange: [-300, 300],
  });

  return (
    <View
      style={[
        styles.card,
        {
          height,
          backgroundColor: isDark ? '#1E1E1E' : '#E5E7EB',
        },
      ]}
    >
      {/* 🔥 SHIMMER */}
      <Animated.View
        style={[styles.shimmerWrapper, { transform: [{ translateX }] }]}
      >
        <LinearGradient
          colors={
            isDark
              ? ['rgba(255,255,255,0.08)', 'transparent']
              : ['rgba(255,255,255,0.1)', 'transparent']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>

      {/* 🎬 BOTTOM OVERLAY MOCK */}
      <View style={styles.overlay}>
        {/* rating badge */}
        <View style={styles.rating} />

        {/* title */}
        <View style={styles.title} />

        {/* buttons */}
        <View style={styles.actions}>
          <View style={styles.button} />
          <View style={styles.circle} />
        </View>
      </View>
    </View>
  );
};

export default MovieCardSkeleton;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },

  shimmerWrapper: {
    ...StyleSheet.absoluteFillObject,
  },

  gradient: {
    width: '60%',
    height: '100%',
  },

  overlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 10,
  },

  rating: {
    width: 40,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 6,
  },

  title: {
    width: '70%',
    height: 14,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 10,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  button: {
    width: 90,
    height: 30,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  circle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});
