import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Animated,
} from 'react-native';

import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';

import { Fonts } from '../../../constants/Fonts';
import GenreBadge from '../../../components/Badges/GenreBadge';
import Avatar from '../../../components/Avatar/Avatar';
import { themeColors } from '../../../theme/colors';

const { width } = Dimensions.get('window');

const CARD_WIDTH = width * 0.44;

type Writer = {
  id: number | string;
  name: string;
  user_name?: string;
  profile_photo_path?: string | null;
  cover_photo_path?: string | null;
  followers_count?: number;
  connections_count?: number;
  active_score?: string | number;
  handleViewProfile?: () => void;
};

type Props = {
  title?: string;
  description?: string;
  data?: Writer[];
  genre?: {
    id?: string;
    name?: string;
  };
  layout?: 'horizontal' | 'grid';
};

export default function TopWritersSection({
  title = 'Top Writers',
  description = '',
  data = [],
  genre,
  layout = 'horizontal',
}: Props) {
  const navigation = useNavigation<any>();
  const isGrid = layout === 'grid';
  const [imageError, setImageError] = useState(false);
  const isDark = true;
  const cardBg = isDark ? themeColors.card2 : themeColors.white;
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
  const textPrimary = isDark ? '#fff' : '#111';
  const textSecondary = isDark ? '#aaa' : '#666';

  const renderItem = ({ item }: { item: Writer }) => {
    // ✅ BUTTON STATE
    let buttonText = 'View Profile';
    let bgColor = themeColors.primary;
    let textColor = '#fff';
    let buttonBorderColor = 'transparent';

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isGrid && styles.gridCard,
          {
            width: isGrid ? '48%' : 150,
            marginRight: isGrid ? 5 : 0,
            backgroundColor: cardBg,
            borderColor,
          },
        ]}
        activeOpacity={0.9}
        onPress={item.handleViewProfile}
      >
        {/* Banner */}
        <View style={styles.banner}>
          <FastImage
            source={
              imageError || !item?.cover_photo_path
                ? require('../../../assets/images/fallback.png')
                : { uri: item.cover_photo_path }
            }
            style={styles.bannerImage}
            resizeMode={FastImage.resizeMode.cover}
            onError={() => setImageError(true)}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.4)']}
            style={StyleSheet.absoluteFill}
          />
        </View>

        {/* Avatar */}
        <View
          style={[styles.avatarWrapper, { borderColor: themeColors.black }]}
        >
          <Avatar uri={item.profile_photo_path} size={58} name={item.name} />
        </View>

        {/* Content */}
        <View style={styles.contentWraper}>
          <Text style={[styles.name, { color: textPrimary }]} numberOfLines={1}>
            {item.name}
          </Text>

          <Text
            style={[styles.role, { color: textSecondary }]}
            numberOfLines={1}
          >
            {item?.user_name && (
              '@' + item?.user_name
            )}
          </Text>
          {/* Button */}
          <Animated.View>
            <TouchableOpacity
              style={[
                styles.button,
                {
                  // backgroundColor: bgColor,
                  borderColor: themeColors.appBg,
                },
              ]}
              activeOpacity={0.8}
              onPress={item.handleViewProfile}
            >
              <Text style={[styles.buttonText, { color: themeColors.appBg }]}>
                {buttonText}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!data.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* {genre?.name ? <GenreBadge label={genre.name} size="sm" /> : null} */}
        {/* <View style={styles.badgeRow}>
          <View style={styles.dot} />
          <Text style={styles.badgeText}>TOP WRITERS</Text>

          <View style={styles.line} />
        </View> */}

        <Text style={styles.heading}>{title}</Text>
        {!!description && <Text style={styles.description}>{description}</Text>}
      </View>

      <FlatList
        horizontal
        data={data}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
        }}
        ItemSeparatorComponent={() => <View style={{ width: 15 }} />}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 45,
    marginBottom: 25,
  },

  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: 10,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: '#FFB400',
    marginRight: 10,
  },

  badgeText: {
    color: '#E5E5E5',
    fontSize: 12,
    letterSpacing: 1.5,
    fontFamily: Fonts.SemiBold,
  },

  line: {
    width: 70,
    height: 1,
    backgroundColor: '#444',
    marginLeft: 10,
  },

  heading: {
    color: '#FFF',
    fontSize: 32,
    fontFamily: Fonts.Bold,
    // marginTop: 12,
    textTransform:"capitalize"
  },

  description: {
    color: '#9A9A9A',
    fontSize: 14,
    lineHeight: 22,
    // marginTop: 10,
    fontFamily: Fonts.Regular,
  },

  gridCard: {
    width: '48%', // 👈 important
    marginHorizontal: 4,
  },

  title: {
    fontSize: 16,
    fontFamily: Fonts.Bold,
    marginBottom: 10,
  },

  row: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  card: {
    width: 160,
    borderRadius: 20,
    overflow: 'hidden',
  },

  banner: {
    width: '100%',
    height: 75,
  },

  bannerImage: {
    width: '100%',
    height: '100%',
  },

  avatarWrapper: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    borderWidth: 3,
    borderRadius: 60,
  },

  contentWraper: {
    marginTop: 35,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 14,
  },

  name: {
    fontFamily: Fonts.Black,
    fontSize: 16,
  },

  role: {
    fontSize: 12,
    fontFamily: Fonts.Medium,
    marginTop: 2,
  },

  mutual: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },

  button: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth:1
  },

  buttonText: {
    fontSize: 12,
    fontFamily: Fonts.Medium,
  },
});
