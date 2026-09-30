import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
  size?: number;
  color?: any;
};
function Wifi({ size = 18, color = '#101010', ...props }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M1.393 7.393a1 1 0 101.415 1.415c5.077-5.077 13.308-5.077 18.384 0a1 1 0 101.415-1.415c-5.858-5.857-15.356-5.857-21.214 0z"
        fill={color}
      />
      <Path
        d="M4.222 11.636a1 1 0 010-1.414c4.295-4.296 11.26-4.296 15.556 0a1 1 0 01-1.414 1.414 9 9 0 00-12.728 0 1 1 0 01-1.414 0z"
        fill={color}
      />
      <Path
        d="M7.05 13.05a1 1 0 101.414 1.414 5 5 0 017.072 0 1 1 0 101.414-1.414 7 7 0 00-9.9 0z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 15a3 3 0 100 6 3 3 0 000-6zm-1 3a1 1 0 112 0 1 1 0 01-2 0z"
        fill={color}
      />
    </Svg>
  );
}

export default Wifi;
