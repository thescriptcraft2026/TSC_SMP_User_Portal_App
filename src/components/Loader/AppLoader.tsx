import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Image } from 'react-native';

type Props = {
  visible: boolean;
};

const AppLoader = ({ visible }: Props) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    }
  }, [visible]);

  if (!visible) return null;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.overlay}>
      <View style={styles.loaderWrapper}>
        <Animated.View
          style={[
            styles.ring,
            {
              transform: [{ rotate }],
            },
          ]}
        />

        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/Logo/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
};

export default AppLoader;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },

  loaderWrapper: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },

  ring: {
    position: 'absolute',
    width: 134,
    height: 134,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: '#D08A1C',
    borderTopColor: 'transparent',
    borderRightColor: '#F5B041',
  },

  logoContainer: {
    width: 102,
    height: 102,
    borderRadius: 999,
    // backgroundColor: '#3B2A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    width: 102,
    height: 102,
  },
});
