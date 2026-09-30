import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import Ionicons from '@react-native-vector-icons/ionicons';

type Props = {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
  icon?: any;
  marginVertical?: any;
  showCloseIcon?: boolean;
  onClosePress?: any;
};

const Tabs = ({
  tabs,
  activeTab,
  onChange,
  icon,
  marginVertical = 10,
  showCloseIcon = false,
  onClosePress,
}: Props) => {
  const isDark = true;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.container,
        { marginVertical: marginVertical },
      ]}
    >
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab;

        return (
          <TouchableOpacity
            key={`${tab}-${index}`}
            onPress={() => onChange(tab)}
            style={[
              styles.tab,
              {
                backgroundColor: isActive
                  ? themeColors.primary
                  : isDark
                  ? '#2A2A2A'
                  : 'transparent',
                borderColor: isActive
                  ? themeColors.primary
                  : isDark
                  ? '#2A2A2A'
                  : '#2A2A2A',
              },
            ]}
          >
            {icon}

            <Text
              style={[
                styles.text,
                {
                  color: isActive ? '#000' : isDark ? '#fff' : '#fff',
                },
              ]}
            >
              {tab}
            </Text>

            {showCloseIcon && isActive && (
              <TouchableOpacity
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={() => onClosePress?.(tab)}
                style={{ marginLeft: 6 }}
              >
                <Ionicons name="close" size={14} color="#000" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

export default Tabs;

const styles = StyleSheet.create({
  container: {
    // paddingHorizontal: 16,
    gap: 2,
    marginVertical: 10,
  },

  tab: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
  },

  text: {
    fontSize: 12,
    fontFamily: Fonts.Medium,
  },
});
