import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';

import { Fonts } from '../../../constants/Fonts';
import GenreBadge from '../../../components/Badges/GenreBadge';

const { width } = Dimensions.get('window');

type SynopsisItem = {
  id: string | number;
  title: string;
  synopsis?: string;
  image?: string;
  avg_rating?: string | number;

  genre?: {
    id?: string;
    name?: string;
  };

  views?: number;
  likes_count?: number;
  comments_count?: number;
  reading_time?: string;

  user?: {
    profile_photo_path?: string;
  };
};

type Props = {
  title?: string;
  description?: string;
  data?: SynopsisItem[];
};

export default function PopularSynopsisSection({
  title = 'Popular Synopses',
  description = '',
  data = [],
}: Props) {
  const navigation = useNavigation<any>();

  const [imageErrors, setImageErrors] = useState<any>({});

  const renderItem = ({ item }: any) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.card}
        onPress={() =>
          navigation.navigate('SynopsisDetails', {
            synopsisId: item.id,
          })
        }
      >
        <FastImage
          source={
            imageErrors[item.id] || !item.image
              ? require('../../../assets/images/fallback.png')
              : { uri: item.image }
          }
          style={styles.image}
          resizeMode={FastImage.resizeMode.cover}
          onError={() =>
            setImageErrors((prev: any) => ({
              ...prev,
              [item.id]: true,
            }))
          }
        />

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,.2)', 'rgba(0,0,0,.95)']}
          style={styles.overlay}
        />

        <View style={styles.genreRow}>
          {/* <View style={styles.genreChip}>
            <Text style={styles.genreText}>{item.genre?.name}</Text>
          </View> */}
          <GenreBadge label={item.genre?.name || ''} size="xs" />

          {/* <View style={styles.ratingChip}>
            <Ionicons name="star" color="#FFC107" size={14} />

            <Text style={styles.rating}>
              {Number(item.avg_rating || 0).toFixed(1)}
            </Text>
          </View> */}
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>

          <Text numberOfLines={2} style={styles.synopsis}>
            {item.synopsis}
          </Text>

          <View style={styles.bottom}>
            {/* <View style={styles.stats}>
              <View style={styles.stat}>
                <Ionicons name="eye-outline" color="#999" size={15} />
                <Text style={styles.statText}>{item.views}</Text>
              </View>

              <View style={styles.stat}>
                <Ionicons name="heart-outline" color="#999" size={15} />
                <Text style={styles.statText}>{item.likes_count}</Text>
              </View>

              <View style={styles.stat}>
                <Ionicons name="chatbubble-outline" color="#999" size={14} />
                <Text style={styles.statText}>{item.comments_count}</Text>
              </View>
            </View> */}

            <View style={styles.readBtn}>
              <Text style={styles.readText}>Read Story</Text>

              <Ionicons name="arrow-forward" color="#000" size={15} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!data.length) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.smallTitle}>FEATURED STORIES</Text>

        <Text style={styles.heading}>{title}</Text>

        {!!description && <Text style={styles.description}>{description}</Text>}
      </View>

      <FlatList
        horizontal
        data={data}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
        }}
        ItemSeparatorComponent={() => <View style={{ width: 18 }} />}
        renderItem={renderItem}
      />
    </View>
  );
}

const CARD_WIDTH = width * 0.48;

const styles = StyleSheet.create({
  container: {
    marginTop: 45,
    marginBottom: 25,
  },

  header: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },

  smallTitle: {
    color: '#FFB400',
    fontSize: 12,
    letterSpacing: 2,
    fontFamily: Fonts.SemiBold,
  },

  heading: {
    color: '#FFF',
    fontSize: 32,
    fontFamily: Fonts.Bold,
    marginTop: 8,
  },

  description: {
    color: '#A5A5A5',
    marginTop: 8,
    lineHeight: 22,
    fontFamily: Fonts.Regular,
  },

  card: {
    width: CARD_WIDTH,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#171717',
  },

  image: {
    width: '100%',
    height: 150,
  },

  overlay: {
    position: 'absolute',
    width: '100%',
    height: 150,
  },

  genreRow: {
    position: 'absolute',
    top: 5,
    left: 5,
    right: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  genreChip: {
    backgroundColor: '#FFB400',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  genreText: {
    color: '#000',
    fontSize: 9,
    fontFamily: Fonts.Bold,
  },

  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,.7)',
    borderRadius: 20,
    paddingHorizontal: 10,
  },

  rating: {
    color: '#fff',
    marginLeft: 5,
  },

  content: {
    padding: 12,
  },

  title: {
    color: '#fff',
    fontSize: 15,
    fontFamily: Fonts.Bold,
  },

  synopsis: {
    color: '#BDBDBD',
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
  },

  bottom: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  stats: {
    flexDirection: 'row',
  },

  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
  },

  statText: {
    color: '#999',
    marginLeft: 5,
    fontSize: 12,
  },

  readBtn: {
    backgroundColor: '#FFB400',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 4,
  },

  readText: {
    color: '#000',
    fontFamily: Fonts.Bold,
    marginRight: 5,
    fontSize: 12,
  },
});
