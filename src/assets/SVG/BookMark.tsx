import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
  width?: number;
  height?: number;
  color?: any;
  bookmarked?: boolean;
};

function BookMark({
  width = 24,
  height = 24,
  color = '#101010',
  bookmarked = false,
}: Props) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={bookmarked ? color : 'none'}
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path
        fill={bookmarked ? color : 'none'}
        d="M17 3a2 2 0 012 2v15a1 1 0 01-1.496.868l-4.512-2.578a2 2 0 00-1.984 0l-4.512 2.578A1 1 0 015 20V5a2 2 0 012-2z"
      />
    </Svg>
  );
}

export default BookMark;
