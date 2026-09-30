import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, useColorScheme } from 'react-native';
import { Fonts } from '../../../constants/Fonts';
import { themeColors } from '../../../theme/colors';

type Props = {
  percentage: number; // 0 - 100
  missingFields?: string[];
};

const ProfileCompletionCard = ({ percentage, missingFields = [] }: Props) => {
  const isDark = true;

  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: percentage,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const widthInterpolated = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const cardBg = isDark ? '#1a1a1a' : themeColors.white;
  const textColor = isDark ? '#fff' : '#000';
  const subTextColor = isDark ? '#9ca3af' : '#6b7280';

  // ✅ Dynamic progress color
  // const progressColor =
  //   percentage >= 80
  //     ? '#22c55e' // green
  //     : percentage >= 50
  //     ? themeColors.primary // yellow/orange
  //     : '#ef4444'; // red
  const progressColor = themeColors.primary;

  return (
    <View style={[styles.card, { backgroundColor: cardBg }]}>
      {/* 🔥 HEADER */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>
          Profile Completion
        </Text>

        <Text style={[styles.percent, { color: progressColor }]}>
          {percentage}%
        </Text>
      </View>

      {/* 🔥 PROGRESS BAR */}
      <View style={styles.progressBg}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: widthInterpolated,
              backgroundColor: progressColor,
            },
          ]}
        />
      </View>

      {/* 🔥 SUBTEXT */}
      {missingFields.length > 0 ? (
        <View style={{ marginTop: 12 }}>
          <Text style={[styles.subText, { color: subTextColor }]}>
            Complete these fields to improve your profile 🚀
          </Text>

          <View style={styles.missingWrapper}>
            {missingFields.map((item, index) => (
              <View key={index} style={styles.badge}>
                <Text style={styles.badgeText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <Text
          style={[
            styles.subText,
            {
              color: themeColors.green,
              textAlign: 'center',
            },
          ]}
        >
          🎉 Your profile is fully completed
        </Text>
      )}
    </View>
  );
};

export default ProfileCompletionCard;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 10,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 16,
    fontFamily: Fonts.Bold,
  },

  percent: {
    fontSize: 16,
    fontFamily: Fonts.Bold,
  },

  progressBg: {
    height: 8,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
    marginTop: 12,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    // backgroundColor: themeColors.primary,
    borderRadius: 10,
  },

  subText: {
    fontSize: 13,
    fontFamily: Fonts.Regular,
  },

  missingWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 8,
  },

  badge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
  },

  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: Fonts.Medium,
  },
});
