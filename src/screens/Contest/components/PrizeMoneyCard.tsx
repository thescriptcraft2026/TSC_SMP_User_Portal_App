import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';

import { Fonts } from '../../../constants/Fonts';
import { themeColors } from '../../../theme/colors';

type Props = {
  amount: string;
};

const PrizeMoneyCard = ({ amount }: Props) => {
  const formattedAmount = new Intl.NumberFormat('en-IN').format(
    Number(amount || 0),
  );
  return (
    <View style={styles.wrapper}>
      <View
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.line} />
          <Text style={styles.heading}>✦ PRIZE MONEY ✦</Text>
          <View style={styles.line} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.centerGroup}>
            <FastImage
              source={require('../../../assets/images/gold-medal.png')}
              style={styles.medal}
              resizeMode={FastImage.resizeMode.contain}
            />

            <View style={styles.textContainer}>
              <Text style={styles.place}>1st Place</Text>

              <View style={styles.amountBox}>
                <Text style={styles.amount}>₹{formattedAmount}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default PrizeMoneyCard;

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#C69200',
    overflow: 'hidden',
  },

  container: {
    borderRadius: 18,
    paddingTop: 10,
    paddingBottom: 14,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#8A6500',
  },

  heading: {
    marginHorizontal: 10,
    color: '#FFF',
    fontFamily: Fonts.Bold,
    fontSize: 12,
    letterSpacing: 1,
  },

  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  centerGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  medal: {
    width: 60,
    height: 60,
  },

  textContainer: {
    marginLeft: 18,
    alignItems: 'center',
  },

  place: {
    color: themeColors.white,
    fontFamily: Fonts.Black,
    fontSize: 18,
    textAlign: 'center',
  },

  amountBox: {
    marginTop: 6,
    borderWidth: 1.5,
    borderColor: '#D79A00',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 4,
    backgroundColor: '#111',
  },

  amount: {
    color: '#FFC62B',
    fontFamily: Fonts.Black,
    fontSize: 18,
    textAlign: 'center',
  },
});
