import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
  size?: number;
  color?: any;
};
function LinkedIn({ size = 18, color = '#101010', ...props }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...props}>
      <Path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S.02 4.88.02 3.5 1.13 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.25h4V23h-4V8.25zm8 0h3.83v2.03h.05c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V23H17v-7.73c0-1.84-.03-4.21-2.56-4.21-2.57 0-2.96 2-2.96 4.07V23H8.5V8.25z" />
    </Svg>
  );
}

export default LinkedIn;
