import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const OpportunityCardSkeleton = () => {
  const isDark = true;

  const bgColor = isDark ? '#2c2c2e' : '#e5e5ea';
  const highlightColor = isDark ? '#3a3a3c' : '#f2f2f7';

  return (
    <View style={styles.wrapper}>
      <SkeletonPlaceholder
        backgroundColor={bgColor}
        highlightColor={highlightColor}
        borderRadius={8}
      >
        <View style={styles.card}>
          {/* Top Row */}
          <View style={styles.topRow}>
            <View style={styles.companyRow}>
              <View style={styles.avatar} />
              <View>
                <View style={styles.name} />
                <View style={styles.time} />
              </View>
            </View>

            <View style={styles.badge} />
          </View>

          {/* Title */}
          <View style={styles.title} />

          {/* Tags */}
          <View style={styles.tagRow}>
            <View style={styles.tag} />
            <View style={styles.tag} />
          </View>

          {/* Description */}
          <View style={styles.desc} />
          <View style={[styles.desc, { width: '80%' }]} />

          {/* Footer */}
          <View style={styles.footer}>
            <View>
              <View style={styles.salary} />
              <View style={styles.location} />
            </View>

            <View style={styles.button} />
          </View>
        </View>
      </SkeletonPlaceholder>
    </View>
  );
};

export default OpportunityCardSkeleton;

const styles = StyleSheet.create({
  wrapper: {
    // padding: 4,
    marginBottom: 6,
    marginTop:10
  },

  card: {
    borderRadius: 18,
    // padding: 16,
    paddingHorizontal: 6,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },

  name: {
    width: 100,
    height: 10,
    borderRadius: 4,
  },

  time: {
    width: 60,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },

  badge: {
    width: 60,
    height: 20,
    borderRadius: 10,
  },

  title: {
    width: '70%',
    height: 18,
    borderRadius: 6,
    marginTop: 14,
  },

  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },

  tag: {
    width: 70,
    height: 20,
    borderRadius: 8,
  },

  desc: {
    width: '100%',
    height: 10,
    borderRadius: 6,
    marginTop: 10,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
  },

  salary: {
    width: 80,
    height: 12,
    borderRadius: 6,
  },

  location: {
    width: 100,
    height: 10,
    borderRadius: 6,
    marginTop: 6,
  },

  button: {
    width: 90,
    height: 32,
    borderRadius: 10,
  },
});
