import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
  size?: number;
  color?: any;
};
function Youtube({ size = 18, color = '#101010', ...props }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...props}>
      <Path stroke={color} d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088C19.49 3.58 12 3.58 12 3.58s-7.49 0-9.407.538A3.007 3.007 0 00.505 6.205 31.24 31.24 0 000 12a31.24 31.24 0 00.505 5.795 3.007 3.007 0 002.088 2.088C4.51 20.42 12 20.42 12 20.42s7.49 0 9.407-.538a3.007 3.007 0 002.088-2.088A31.24 31.24 0 0024 12a31.24 31.24 0 00-.505-5.795zm-13.95 9.363V8.432L15.818 12l-6.273 3.568z" />
    </Svg>
  );
}

export default Youtube;
