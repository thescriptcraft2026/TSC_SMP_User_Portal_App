import { useRef } from 'react';
import { Animated } from 'react-native';

export const useLikeAnimation = () => {
  const likeScale = useRef(new Animated.Value(1)).current;

  const PARTICLE_COUNT = 8;

  const particleAnims = useRef(
    Array.from({ length: PARTICLE_COUNT }, () => new Animated.Value(0)),
  ).current;

  const animateLike = () => {
    likeScale.stopAnimation();
    likeScale.setValue(0.6);

    Animated.sequence([
      Animated.timing(likeScale, {
        toValue: 1.25,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(likeScale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateParticles = () => {
    particleAnims.forEach(anim => {
      anim.stopAnimation();
      anim.setValue(0);
    });

    Animated.stagger(
      20,
      particleAnims.map(anim =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ),
    ).start();
  };

  return {
    likeScale,
    particleAnims,
    animateLike,
    animateParticles,
  };
};
