import Ionicons from '@react-native-vector-icons/ionicons';
import React, { createContext, useContext, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  useColorScheme,
  PanResponder,
} from 'react-native';

const ToastContext = createContext<any>(null);
export const useToast = () => useContext(ToastContext);

const { width } = Dimensions.get('window');

export const ToastProvider = ({ children }: any) => {
  const [toast, setToast] = useState<any>(null);

  const translateY = useRef(new Animated.Value(-100)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scheme = useColorScheme();
  const isDark = true;

  const show = (data: any) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    translateX.setValue(0);
    setToast(data);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 60,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    timeoutRef.current = setTimeout(() => {
      hide();
    }, 3000);
  };

  const hide = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      translateX.setValue(0);
      setToast(null);
    });
  };

const panResponder = useRef(
  PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return gestureState.dy < -5; // Only respond to upward drag
    },

    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy < 0) {
        // Toast is at Y = 60, move it upward
        translateY.setValue(60 + gestureState.dy);
      }
    },

    onPanResponderRelease: (_, gestureState) => {
      // If dragged up more than 50px, dismiss
      if (gestureState.dy < -50) {
        hide();
      } else {
        // Otherwise return to original position
        Animated.spring(translateY, {
          toValue: 60,
          useNativeDriver: true,
        }).start();
      }
    },
  })
).current;
  const getTypeStyles = (
    type: string,
  ): { icon: React.ComponentProps<typeof Ionicons>['name']; color: string } => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle',
          color: '#4CAF50',
        };
      case 'error':
        return {
          icon: 'close-circle',
          color: '#FF3B30',
        };
      case 'info':
      default:
        return {
          icon: 'information-circle',
          color: '#007AFF',
        };
    }
  };

  const colors = {
    background: isDark ? '#1E1E1E' : '#FFFFFF',
    title: isDark ? '#FFFFFF' : '#111111',
    shadow: isDark ? '#000' : '#999',
  };

  const typeStyles = getTypeStyles(toast?.type);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}

      {toast && (
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.wrapper,
            {
              opacity,
              transform: [{ translateY }, { translateX }],
            },
          ]}
        >
          <View
            style={[
              styles.container,
              {
                backgroundColor: colors.background,
                shadowColor: colors.shadow,
              },
            ]}
          >
            {/* 🔥 Icon */}
            <Ionicons
              name={typeStyles.icon}
              size={18}
              color={typeStyles.color}
              style={styles.icon}
            />

            {/* 🔥 Text */}
            <Text style={[styles.title, { color: colors.title }]}>
              {toast.title}
            </Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    width,
    alignItems: 'center',
    zIndex: 999,
  },

  container: {
    flexDirection: 'row', // 🔥 important for icon + text
    alignItems: 'center',
    alignSelf: 'center',
    maxWidth: width * 0.8,
    borderRadius: 100,
    paddingVertical: 10,
    paddingHorizontal: 16,

    // Shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },

  icon: {
    marginRight: 8,
  },

  title: {
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1, // 🔥 prevents overflow
  },
});
