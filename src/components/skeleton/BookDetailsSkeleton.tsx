import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const BookDetailsSkeleton = () => {
  return (
    <SkeletonPlaceholder
      borderRadius={8}
      backgroundColor="#2A2A2A"
      highlightColor="#3A3A3A"
    >
      <View>
        {/* Cover Image */}
        <View style={styles.image} />

        <View style={styles.content}>
          {/* Action Bar */}
          <View style={styles.actionBar}>
            {[1, 2, 3, 4].map(item => (
              <View key={item} style={styles.actionItem} />
            ))}
          </View>

          {/* Genre */}
          <View style={styles.genre} />

          {/* Title */}
          <View style={styles.title} />
          <View style={[styles.title, { width: '70%' }]} />

          {/* Author */}
          <View style={styles.author} />

          {/* Reading Card */}
          <View style={styles.readingCard}>
            {[1, 2, 3, 4, 5, 6, 7].map(item => (
              <View
                key={item}
                style={[styles.line, item === 7 && { width: '60%' }]}
              />
            ))}

            {/* Divider */}
            <View style={styles.divider} />

            {/* Tags */}
            <View style={styles.tagRow}>
              <View style={styles.tag} />
              <View style={styles.tag} />
              <View style={styles.tag} />
            </View>
          </View>

          {/* Suggested Books */}
          <View style={styles.sectionTitle} />

          <View style={styles.bookRow}>
            <View style={styles.bookCard} />
            <View style={styles.bookCard} />
          </View>

          {/* Bottom Button */}
          <View style={styles.button} />
        </View>
      </View>
    </SkeletonPlaceholder>
  );
};

export default BookDetailsSkeleton;

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 400,
  },

  content: {
    padding: 10,
  },

  actionBar: {
    marginTop: 10,
    marginBottom: 15,
    height: 56,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  actionItem: {
    width: 45,
    height: 16,
    borderRadius: 8,
  },

  genre: {
    width: 90,
    height: 24,
    borderRadius: 20,
    marginBottom: 12,
  },

  title: {
    width: '90%',
    height: 24,
    borderRadius: 6,
    marginBottom: 8,
  },

  author: {
    width: 180,
    height: 16,
    borderRadius: 6,
    marginBottom: 18,
  },

  readingCard: {
    borderRadius: 24,
    padding: 20,
  },

  line: {
    width: '100%',
    height: 14,
    borderRadius: 6,
    marginBottom: 12,
  },

  divider: {
    width: '100%',
    height: 1,
    marginVertical: 18,
  },

  tagRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },

  tag: {
    width: 90,
    height: 34,
    borderRadius: 18,
    marginRight: 12,
  },

  sectionTitle: {
    width: 170,
    height: 22,
    borderRadius: 6,
    marginTop: 25,
    marginBottom: 15,
  },

  bookRow: {
    flexDirection: 'row',
  },

  bookCard: {
    width: 160,
    height: 220,
    borderRadius: 18,
    marginRight: 12,
  },

  button: {
    width: '100%',
    height: 52,
    borderRadius: 28,
    marginTop: 30,
    marginBottom: 20,
  },
});
