import React from 'react';
import { Text, View, StyleSheet, useColorScheme } from 'react-native';
import { Fonts } from '../../constants/Fonts';

type Props = {
  status: string;
};

const StatusBadge = ({ status }: Props) => {
  const isDark = true;

  const getStatusStyle = () => {
    const s = status?.toLowerCase();

    // 🔥 Open / Hiring
    if (['open', 'hiring', 'hiring now', 'active'].includes(s)) {
      return {
        bg: isDark ? '#0f2e1f' : '#e6f4ea',
        text: isDark ? '#4ade80' : '#2e7d32',
        border: isDark ? '#1f5135' : '#c8e6c9',
      };
    }

    // 🟡 Closing Soon (NEW - Yellow)
    if (['closing soon'].includes(s)) {
      return {
        bg: isDark ? '#3a2e0f' : '#fff8e1',
        text: isDark ? '#facc15' : '#f9a825',
        border: isDark ? '#5c4a1f' : '#ffe082',
      };
    }

    // 🔴 Urgent
    if (['urgent', 'urgent hiring'].includes(s)) {
      return {
        bg: isDark ? '#3a1212' : '#fdecea',
        text: isDark ? '#f87171' : '#d32f2f',
        border: isDark ? '#5c1f1f' : '#f5c6cb',
      };
    }

    // 🔴 Closed
    if (['closed', 'expired'].includes(s)) {
      return {
        bg: isDark ? '#3a1212' : '#fdecea',
        text: isDark ? '#f87171' : '#d32f2f',
        border: isDark ? '#5c1f1f' : '#f5c6cb',
      };
    }

    // ⚪ Default
    return {
      bg: isDark ? '#1f2937' : '#f3f4f6',
      text: isDark ? '#d1d5db' : '#374151',
      border: isDark ? '#374151' : '#e5e7eb',
    };
  };

  const { bg, text, border } = getStatusStyle();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          borderColor: border,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: text }]} />
      <Text style={[styles.text, { color: text }]}>{status}</Text>
    </View>
  );
};

export default StatusBadge;

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 0.5, // 🔥 subtle premium border
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 100,
  },

  text: {
    fontSize: 10,
    fontFamily: Fonts.Bold,
    textTransform: 'capitalize',
    letterSpacing: 0.3,
  },
});
