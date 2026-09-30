import React, { useRef, useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Animated, FlatList, Text } from 'react-native';
import FastImage from 'react-native-fast-image';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';

const { width } = Dimensions.get('window');

type ItemType = {
  id?: string | number;
  poster: string;
};

type Props = {
  data: ItemType[];
  title?: string;
  description?: string;
  cardWidth?: number;
  cardHeight?: number;
  spacing?: number;
  autoPlayInterval?: number;
  autoPlay?: boolean;
};

export default function CoverflowSwiper({
  data = [],
  title,
  description,
  cardWidth = width * 0.8,
  cardHeight = 160,
  spacing = 0,
  autoPlayInterval = 3000,
  autoPlay = true,
}: Props) {
  const ITEM_SIZE = cardWidth + spacing * 2;

  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const indexRef = useRef(1);
  const [index, setIndex] = useState(1);

  /** ♾ Loop Data */
  const loopData = useMemo(() => {
    if (!data?.length) return [];

    return [data[data.length - 1], ...data, data[0]];
  }, [data]);

  /** 🔁 Auto Play */
  useEffect(() => {
    if (!autoPlay || data.length <= 1) return;

    const timer = setInterval(() => {
      scrollTo(indexRef.current + 1);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, data.length]);

  const scrollTo = (i: number, animated = true) => {
    flatListRef.current?.scrollToOffset({
      offset: i * ITEM_SIZE,
      animated,
    });

    indexRef.current = i;
    setIndex(i);
  };

  /** ♾ Infinite Loop */
  const onMomentumEnd = (e: any) => {
    if (!data.length) return;

    let i = Math.round(e.nativeEvent.contentOffset.x / ITEM_SIZE);

    if (i === 0) {
      i = data.length;
      scrollTo(i, false);
      return;
    }

    if (i === loopData.length - 1) {
      i = 1;
      scrollTo(i, false);
      return;
    }

    indexRef.current = i;
    setIndex(i);
  };

  const renderItem = ({ item, index: i }: any) => {
    const inputRange = [
      (i - 1) * ITEM_SIZE,
      i * ITEM_SIZE,
      (i + 1) * ITEM_SIZE,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.82, 1, 0.82],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.card,
          {
            width: cardWidth,
            height: cardHeight,
            marginHorizontal: spacing,
            transform: [{ scale }],
          },
        ]}
      >
        <FastImage
          source={{ uri: item?.poster }}
          style={styles.image}
          resizeMode={FastImage.resizeMode.cover}
        />
      </Animated.View>
    );
  };

  if (!data?.length) {
    return null;
  }

  return (
    <View>
      <View style={styles.header}>
        {!!title && (
          <Text style={styles.heading}>
            {title}
          </Text>
        )}

        {!!description && (
          <Text style={styles.description}>
            {description}
          </Text>
        )}
      </View>
      <View
        style={[
          styles.container,
          {
            height: cardHeight + 20,
          },
        ]}
      >

        <Animated.FlatList
          ref={flatListRef}
          data={loopData}
          horizontal
          bounces={false}
          pagingEnabled={false}
          snapToInterval={ITEM_SIZE}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={1}
          keyExtractor={(item, i) => `coverflow-${item?.id || 'item'}-${i}`}
          getItemLayout={(_, i) => ({
            length: ITEM_SIZE,
            offset: ITEM_SIZE * i,
            index: i,
          })}
          contentContainerStyle={{
            paddingHorizontal: (width - cardWidth) / 2 - spacing,
          }}
          onMomentumScrollEnd={onMomentumEnd}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            {
              useNativeDriver: true,
            },
          )}
          scrollEventThrottle={16}
          renderItem={renderItem}
        />

        {/* Pagination */}
        {data.length > 1 && (
          <View style={styles.dots}>
            {data.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === index - 1 && styles.activeDot]}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  card: {
    borderRadius: 20,
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  dots: {
    flexDirection: 'row',
    marginTop: 10,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: themeColors.gray,
    marginHorizontal: 4,
  },

  activeDot: {
    width: 30,
    backgroundColor: themeColors.primary,
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
    textTransform: "capitalize"
  },

  description: {
    color: '#9A9A9A',
    fontSize: 14,
    lineHeight: 22,
    // marginTop: 10,
    fontFamily: Fonts.Regular,
  },
});
