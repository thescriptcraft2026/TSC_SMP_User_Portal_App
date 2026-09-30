import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  Animated,
  Dimensions,
  Image,
} from 'react-native';

import PagerView from 'react-native-pager-view';
import FastImage from 'react-native-fast-image';
import Video from 'react-native-video';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';

import { themeColors } from '../../theme/colors';
import { skipFeedRefreshOnFocus } from '../../utils/navigationFlags';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MAX_HEIGHT = 360;
const MIN_HEIGHT = 120;

type MediaItem = {
  type: 'image' | 'video';
  url: string;
};

type Props = {
  media: MediaItem[];
  isVisible?: boolean;
};

// module-level cache — persists across remounts/recycled FlashList rows
// so a given image URL is only ever measured once
const heightCache: Record<string, number> = {};

const clampHeight = (h: number) =>
  Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, h));

const PostCarousel = ({ media = [], isVisible = true }: Props) => {
  const navigation = useNavigation<any>();

  const pagerRef = useRef<PagerView>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const [index, setIndex] = useState(0);

  const [imageHeights, setImageHeights] = useState<Record<number, number>>({});
  const [containerHeight, setContainerHeight] = useState<number | null>(null);

  const isSingleItem = media.length <= 1;

  useEffect(() => {
    setIndex(0);
  }, [media]);

  useEffect(() => {
    if (!media.length) return;

    let mounted = true;

    const loadHeights = async () => {
      const heights: Record<number, number> = {};

      await Promise.all(
        media.map(
          (item, index) =>
            new Promise<void>(resolve => {
              if (item.type !== 'image') {
                resolve();
                return;
              }

              if (heightCache[item.url]) {
                heights[index] = heightCache[item.url];
                resolve();
                return;
              }

              Image.getSize(
                item.url,
                (w, h) => {
                  const height = clampHeight(
                    SCREEN_WIDTH * (h / w),
                  );

                  heightCache[item.url] = height;
                  heights[index] = height;

                  resolve();
                },
                () => {
                  heights[index] = MAX_HEIGHT;
                  resolve();
                },
              );
            }),
        ),
      );

      if (!mounted) return;

      setImageHeights(heights);

      const maxHeight =
        Object.values(heights).length > 0
          ? Math.max(...Object.values(heights))
          : MAX_HEIGHT;

      setContainerHeight(maxHeight);
    };

    loadHeights();

    return () => {
      mounted = false;
    };
  }, [media]);

  const openViewer = (tappedIndex: number) => {
    skipFeedRefreshOnFocus.current = true;
    navigation.navigate('ImageViewer', {
      images: media,
      index: tappedIndex,
    });
  };

  if (containerHeight === null) {
    return (
      <View
        style={{
          width: '100%',
          height: 220,
          backgroundColor: '#111',
        }}
      />
    );
  }

  if (!media.length) return null;

  const renderMediaContent = (item: MediaItem, i: number) => {
    if (item.type === 'image') {
      // Get the calculated height or use a default
      const imageHeight = imageHeights[i] || containerHeight;

      return (
        <View
          style={{
            width: '100%',
            height: containerHeight,
            backgroundColor: '#000',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <FastImage
            source={{ uri: item.url, priority: FastImage.priority.high }}
            style={{
              width: '100%',
              height: imageHeight,
              // Add a transition for smooth height changes
            }}
            resizeMode={FastImage.resizeMode.contain}
            // Add onLoad to ensure height is set properly
            onLoad={() => {
              // Force a re-render if needed
              if (!imageHeights[i]) {
                // Recalculate height if not set
                Image.getSize(
                  item.url,
                  (w, h) => {
                    const height = clampHeight(SCREEN_WIDTH * (h / w));
                    heightCache[item.url] = height;
                    setImageHeights(prev => ({
                      ...prev,
                      [i]: height
                    }));
                  },
                  () => { }
                );
              }
            }}
          />
        </View>
      );
    }

    return (
      <Video
        source={{ uri: item.url }}
        style={{ width: '100%', height: containerHeight }}
        resizeMode="contain"
        repeat
        paused={!isVisible || index !== i}
      />
    );
  };

  // Single media item — no PagerView at all, just a plain pressable
  // image/video. Avoids mounting a heavy UIPageViewController per card.
  if (isSingleItem) {
    return (
      <View style={[styles.container, { height: containerHeight }]}>
        <Pressable style={{ flex: 1 }} onPress={() => openViewer(0)}>
          {renderMediaContent(media[0], 0)}
        </Pressable>
      </View>
    );
  }

  // Lightweight placeholder for off-screen multi-image posts
  if (!isVisible) {
    return (
      <View style={[styles.placeholder, { height: containerHeight }]}>
        <FastImage
          source={{ uri: media[0].url }}
          style={{ width: '100%', height: containerHeight }}
          resizeMode={FastImage.resizeMode.contain}
        />
        <View style={styles.counter}>
          <Text style={styles.counterText}>1/{media.length}</Text>
        </View>
      </View>
    );
  }

  const onPageChange = (e: any) => {
    const newIndex = e.nativeEvent.position;
    setIndex(newIndex);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.15,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const goPrev = () => {
    if (index > 0) pagerRef.current?.setPage(index - 1);
  };

  const goNext = () => {
    if (index < media.length - 1) pagerRef.current?.setPage(index + 1);
  };

  return (
    <View style={[styles.container, { height: containerHeight }]}>
      <PagerView
        ref={pagerRef}
        style={{ width: '100%', height: containerHeight }}
        initialPage={0}
        onPageSelected={onPageChange}
      >
        {media.map((item, i) => (
          <View
            key={`${item.url}-${i}`}
            style={{ width: '100%', height: containerHeight }}
          >
            <Pressable style={{ flex: 1 }} onPress={() => openViewer(i)}>
              {renderMediaContent(item, i)}
            </Pressable>
          </View>
        ))}
      </PagerView>

      {index > 0 && (
        <Pressable
          style={[styles.navButton, styles.navButtonLeft]}
          onPress={goPrev}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={18} color={themeColors.primary} />
        </Pressable>
      )}

      {index < media.length - 1 && (
        <Pressable
          style={[styles.navButton, styles.navButtonRight]}
          onPress={goNext}
          hitSlop={10}
        >
          <Ionicons name="chevron-forward" size={18} color={themeColors.primary} />
        </Pressable>
      )}

      <Animated.View
        style={[styles.counter, { transform: [{ scale: scaleAnim }] }]}
      >
        <Text style={styles.counterText}>
          {index + 1}/{media.length}
        </Text>
      </Animated.View>

      <View style={styles.pagination}>
        {media.map((_, i) => (
          <View key={i} style={[styles.dot, index === i && styles.activeDot]} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
    overflow: 'hidden',
  },

  placeholder: {
    width: '100%',
    backgroundColor: '#000',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },

  counter: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    zIndex: 100,
  },

  counterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  pagination: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    zIndex: 100,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },

  activeDot: {
    backgroundColor: themeColors.white,
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 100,
  },

  navButtonLeft: {
    left: 8,
  },

  navButtonRight: {
    right: 8,
  },
});

export default React.memo(PostCarousel);