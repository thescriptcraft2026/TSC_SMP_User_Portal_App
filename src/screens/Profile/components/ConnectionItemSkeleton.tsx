import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { themeColors } from '../../../theme/colors';

const ConnectionItemSkeleton = () => {
  const isDark = true;

  return (
    <SkeletonPlaceholder
      backgroundColor={isDark ? '#2a2a2d' : '#E1E9EE'}
      highlightColor={isDark ? '#3a3a3d' : '#F2F8FC'}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark ? themeColors.card2 : themeColors.white,
          },
        ]}
      >
        {/* LEFT SIDE */}
        <View style={styles.left}>
          {/* Avatar */}
          <View style={styles.avatar} />

          {/* Texts */}
          <View style={{ marginLeft: 10 }}>
            <View style={styles.name} />
            <View style={styles.username} />
            <View style={styles.role} />
          </View>
        </View>

        {/* BUTTON */}
        <View style={styles.button} />
      </View>
    </SkeletonPlaceholder>
  );
};

export default ConnectionItemSkeleton;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  name: {
    width: 120,
    height: 14,
    borderRadius: 4,
    marginBottom: 6,
  },

  username: {
    width: 100,
    height: 12,
    borderRadius: 4,
    marginBottom: 6,
  },

  role: {
    width: 140,
    height: 12,
    borderRadius: 4,
  },

  button: {
    width: 80,
    height: 28,
    borderRadius: 20,
  },
});
