import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ImageBackground,
  Platform,
  Animated,
  Easing,
} from 'react-native';

import { Fonts } from '../../../constants/Fonts';

const { width } = Dimensions.get('window');

const CARD_WIDTH = Platform.OS === 'ios' ? width * 0.4 : width * 0.35;
const CARD_HEIGHT = 80;
const GAP = 6;

type PartnerItem = {
  id?: string | number;
  image: string;
};

type Props = {
  data?: PartnerItem[];
  title?: string;
  description?: string;
  cardWidth?: number;
  cardHeight?: number;
  gap?: number;
  cardBackground?: any;
};

const OurPartners = ({
  data = [],
  title = 'Our Trusted\nAssociated Partners',
  description = `A powerful alliance of creative forces delivering cinematic excellence through trusted collaborations and shared vision.`,
  cardWidth = CARD_WIDTH,
  cardHeight = CARD_HEIGHT,
  gap = GAP,
  cardBackground = require('../../../assets/images/PartnerImgs/cardBg.png'),
}: Props) => {
  const translateX = useRef(new Animated.Value(0)).current;

  const loopData = useMemo(() => [...data, ...data], [data]);

  const contentWidth = (cardWidth + gap) * data.length;

  useEffect(() => {
    if (!data.length) return;

    translateX.setValue(0);

    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: -contentWidth,
        duration: data.length * 2500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [data, contentWidth]);

  if (!data.length) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>

      {!!description && <Text style={styles.description}>{description}</Text>}

      <View style={styles.sliderWrapper}>
        <View style={styles.clip}>
          <Animated.View
            style={[
              styles.row,
              {
                transform: [{ translateX }],
              },
            ]}
          >
            {loopData.map((item, index) => (
              <ImageBackground
                key={`${item.id ?? index}-${index}`}
                source={cardBackground}
                resizeMode="stretch"
                style={[
                  styles.card,
                  {
                    width: cardWidth,
                    height: cardHeight,
                    marginRight: gap,
                  },
                ]}
              >
                <Image
                  source={
                    item.image
                      ? { uri: item.image }
                      : require('../../../assets/images/fallback.png')
                  }
                  resizeMode="contain"
                  style={styles.logo}
                />
              </ImageBackground>
            ))}
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

export default OurPartners;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
  },

  header: {
    paddingHorizontal: 20,
  },

  title: {
    color: '#fff',
    fontSize: 38,
    lineHeight: 48,
    fontFamily: Fonts.Bold,
  },

  description: {
    color: '#B0B0B0',
    fontSize: 16,
    lineHeight: 28,
    fontFamily: Fonts.Regular,
    paddingHorizontal: 20,
    width: '90%',
  },

  sliderWrapper: {
    marginTop: 40,
  },

  clip: {
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  card: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 15,
  },

  logo: {
    width: '80%',
    height: '80%',
  },
});
