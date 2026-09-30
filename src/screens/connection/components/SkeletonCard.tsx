import { StyleSheet, View, useColorScheme } from 'react-native';

export const SkeletonCard = () => {
  const isDark = true;

  const bg = isDark ? '#2a2a2a' : '#e0e0e0';
  const highlight = isDark ? '#3a3a3a' : '#f0f0f0';

  return (
    <View style={styles.skeleton}>
      <View style={[styles.avatarSkeleton, { backgroundColor: bg }]} />

      <View style={{ flex: 1 }}>
        <View style={[styles.line, { backgroundColor: bg }]} />
        <View
          style={[styles.line, { width: '60%', backgroundColor: highlight }]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  avatarSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  line: {
    height: 10,
    borderRadius: 6,
    marginBottom: 6,
  },
});
