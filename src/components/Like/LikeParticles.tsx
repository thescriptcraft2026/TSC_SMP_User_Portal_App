import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export const LikeParticles = ({ particleAnims }: any) => {
  return (
    <View style={styles.container} pointerEvents="none">
      {particleAnims.map((anim: any, i: number) => {
        const angle = (i * 45 * Math.PI) / 180;

        const DISTANCE = 50;

        const translateX = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.sin(angle) * DISTANCE],
        });

        const translateY = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -Math.cos(angle) * DISTANCE],
        });

        const opacity = anim.interpolate({
          inputRange: [0, 0.01, 1],
          outputRange: [0, 1, 0],
        });

        return (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                opacity,
                transform: [
                  { translateX },
                  { translateY },
                  {
                    rotate: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [
                        '0deg',
                        `${(i % 2 === 0 ? 1 : -1) * 180}deg`,
                      ],
                    }),
                  },
                ],
                // backgroundColor: ['#ff3040', '#ffd166', '#ff7b00'][i % 3],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -35,
    left: -35,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex:999,
    pointerEvents: 'none',
    overflow: 'visible',
  },

  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red', // 🔥 force visible
  },
});
