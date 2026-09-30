// PopularBooksSection.tsx

import React from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Linking,
} from 'react-native';

import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';

import { Fonts } from '../../../constants/Fonts';

const { width } = Dimensions.get('window');

const BOOK_WIDTH = width * 0.42;

type BookItem = {
  id: string | number;
  title: string;
  synopsis?: string;
  image?: string;
  avg_rating?: string | number;
  link?: string | null;
  user?:string | null;
};

type Props = {
  title?: string;
  description?: string;
  data?: BookItem[];
};

export default function PopularBooksSection({
  title = '',

  description = '',

  data = [],
}: Props) {
  const navigation = useNavigation<any>();
  const [imageErrors, setImageErrors] = React.useState<any>({});

  const renderItem = ({ item }: any) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={() => {
          navigation.navigate('BookDetails', {
            bookId: item?.id,
          });
        }}
      >
        {/* BOOK COVER */}
        <FastImage
          source={
            imageErrors[item?.id] || !item?.image
              ? require('../../../assets/images/fallback.png')
              : { uri: item?.image }
          }
          style={styles.image}
          resizeMode={FastImage.resizeMode.cover}
          onError={() => {
            setImageErrors((prev: any) => ({
              ...prev,
              [item?.id]: true,
            }));
          }}
        />

        {/* OVERLAY */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.95)']}
          style={styles.overlay}
        />

        {/* CONTENT */}
        <View style={styles.content}>

          <Text numberOfLines={1} style={styles.title}>
            {item?.title}
          </Text>
          <Text numberOfLines={1} style={styles.author}>
            by {item?.user}
          </Text>

          {!!item?.synopsis && (
            <Text numberOfLines={2} style={styles.author}>
              {item?.synopsis}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!data?.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        {/* <View style={styles.badgeRow}>
          <View style={styles.dot} />

          <Text style={styles.badgeText}>OUR POPULAR BOOKS</Text>

          <View style={styles.line} />
        </View> */}

        <Text style={styles.heading}>{title}</Text>
        {!!description && <Text style={styles.description}>{description}</Text>}
      </View>

      {/* BOOK LIST */}
      <FlatList
        horizontal
        data={data}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, i) => `book-${item?.id || 'item'}-${i}`}
        contentContainerStyle={{
          paddingHorizontal: 20,
        }}
        ItemSeparatorComponent={() => <View style={{ width: 18 }} />}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    marginBottom: 20,
  },

  header: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },

  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 100,
    backgroundColor: '#FFB400',
    marginRight: 10,
  },

  badgeText: {
    color: '#E5E5E5',
    fontSize: 12,
    letterSpacing: 1.6,
    fontWeight: '600',
  },

  line: {
    width: 70,
    height: 1,
    backgroundColor: '#444',
    marginLeft: 10,
  },

  heading: {
    color: '#FFF',
    fontSize: 34,
    lineHeight: 50,
    fontFamily: Fonts.Bold,
    marginTop: 14,
  },

  description: {
    color: '#9A9A9A',
    fontSize: 15,
    lineHeight: 24,
    marginTop: 10,
    width: '92%',
  },

  card: {
    width: BOOK_WIDTH,
    height: BOOK_WIDTH * 1.4,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 14,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  overlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '70%',
  },

  content: {
    position: 'absolute',
    bottom: 10,
    left: 16,
    right: 16,
  },

  title: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: Fonts.Bold,
  },

  author: {
    color: '#BDBDBD',
    fontSize: 12,
    fontFamily: Fonts.Regular,
    marginTop: 4,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  rating: {
    color: '#FFB400',
    fontSize: 12,
  },
});
