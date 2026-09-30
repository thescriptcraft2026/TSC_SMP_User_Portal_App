import * as React from 'react';
import { useColorScheme } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

type Props = {
  size?: number;
  color?: any;
};

function EyeTwo({ size = 18, color = '#101010', ...props }: Props) {
  const isDark = true;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* 👁 Main pupil */}
      <Circle cx={12} cy={12} r={4} fill={color} />

      {/* ✨ Highlight dot (top-right) */}
      <Circle cx={14.5} cy={9} r={2.5} fill={isDark ? '#000' : '#fff'} />

      {/* 👁 Eye shape */}
      <Path d="M21 12s-1-8-9-8-9 8-9 8" stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

export default EyeTwo;
