import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { Fonts } from '../../../constants/Fonts';
import { themeColors } from '../../../theme/colors';

export const InfoItem = ({ label, value, Icon }: any) => {
  const isDark = true;

  return (
    <View
      style={[
        styles.infoItem,
        {
          backgroundColor: isDark ? themeColors.card2 : themeColors.white,
        },
      ]}
    >
      <View style={styles.infoTop}>
        {Icon && <Icon />}

        <Text style={[styles.infoLabel, { color: isDark ? '#aaa' : '#555' }]}>
          {label}
        </Text>
      </View>

      <Text
        style={[styles.infoValue, { color: isDark ? '#fff' : '#111' }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  infoItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },

  infoTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },

  infoLabel: {
    fontSize: 11,
    fontFamily: Fonts.Medium,
  },

  infoValue: {
    fontSize: 13,
    fontFamily: Fonts.Bold,
  },
});
