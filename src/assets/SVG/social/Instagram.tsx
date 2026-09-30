import * as React from 'react';
import Svg, { Rect, Circle } from 'react-native-svg';

type Props = {
  size?: number;
  color?: any;
};
function Instagram({ size = 18, color = '#101010', ...props }: Props) {
  return (
    <Svg viewBox="0 0 24 24" {...props}>
      <Rect
        x={2}
        y={2}
        width={size}
        height={size}
        rx={5.5}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
      />
      <Circle
        cx={12}
        cy={12}
        r={4.5}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
      />
      <Circle cx={17} cy={7} r={1.3} />
    </Svg>
  );
}

export default Instagram;
