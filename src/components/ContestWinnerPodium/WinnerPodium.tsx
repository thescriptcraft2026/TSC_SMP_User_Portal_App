import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import FastImage from 'react-native-fast-image';
import { Fonts } from '../../constants/Fonts';
import Star from '../../assets/SVG/Star';
import { themeColors } from '../../theme/colors';
import { formatCount } from '../../utils/date';

interface Props {
  winner: any;
  position: number;
  height: number;
  isCenter?: boolean;
  onPress?: (winner: any) => void;
}

const WinnerPodium = ({
  winner,
  position,
  height,
  isCenter = false,
  onPress,
}: Props) => {
  const [imageError, setImageError] = useState(false);

  if (!winner) {
    return <View style={{ width: 110 }} />;
  }

  const avatar = winner?.user?.profile_photo_path;

  const hasAvatar = avatar && avatar !== 'null' && avatar !== 'undefined';

  const medalColor =
    position === 1 ? '#FFC107' : position === 2 ? '#C0C0C0' : '#CD7F32';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.wrapper}
      onPress={() => onPress?.(winner)}
    >
      {/* Avatar */}
      <View
        style={[
          styles.avatarOuter,
          {
            borderColor: medalColor,
            shadowColor: medalColor,
            width: isCenter ? 86 : 66,
            height: isCenter ? 86 : 66,
            borderRadius: isCenter ? 50 : 43,
          },
        ]}
      >
        <FastImage
          source={
            hasAvatar && !imageError
              ? { uri: avatar }
              : require('../../assets/images/default-profile.jpg')
          }
          style={[
            styles.avatar,
            {
              width: isCenter ? 76 : 56,
              height: isCenter ? 76 : 56,
              borderRadius: isCenter ? 45 : 38,
            },
          ]}
          onError={() => setImageError(true)}
        />
      </View>

      {/* Medal */}
      <View
        style={[
          styles.medal,
          {
            backgroundColor: medalColor,
          },
        ]}
      >
        <Text style={styles.medalText}>{position}</Text>
      </View>

      {/* Name */}
      <Text
        numberOfLines={1}
        style={[
          styles.name,
          isCenter && {
            fontSize: 18,
          },
        ]}
      >
        {winner?.user?.name}
      </Text>

      {/* Score */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <Star color={themeColors.primary} size={15} />
        <Text style={styles.score}>
          {formatCount(winner?.ratings_count ?? '--')}
        </Text>
      </View>

      {/* Podium */}
      <View
        style={[
          styles.podium,
          {
            height,
            borderTopColor: medalColor,
          },
        ]}
      >
        <Text
          style={[
            styles.position,
            {
              color: medalColor,
            },
          ]}
        >
          {position}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default WinnerPodium;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    width: 115,
  },

  avatarOuter: {
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',

    shadowOpacity: 0.7,
    shadowRadius: 15,
    elevation: 15,
  },

  avatar: {},

  medal: {
    width: 26,
    height: 26,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -18,
    // borderWidth: 2,
    // borderColor: '#111',
  },

  medalText: {
    color: '#111',
    fontSize: 18,
    fontFamily: Fonts.Bold,
  },

  name: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Fonts.Bold,
    marginTop: 10,
  },

  score: {
    color: '#ffb000',
    fontFamily: Fonts.Medium,
    fontSize: 14,
  },

  podium: {
    marginTop: 12,
    width: '100%',
    backgroundColor: '#121212',
    borderTopWidth: 5,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  position: {
    fontSize: 42,
    fontFamily: Fonts.Bold,
  },
});
