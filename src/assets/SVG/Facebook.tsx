import * as React from "react"
import Svg, { Path, Text } from "react-native-svg"

type Props = {
  size?: number;
  color?: any;
};

function Facebook({ size = 26, color = '#101010', ...props }: Props) {
  return (
  <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path
        fill={color}
        d="M13.5 22V13.8H16.3L16.7 10.6H13.5V8.55C13.5 7.63 13.76 7 15.08 7H16.8V4.14C16.5 4.1 15.48 4 14.29 4C11.82 4 10.13 5.5 10.13 8.25V10.6H7.5V13.8H10.13V22H13.5Z"
      />
    </Svg>
  )
}

export default Facebook
