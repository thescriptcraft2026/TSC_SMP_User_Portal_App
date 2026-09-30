import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
  filled?: boolean;
};

function Feed({
  size = 18,
  color = '#101010',
  filled = false,
  ...props
}: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      {filled ? (
        <Path
          d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81v8.37C2 19.83 4.17 22 7.81 22h8.37c3.64 0 5.81-2.17 5.81-5.81V7.81C22 4.17 19.83 2 16.19 2zM17 17.25H7c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h10c.41 0 .75.34.75.75s-.34.75-.75.75zm0-4.5H7c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h10c.41 0 .75.34.75.75s-.34.75-.75.75zm0-4.5H7c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h10c.41 0 .75.34.75.75s-.34.75-.75.75z"
          fill={color}
        />
      ) : (
        <>
          {/* Box */}
          <Path
            d="M7.81 2.75h8.38c3.22 0 5.06 1.84 5.06 5.06v8.38c0 3.22-1.84 5.06-5.06 5.06H7.81c-3.22 0-5.06-1.84-5.06-5.06V7.81c0-3.22 1.84-5.06 5.06-5.06z"
            stroke={color}
            strokeWidth={1.5}
          />

          {/* Lines */}
          <Path
            d="M7 8.25h10M7 12h10M7 15.75h10"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </>
      )}
    </Svg>
  );
}

export default Feed;