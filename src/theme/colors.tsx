import { ColorValue } from 'react-native';

export const themeColors: Record<string, ColorValue> = {
  white: '#FFFFFF',
  black: '#09090d',
  gray: '#676767ff',

  appBg: '#e59319',

  stone: '#fafafa',
  zinc: '#f4f4f5',
  slate: '#f1f5f9',
  neutral: '#d4d4d4',

  background: '#121212',
  appBackground: '#F2F4F7',
  foreground: '#F8F9FA',
  card: '#2C3136',
  card2: '#adb5bd21',
  card3: '#e7e5e4',
  card4: '#edededff',
  card5: '#1A1D24',
  cardForeground: '#F8F9FA',
  popover: '#2C3136',
  popoverForeground: '#F8F9FA',

  primary: '#EB9D08',
  red: '#ff0000df',
  green: '#16a34a',
  lightGreen: '#bbf7d0',
  secondary2: '#66A3FF',
  primaryForeground: '#212529',
  secondary: '#ADB5BD',
  secondaryForeground: '#212529',

  // ===== Border / Input =====
  border: '#495057',
  input: '#495057',
  inputBackground: '#2C3136',
  switchBackground: '#495057',
  inputBackgroundDark: '#1c1c1e',
  inputBackgroundLight: '#f1f1f3',

  overlay: 'rgba(0, 0, 0, 0.6)',
  borderLight: '#49505730',
  borderMedium: '#49505750',
  disabledOpacity: 'rgba(73, 80, 87, 0.5)',
};

export type ThemeColor = keyof typeof themeColors;
