import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
type Props = {
  size?: number;
  color?: any;
};
function Facebook({ size = 18, color = '#101010', ...props }: Props) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size} {...props}>
      <Path
        stroke={color}
        fill={color}
        d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.103 4.388 23.104 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971h-1.513c-1.491 0-1.956.93-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.104 24 18.103 24 12.073z"
      />
    </Svg>
  );
}

export default Facebook;
