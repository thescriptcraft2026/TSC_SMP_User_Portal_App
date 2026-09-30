import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
type Props = {
  size?: number;
  color?: any;
};

function Edit({ size = 18, color = '#101010', ...props }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} {...props}>
      <Path
        d="M3.5 20.5c.83.83 2.17.83 3 0l13-13c.83-.83.83-2.17 0-3-.83-.83-2.17-.83-3 0l-13 13c-.83.83-.83 2.17 0 3zM18.01 8.99l-3-3"
        stroke="#101010"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.5 2.44L10 2l-.44 1.5L10 5l-1.5-.44L7 5l.44-1.5L7 2l1.5.44zM4.5 8.44L6 8l-.44 1.5L6 11l-1.5-.44L3 11l.44-1.5L3 8l1.5.44zM19.5 13.44L21 13l-.44 1.5L21 16l-1.5-.44L18 16l.44-1.5L18 13l1.5.44z"
        stroke="#101010"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default Edit;
