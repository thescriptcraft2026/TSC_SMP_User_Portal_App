import React, { useEffect, useRef } from 'react';
import {
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OnboardingData } from '../../data/data';
import { Fonts } from '../../constants/Fonts';

type Props = {
  flatListRef: React.RefObject<FlatList<OnboardingData> | null>;
  flatListIndex: any;
  dataLength: number;
  x: Animated.Value;
};

const CustomButton = ({ flatListRef, flatListIndex, dataLength, x }: Props) => {
  const navigation = useNavigation<any>();
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  // Animations
  const widthAnim = useRef(new Animated.Value(60)).current;
  const arrowOpacity = useRef(new Animated.Value(1)).current;
  const arrowTranslate = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslate = useRef(new Animated.Value(-100)).current;

  // Trigger animation on index change
  useEffect(() => {
    if (flatListIndex === dataLength - 1) {
      Animated.parallel([
        Animated.spring(widthAnim, {
          toValue: 140,
          useNativeDriver: false,
        }),
        Animated.timing(arrowOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(arrowTranslate, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslate, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(widthAnim, {
          toValue: 60,
          useNativeDriver: false,
        }),
        Animated.timing(arrowOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(arrowTranslate, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslate, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [flatListIndex]);

  // Background color animation
  const backgroundColor = x.interpolate({
    inputRange: [0, SCREEN_WIDTH, 2 * SCREEN_WIDTH],
    outputRange: ['#000', '#000', '#FFF'],
  });

  // Press handler
  const handlePress = () => {
    if (flatListIndex < dataLength - 1) {
      flatListRef.current?.scrollToIndex({
        index: flatListIndex + 1,
        animated: true,
      });
    } else {
      navigation.navigate('Auth');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <Animated.View
        style={[
          styles.container,
          {
            width: widthAnim,
            backgroundColor,
          },
        ]}
      >
        {/* Text */}
        <Animated.Text
          style={[
            styles.buttonText,
            {
              opacity: textOpacity,
              transform: [{ translateX: textTranslate }],
            },
          ]}
        >
          Get Started
        </Animated.Text>

        {/* Arrow */}
        <Animated.Image
          source={require('../../assets/ArrowIcon.png')}
          style={[
            styles.arrow,
            {
              opacity: arrowOpacity,
              transform: [{ translateX: arrowTranslate }],
            },
          ]}
        />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    width: 60,
    height: 60,
  },
  arrow: {
    position: 'absolute',
    width: 30,
    height: 30,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    position: 'absolute',
    fontFamily:Fonts.Medium
  },
});
