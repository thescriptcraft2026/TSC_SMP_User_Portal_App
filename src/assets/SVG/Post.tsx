import * as React from 'react';
import Svg, { Path } from 'react-native-svg';
type Props = {
  width?: number;
  height?: number;
  color?: string;
};

const Post = ({ width = 24, height = 24, color = 'currentColor' }: Props) => {
  return (
    <Svg width={width} height={width} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 10v5c0 5-2 7-7 7H9c-5 0-7-2-7-7V9c0-5 2-7 7-7h5"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M22 10h-4c-3 0-4-1-4-4V2l8 8zM7 13h6M7 17h4"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default Post;
