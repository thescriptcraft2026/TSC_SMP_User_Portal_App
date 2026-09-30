import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import React from 'react';
import FastImage from 'react-native-fast-image';
import { Fonts } from '../../../constants/Fonts';
import { themeColors } from '../../../theme/colors';
import Star from '../../../assets/SVG/Star';
import Heart from '../../../assets/SVG/Heart';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '../../../components/Toast/ToastProvider';
import api from '../../../../Instance/Instance';
import HeartActive from '../../../assets/SVG/HeartActive';

interface ReviewCardProps {
  item: {
    id: string;
    rating: number;
    userreview: string;
    likes_count: number;
    is_liked?: number;

    user: {
      id: any;
      name: string;
      profile_photo_path: string;
      user_name: string;
    };
  };
}
const ReviewCard = ({ item }: ReviewCardProps) => {
  const isDark = true;
  const navigation = useNavigation<any>();
  const { show } = useToast();
  const [liked, setLiked] = React.useState(item?.is_liked === 1);
  const [likesCount, setLikesCount] = React.useState(item?.likes_count);
  const [imageError, setImageError] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const [showReadMore, setShowReadMore] = React.useState(false);

  const handleProfile = () => {
    if (!item?.user) {
      navigation.navigate('NotFound', {
        title: 'User Not Found',
        description:
          "The user you're looking for doesn't exist or may have been removed.",
        icon: 'person-remove-outline',
      });
      return;
    }
    navigation.navigate('Profile', {
      username: item?.user?.user_name || item?.user?.id,
    });
  };

  const handleLike = async () => {
    const newLiked = !liked;

    // 🔥 Optimistic UI update
    setLiked(newLiked);
    setLikesCount(prev => (newLiked ? prev + 1 : prev - 1));

    try {
      const res = await api.post('/review-contents/review/like', {
        review_id: item.id, // ✅ must be UUID string
      });
      console.log('review like res', res);
      show({
        type: 'success',
        title: `Review ${res?.data?.message}`,
      });
    } catch (error: any) {
      // ❌ rollback if API fails
      setLiked(!newLiked);
      setLikesCount(prev => (newLiked ? prev - 1 : prev + 1));

      show({
        type: 'error',
        title:
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Something went wrong',
      });
    }
  };

  return (
    <View
      style={[
        styles.reviewCard,
        {
          backgroundColor: isDark ? themeColors.card2 : themeColors.white,
        },
      ]}
    >
      {/* LEFT CONTENT */}
      <View style={{ flex: 1 }}>
        {/* 🔥 Top Row */}
        <View style={styles.reviewHeader}>
          <TouchableOpacity onPress={handleProfile}>

            <FastImage
              source={
                imageError || !item?.user?.profile_photo_path
                  ? require('../../../assets/images/default-profile.jpg')
                  : {
                    uri: item?.user?.profile_photo_path,
                    priority: FastImage.priority.normal,
                  }
              }
              onError={() => setImageError(true)}
              style={styles.reviewAvatar}
            />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <TouchableOpacity onPress={handleProfile}>
              <Text
                style={[styles.reviewName, { color: isDark ? '#fff' : '#000' }]} numberOfLines={1}
              >
                {item?.user?.name || "User"}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>

                {item?.user?.user_name &&
                  <Text style={[styles.reviewUserName]} numberOfLines={1}>
                    @{item?.user?.user_name}
                  </Text>
                }
                {item?.rating && (
                  <View style={styles.ratingRow}>
                    <Star size={14} color={themeColors.primary} rating={item?.rating} />
                    <Text style={styles.ratingText}>{item?.rating}/5</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

          </View>
        </View>

        {/* 💬 Comment */}
        {item?.userreview && (
          <View style={{ marginTop: 8 }}>
            <Text
              numberOfLines={expanded ? undefined : 3}
              onTextLayout={e => {
                if (e.nativeEvent.lines.length > 2 && !showReadMore) {
                  setShowReadMore(true);
                }
              }}
              style={[
                styles.reviewComment,
                {
                  color: isDark ? '#ccc' : '#444',
                },
              ]}
            >
              {item?.userreview}
            </Text>

            {showReadMore && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setExpanded(prev => !prev)}
                style={{
                  marginTop: 4,
                  alignSelf: 'flex-start',
                }}
              >
                <Text
                  style={{
                    color: themeColors.primary,
                    fontSize: 12,
                    fontFamily: Fonts.Medium,
                  }}
                >
                  {expanded ? 'Read less' : 'Read more'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* ❤️ RIGHT SIDE (LIKE) */}
      <View style={styles.reviewFooter}>
        <TouchableOpacity activeOpacity={0.6} onPress={handleLike}>
          {liked ? (
            <HeartActive size={16} color={themeColors.red} />
          ) : (
            <Heart size={16} color={themeColors.gray} />
          )}
        </TouchableOpacity>
        <Text style={styles.likeText}>{likesCount}</Text>
      </View>
    </View>
  );
};

export default ReviewCard;

const styles = StyleSheet.create({
  reviewCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center', // ✅ vertical alignment
  },

  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },

  reviewName: {
    fontSize: 14,
    fontFamily: Fonts.Bold,
  },
  reviewUserName: {
    fontSize: 12,
    fontFamily: Fonts.Regular,
    color: themeColors.gray,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },

  ratingText: {
    fontSize: 12,
    color: '#aaa',
  },

  reviewComment: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.Regular,
  },

  reviewFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10, // spacing from content
    gap: 2,
  },

  likeText: {
    fontSize: 12,
    color: '#999',
  },
});
