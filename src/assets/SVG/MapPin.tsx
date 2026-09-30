import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
  size?: number;
  color?: any;
};
function MapPin({ size = 18, color = '#101010', ...props }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 6a4 4 0 100 8 4 4 0 000-8zm-2 4a2 2 0 114 0 2 2 0 01-4 0z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 0C6.498 0 2 4.367 2 9.8c0 3.667 2.196 7.199 4.366 9.726a25.406 25.406 0 003.176 3.116c.467.38.898.69 1.26.913.18.111.36.21.53.285.137.06.387.16.668.16s.531-.1.669-.16c.17-.075.349-.174.529-.285a12.41 12.41 0 001.26-.913 25.409 25.409 0 003.176-3.116C19.804 17 22 13.466 22 9.8 22 4.367 17.502 0 12 0zM4 9.8C4 5.513 7.56 2 12 2c4.44 0 8 3.513 8 7.8 0 2.933-1.804 6.001-3.884 8.424a23.419 23.419 0 01-2.918 2.865c-.423.343-.781.599-1.048.763a3.75 3.75 0 01-.15.088 3.75 3.75 0 01-.15-.088c-.267-.164-.625-.42-1.048-.763a23.421 23.421 0 01-2.918-2.865C5.804 15.8 4 12.734 4 9.8z"
        fill={color}
      />
    </Svg>
  );
}

export default MapPin;
