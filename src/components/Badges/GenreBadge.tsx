import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Fonts } from '../../constants/Fonts';

interface GenreBadgeProps {
  label?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

/* ---------------- COLORS ---------------- */
const GENRE_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  drama: {
    bg: 'rgba(255,77,79,0.9)',
    text: '#FFF',
    border: '#FF4D4F',
  },
  finance: {
    bg: 'rgba(82,196,26,0.9)',
    text: '#FFF',
    border: '#52C41A',
  },
  selfhelp: {
    bg: 'rgba(24,144,255,0.9)',
    text: '#FFF',
    border: '#1890FF',
  },
  romance: {
    bg: 'rgba(255,105,180,0.9)',
    text: '#FFF',
    border: '#FF69B4',
  },
  thriller: {
    bg: 'rgba(114,46,209,0.9)',
    text: '#FFF',
    border: '#722ED1',
  },
};

/* ---------------- SIZE CONFIG ---------------- */
const SIZE_CONFIG = {
  xs: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    fontSize: 7,
  },
  sm: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontSize: 8,
  },
  md: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 10,
  },
  lg: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
  },
};

const GenreBadge: React.FC<GenreBadgeProps> = ({
  label,
  size = 'md',
}) => {
  const safeLabel = useMemo(() => {
    return typeof label === 'string' ? label : '';
  }, [label]);

  const key = useMemo(() => {
    return safeLabel
      .toLowerCase()
      .replace(/\s/g, '');
  }, [safeLabel]);

  const colors = GENRE_COLORS[key] || {
    bg: 'rgba(150,150,150,0.7)',
    text: '#fff',
    border: '#999',
  };

  const sizeStyle = SIZE_CONFIG[size] || SIZE_CONFIG.md;

  if (!safeLabel) {
    return null;
  }

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          paddingVertical: sizeStyle.paddingVertical,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: sizeStyle.fontSize,
          },
        ]}
      >
        {safeLabel.toUpperCase()}
      </Text>
    </View>
  );
};

export default React.memo(GenreBadge);

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },

  text: {
    fontFamily: Fonts.Bold,
    letterSpacing: 0.5,
  },
});