import * as React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

type Props = {
  size?: number;
  color?: any;
};
function Scope({ size = 18, color = '#101010', ...props }: Props) {
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
      <Path d="M10.065 12.493l-6.18 1.318a.934.934 0 01-1.108-.702l-.537-2.15a1.07 1.07 0 01.691-1.265l13.504-4.44M13.56 11.747l4.332-.924M16 21l-3.105-6.21" />
      <Path d="M16.485 5.94a2 2 0 011.455-2.425l1.09-.272a1 1 0 011.212.727l1.515 6.06a1 1 0 01-.727 1.213l-1.09.272a2 2 0 01-2.425-1.455zM6.158 8.633l1.114 4.456M8 21l3.105-6.21" />
      <Circle cx={12} cy={13} r={2} />
    </Svg>
  );
}

export default Scope;
