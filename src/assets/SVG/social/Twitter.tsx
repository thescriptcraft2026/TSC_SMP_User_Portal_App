import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
type Props = {
  size?: number;
  color?: any;
};
function Twitter({ size = 18, color = '#101010', ...props }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...props}>
      <Path
        stroke={color}
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L2.25 2.25h6.938l4.26 5.631 5.796-5.631zm-1.161 17.52h1.833L7.003 4.13H5.036l12.047 15.64z"
      />
    </Svg>
  );
}

export default Twitter;
