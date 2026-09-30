import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  useColorScheme,
  FlatList,
} from 'react-native';
import { themeColors } from '../../theme/colors';

const SkeletonItem = () => {
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

  const baseColor = isDark ? '#2a2a2d' : '#E5E7EB';
  const highlightColor = isDark ? '#3a3a3d' : '#F3F4F6';

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: isDark ? themeColors.card2 : '#fff' },
      ]}
    >
      {/* Banner */}
      <View style={[styles.banner, { backgroundColor: baseColor }]}>
        <Animated.View
          style={[
            styles.shimmer,
            {
              backgroundColor: highlightColor,
              transform: [{ translateX }],
            },
          ]}
        />
      </View>

      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        <View style={[styles.avatar, { backgroundColor: baseColor }]} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Name */}
        <View
          style={[styles.line, { width: 80, backgroundColor: baseColor }]}
        />

        {/* Role */}
        <View
          style={[styles.lineSmall, { width: 60, backgroundColor: baseColor }]}
        />

        {/* Button */}
        <View style={[styles.button, { backgroundColor: baseColor }]} />
      </View>
    </View>
  );
};

const ProfileSuggestionSkeleton = ({ count = 4 }) => {
  return (
    <FlatList
      data={Array.from({ length: count })}
      keyExtractor={(_, i) => `skeleton-${i}`}
      numColumns={2}
      renderItem={() => <SkeletonItem />}
      columnWrapperStyle={{ justifyContent: 'space-between' }}
      contentContainerStyle={{ paddingHorizontal: 10 }}
    />
  );
};

export default ProfileSuggestionSkeleton;

const styles = StyleSheet.create({
  card: {
    width: '48%',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 10,
  },

  banner: {
    height: 75,
    overflow: 'hidden',
  },

  shimmer: {
    width: 100,
    height: '100%',
    opacity: 0.4,
  },

  avatarWrapper: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 30,
  },

  content: {
    marginTop: 35,
    alignItems: 'center',
    padding: 12,
  },

  line: {
    height: 10,
    borderRadius: 6,
    marginBottom: 6,
  },

  lineSmall: {
    height: 8,
    borderRadius: 6,
    marginBottom: 10,
  },

  button: {
    height: 28,
    width: 80,
    borderRadius: 20,
  },
});
