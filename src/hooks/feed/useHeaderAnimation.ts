import { useRef } from 'react';

import { Animated, Platform } from 'react-native';

import { tabBarScrollY } from '../../navigation/BottomTab';

const EXPANDED_HEADER_HEIGHT = Platform.OS === 'ios' ? 140 : 120;

export const useHeaderAnimation = () => {
  const scrollY = useRef(new Animated.Value(0)).current;

  const lastScrollY = useRef(0);

  const tabVisible = useRef(true);

  const scrollRefs = useRef<any[]>([]);

  const scrollOffsets = useRef([0, 0, 0]);

  // ✅ HEADER STICKY ANIMATION
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, EXPANDED_HEADER_HEIGHT],

    outputRange: [0, -(EXPANDED_HEADER_HEIGHT - 60)],

    extrapolate: 'clamp',
  });

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 70],
    outputRange: [EXPANDED_HEADER_HEIGHT, 50],
    extrapolate: 'clamp',
  });

  // ✅ BOTTOM TAB HIDE
  const handleTabBarAnimation = (y: number) => {
    const delta = y - lastScrollY.current;

    if (delta > 8 && tabVisible.current) {
      tabVisible.current = false;

      Animated.spring(tabBarScrollY, {
        toValue: 120,
        useNativeDriver: true,
      }).start();
    }

    if (delta < -8 && !tabVisible.current) {
      tabVisible.current = true;

      Animated.spring(tabBarScrollY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }

    lastScrollY.current = y;
  };

  const handleScroll = (index: number) =>
    Animated.event(
      [
        {
          nativeEvent: {
            contentOffset: {
              y: scrollY,
            },
          },
        },
      ],
      {
        useNativeDriver: false,

        listener: (event: any) => {
          const y = event.nativeEvent.contentOffset.y;

          scrollOffsets.current[index] = y;

          handleTabBarAnimation(y);

          lastScrollY.current = y;
        },
      },
    );

  // ✅ SYNC TABS
  const syncScroll = (index: number) => {
    scrollRefs.current.forEach((ref, i) => {
      if (!ref || i === index) return;

      const offset =
        scrollOffsets.current[index] > EXPANDED_HEADER_HEIGHT
          ? EXPANDED_HEADER_HEIGHT
          : scrollOffsets.current[index];

      ref.scrollToOffset({
        offset,
        animated: false,
      });
    });
  };

  return {
    scrollY,

    headerTranslateY,

    scrollRefs,

    handleScroll,

    syncScroll,

    handleTabBarAnimation,
    headerHeight,
  };
};
