import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { themeColors } from '../../../theme/colors';
import { Fonts } from '../../../constants/Fonts';
import Eye from '../../../assets/SVG/Eye';
import Star from '../../../assets/SVG/Star';
import Like from '../../../assets/SVG/Like';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import Avatar from '../../../components/Avatar/Avatar';
import { formatCount, formatDate } from '../../../utils/date';

type Props = {
  item: any;
  onPress?: () => void;
};

const STATUS_COLORS: Record<string, string> = {
  submitted: '#66A3FF',
  approved: '#16a34a',
  published: '#16a34a',
  rejected: '#ff4d4f',
  pending: '#EB9D08',
};

const SubmissionCard = ({ item, onPress }: Props) => {
  const [imageError, setImageError] = useState(false);

  const status = String(item?.contest_status || '').toLowerCase();
  const statusColor: string =
    STATUS_COLORS[status] || String(themeColors.primary);

  const stats = [
    { icon: <Eye size={13} color="#fff" />, value: formatCount(item?.views || 0) },
    {
      icon: <Like size={13} color="#fff" />,
      value: formatCount(item?.likes_count || 0),
    },
    {
      icon: <Ionicons name="chatbubble-outline" size={13} color="#fff" />,
      value: formatCount(item?.comments_count || 0),
    },
  ];

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={styles.card}
    >
      {/* COVER */}
      <View style={styles.imageWrapper}>
        <FastImage
          source={
            imageError || !item?.image
              ? require('../../../assets/images/fallback.png')
              : { uri: item.image }
          }
          onError={() => setImageError(true)}
          style={styles.image}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.35)', 'transparent', 'rgba(9,9,13,0.95)']}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.topRow}>
          {!!status && (
            <View style={[styles.glassPill, { borderColor: `${statusColor}99` }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={styles.pillText}>{status.toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.glassPill}>
            <Star size={12} color={themeColors.primary} />
            <Text style={styles.pillText}>
              {Number(item?.avg_rating || 0).toFixed(1)}
            </Text>
          </View>
        </View>

        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={2}>
            {item?.title}
          </Text>
        </View>
      </View>

      {/* BODY */}
      <View style={styles.body}>
        <View style={styles.authorRow}>
          <Avatar
            uri={item?.user?.profile_photo_path}
            name={item?.user?.name}
            size={26}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.author} numberOfLines={1}>
              {item?.user?.name}
            </Text>
            <Text style={styles.date}>{formatDate(item?.createdAt)}</Text>
          </View>
          <View style={styles.arrowBtn}>
            <Ionicons
              name="arrow-forward"
              size={16}
              color={String(themeColors.primaryForeground)}
            />
          </View>
        </View>

        {!!item?.story && (
          <Text style={styles.story} numberOfLines={2}>
            {item.story}
          </Text>
        )}

        <View style={styles.statsRow}>
          {stats.map((st, i) => (
            <View key={i} style={styles.statPill}>
              {st.icon}
              <Text style={styles.statText}>{st.value}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SubmissionCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#14161b',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  imageWrapper: {
    height: 140,
    justifyContent: 'flex-end',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  topRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  glassPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  pillText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: Fonts.Bold,
  },
  titleWrap: {
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  title: {
    color: themeColors.white,
    fontSize: 18,
    fontFamily: Fonts.Black,
  },
  body: {
    padding: 12,
    gap: 8,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  author: {
    color: themeColors.white,
    fontSize: 14,
    fontFamily: Fonts.SemiBold,
  },
  date: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontFamily: Fonts.Regular,
  },
  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: themeColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  story: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: Fonts.Regular,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statText: {
    color: themeColors.white,
    fontSize: 12,
    fontFamily: Fonts.SemiBold,
  },
});
