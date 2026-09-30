import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import FastImage from 'react-native-fast-image';

import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';

type Props = {
  brandName: string;
  brandLogo: string;
  adImage: string;
  title: string;
  description: string;
  cta: string;
  onPress?: () => void;
};

const SponsoredCard = ({
  brandName,
  brandLogo,
  adImage,
  title,
  description,
  cta,
  onPress,
}: Props) => {
  const isDark = true;

  const bg = isDark ? '#1A1D24' : '#FFFFFF';
  const text = isDark ? '#FFFFFF' : '#000000';
  const subText = isDark ? '#A0A4AE' : '#666';

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <FastImage source={{ uri: brandLogo }} style={styles.logo} />

        <View style={{ flex: 1 }}>
          <Text style={[styles.brand, { color: text }]}>{brandName}</Text>

          <Text style={styles.sponsored}>Sponsored</Text>
        </View>
      </View>

      {/* IMAGE */}
      <FastImage source={{ uri: adImage }} style={styles.image} />

      {/* CONTENT */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: text }]}>{title}</Text>

        <Text style={[styles.desc, { color: subText }]}>{description}</Text>

        {/* CTA */}
        <TouchableOpacity style={styles.cta} onPress={onPress}>
          <Text style={styles.ctaText}>{cta}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SponsoredCard;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 6,
    marginBottom: 8,
    borderRadius: 15,
    overflow: 'hidden',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },

  logo: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 10,
  },

  brand: {
    fontSize: 14,
    fontFamily: Fonts.Bold,
  },

  sponsored: {
    fontSize: 11,
    color: '#999',
  },

  image: {
    width: '100%',
    height: 180,
  },

  content: {
    padding: 12,
  },

  title: {
    fontSize: 15,
    fontFamily: Fonts.SemiBold,
    marginBottom: 4,
  },

  desc: {
    fontSize: 13,
    marginBottom: 10,
  },

  cta: {
    backgroundColor: themeColors.primary,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },

  ctaText: {
    color: '#fff',
    fontFamily: Fonts.Bold,
    fontSize: 13,
  },
});
