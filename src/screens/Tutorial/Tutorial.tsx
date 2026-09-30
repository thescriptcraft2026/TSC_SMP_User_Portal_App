import {
  Dimensions,
  StatusBar,
  StyleSheet,
  View,
  FlatList,
  Text,
  Linking,
} from 'react-native';

import React, { useEffect, useMemo, useState } from 'react';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import AuthHeader from '../../components/Header/AuthHeader';
import TutorialCard from './components/TutorialCard';

import api from '../../../Instance/Instance';

import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';

import NoBookMark from '../../assets/SVG/NoBookMark';
import NoTutorial from '../../assets/SVG/NoTutorial';

const { width } = Dimensions.get('window');

const CARD_MARGIN = 10;

const Tutorial = () => {
  const navigation = useNavigation<any>();

  const isDark = true;

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleBack = () => navigation.goBack();

  const backgroundColor = useMemo(
    () => (isDark ? themeColors.black : themeColors.appBackground),
    [isDark],
  );

  // ================= YOUTUBE ID =================

  const getYoutubeId = (url: string) => {
    if (!url) return '';

    const regExp =
      /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;

    const match = url.match(regExp);

    return match && match[1]?.length === 11 ? match[1] : '';
  };

  // ================= API =================

  const getAllTutorials = async () => {
    try {
      setLoading(true);

      const res = await api.get('/tutorial');

      console.log('tutorial res =>', res?.data);

      setData(res?.data?.data || []);
    } catch (error) {
      console.log('tutorial error =>', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllTutorials();
  }, []);

  // ================= EMPTY =================

  const renderEmpty = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <NoTutorial width={90} height={90} />

        <Text style={styles.emptyTitle}>No Tutorials Found</Text>
        <Text style={styles.emptyDesc}>
          Tutorials will appear here once added.
        </Text>
      </View>
    );
  };

  // ================= RENDER =================

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor,
        },
      ]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        translucent
        barStyle="light-content"
      />

      {/* HEADER */}
      <AuthHeader showBack title="Tutorials" onBack={handleBack} />

      {/* LIST */}
      <FlatList
        data={data}
        numColumns={2}
        keyExtractor={(item: any, index) => `${item?.id}-${index}`}
        columnWrapperStyle={{
          justifyContent: 'space-between',
          paddingHorizontal: CARD_MARGIN,
        }}
        contentContainerStyle={{
          paddingTop: 10,
          paddingBottom: 30,
        }}
        renderItem={({ item }) => (
          <TutorialCard
            title={item?.title}
            youtubeId={getYoutubeId(item?.link)}
            onPress={() => Linking.openURL(item?.link)}
          />
        )}
        ListEmptyComponent={renderEmpty}
      />
    </SafeAreaView>
  );
};

export default Tutorial;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  listContainer: {
    paddingHorizontal: CARD_MARGIN,
    paddingBottom: 20,
    paddingTop: 10,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },

  emptyTitle: {
    color: themeColors.primary,
    marginTop: 16,
    fontFamily: Fonts.Bold,
    fontSize: 20,
  },

  emptyDesc: {
    color: themeColors.gray,
    marginTop: 6,
    fontFamily: Fonts.Regular,
    fontSize: 14,
  },
});
