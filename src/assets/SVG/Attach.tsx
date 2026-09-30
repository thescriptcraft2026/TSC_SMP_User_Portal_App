import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
type Props = {
  size?: number;
  color?: any;
};
function Attach({ size = 18, color = '#101010', ...props }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <Path
        stroke={color}
        d="M16 6l-8.414 8.586a2 2 0 002.829 2.829l8.414-8.586a4 4 0 10-5.657-5.657l-8.379 8.551a6 6 0 108.485 8.485l8.379-8.551"
      />
    </Svg>
  );
}

export default Attach;
