import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { themeColors } from '../../../theme/colors';
import FastImage from 'react-native-fast-image';
import Eye from '../../../assets/SVG/Eye';
import Star from '../../../assets/SVG/Star';
import { Fonts } from '../../../constants/Fonts';
import Avatar from '../../../components/Avatar/Avatar';
import { formatCount } from '../../../utils/date';
import Thumb from '../../../assets/SVG/Thumb';
import Like from '../../../assets/SVG/Like';

export const ParticipantCard = ({ item, index, onPress }: any) => {
  const isDark = true;

  const bg = isDark ? themeColors.card2 : '#F7F7F7';
  const textPrimary = isDark ? '#fff' : '#111';
  const textSecondary = isDark ? '#aaa' : '#666';

  const getBadge = () => {
    if (index === 0) return require('../../../assets/Badges/first.png');
    if (index === 1) return require('../../../assets/Badges/second.png');
    if (index === 2) return require('../../../assets/Badges/third.png');
    if (index === 3) return require('../../../assets/Badges/fourth.png');
    if (index === 4) return require('../../../assets/Badges/fifth.png');
    return null;
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: bg }]}
      onPress={onPress}
    >
      {/* LEFT */}
      <View style={styles.left}>
        <Avatar
          uri={item?.user?.profile_photo_path}
          name={item?.user?.name}
          size={38}
        />

        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={styles.statsRow}>
            <Text
              style={[styles.name, { color: textPrimary }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item?.user?.name}
            </Text>
            <View style={styles.ratingRow}>
              <Star size={12} color={themeColors.primary} />
              <Text style={[styles.rating, { color: textPrimary }]}>
                {Number(item?.avg_rating).toFixed(1)}
              </Text>
            </View>
            <View style={styles.ratingRow}>
              <Eye
                size={12}
                color={isDark ? themeColors.white : themeColors.black}
              />
              <Text style={[styles.rating, { color: textPrimary }]}>
                {formatCount(item?.views)}
              </Text>
            </View>
            <View style={styles.ratingRow}>
              <Like size={12} color={themeColors.white} />
              <Text style={[styles.rating, { color: textPrimary }]}>
                {formatCount(item?.likes_count)}
              </Text>
            </View>
          </View>
          <Text
            style={[styles.titleTwo, { color: textSecondary }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item?.title}
          </Text>
        </View>
        {/* RIGHT */}
        <View style={styles.right}>
          {getBadge() && <FastImage source={getBadge()} style={styles.badge} />}
        </View>
      </View>

    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 6,
  },

  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
    marginRight: 8,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },

  name: {
    fontSize: 15,
    fontFamily: Fonts.Bold,
    flexShrink: 1,
    maxWidth: 140, // tune to taste, or compute from screen width
  },

  titleTwo: {
    fontSize: 12,
    marginTop: 2,
  },

  right: {
    alignItems: 'center',
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  rating: {
    fontSize: 10,
    fontFamily: Fonts.Bold,
  },

  badge: {
    width: 24,
    height: 34,
  },
});