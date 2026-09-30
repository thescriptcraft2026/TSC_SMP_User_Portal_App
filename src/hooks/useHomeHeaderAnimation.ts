import { Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useHomeHeaderAnimation = (
  headerOffset: Animated.Value,
  pagerScroll: Animated.Value,
  TAB_WIDTH: number,
  showTabs: boolean,
) => {
  const insets = useSafeAreaInsets();

  // Header layout
  const HEADER_TOP =
    Platform.OS === 'ios' ? 52 : 48;

  const TAB_HEIGHT =
    showTabs
      ? Platform.OS === 'ios'
        ? 20
        : 30
      : 0;

  const HEADER_PADDING =
    Platform.OS === 'ios' ? 8 : 10;

  const EXPANDED_HEADER_HEIGHT =
    insets.top +
    HEADER_TOP +
    TAB_HEIGHT +
    HEADER_PADDING;

  const COLLAPSED_HEADER_HEIGHT =
    showTabs
      ? insets.top + TAB_HEIGHT + HEADER_PADDING
      : EXPANDED_HEADER_HEIGHT;

  const TOP_HEADER_HEIGHT = showTabs
    ? EXPANDED_HEADER_HEIGHT - COLLAPSED_HEADER_HEIGHT
    : 0;

  const headerTranslate = showTabs
    ? headerOffset.interpolate({
        inputRange: [0, TOP_HEADER_HEIGHT],
        outputRange: [0, -TOP_HEADER_HEIGHT],
        extrapolate: 'clamp',
      })
    : new Animated.Value(0);

  const topSectionOpacity = showTabs
    ? headerOffset.interpolate({
        inputRange: [0, TOP_HEADER_HEIGHT * 0.5, TOP_HEADER_HEIGHT],
        outputRange: [1, 0.5, 0],
        extrapolate: 'clamp',
      })
    : new Animated.Value(1);

  const topSectionTranslateY = showTabs
    ? headerOffset.interpolate({
        inputRange: [0, TOP_HEADER_HEIGHT],
        outputRange: [0, -HEADER_TOP],
        extrapolate: 'clamp',
      })
    : new Animated.Value(0);

  const blurOpacity = new Animated.Value(1);

  return {
    headerTranslate,
    topSectionOpacity,
    topSectionTranslateY,
    blurOpacity,
    EXPANDED_HEADER_HEIGHT,
    COLLAPSED_HEADER_HEIGHT,
    TOP_HEADER_HEIGHT,
  };
};