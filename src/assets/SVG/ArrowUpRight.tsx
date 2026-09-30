import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
type Props = {
  size?: number;
  color?: any;
};
function ArrowUpRight({ size = 18, color = '#101010', ...props }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <Path d="M7 7h10v10M7 17L17 7" />
    </Svg>
  );
}

export default ArrowUpRight;
