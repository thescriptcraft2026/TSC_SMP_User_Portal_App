import { StyleSheet, View, Animated } from 'react-native';
import React from 'react';
import { OnboardingData } from '../../data/data';
import Dot from './Dot';

type Props = {
  data: OnboardingData[];
  x: Animated.Value; // ✅ use Animated.Value
};

const Pagination = ({ data, x }: Props) => {
  return (
    <View style={styles.paginationContainer}>
      {data.map((_, index) => (
        <Dot key={index} index={index} x={x} />
      ))}
    </View>
  );
};

export default Pagination;

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
