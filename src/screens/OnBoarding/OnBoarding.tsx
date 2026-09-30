import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
  Animated,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import RenderItem from '../../components/OnBoarding/RenderItem';
import Pagination from '../../components/OnBoarding/Pagination';
import CustomButton from '../../components/OnBoarding/CustomButton';
import data, { OnboardingData } from '../../data/data';
import { themeColors } from '../../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OnBoarding = ({ navigation }: any) => {
  const flatListRef = useRef<FlatList<OnboardingData> | null>(null);

  // ✅ Animated values
  const x = useRef(new Animated.Value(0)).current;
  const [flatListIndex, setFlatListIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index != null) {
        setFlatListIndex(viewableItems[0].index);
      }
    },
  ).current;

  const handleSkip = () => {
    navigation.navigate('Auth');
  };

  useEffect(() => {
    AsyncStorage.setItem('hasSeenOnboarding', 'true').then(() => {
      console.log('Set Success');
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Onboarding FlatList */}
      <Animated.FlatList
        ref={flatListRef}
        data={data}
        keyExtractor={item => String(item.id)}
        renderItem={({ item, index }) => (
          <RenderItem item={item} index={index} x={x} />
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x } } }],
          { useNativeDriver: false }, // ❗ required
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          minimumViewTime: 300,
          viewAreaCoveragePercentThreshold: 10,
        }}
      />

      {/* Bottom Controls */}
      <View style={styles.bottomContainer}>
        <Pagination data={data} x={x} />
        <CustomButton
          flatListRef={flatListRef}
          flatListIndex={flatListIndex}
          dataLength={data.length}
          x={x}
        />
      </View>
    </View>
  );
};

export default OnBoarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 52,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: themeColors.primary,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    marginHorizontal: 30,
    paddingVertical: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
