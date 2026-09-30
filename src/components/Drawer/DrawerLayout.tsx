import React, { useRef, useState, createContext, useContext } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
  PanResponder,
  TouchableOpacity,
  Easing,
} from 'react-native';
import DrawerMenu from './DrawerMenu';

const DrawerContext = createContext<any>(null);
export const useDrawer = () => useContext(DrawerContext);

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.55;

const DrawerLayout = ({ children, enableGesture = false }: any) => {
  const animation = useRef(new Animated.Value(0)).current;
  const [open, setOpen] = useState(false);

  const openDrawer = () => {
    setOpen(true);

    Animated.timing(animation, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => setOpen(false));
  };

  const drawerTranslate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-DRAWER_WIDTH, 0],
  });

  // const screenTranslate = animation.interpolate({
  //   inputRange: [0, 1],
  //   outputRange: [0, DRAWER_WIDTH],
  // });

  const screenScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1],
  });

  const overlayOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.35],
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 20 && Math.abs(gesture.dy) < 20,

      onShouldBlockNativeResponder: () => false,

      onPanResponderTerminationRequest: () => false,

      onPanResponderMove: (_, gesture) => {
        let progress = gesture.dx / DRAWER_WIDTH;

        if (open) {
          progress = 1 + gesture.dx / DRAWER_WIDTH;
        }

        progress = Math.max(0, Math.min(1, progress));
        animation.setValue(progress);
      },

      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > DRAWER_WIDTH * 0.3) {
          openDrawer();
        } else if (gesture.dx < -DRAWER_WIDTH * 0.3) {
          closeDrawer();
        } else {
          open ? openDrawer() : closeDrawer();
        }
      },
    }),
  ).current;

  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer, open }}>
      <View style={styles.container}>
        {/* Drawer */}
        <Animated.View
          renderToHardwareTextureAndroid
          style={[
            styles.drawer,
            { transform: [{ translateX: drawerTranslate }] },
          ]}
        >
          <DrawerMenu />
        </Animated.View>

        {/* Overlay */}
        <Animated.View
          pointerEvents={open ? 'auto' : 'none'}
          style={[styles.overlay, { opacity: overlayOpacity }]}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={closeDrawer}
          />
        </Animated.View>

        {/* Main Screen */}
        <Animated.View
          renderToHardwareTextureAndroid
          style={[
            styles.main,
            // {
            //   transform: [
            //     { translateX: screenTranslate },
            //     { scale: screenScale },
            //   ],
            // },
          ]}
          {...(enableGesture ? panResponder.panHandlers : {})}
        >
          {children}
        </Animated.View>
      </View>
    </DrawerContext.Provider>
  );
};

export default DrawerLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  drawer: {
    position: 'absolute',
    width: DRAWER_WIDTH,
    height: '100%',
    left: 0,
    top: 0,
    zIndex: 5,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 4,
  },

  main: {
    flex: 1,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
});
