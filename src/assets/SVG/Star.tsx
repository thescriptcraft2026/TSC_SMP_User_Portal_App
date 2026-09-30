import * as React from 'react';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { themeColors } from '../../theme/colors'; // adjust path to match your project

type Props = {
  size?: number;
  color?: any; // stroke/outline color
  fillColor?: any; // color used for the filled portion
  filled?: boolean; // solid fill on/off (e.g. star-by-star rating pickers)
  rating?: number; // 0 - 5, for proportional gradient fill (e.g. BookCard avg rating)
  maxRating?: number; // defaults to 5
};

let idCounter = 0;

function Star({
  size = 18,
  color = '#FFFFFF',
  fillColor = themeColors.primary,
  filled = false,
  rating,
  maxRating = 5,
  ...props
}: Props) {
  const gradId = React.useRef(`starFill-${idCounter++}`).current;

  const hasRating = typeof rating === 'number' && !isNaN(rating);
  const percent = hasRating
    ? Math.max(0, Math.min(100, (rating! / maxRating) * 100))
    : 0;

  const fill = filled
    ? fillColor
    : hasRating
      ? `url(#${gradId})`
      : 'none';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      {hasRating && !filled && (
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <Stop offset={`${percent}%`} stopColor={fillColor} stopOpacity={1} />
            <Stop offset={`${percent}%`} stopColor={fillColor} stopOpacity={0} />
          </LinearGradient>
        </Defs>
      )}
      <Path
        d="M13.73 3.51l1.76 3.52c.24.49.88.96 1.42 1.05l3.19.53c2.04.34 2.52 1.82 1.05 3.28l-2.48 2.48c-.42.42-.65 1.23-.52 1.81l.71 3.07c.56 2.43-.73 3.37-2.88 2.1l-2.99-1.77c-.54-.32-1.43-.32-1.98 0l-2.99 1.77c-2.14 1.27-3.44.32-2.88-2.1l.71-3.07c.13-.58-.1-1.39-.52-1.81l-2.48-2.48c-1.46-1.46-.99-2.94 1.05-3.28l3.19-.53c.53-.09 1.17-.56 1.41-1.05l1.76-3.52c.96-1.91 2.52-1.91 3.47 0z"
        fill={fill}
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default Star;