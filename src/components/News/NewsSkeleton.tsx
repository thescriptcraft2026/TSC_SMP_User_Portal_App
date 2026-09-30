import React from 'react';
import { View, StyleSheet } from 'react-native';

const NewsSkeleton = () => {
  return (
    <View style={styles.card}>
      <View style={styles.image} />
      <View style={styles.text} />
      <View style={[styles.text, { width: '60%' }]} />
    </View>
  );
};

export default NewsSkeleton;

const styles = StyleSheet.create({
  card: {
    margin: 10,
    borderRadius: 16,
    backgroundColor: '#eee',
    padding: 10,
  },
  image: {
    height: 150,
    backgroundColor: '#ddd',
    borderRadius: 12,
    marginBottom: 10,
  },
  text: {
    height: 14,
    backgroundColor: '#ddd',
    borderRadius: 6,
    marginBottom: 6,
  },
});
