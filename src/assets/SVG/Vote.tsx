import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
  size?: number;
  color?: any;
};
function Vote({ size = 18, color = '#101010', ...props }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <Path d="M9 12l2 2 4-4" />
      <Path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 012 2v12H5V7zM22 19H2" />
    </Svg>
  );
}

export default Vote;
