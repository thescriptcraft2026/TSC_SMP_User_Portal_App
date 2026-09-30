import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  FlatList,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { themeColors } from '../../../theme/colors';

const { width } = Dimensions.get('window');

type BannerItem = {
  id: string | number;
  image: string;
  position?: number;
  status?: string;
};

type Props = {
  data: BannerItem[];
  cardWidth?: number;
  cardHeight?: number;
  spacing?: number;
  autoPlayInterval?: number;
  autoPlay?: boolean;
};

/**
 * ---------------------------------------------------------
 * Banner Image
 * ---------------------------------------------------------
 *
 * Automatically decides whether to use:
 *
 * cover   -> banner fills the card
 * contain -> prevents excessive cropping
 */
const BannerImage = ({ uri }: { uri: string }) => {
  return (
    <FastImage
      source={{
        uri,
        priority: FastImage.priority.high,
        cache: FastImage.cacheControl.web,
      }}
      style={styles.image}
      resizeMode={FastImage.resizeMode.contain}
      onError={() => {
        console.log('Contest banner failed:', uri);
      }}
    />
  );
};

export default function ContestBannerSwiper({
  data = [],
  cardWidth = width * 0.72,
  cardHeight = width * 0.72,
  spacing = 0,
  autoPlayInterval = 3000,
  autoPlay = true,
}: Props) {
  const ITEM_SIZE = cardWidth + spacing * 2;

  const scrollX = useRef(new Animated.Value(0)).current;

  const flatListRef = useRef<FlatList>(null);

  const indexRef = useRef(1);

  const [index, setIndex] = useState(1);

  /**
   * ---------------------------------------------------------
   * Sort + Filter banners
   * ---------------------------------------------------------
   */
  const sortedData = useMemo(() => {
    return [...data]
      .filter(
        item =>
          item?.status === 'active' &&
          !!item?.image,
      )
      .sort(
        (a, b) =>
          Number(a.position || 0) -
          Number(b.position || 0),
      );
  }, [data]);

  /**
   * ---------------------------------------------------------
   * Infinite loop data
   *
   * [last, 1, 2, 3, first]
   * ---------------------------------------------------------
   */
  const loopData = useMemo(() => {
    if (!sortedData.length) {
      return [];
    }

    // Don't create fake loop items for one banner
    if (sortedData.length === 1) {
      return sortedData;
    }

    return [
      sortedData[sortedData.length - 1],
      ...sortedData,
      sortedData[0],
    ];
  }, [sortedData]);

  /**
   * ---------------------------------------------------------
   * Auto Play
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (
      !autoPlay ||
      sortedData.length <= 1
    ) {
      return;
    }

    const timer = setInterval(() => {
      const nextIndex =
        indexRef.current + 1;

      flatListRef.current?.scrollToOffset({
        offset: nextIndex * ITEM_SIZE,
        animated: true,
      });

      indexRef.current = nextIndex;
      setIndex(nextIndex);
    }, autoPlayInterval);

    return () => {
      clearInterval(timer);
    };
  }, [
    autoPlay,
    autoPlayInterval,
    ITEM_SIZE,
    sortedData.length,
  ]);

  /**
   * ---------------------------------------------------------
   * Scroll to item
   * ---------------------------------------------------------
   */
  const scrollTo = (
    i: number,
    animated = true,
  ) => {
    flatListRef.current?.scrollToOffset({
      offset: i * ITEM_SIZE,
      animated,
    });

    indexRef.current = i;
    setIndex(i);
  };

  const onMomentumEnd = (
    e: any,
  ) => {
    if (!sortedData.length) {
      return;
    }

    let i = Math.round(
      e.nativeEvent.contentOffset.x /
      ITEM_SIZE,
    );

    if (
      sortedData.length > 1 &&
      i === loopData.length - 1
    ) {
      i = 1;

      scrollTo(i, false);

      return;
    }

    if (
      sortedData.length > 1 &&
      i === 0
    ) {
      i = sortedData.length;

      scrollTo(i, false);

      return;
    }

    indexRef.current = i;

    setIndex(i);
  };

  const renderItem = ({
    item,
    index: i,
  }: any) => {
    const inputRange = [
      (i - 1) * ITEM_SIZE,
      i * ITEM_SIZE,
      (i + 1) * ITEM_SIZE,
    ];

    const scale =
      scrollX.interpolate({
        inputRange,
        outputRange: [
          0.82,
          1,
          0.82,
        ],
        extrapolate: 'clamp',
      });

    const opacity =
      scrollX.interpolate({
        inputRange,
        outputRange: [
          0.75,
          1,
          0.75,
        ],
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
            opacity,
          },
        ]}
      >
        <BannerImage
          uri={item.image}
        />
      </Animated.View>
    );
  };

  /**
   * ---------------------------------------------------------
   * No banners
   * ---------------------------------------------------------
   */
  if (!sortedData.length) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          height: cardHeight + 35,
        },
      ]}
    >
      {/* -------------------------------------------------
          Carousel
      -------------------------------------------------- */}
      <Animated.FlatList
        ref={flatListRef}
        data={loopData}
        horizontal
        bounces={false}
        pagingEnabled={false}
        snapToInterval={ITEM_SIZE}
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={
          sortedData.length > 1
            ? 1
            : 0
        }
        keyExtractor={(
          item,
          i,
        ) =>
          `contest-banner-${item?.id}-${i}`
        }
        getItemLayout={(
          _,
          i,
        ) => ({
          length: ITEM_SIZE,
          offset:
            ITEM_SIZE * i,
          index: i,
        })}
        contentContainerStyle={{
          paddingHorizontal:
            (width - cardWidth) / 2,
        }}
        onMomentumScrollEnd={
          onMomentumEnd
        }
        onScroll={Animated.event(
          [
            {
              nativeEvent: {
                contentOffset: {
                  x: scrollX,
                },
              },
            },
          ],
          {
            useNativeDriver: true,
          },
        )}
        scrollEventThrottle={16}
        renderItem={renderItem}
      />

      {/* -------------------------------------------------
          Pagination
          Positioned OVER the banner
      -------------------------------------------------- */}
      {sortedData.length > 1 && (
        <View
          pointerEvents="none"
          style={styles.dots}
        >
          {sortedData.map(
            (item, i) => (
              <View
                key={item?.id}
                style={[
                  styles.dot,
                  i ===
                  index - 1 &&
                  styles.activeDot,
                ]}
              />
            ),
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    position: 'relative',
  },

  card: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#151515',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  dots: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    elevation: 100,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.55)',
    marginHorizontal: 4,
  },

  activeDot: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: themeColors.primary,
  },
});