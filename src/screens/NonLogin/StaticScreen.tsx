// StaticScreen.tsx

import {
  Animated,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import CoverflowSwiper from '../../components/swiper/CoverflowSwiper';
import HomeHeader from '../Home/components/Header/HomeHeader';
import OurPartners from './components/OurPartners';
import { themeColors } from '../../theme/colors';
import PressReleaseSection from './components/PressReleaseSection';
import FastImage from 'react-native-fast-image';
import AutoScrollRibbon from './components/AutoScrollRibbon';
import TestimonialSection from './components/TestimonialSection';
import FooterSection from './components/FooterSection';
import { SafeAreaView } from 'react-native-safe-area-context';
import PopularBooksSection from './components/PopularBooksSection';

import { useDispatch, useSelector } from 'react-redux';
import { fetchBanners } from '../../redux/slices/bannerSlice';
import PopularSynopsisSection from './components/PopularSynopsisSection';
import TopWritersSection from './components/TopWritersSection';
import TodaysUpdateSection from './components/TodaysUpdateSection';
import AppLoader from '../../components/Loader/AppLoader';
import TopVisionXSection from './components/TopVisionXSection';
import { useSocket } from '../../context/SocketContext';
import VideoSection from './components/VideoSection';
import CommunitySection from './components/CommunitySection';
import HeroBanner from './components/HearoBanner';
import ContactSection from './components/ContactSection';
import Collaborate from './components/Collaborate';

const HEADER_HEIGHT = Platform.OS === 'ios' ? 50 : 100;

const StaticScreen = () => {
  const navigation = useNavigation<any>();
  const isDark = useColorScheme() === 'dark';
  const headerOffset = useRef(new Animated.Value(0)).current;
  const pagerRef = useRef(null);
  const pagerScroll = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch<any>();
  const [refreshing, setRefreshing] = useState(false);


  const { rows, loading } = useSelector((state: any) => state.banners);
  const { user } = useSelector((state: any) => state.auth);
  const { notificationCount: socketNotificationCount } = useSocket();

  const notificationCountValue = useSelector(
    (state: any) => state.notification?.count || 0,
  );
  const totalNotificationCount =
    notificationCountValue + socketNotificationCount;

  useEffect(() => {
    dispatch(fetchBanners());
  }, []);

  if (loading) {
    return <AppLoader visible={true} />;
  }

  const bg = isDark ? themeColors.black : themeColors.black;

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await dispatch(fetchBanners());
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: bg }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        translucent
        barStyle={'light-content'}
      />

      {/* Header */}
      <HomeHeader
        headerOffset={headerOffset}
        pagerRef={pagerRef}
        pagerScroll={pagerScroll}
        showTabs={false}
        notificationCount={totalNotificationCount}
      />

      <Animated.ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: headerOffset } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.primary}
            colors={[themeColors.primary]}
            progressBackgroundColor={themeColors.black}
          />
        }
      >

        {/* Background Patterns */}
        <FastImage
          source={require('../../assets/images/awards-bg-removebg-preview.png')}
          style={styles.leftPattern}
          resizeMode="contain"
        />

        <FastImage
          source={require('../../assets/images/about-pattern.png')}
          style={styles.rightPattern}
          resizeMode="contain"
        />

        <HeroBanner onGetStarted={() => {
          navigation.navigate('BottomTab', {
            screen: 'Feed',
          });
        }} />

        {rows?.map((row: any, index: number) => {
          // BANNERS
          if (row?.row_type === 'banners') {
            return (
              <View
                key={`${row?.row_type}-${row?.id}-${index}`}
                style={styles.swiperContainer}
              >
                <CoverflowSwiper
                  title={row?.title}
                  description={row?.description}
                  data={
                    [...(row?.images || [])]
                      .sort(
                        (a: any, b: any) =>
                          (a?.position || 0) - (b?.position || 0),
                      )
                      .map((img: any) => ({
                        id: img?.id,
                        poster: img?.image,
                        link: img?.link,
                      }))
                  }
                />
              </View>
            );
          }

          // PARTNERS
          if (row?.row_type === 'partners') {
            return (
              <OurPartners
                key={`${row?.row_type}-${row?.id}-${index}`}
                title={row?.title}
                description={row?.description}
                data={
                  [...(row?.images || [])]
                    .sort(
                      (a: any, b: any) =>
                        (a?.position || 0) - (b?.position || 0),
                    )
                    .map((img: any) => ({
                      id: img?.id,
                      image: img?.image,
                      link: img?.link,
                    })) || []
                }
              />
            );
          }

          // NEWS
          if (row?.row_type === 'news') {
            return (
              <PressReleaseSection
                key={`${row?.row_type}-${row?.id}-${index}`}
                title={row?.title}
                data={
                  (row?.contents || []).map((item: any) => ({
                    id: item?.id,
                    title: item?.title,
                    description: item?.description,
                    image: item?.image,
                    link: item?.link,
                    createdAt: item?.createdAt,
                  })) || []
                }
              />
            );
          }

          // BOOKS
          if (row?.row_type === 'book') {
            return (
              <PopularBooksSection
                key={`${row?.row_type}-${row?.id}-${index}`}
                title={row?.title}
                description={row?.description}
                data={
                  (row?.contents || []).map((item: any) => ({
                    id: item?.id,
                    title: item?.title,
                    synopsis: item?.synopsis,
                    image: item?.image,
                    avg_rating: item?.avg_rating,
                    link: item?.link,
                    user: item?.user?.name,
                  })) || []
                }
              />
            );
          }

          // Synpses
          if (row?.row_type === 'script') {
            return (
              <PopularSynopsisSection
                key={`${row?.row_type}-${row?.id}-${index}`}
                title={row?.title}
                description={row?.description}
                data={
                  (row?.contents || []).map((item: any) => ({
                    id: item?.id,
                    title: item?.title,
                    synopsis: item?.synopsis,
                    image: item?.image,
                    avg_rating: item?.avg_rating,
                    genre: item?.genre,
                    views: item?.views,
                    likes_count: item?.likes_count,
                    comments_count: item?.comments_count,
                    reading_time: item?.reading_time, // optional if available
                    user: item?.user,
                  })) || []
                }
              />
            );
          }

          // TOP WRITERS
          if (row?.row_type === 'users') {
            return (
              <TopWritersSection
                key={`${row?.row_type}-${row?.id}-${index}`}
                title={row?.title}
                description={row?.description}
                data={(row?.contents || [])
                  .filter(
                    (item: any) =>
                      item?.id !== user?.id &&
                      item?.user_name !== user?.user_name,
                  )
                  .map((item: any) => ({
                    id: item?.id,
                    name: item?.name,
                    user_name: item?.user_name,
                    profile_photo_path: item?.profile_photo_path,
                    cover_photo_path: item?.cover_photo_path,
                    followers_count: item?.followers_count,
                    connections_count: item?.connections_count,
                    active_score: item?.active_score,
                    handleViewProfile: () => {
                      navigation.navigate('Profile', {
                        username: item?.user_name || item?.id,
                      });
                    },
                  }))}
              />
            );
          }

          // Today's Update
          if (row?.row_type === 'todays_update') {
            return (
              <TodaysUpdateSection
                key={`${row.row_type}-${row.id}-${index}`}
                title={row.title}
                description={row.description}
                data={[...(row.images || [])]
                  .sort((a, b) => a.position - b.position)
                  .map(item => ({
                    id: item.id,
                    image: item.image,
                    link: item.link,
                  }))}
              />
            );
          }

          // VisionX
          if (row?.row_type === 'visionx') {
            return (
              <TopVisionXSection
                key={`${row?.row_type}-${row?.id}-${index}`}
                title={row?.title}
                description={row?.description}
                data={(row?.contents || []).map((item: any) => ({
                  id: item?.id,
                  title: item?.title,
                  story: item?.story,
                  synopsis: item?.synopsis,

                  image: item?.image,
                  link: item?.link, // ✅ Pass this
                  platform: item?.platform, // ✅ Pass this

                  avg_rating: item?.avg_rating,
                  trending_score: item?.trending_score,
                  views: item?.views,
                  likes_count: item?.likes_count,
                  comments_count: item?.comments_count,

                  genre: item?.genre,

                  user: {
                    id: item?.user?.id,
                    name: item?.user?.name,
                    user_name: item?.user?.user_name,
                    profile_photo_path: item?.user?.profile_photo_path,
                  },
                }))}
              />
            );
          }

          return null;
        })}

        {/* <View style={{ marginVertical: 20 }}>
          <AutoScrollRibbon />
        </View> */}

        <Collaborate />

        <VideoSection />
        <CommunitySection />
        <TestimonialSection />
        <ContactSection />
        <FooterSection />
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default StaticScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  content: {
    paddingTop: Platform.OS === 'ios' ? HEADER_HEIGHT + 10 : HEADER_HEIGHT - 50,
    paddingBottom: 120,
  },

  swiperContainer: {
    marginTop: 10,
    marginBottom: 10,
  },

  leftPattern: {
    position: 'absolute',
    left: -120,
    top: 140,
    width: 280,
    height: 500,
    opacity: 0.22,
  },

  rightPattern: {
    position: 'absolute',
    right: -80,
    bottom: 80,
    width: 240,
    height: 400,
    opacity: 0.22,
  },
});
