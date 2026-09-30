import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import CheckTwo from '../../assets/SVG/CheckTwo';
import Plus from '../../assets/SVG/Plus';

interface FollowButtonProps {
  isFollowing: boolean;
  onPress: () => void;
}

const FollowButton = ({ isFollowing, onPress }: FollowButtonProps) => {
  const isDark = true;

  const followBtnStyle = {
    borderWidth: isFollowing ? 0.5 : 1,
    borderColor: isFollowing
      ? isDark
        ? '#333'
        : '#ddd' // subtle gray border
      : themeColors.primary,
    backgroundColor: 'transparent', // ❌ no fill
  };
  const textColor = isFollowing
    ? isDark
      ? '#aaa'
      : '#666'
    : themeColors.primary;

  const iconColor = isFollowing
    ? isDark
      ? '#aaa'
      : '#666'
    : isDark
    ? themeColors.white
    : themeColors.black;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.button, followBtnStyle]}
    >
      <View style={styles.content}>
        {isFollowing ? (
          <CheckTwo size={14} color={iconColor} />
        ) : (
          <Plus size={14} color={iconColor} />
        )}

        <Text style={[styles.text, { color: textColor }]}>
          {isFollowing ? 'Following' : 'Follow'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default FollowButton;

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 20,
    minWidth: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  text: {
    fontSize: 9,
    fontFamily: Fonts.SemiBold,
  },
});
