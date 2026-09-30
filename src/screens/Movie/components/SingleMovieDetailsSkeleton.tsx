import React from 'react';
import { View, StyleSheet, Platform, useColorScheme } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { SafeAreaView } from 'react-native-safe-area-context';

const SingleMovieDetailsSkeleton = () => {
  const isDark = true;

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? '#000' : '#fff' }, // ✅ full bg support
      ]}
      edges={['left', 'right']}
    >
      <SkeletonPlaceholder
        backgroundColor={isDark ? '#2A2A2A' : '#E1E9EE'}
        highlightColor={isDark ? '#3A3A3A' : '#F2F8FC'}
      >
        <View>
          {/* IMAGE */}
          <View style={styles.image} />

          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.circle} />
            <View style={styles.circle} />
          </View>

          {/* ACTION BAR */}
          <View style={styles.actionBar}>
            {[1, 2, 3, 4].map(i => (
              <View key={i} style={styles.smallBox} />
            ))}
          </View>

          {/* CONTENT */}
          <View style={styles.content}>
            <View style={styles.title} />

            <View style={styles.line} />
            <View style={styles.line} />
            <View style={[styles.line, { width: '70%' }]} />

            <View style={styles.button} />
          </View>
        </View>
      </SkeletonPlaceholder>
    </SafeAreaView>
  );
};

export default SingleMovieDetailsSkeleton;

const styles = StyleSheet.create({
  container: {
    flex: 1, // ✅ important
  },

  image: {
    width: '100%',
    height: 400,
    borderBottomLeftRadius: 45,
    borderBottomRightRadius: 45,
  },

  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  actionBar: {
    position: 'absolute',
    bottom: -15,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 10,
  },

  smallBox: {
    width: 50,
    height: 20,
    borderRadius: 10,
  },

  content: {
    marginTop: 40,
    paddingHorizontal: 16,
  },

  title: {
    width: '60%',
    height: 24,
    borderRadius: 6,
    marginBottom: 12,
  },

  line: {
    width: '100%',
    height: 14,
    borderRadius: 6,
    marginBottom: 8,
  },

  button: {
    marginTop: 30,
    height: 45,
    borderRadius: 10,
  },
});
