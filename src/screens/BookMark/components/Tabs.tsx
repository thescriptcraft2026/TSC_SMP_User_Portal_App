import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  ScrollView,
  Dimensions,
  useColorScheme,
  Platform,
} from 'react-native';

import { Fonts } from '../../../constants/Fonts';
import { themeColors } from '../../../theme/colors';

const tabs = [
  'Posts',
  'Books',
  'Synopses',
  'Creators Zone',
  'Contest',
  'Opportunities',
  'Unfiltered',
];

const SCREEN_WIDTH = Dimensions.get('window').width;
const TAB_WIDTH = SCREEN_WIDTH / 4;

type Props = {
  activeIndex: number;
  onTabChange: (index: number) => void;
};

const Tabs = ({ activeIndex, onTabChange }: Props) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const isDark = true;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: activeIndex * TAB_WIDTH,
      useNativeDriver: true,
    }).start();
  }, [activeIndex]);

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: isDark ? '#333' : '#ddd',
          backgroundColor: isDark ? themeColors.black : themeColors.zinc,
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
      >
        {tabs.map((tab, index) => (
          <Pressable
            key={index}
            style={[styles.tab, { width: TAB_WIDTH }]}
            onPress={() => onTabChange(index)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeIndex === index
                      ? themeColors.primary
                      : isDark
                      ? '#9ca3af'
                      : '#6b7280',
                },
              ]}
            >
              {tab}
            </Text>
          </Pressable>
        ))}

        {/* INDICATOR */}
        <Animated.View
          style={[
            styles.indicator,
            {
              width: TAB_WIDTH,
              backgroundColor: themeColors.primary,
              transform: [{ translateX }],
            },
          ]}
        />
      </ScrollView>
    </View>
  );
};

export default Tabs;

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 0.5,
  },

  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  tab: {
    paddingBottom: Platform.OS === 'ios' ? 12 : 12,
    paddingTop: Platform.OS === 'ios' ? 6 : 6,
    alignItems: 'center',
  },

  tabText: {
    fontSize: 14,
    fontFamily: Fonts.Medium,
  },

  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    borderRadius: 2,
  },
});
