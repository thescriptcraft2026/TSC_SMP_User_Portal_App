// PressReleaseSection.tsx

import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  Linking,
} from 'react-native';

import Swiper from 'react-native-swiper';
import Ionicons from '@react-native-vector-icons/ionicons';

import { Fonts } from '../../../constants/Fonts';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const CARD_WIDTH = width * 0.8;
const CARD_HEIGHT = 350;

type NewsItem = {
  id: string | number;
  title: string;
  description?: string;
  image?: string | null;
  link?: string | null;
  createdAt?: string | null;
};

type Props = {
  title?: string;
  data?: NewsItem[];
};

const PressReleaseSection = ({
  title = 'Press Release &\nLatest News',
  data = [],
}: Props) => {
  const swiperRef = useRef<any>(null);
  const [imageErrors, setImageErrors] = React.useState<any>({});

  const handleOpenLink = async (url?: string | null) => {
    if (!url) return;

    try {
      await Linking.openURL(url);
    } catch (error) {}
  };

  if (!data?.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Heading */}
      <View style={styles.headingRow}>
        <Text style={styles.title}>{title}</Text>

        {data.length > 1 && (
          <View style={styles.arrows}>
            <TouchableOpacity
              style={styles.arrowBtn}
              activeOpacity={0.8}
              onPress={() => swiperRef.current?.scrollBy(-1)}
            >
              <Ionicons name="chevron-back" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.arrowBtn}
              activeOpacity={0.8}
              onPress={() => swiperRef.current?.scrollBy(1)}
            >
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Swiper */}
      <View style={styles.swiperWrapper}>
        <Swiper
          ref={swiperRef}
          autoplay={data.length > 1}
          autoplayTimeout={5}
          loop={data.length > 1}
          showsPagination
          dotStyle={styles.dot}
          activeDotStyle={styles.activeDot}
          removeClippedSubviews={false}
          loadMinimal={false}
        >
          {data.map((item, index) => (
            <View
              key={`news-${item?.id || 'item'}-${index}`}
              style={styles.slide}
            >
              <ImageBackground
                source={
                  imageErrors[item?.id] || !item?.image?.trim()
                    ? require('../../../assets/images/fallback.png')
                    : { uri: item?.image }
                }
                style={styles.card}
                imageStyle={styles.cardImage}
                onError={() => {
                  setImageErrors((prev: any) => ({
                    ...prev,
                    [item?.id]: true,
                  }));
                }}
              >
                {/* Overlay */}
                {/* <View style={styles.overlay} /> */}
                <LinearGradient
                  colors={[
                    'rgba(0,0,0,0.15)',
                    'rgba(0,0,0,0.45)',
                    'rgba(0,0,0,0.92)',
                  ]}
                  style={styles.overlay}
                />

                <View style={styles.contentWrapper}>
                  {/* TOP */}
                  <View style={styles.topSection}>
                    {!!item?.createdAt && (
                      <View style={styles.dateBadge}>
                        <Text style={styles.dateText}>
                          {new Date(item.createdAt).toLocaleDateString(
                            'en-GB',
                            {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            },
                          )}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* BOTTOM */}
                  <View style={styles.bottomContent}>
                    <Text numberOfLines={4} style={styles.newsTitle}>
                      {item?.title}
                    </Text>

                    {!!item?.link && (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleOpenLink(item?.link)}
                      >
                        <Text style={styles.readStory}>
                          Read Story {'  '}
                          <Ionicons
                            name="arrow-forward"
                            size={14}
                            color="#F5A300"
                          />
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </ImageBackground>
            </View>
          ))}
        </Swiper>
      </View>
    </View>
  );
};

export default PressReleaseSection;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
  },

  headingRow: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    color: '#fff',
    fontSize: 34,
    lineHeight: 50,
    fontFamily: Fonts.Bold,
    flex: 1,
  },

  arrows: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  arrowBtn: {
    width: 34,
    height: 34,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  swiperWrapper: {
    height: CARD_HEIGHT + 30,
    marginTop: 35,
  },

  slide: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderRadius: 24,
  },

  cardImage: {
    borderRadius: 24,
  },

  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },

  topSection: {
    minHeight: 60,
    justifyContent: 'flex-start',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor: 'rgba(0,0,0,0.42)',
  },

  dateBadge: {
    marginTop: 16,
    marginLeft: 16,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },

  dateText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: Fonts.Medium,
  },

  bottomContent: {
    paddingHorizontal: 18,
    paddingBottom: 22,
  },

  newsTitle: {
    color: '#fff',
    fontSize: 20,
    lineHeight: 30,
    fontFamily: Fonts.Medium,
  },

  readStory: {
    marginTop: 18,
    color: '#F5A300',
    fontSize: 15,
    fontFamily: Fonts.Medium,
  },

  dot: {
    backgroundColor: '#666',
    width: 6,
    height: 6,
    borderRadius: 100,
    marginBottom: -35,
  },

  activeDot: {
    backgroundColor: '#F5A300',
    width: 20,
    height: 6,
    borderRadius: 100,
    marginBottom: -35,
  },
});
