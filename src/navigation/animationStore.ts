import { Animated } from 'react-native';

export const scrollY = new Animated.Value(0);

export let lastScrollY = 0;
export let tabBarVisible = true;