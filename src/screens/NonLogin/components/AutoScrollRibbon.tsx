import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { themeColors } from '../../../theme/colors';
import { Fonts } from '../../../constants/Fonts';

const { width } = Dimensions.get('window');

const RED_TEXT = ' ✦ Write & Develop ✦ Collaborate ';

const BLACK_TEXT = ' ✦ Get Discovered ✦ Win & Grow ';

export default function AutoScrollRibbon() {
  const redAnim = useRef(new Animated.Value(0)).current;

  const blackAnim = useRef(new Animated.Value(-width)).current;

  useEffect(() => {
    const animateRed = () => {
      redAnim.setValue(0);

      Animated.timing(redAnim, {
        toValue: -width,
        duration: 10000,
        useNativeDriver: true,
      }).start(() => animateRed());
    };

    const animateBlack = () => {
      blackAnim.setValue(-width);

      Animated.timing(blackAnim, {
        toValue: 0,
        duration: 10000,
        useNativeDriver: true,
      }).start(() => animateBlack());
    };

    animateRed();
    animateBlack();
  }, []);

  return (
    <View style={styles.container}>
      {/* RED LEFT -> RIGHT */}
      <View style={styles.redWrapper}>
        <Animated.View
          style={[
            styles.row,
            {
              transform: [{ translateX: redAnim }],
            },
          ]}
        >
          {[...Array(20)].map((_, i) => (
            <Text key={i} style={styles.redText}>
              {RED_TEXT}
            </Text>
          ))}
        </Animated.View>
      </View>

      {/* BLACK RIGHT -> LEFT */}
      <View style={styles.blackWrapper}>
        <Animated.View
          style={[
            styles.row,
            {
              transform: [{ translateX: blackAnim }],
            },
          ]}
        >
          {[...Array(20)].map((_, i) => (
            <Text key={i} style={styles.blackText}>
              {BLACK_TEXT}
            </Text>
          ))}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 120,
    justifyContent: 'center',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width * 4,
  },

  /* RED RIBBON */
  redWrapper: {
    backgroundColor: themeColors.primary,
    paddingVertical: 8,
    transform: [{ rotate: '-3deg' }],
    zIndex: 2,
    marginBottom: 0,
  },

  redText: {
    color: '#000',
    fontSize: Platform.OS === 'android' ? 28 : 22,
    fontFamily: Fonts.Bold,
    marginRight: 20,
  },

  /* BLACK RIBBON */
  blackWrapper: {
    backgroundColor: themeColors.card2,
    paddingVertical: 8,
    transform: [{ rotate: '3deg' }],
    zIndex: 1,
  },

  blackText: {
    color: '#FFF',
    fontSize: Platform.OS === 'android' ? 28 : 22,
    fontFamily: Fonts.Bold,
    marginRight: 20,
  },
});
