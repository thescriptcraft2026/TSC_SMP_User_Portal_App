import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
  size?: number;
  color?: any;
};

function WhatsApp({ size = 18, color = '#101010', ...props }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {/* Outer chat circle */}
      <Path
        d="M12 2C6.48 2 2 6.03 2 11c0 1.9.63 3.65 1.69 5.08L2.5 21.5l5.6-1.15C9.54 21.45 10.74 22 12 22c5.52 0 10-4.03 10-9S17.52 2 12 2z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {/* Phone inside */}
      <Path
        d="M8.5 9.5c.3-.6.8-1 1.3-1 .3 0 .5.1.7.3l.8 1c.2.2.2.5.1.7l-.3.6c-.1.2 0 .5.2.7.5.6 1.2 1.2 1.8 1.6.2.1.5.1.7 0l.6-.3c.2-.1.5-.1.7.1l1 .8c.2.2.3.4.3.7 0 .5-.4 1-1 1.3-.5.2-1 .3-1.6.2-1.4-.3-3.1-1.5-4.6-3-1.5-1.5-2.7-3.2-3-4.6-.1-.6 0-1.1.2-1.6z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default WhatsApp;
