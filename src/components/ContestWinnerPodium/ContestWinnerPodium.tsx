import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { Fonts } from '../../constants/Fonts';
import WinnerPodium from './WinnerPodium';
import Star from '../../assets/SVG/Star';
import { formatCount } from '../../utils/date';
import { themeColors } from '../../theme/colors';
import Avatar from '../Avatar/Avatar';

interface Props {
  first: any;
  second: any;
  third: any;
  others: any[];
  onWinnerPress?: (winner: any) => void;
}

const ContestWinnerPodium = ({
  first,
  second,
  third,
  others,
  onWinnerPress,
}: Props) => {
  const isDark = useColorScheme() === 'dark';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:'#050505',
        },
      ]}
    >
      {/* ---------------- Title ---------------- */}
      <View style={styles.header}>
        <FastImage
          source={require('../../assets/images/leaf2.png')}
          style={styles.crown}
          resizeMode={FastImage.resizeMode.contain}
        />

        <View>
          <Text style={styles.contestText}>CONTEST</Text>
          <Text style={styles.winnerText}>WINNERS</Text>
        </View>
        <FastImage
          source={require('../../assets/images/leaf2.png')}
          style={[
            styles.crown,
            {
              transform: [{ scaleX: -1 }],
            },
          ]}
          resizeMode={FastImage.resizeMode.contain}
        />
      </View>

      {/* ---------------- Podium ---------------- */}
      <View style={styles.row}>
        <WinnerPodium
          winner={second}
          position={2}
          height={100}
          onPress={onWinnerPress}
        />
        <WinnerPodium
          winner={first}
          position={1}
          height={150}
          isCenter
          onPress={onWinnerPress}
        />
        <WinnerPodium
          winner={third}
          position={3}
          height={70}
          onPress={onWinnerPress}
        />
      </View>

      {others?.length > 0 && (
        <>
          <Text style={styles.moreTitle}>MORE WINNERS</Text>

          {others.map((item: any) => (
            <TouchableOpacity
              key={item.id}
              style={styles.moreWinnerCard}
              activeOpacity={0.8}
              onPress={() => onWinnerPress?.(item)}
            >
              <View style={styles.leftSection}>
                <Text style={styles.rankText}>#{item.winning_position}</Text>
                <Avatar
                  uri={item.user.profile_photo_path}
                  name={item.user.name}
                  size={42}
                />

                <View style={{ marginLeft: 12 }}>
                  <Text numberOfLines={1} style={styles.userName} ellipsizeMode='tail'>
                    {item.user?.name}
                  </Text>

                  <View style={styles.ratingRow}>
                    <Star color={themeColors.primary} size={14} />

                    <Text style={styles.rating}>
                      {formatCount(item?.ratings_count ?? 0)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* <View style={styles.rankBadge}>
                <Text style={styles.rankBadgeText}>
                  #{item.winning_position}
                </Text>
              </View> */}
            </TouchableOpacity>
          ))}
        </>
      )}
    </View>
  );
};

export default ContestWinnerPodium;

const styles = StyleSheet.create({
  container: {
    borderRadius: 22,
    paddingTop: 20,
    overflow: 'hidden',
  },

  header: {
    alignItems: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },

  crown: {
    width: 45,
    height: 45,
    marginBottom: 5,
  },

  contestText: {
    color: '#fff',
    fontFamily: Fonts.Bold,
    fontSize: 14,
    letterSpacing: 2,
    textAlign: 'center',
  },

  winnerText: {
    color: '#ffb000',
    fontFamily: Fonts.Black,
    fontSize: 20,
    letterSpacing: 1,
    textAlign: 'center',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
  },

  moreButton: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#ffb000',
  },

  moreText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 15,
    fontFamily: Fonts.Medium,
  },

  moreTitle: {
    color: '#777',
    alignSelf: 'center',
    marginVertical: 18,
    fontSize: 13,
    fontFamily: Fonts.Medium,
    letterSpacing: 1,
  },

  moreWinnerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    backgroundColor: '#15151F',

    marginHorizontal: 10,
    marginBottom: 12,

    borderRadius: 14,

    paddingVertical: 14,
    paddingHorizontal: 14,
  },

  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  rankText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: Fonts.Bold,
    width: 40,
  },

  smallAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },

  userName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: Fonts.Bold,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },

  rating: {
    color: '#CCCCCC',
    marginLeft: 4,
    fontSize: 14,
  },

  rankBadge: {
    backgroundColor: '#2A2A35',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  rankBadgeText: {
    color: '#777',
    fontSize: 14,
    fontFamily: Fonts.Bold,
  },
});
