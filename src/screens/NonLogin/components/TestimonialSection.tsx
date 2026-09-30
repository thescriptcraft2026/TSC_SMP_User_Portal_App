import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  Platform,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import { Fonts } from '../../../constants/Fonts';
import Avatar from '../../../components/Avatar/Avatar';
import { themeColors } from '../../../theme/colors';
import Swiper from 'react-native-swiper';
import firstWinner from '../../../assets/images/Testimonials/first-winner.jpg';
import secondWinner from '../../../assets/images/Testimonials/second-winner.jpg';
import thirdWinner from '../../../assets/images/Testimonials/third-winner.jpg';

const { width } = Dimensions.get('window');

const CARD_WIDTH = width * 0.82;

const testimonials = [
  {
    id: 1,
    name: 'Suvadeep',
    role: '1st Prize Winner at International Short Film Festival',
    image: firstWinner,
    text:
      'Receiving this award is both humbling and inspiring. To have that work recognized on an international platform is truly a special moment in my creative career.',
  },
  {
    id: 2,
    name: 'Vinay Kumar',
    role: '2nd Prize Winner at International Short Film Festival',
    image: secondWinner,
    text:
      'I am delighted and honoured to have been selected as the 2nd Winner in the Script Craft Short Film Contest.',
  },
  {
    id: 3,
    name: 'Sai Kiran',
    role: '3rd Prize Winner at International Short Film Festival',
    image: thirdWinner,
    text:
      'Just like an oasis to a thirsty traveller in a desert, we got this chance of showcasing our work to larger audience through this prestigious contest.',
  },
];


export default function TestimonialSection() {
  const flatListRef = useRef<any>(null);

  const currentIndex = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      currentIndex.current = (currentIndex.current + 1) % testimonials.length;

      flatListRef.current?.scrollToIndex({
        index: currentIndex.current,
        animated: true,
      });
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* LEFT SIDE */}
      <View style={styles.leftContent}>
        <View style={styles.badgeRow}>
          <View style={styles.dotTwo} />
          <Text style={styles.badgeText}>TESTIMONIALS</Text>
          <View style={styles.line} />
        </View>

        <Text style={styles.heading}>What Our Members Are Saying!</Text>

        {/* <View style={styles.buttonsRow}>
          <View style={styles.circleBtn}>
            <Ionicons name="arrow-back" size={18} color="#FFF" />
          </View>

          <View style={styles.circleBtn}>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </View>
        </View> */}
      </View>

      {/* RIGHT SIDE */}
      <View style={styles.sliderWrapper}>
        <Swiper
          autoplay
          autoplayTimeout={3}
          loop
          showsPagination
          dotStyle={styles.dot}
          activeDotStyle={styles.activeDot}
          paginationStyle={{
            bottom: 0,
          }}
        >
          {testimonials.map(item => (
            <View key={item.id} style={styles.card}>
              {/* TOP */}
              <View style={styles.topRow}>
                <View style={styles.profileRow}>
                  <Avatar uri={item.image} name={item?.name} size={40} />

                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.name}>{item.name}</Text>

                    <Text style={styles.role}>{item.role}</Text>

                    <Text style={styles.stars}>★★★★★</Text>
                  </View>
                </View>
              </View>

              {/* QUOTE */}
              <Text style={styles.quote}>❝</Text>

              <Text style={styles.text} ellipsizeMode="tail" numberOfLines={3}>
                {item.text}
              </Text>
            </View>
          ))}
        </Swiper>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
  },

  /* LEFT SIDE */
  leftContent: {
    // paddingTop: 20,
    paddingHorizontal: 20,
  },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    color: '#DDD',
    fontSize: 12,
    letterSpacing: 1.5,
  },
  line: {
    width: 70,
    height: 1,
    backgroundColor: '#555',
    marginLeft: 10,
  },

  heading: {
    color: themeColors.white,
    fontSize: 38,
    fontFamily: Fonts.Bold,
    lineHeight: 48,
    marginTop: 12,
    marginBottom: 16,
  },

  /* RIGHT SIDE */
  sliderWrapper: {
    height: 220,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 10,
    backgroundColor: '#666',
    marginHorizontal: 3,
    marginTop: -50,
  },

  dotTwo: {
    width: 8,
    height: 8,
    borderRadius: 100,
    backgroundColor: themeColors.primary,
    marginRight: 10,
  },

  activeDot: {
    width: 24,
    height: 7,
    borderRadius: 10,
    backgroundColor: themeColors.primary,
    marginHorizontal: 3,
    marginTop: -50,
  },
  row: {
    flexDirection: 'row',
  },

  card: {
    width: width - 40,
    height: 170,
    borderRadius: 26,
    marginHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 14,
    paddingHorizontal: 16,
    backgroundColor: themeColors.card2,

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  name: {
    color: themeColors.white,
    fontSize: 16,
    fontFamily: Fonts.Medium,
  },

  role: {
    color: '#888',
    fontSize: 10,
    fontFamily:Fonts.Regular
  },

  stars: {
    color: themeColors.primary,
    fontSize: 12,
  },

  quote: {
    color: themeColors.primary,
    fontSize: 18,
    marginTop: 12,
  },

  text: {
    color: '#CFCFCF',
    fontSize: 14,
    fontFamily:Fonts.Regular
  },
});
