import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';

interface TagChipProps {
  label: string;
  onPress?: (tag: string) => void;
}

const TagChip = ({ label, onPress }: TagChipProps) => {
  const isDark = true;

  const backgroundColor = isDark
    ? 'rgba(255, 149, 0, 0.15)' // subtle primary tint (🔥 better than + '20')
    : 'rgba(255, 149, 0, 0.12)';

  const textColor = isDark ? themeColors.primary : themeColors.primary;

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor,
          borderColor: 'transparent', // cleaner look
        },
      ]}
      onPress={() => onPress?.(label)}
    >
      <Text style={[styles.text, { color: textColor }]}>#{label}</Text>
    </TouchableOpacity>
  );
};

export default TagChip;

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 100,
    marginRight: 8,
    marginBottom: 8,
  },
  text: {
    fontSize: 12,
    fontFamily: Fonts.Medium,
  },
});
