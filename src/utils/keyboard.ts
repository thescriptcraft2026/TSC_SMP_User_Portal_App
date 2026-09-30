// utils/keyboard.ts

import { Dimensions, Platform } from 'react-native';

const { height } = Dimensions.get('window');

const isSmallPhone = height < 700;
const isMediumPhone = height >= 700 && height < 850;
const isLargePhone = height >= 850;
const isTablet = height >= 1000;

export const keyboardAwareProps = {
  enableOnAndroid: true,
  keyboardOpeningTime: 0,
  keyboardShouldPersistTaps: 'handled' as const,
  nestedScrollEnabled: true,

  extraScrollHeight: Platform.select({
    ios: 0,
    android: isTablet
      ? 180
      : isLargePhone
      ? 150
      : isMediumPhone
      ? 120
      : 90,
  }),

  extraHeight: Platform.select({
    ios: 120,
    android: isTablet
      ? 140
      : isLargePhone
      ? 120
      : isMediumPhone
      ? 100
      : 80,
  }),
};