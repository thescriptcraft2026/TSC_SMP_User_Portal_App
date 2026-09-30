import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  Animated,
} from 'react-native';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import Avatar from '../Avatar/Avatar';
import Plus from '../../assets/SVG/Plus';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';

type User = {
  connectionStatus: any;
  username: any;
  id: string;
  name: string;
  role: string;
  profile_photo_path: string;
  cover_photo_path: string;
  mutual?: number;
  isPrivate?: boolean;
  roles: {
    id: number;
    name: string;
    display_name: string;
  }[];
};

type Props = {
  data: User[] | any;
  onFollow?: (user: User) => void;
  layout?: 'horizontal' | 'grid';
  onPress?: (user: User) => void;
};

const ProfileSuggestionCard = ({
  data,
  onFollow,
  layout = 'horizontal',
  onPress,
}: Props) => {
  const isGrid = layout === 'grid';
  const isDark = true;

  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [requestedIds, setRequestedIds] = useState<string[]>([]);
  const [imageError, setImageError] = useState(false);

  // ✅ FIX: animation map (NO HOOK INSIDE renderItem)
  const scaleMap = useRef<{ [key: string]: Animated.Value }>({});

  const cardBg = isDark ? themeColors.card2 : themeColors.white;
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
  const textPrimary = isDark ? '#fff' : '#111';
  const textSecondary = isDark ? '#aaa' : '#666';

  // ✅ FOLLOW LOGIC
  const toggleFollow = async (user: User) => {
    const isFollowing = followingIds.includes(user.id);
    const isRequested = requestedIds.includes(user.id);

    // already following
    if (isFollowing) {
      setFollowingIds(prev => prev.filter(id => id !== user.id));
      return;
    }

    // already requested
    if (isRequested) {
      return;
    }

    // ✅ immediately show Requested
    setRequestedIds(prev => [...prev, user.id]);

    // call parent api
    onFollow?.(user);
  };

  const renderItem = ({ item }: { item: User }) => {
    const isFollowing =
      followingIds.includes(item.id) ||
      item?.connectionStatus?.status === 'accepted';

    const isRequested =
      requestedIds.includes(item.id) ||
      item?.connectionStatus?.status === 'pending';

    // ✅ get or create animation value
    if (!scaleMap.current[item.id]) {
      scaleMap.current[item.id] = new Animated.Value(1);
    }

    const scale = scaleMap.current[item.id];

    const animatePress = () => {
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 0.95,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        }),
      ]).start();
    };

    // ✅ BUTTON STATE
    let buttonText = 'Connect';
    let bgColor = themeColors.primary;
    let textColor = themeColors.primary;
    let buttonBorderColor = themeColors.primary;

    if (isRequested) {
      buttonText = 'Requested';
      bgColor = '#F5F5F5';
      buttonBorderColor = '#D1D5DB';
      textColor = '#666';
    } else if (isFollowing) {
      buttonText = 'Following';
      bgColor = isDark ? '#2a2a2d' : '#E9EEF3';
      textColor = isDark ? '#fff' : '#000';
    }

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isGrid && styles.gridCard,
          {
            width: isGrid ? '48%' : 150,
            marginRight: isGrid ? 5 : 10,
            backgroundColor: cardBg,
            borderColor,
          },
        ]}
        activeOpacity={0.9}
        onPress={() => onPress?.(item)}
      >
        {/* Banner */}
        <View style={styles.banner}>
          <FastImage
            source={
              imageError || !item?.cover_photo_path
                ? require('../../assets/images/fallback.png')
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
          style={[
            styles.avatarWrapper,
            { borderColor: isDark ? themeColors.black : '#fff' },
          ]}
        >
          <Avatar uri={item.profile_photo_path} size={54} name={item.name} />
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
            {item.roles?.map((role: any) => role.display_name).join(', ')}
          </Text>
          {/* {item.roles && (
            <Text style={[styles.mutual, { color: textSecondary }]}>
              {item.mutual} mutual connections
            </Text>
          )} */}

          {/* Button */}
          <Animated.View style={{ transform: [{ scale }] }}>
            <TouchableOpacity
              style={[
                styles.button,
                {
                  // backgroundColor: bgColor,
                  borderWidth: isRequested ? 1 : 1,
                  borderColor: isRequested ? themeColors.gray : buttonBorderColor,
                },
              ]}
              activeOpacity={0.8}
              onPress={() => {
                animatePress();
                toggleFollow(item);
              }}
            >
              <Text style={[styles.buttonText, { color: textColor }]}>
                {buttonText}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ marginBottom: isGrid ? 0 : 10 }}>
      {/* <Text
        style={[
          styles.title,
          {
            paddingHorizontal: isGrid ? 6 : 10,
            color: isDark ? '#fff' : '#111',
          },
        ]}
      >
        Suggested for you
      </Text> */}

      <View style={styles.peopleHeader}>
        <View style={styles.peopleLine} />

        <Text style={styles.peopleHeaderText}>
          PEOPLE YOU MAY KNOW
        </Text>

        <View style={styles.peopleLine} />
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal={!isGrid}
        numColumns={isGrid ? 2 : 1}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          isGrid && styles.gridContent,
        ]}
        columnWrapperStyle={isGrid ? styles.row : undefined}
      />
    </View>
  );
};

export default ProfileSuggestionCard;

const styles = StyleSheet.create({
  gridCard: {
    width: '48%', // 👈 important
    marginHorizontal: 4,
  },

  gridContent: {},

  listContent: {
    paddingHorizontal: 10,
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
    paddingVertical: 4,
    paddingHorizontal: 18,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  buttonText: {
    fontSize: 12,
    fontFamily: Fonts.Medium,
  },

  peopleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  peopleLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#3A2A00',
  },

  peopleHeaderText: {
    color: themeColors.white,
    fontSize: 12,
    letterSpacing: 2,
    marginHorizontal: 12,
    fontFamily: Fonts.Medium,
  },
});
