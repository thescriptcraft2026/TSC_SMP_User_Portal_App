import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = width / guidelineBaseWidth;
const verticalScale = height / guidelineBaseHeight;

export const scaleSize = (size: number) => size * scale;

export const verticalScaleSize = (size: number) => size * verticalScale;

export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scaleSize(size) - size) * factor;
};

export const responsiveFont = (
  size: number,
  min?: number,
  max?: number,
): number => {
  const newSize = PixelRatio.roundToNearestPixel(moderateScale(size));

  if (min !== undefined && newSize < min) return min;
  if (max !== undefined && newSize > max) return max;

  return newSize;
};

export const responsiveWidth = (percent: number) => (width * percent) / 100;

export const responsiveHeight = (percent: number) => (height * percent) / 100;

export { width as SCREEN_WIDTH, height as SCREEN_HEIGHT };
