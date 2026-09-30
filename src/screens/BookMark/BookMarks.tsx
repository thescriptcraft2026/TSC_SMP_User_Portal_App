import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  FlatList,
  Dimensions,
  View,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { themeColors } from '../../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthHeader from '../../components/Header/AuthHeader';
import Tabs from './components/Tabs';
import PostsTab from './components/PostsTab';
import BookTabs from './components/BookTabs';
import SynopsesTabs from './components/SynopsesTabs';
import VisionXTabs from './components/VisionXTabs';
import ContestTab from './components/ContestTab';
import OpportunityTab from './components/OpportunityTab';
import MoviesTab from './components/MoviesTab';

const SCREEN_WIDTH = Dimensions.get('window').width;
const TAB_DATA = [
  'Posts',
  'Books',
  'Synopses',
  'Creator Zone',
  'Contest',
  'Opportunities',
  'Unfiltered',
];
const BookMarks = () => {
  const navigation = useNavigation<any>();
  const isDark = true;
  const [activeTab, setActiveTab] = useState(0);
  const listRef = useRef<FlatList>(null);

  const backgroundColor = useMemo(
    () => (isDark ? themeColors.black : themeColors.appBackground),
    [isDark],
  );

  const handleBack = () => navigation.goBack();

  const handleTabChange = (index: number) => {
    setActiveTab(index);

    listRef.current?.scrollToOffset({
      offset: index * SCREEN_WIDTH,
      animated: true,
    });
  };
  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        translucent
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      {/* HEADER */}
      <AuthHeader showBack title="All Bookmarks" onBack={handleBack} />

      {/* TABS */}
      <Tabs activeIndex={activeTab} onTabChange={handleTabChange} />

      {/* TAB CONTENT */}
      <FlatList
        ref={listRef}
        data={TAB_DATA}
        keyExtractor={(_, i) => i.toString()}
        horizontal
        extraData={activeTab}
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        // style={{ marginBottom: 10 }}
        onMomentumScrollEnd={e => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
          );
          setActiveTab(index);
        }}
        renderItem={({ index }) => {
          let Component = null;

          if (index === 0) Component = <PostsTab key="posts" />;
          if (index === 1) Component = <BookTabs key="books" />;
          if (index === 2) Component = <SynopsesTabs key="synopsis" />;
          if (index === 3) Component = <VisionXTabs key="visionx" />;
          if (index === 4) Component = <ContestTab key="contest" />;
          if (index === 5) Component = <OpportunityTab key="opportunity" />;
          if (index === 6) Component = <MoviesTab key="Unfiltered" />;

          return (
            <View style={{ width: SCREEN_WIDTH, flex: 1 }}>{Component}</View>
          );
        }}
      />
    </SafeAreaView>
  );
};

export default BookMarks;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  tabContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tabText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
