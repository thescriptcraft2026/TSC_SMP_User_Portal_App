import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { themeColors } from '../../../../theme/colors';
import { Fonts } from '../../../../constants/Fonts';

interface ProfileCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  titleColor?: any;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  titleColor,
}) => {
  const scheme = useColorScheme();
  const isDark = true;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: isDark ? themeColors.card2 : themeColors.white },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Left Icon */}
      <View
        style={{
          padding: 10,
          borderRadius: 100,
          backgroundColor: isDark ? themeColors.card : themeColors.card2,
        }}
      >
        {icon}
      </View>

      {/* Text Content */}
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.title,
            {
              color:
                titleColor ?? (isDark ? themeColors.white : themeColors.black),
            },
          ]}
        >
          {title}
        </Text>

        {subtitle && (
          <Text
            style={[
              styles.subtitle,
              { color: isDark ? themeColors.white : themeColors.gray },
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {/* Arrow */}
      <View
        style={[
          styles.arrowContainer,
          { backgroundColor: isDark ? themeColors.card : themeColors.card2 },
        ]}
      >
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isDark ? themeColors.white : themeColors.black}
        />
      </View>
    </TouchableOpacity>
  );
};

export default ProfileCard;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 16,
    marginTop: 8,
  },

  textContainer: {
    flex: 1,
    marginLeft: 15,
  },

  title: {
    fontSize: 16,
    fontFamily: Fonts.Bold,
  },

  subtitle: {
    fontSize: 12,
    fontFamily: Fonts.Regular,
    // marginTop:2,
  },

  arrowContainer: {
    padding: 6,
    borderRadius: 50,
  },
});
