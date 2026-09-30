import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, useColorScheme, Animated } from 'react-native';
import { themeColors } from '../../theme/colors';

const ContestSkeleton = () => {
  const isDark = true;

  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const shimmerOpacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const bg = isDark ? '#2a2a2a' : '#e0e0e0';
  const cardBg = isDark ? themeColors.card2 : themeColors.white;

  return (
    <View style={[styles.container, { backgroundColor: cardBg }]}>
      {/* IMAGE */}
      <Animated.View
        style={[styles.image, { backgroundColor: bg, opacity: shimmerOpacity }]}
      />

      {/* PARTICIPANTS PILL */}
      <Animated.View
        style={[
          styles.participants,
          { backgroundColor: bg, opacity: shimmerOpacity },
        ]}
      />

      {/* TITLE */}
      <Animated.View
        style={[styles.title, { backgroundColor: bg, opacity: shimmerOpacity }]}
      />

      {/* DATE ROW */}
      <View style={styles.row}>
        <Animated.View
          style={[
            styles.date,
            { backgroundColor: bg, opacity: shimmerOpacity },
          ]}
        />
        <Animated.View
          style={[
            styles.date,
            { backgroundColor: bg, opacity: shimmerOpacity },
          ]}
        />
      </View>

      {/* BADGE */}
      <Animated.View
        style={[styles.badge, { backgroundColor: bg, opacity: shimmerOpacity }]}
      />

      {/* ACTION BUTTONS */}
      <View style={styles.actions}>
        <Animated.View
          style={[
            styles.icon,
            { backgroundColor: bg, opacity: shimmerOpacity },
          ]}
        />
        <Animated.View
          style={[
            styles.icon,
            { backgroundColor: bg, opacity: shimmerOpacity },
          ]}
        />
      </View>
    </View>
  );
};

export default ContestSkeleton;

const styles = StyleSheet.create({
  container: {
    borderRadius: 22,
    marginHorizontal: 10,
    marginBottom: 6,
    height: 220,
    overflow: 'hidden',
    padding: 6,
  },

  image: {
    width: '100%',
    height: 140,
    borderRadius: 22,
  },

  participants: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    height: 20,
    width: 120,
    borderRadius: 20,
  },

  title: {
    height: 18,
    width: '70%',
    marginTop: 15,
    marginHorizontal: 15,
    borderRadius: 6,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    marginTop: 10,
  },

  date: {
    height: 12,
    width: '40%',
    borderRadius: 6,
  },

  badge: {
    position: 'absolute',
    top: 15,
    left: 14,
    width: 60,
    height: 18,
    borderRadius: 20,
  },

  actions: {
    position: 'absolute',
    top: 10,
    right: 10,
  },

  icon: {
    width: 28,
    height: 28,
    borderRadius: 20,
    marginBottom: 6,
  },
});
