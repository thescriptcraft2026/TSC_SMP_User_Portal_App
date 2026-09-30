import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const ContestDetailsSkeleton = () => {
  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        <SkeletonPlaceholder
          borderRadius={10}
          backgroundColor="#1A1A1D"
          highlightColor="#2A2A2E"
        >
          {/* ---------------- HERO IMAGE ---------------- */}
          <View style={styles.imageWrapper}>
            <View style={styles.image} />

            {/* HEADER */}
            <View style={styles.header}>
              <View style={styles.backBtn} />
              <View style={styles.bookmarkBtn} />
            </View>

            {/* TITLE AREA */}
            <View style={styles.titleContainer}>
              <View style={styles.badge} />

              <View
                style={{
                  width: '75%',
                  height: 28,
                  borderRadius: 8,
                  marginTop: 10,
                }}
              />

              <View
                style={{
                  width: '45%',
                  height: 18,
                  borderRadius: 6,
                  marginTop: 10,
                }}
              />
            </View>
          </View>

          {/* ---------------- ACTION BAR ---------------- */}
          <View style={styles.actionBar}>
            <View style={styles.actionItem}>
              <View style={styles.circle} />

              <View style={{ marginLeft: 10 }}>
                <View
                  style={{
                    width: 50,
                    height: 14,
                    borderRadius: 4,
                    marginBottom: 6,
                  }}
                />

                <View
                  style={{
                    width: 70,
                    height: 12,
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.actionItem}>
              <View style={styles.circle} />

              <View style={{ marginLeft: 10 }}>
                <View
                  style={{
                    width: 70,
                    height: 14,
                    borderRadius: 4,
                    marginBottom: 6,
                  }}
                />

                <View
                  style={{
                    width: 50,
                    height: 12,
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>
          </View>

          {/* ---------------- BUTTONS ---------------- */}
          <View style={styles.btnRow}>
            <View style={styles.primaryBtn} />

            <View style={styles.shareBtn} />
          </View>

          {/* ---------------- ABOUT ---------------- */}
          <View style={styles.section}>
            <View style={styles.sectionHeader} />

            <View style={styles.line} />
            <View style={styles.line} />
            <View style={[styles.line, { width: '80%' }]} />
            <View style={[styles.line, { width: '60%' }]} />
          </View>

          {/* ---------------- TIMELINE ---------------- */}
          <View style={styles.section}>
            <View style={styles.sectionHeader} />

            <View style={styles.timeline}>
              {[1, 2, 3].map(item => (
                <View key={item} style={styles.timelineItem}>
                  <View style={styles.timelineDot} />

                  <View
                    style={{
                      width: 80,
                      height: 12,
                      borderRadius: 4,
                      marginTop: 10,
                    }}
                  />

                  <View
                    style={{
                      width: 60,
                      height: 10,
                      borderRadius: 4,
                      marginTop: 6,
                    }}
                  />
                </View>
              ))}
            </View>
          </View>

          {/* ---------------- WINNER CARD ---------------- */}
          <View style={styles.section}>
            <View style={styles.sectionHeader} />

            <View style={styles.winnerCard}>
              <View style={styles.avatar} />

              <View style={{ marginLeft: 14 }}>
                <View
                  style={{
                    width: 120,
                    height: 16,
                    borderRadius: 5,
                    marginBottom: 8,
                  }}
                />

                <View
                  style={{
                    width: 80,
                    height: 12,
                    borderRadius: 4,
                  }}
                />
              </View>
            </View>
          </View>

          {/* ---------------- PARTICIPANTS ---------------- */}
          <View style={styles.section}>
            <View style={styles.sectionHeader} />

            {[1, 2, 3].map(item => (
              <View key={item} style={styles.participantCard}>
                <View style={styles.participantImage} />

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View
                    style={{
                      width: '70%',
                      height: 16,
                      borderRadius: 5,
                      marginBottom: 8,
                    }}
                  />

                  <View
                    style={{
                      width: '50%',
                      height: 12,
                      borderRadius: 4,
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        </SkeletonPlaceholder>
      </ScrollView>

      {/* ---------------- BOTTOM CTA ---------------- */}
      <LinearGradient
        colors={['transparent', '#09090d']}
        style={styles.bottomWrapper}
      >
        <SkeletonPlaceholder
          borderRadius={16}
          backgroundColor="#1A1A1D"
          highlightColor="#2A2A2E"
        >
          <View style={styles.bottomBtn} />
        </SkeletonPlaceholder>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default ContestDetailsSkeleton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090d',
  },

  imageWrapper: {
    position: 'relative',
  },

  image: {
    width: width,
    height: 400,
  },

  header: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 100,
  },

  bookmarkBtn: {
    width: 42,
    height: 42,
    borderRadius: 100,
  },

  titleContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },

  badge: {
    width: 90,
    height: 26,
    borderRadius: 100,
  },

  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginTop: 10,
    padding: 16,
    borderRadius: 18,
  },

  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  divider: {
    width: 1,
    height: 40,
    marginHorizontal: 10,
  },

  circle: {
    width: 24,
    height: 24,
    borderRadius: 100,
  },

  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 12,
    gap: 10,
  },

  primaryBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
  },

  shareBtn: {
    width: 50,
    height: 50,
    borderRadius: 16,
  },

  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },

  sectionHeader: {
    width: 180,
    height: 22,
    borderRadius: 6,
    marginBottom: 18,
  },

  line: {
    width: '100%',
    height: 14,
    borderRadius: 4,
    marginBottom: 10,
  },

  timeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  timelineItem: {
    alignItems: 'center',
    flex: 1,
  },

  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 100,
  },

  winnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 100,
  },

  participantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderRadius: 16,
    padding: 10,
  },

  participantImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },

  bottomWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 20,
  },

  bottomBtn: {
    width: '100%',
    height: 54,
    borderRadius: 18,
  },
});
