import React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
  size?: number;
  color?: any;
};

const Comment = ({ size = 18, color = '#101010', ...props }: Props) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M2.992 16.342a2 2 0 01.094 1.167l-1.065 3.29a1 1 0 001.236 1.168l3.413-.998a2 2 0 011.099.092 10 10 0 10-4.777-4.719"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default Comment;
