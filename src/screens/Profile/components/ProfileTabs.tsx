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
} from 'react-native';

import { Fonts } from '../../../constants/Fonts';
import { themeColors } from '../../../theme/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;

type Props = {
  tabs: string[]; // ✅ dynamic tabs
  activeIndex: number;
  onTabChange: (index: number) => void;
};

const ProfileTabs = ({ tabs, activeIndex, onTabChange }: Props) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const isDark = true;

  // ✅ dynamic width (max 4 visible at once)
  const TAB_WIDTH =
    tabs.length <= 4 ? SCREEN_WIDTH / tabs.length : SCREEN_WIDTH / 4;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: activeIndex * TAB_WIDTH,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, TAB_WIDTH]);

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: isDark ? '#333' : '#ddd',
          backgroundColor: isDark ? themeColors.black : themeColors.appBackground,
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
              numberOfLines={1}
            >
              {tab}
            </Text>
          </Pressable>
        ))}

        {/* 🔥 Animated Indicator */}
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

export default ProfileTabs;

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 0.5,
    zIndex: 10,
  },

  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  tab: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
