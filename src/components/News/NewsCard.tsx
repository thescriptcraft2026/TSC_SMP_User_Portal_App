import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Linking,
  Animated,
  Alert,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import ArrowUpRight from '../../assets/SVG/ArrowUpRight';
import ArrowRight from '../../assets/SVG/ArrowRight';

type Props = {
  title: string;
  description: string;
  images: string[]; // 🔥 array of 4 images
  time?: string;
  location?: string;
  url?: any;
};

const NewsCard = ({
  title,
  description,
  images = [],
  time,
  location,
  url,
}: Props) => {
  const isDark = true;
  const [imageError, setImageError] = useState(false);

  const handlePress = async () => {
    if (!url) return;

    try {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Invalid URL', 'Cannot open this link');
      }
    } catch (error) {
      console.log('Link error:', error);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={handlePress}
      style={styles.wrapper}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: isDark ? '#121212' : themeColors.white },
        ]}
      >
        {/* 🔥 IMAGE COLLAGE */}
        <View style={styles.imageRow}>
          {images.slice(0, 4).map((img, index) => (
            <FastImage
              key={index}
              source={
                imageError || !img || img === 'fallback'
                  ? require('../../assets/images/fallback.png')
                  : { uri: img }
              }
              onError={() => setImageError(true)} // ✅ IMPORTANT
              style={styles.image}
              resizeMode="cover"
            />
          ))}
        </View>

        {/* 🔥 CONTENT */}
        <View style={styles.content}>
          <Text
            style={[styles.title, { color: isDark ? '#fff' : '#000' }]}
            numberOfLines={2}
          >
            {title}
          </Text>

          <Text
            style={[styles.description, { color: isDark ? '#aaa' : '#666' }]}
            numberOfLines={2}
          >
            {description}
          </Text>

          {/* 🔥 FOOTER */}
          <Text style={styles.footer}>
            {time} {location ? `, ${location}` : ''}
          </Text>

          <View style={[styles.iconContainer]}>
            <ArrowUpRight
              size={30}
              color={isDark ? themeColors.gray : themeColors.black}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default NewsCard;

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 10,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
    padding: 6,

    // iOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 8,

    // Android
    elevation: 1,
  },

  imageRow: {
    flexDirection: 'row',
    height: 160,
  },

  image: {
    flex: 1,
    height: '100%',
    borderRadius: 16,
  },

  content: {
    padding: 12,
  },

  title: {
    fontSize: 18,
    marginBottom: 4,
    fontFamily: Fonts.Bold,
  },

  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
    fontFamily: Fonts.Regular,
  },

  iconContainer: {
    position: 'absolute',
    bottom: 3,
    right: 3,
  },

  footer: {
    fontSize: 12,
    color: '#888',
  },
});
