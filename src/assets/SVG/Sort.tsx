import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
  size?: number;
  color?: any;
};

function Sort({ size = 18, color = '#101010', ...props }: Props) {
  return (
    <Svg style={{ transform: [{ rotate: '90deg' }] }} width={size} height={size} viewBox="0 0 24 24" fill={color} {...props}>
      <Path
        d="M22 6.5h-6M6 6.5H2M10 10a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM22 17.5h-4M8 17.5H2M14 21a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
        stroke={color}
        strokeWidth={1.5}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default Sort;
