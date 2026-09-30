import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const OpportunityDetailsSkeleton = () => {
  const isDark = true;

  const backgroundColor = isDark ? '#1A1A1A' : '#E1E9EE';
  const highlightColor = isDark ? '#333333' : '#F2F8FC';

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? '#000' : '#fff', // ✅ FIX
      }}
    >
      <SkeletonPlaceholder
        borderRadius={10}
        backgroundColor={backgroundColor}
        highlightColor={highlightColor}
      >
        <View style={[styles.container]}>
          {/* IMAGE */}
          <View style={styles.image} />

          <View style={{ padding: 20 }}>
            {/* TITLE */}
            <View style={styles.title} />

            {/* INFO ROW */}
            <View style={styles.infoRow}>
              <View style={styles.infoCard} />
              <View style={styles.infoCard} />
              <View style={styles.infoCard} />
            </View>

            {/* ACTION BAR */}
            <View style={styles.actionBar}>
              <View style={styles.actionItem} />
              <View style={styles.actionItem} />
            </View>

            {/* DESCRIPTION */}
            <View style={styles.sectionTitle} />
            <View style={styles.desc} />
            <View style={styles.desc} />
            <View style={styles.desc} />
            <View style={[styles.desc, { width: '70%' }]} />

            {/* CONTACT */}
            <View style={styles.sectionTitle} />
            <View style={styles.contactRow}>
              <View style={styles.avatar} />
              <View style={styles.contactText} />
            </View>

            {/* BUTTON */}
            <View style={styles.button} />
          </View>
        </View>
      </SkeletonPlaceholder>
    </View>
  );
};

export default OpportunityDetailsSkeleton;

const styles = StyleSheet.create({
  container: {
    // padding: 12,
  },

  image: {
    width: '100%',
    height: 400,
    borderRadius: 30,
  },

  title: {
    width: '70%',
    height: 24,
    marginTop: 12,
  },

  infoRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },

  infoCard: {
    flex: 1,
    height: 50,
    borderRadius: 10,
  },

  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingVertical: 10,
  },

  actionItem: {
    width: '40%',
    height: 16,
    borderRadius: 6,
  },

  sectionTitle: {
    width: '40%',
    height: 18,
    marginTop: 16,
  },

  desc: {
    width: '100%',
    height: 12,
    marginTop: 6,
  },

  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },

  contactText: {
    width: '50%',
    height: 14,
    marginLeft: 10,
  },

  button: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    marginTop: 20,
  },
});
