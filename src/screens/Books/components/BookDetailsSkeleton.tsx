import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const BookDetailsSkeleton = () => {
  return (
    <SkeletonPlaceholder
      speed={1200}
      borderRadius={8}
      backgroundColor="#2A2A2A"
      highlightColor="#3A3A3A"
    >
      <View style={styles.container}>
        {/* IMAGE */}
        <View style={styles.image} />

        {/* TITLE SECTION */}
        <View style={styles.titleContainer}>
          <View style={styles.badge} />

          <View style={styles.title} />

          <View style={styles.metaRow}>
            <View style={styles.smallCircle} />
            <View style={styles.author} />
            <View style={styles.date} />
          </View>
        </View>

        {/* ACTION BAR */}
        <View style={styles.actionBar}>
          {[1, 2, 3, 4].map(item => (
            <View key={item} style={styles.actionItem}>
              <View style={styles.icon} />
              <View style={styles.label} />
            </View>
          ))}
        </View>

        {/* CONTENT CARD */}
        <View style={styles.contentCard}>
          {[1, 2, 3, 4, 5, 6].map(item => (
            <View
              key={item}
              style={[
                styles.paragraph,
                {
                  width: item % 2 === 0 ? '100%' : item === 5 ? '70%' : '90%',
                },
              ]}
            />
          ))}

          {/* TAGS */}
          <View style={styles.tagsContainer}>
            {[1, 2, 3].map(item => (
              <View key={item} style={styles.tag} />
            ))}
          </View>
        </View>

        {/* SUGGESTED */}
        <View style={{ marginTop: 20 }}>
          <View style={styles.suggestedTitle} />

          <View style={styles.booksRow}>
            {[1, 2].map(item => (
              <View key={item} style={styles.bookCard} />
            ))}
          </View>
        </View>

        {/* BUTTON */}
        <View style={styles.button} />
      </View>
    </SkeletonPlaceholder>
  );
};

export default BookDetailsSkeleton;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingBottom: 40,
  },

  image: {
    width: '100%',
    height: 400,
    borderRadius: 12,
  },

  titleContainer: {
    marginTop: 16,
  },

  badge: {
    width: 80,
    height: 24,
    borderRadius: 20,
    marginBottom: 12,
  },

  title: {
    width: '85%',
    height: 30,
    borderRadius: 6,
    marginBottom: 14,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  smallCircle: {
    width: 16,
    height: 16,
    borderRadius: 20,
    marginRight: 8,
  },

  author: {
    width: 120,
    height: 16,
    borderRadius: 4,
    marginRight: 10,
  },

  date: {
    width: 80,
    height: 14,
    borderRadius: 4,
  },

  actionBar: {
    marginTop: 18,
    height: 70,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  actionItem: {
    alignItems: 'center',
  },

  icon: {
    width: 22,
    height: 22,
    borderRadius: 20,
    marginBottom: 8,
  },

  label: {
    width: 40,
    height: 12,
    borderRadius: 4,
  },

  contentCard: {
    marginTop: 16,
    borderRadius: 28,
    padding: 24,
  },

  paragraph: {
    height: 14,
    borderRadius: 4,
    marginBottom: 12,
  },

  tagsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
    flexWrap: 'wrap',
  },

  tag: {
    width: 90,
    height: 38,
    borderRadius: 999,
  },

  suggestedTitle: {
    width: 160,
    height: 24,
    borderRadius: 6,
    marginBottom: 14,
  },

  booksRow: {
    flexDirection: 'row',
    gap: 12,
  },

  bookCard: {
    width: 160,
    height: 220,
    borderRadius: 18,
  },

  button: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    marginTop: 30,
  },
});
