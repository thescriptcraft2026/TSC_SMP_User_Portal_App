import * as React from "react"
import Svg, { Path, Text } from "react-native-svg"

type Props = {
    size?: number;
    color?: any;
};

function Twitter({ size = 18, color = '#101010', ...props }: Props) {
    return (
        <Svg
            width={size}
            height={size}
            viewBox="0 0 1200 1227"
            {...props}
        >
            <Path
                fill={color}
                d="M714.2 519.3L1160.9 0H1055.3L667.5 450.9L357.8 0H0L468.5 681.8L0 1226.4H105.6L515.2 750.2L842.2 1226.4H1200L714.2 519.3ZM568.8 688.3L521.4 620.5L143.3 79.7H306.1L611.2 516.2L658.6 584L1055.4 1151.5H892.6L568.8 688.3Z"
            />
        </Svg>
    )
}

export default Twitter
