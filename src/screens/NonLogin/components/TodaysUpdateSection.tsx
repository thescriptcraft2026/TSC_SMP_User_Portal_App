import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Linking,
} from 'react-native';

import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';

import { Fonts } from '../../../constants/Fonts';

const { width } = Dimensions.get('window');

const CARD_WIDTH = width * 0.86;
const CARD_HEIGHT = 200;

type UpdateItem = {
  id: string | number;
  image?: string;
  link?: string;
};

type Props = {
  title?: string;
  description?: string;
  data?: UpdateItem[];
};

export default function TodaysUpdateSection({
  title = "Today's Updates",
  description = '',
  data = [],
}: Props) {
  const [imageErrors, setImageErrors] = useState<any>({});

  const openLink = async (url?: string) => {
    if (!url) return;

    try {
      await Linking.openURL(url);
    } catch (e) {}
  };

  const renderItem = ({ item }: { item: UpdateItem }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() => openLink(item.link)}
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
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,.25)', 'rgba(0,0,0,.92)']}
        style={styles.overlay}
      />

      {/* <View style={styles.content}>
        <View style={styles.badge}>
          <Ionicons name="flash" color="#FFB400" size={13} />

          <Text style={styles.badgeText}>TODAY</Text>
        </View>

        <Text style={styles.title}>{title}</Text>

        {!!description && (
          <Text numberOfLines={2} style={styles.description}>
            {description}
          </Text>
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.button}
          onPress={() => openLink(item.link)}
        >
          <Text style={styles.buttonText}>Read More</Text>

          <Ionicons name="arrow-forward" color="#000" size={16} />
        </TouchableOpacity>
      </View> */}
    </TouchableOpacity>
  );

  if (!data.length) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.dot} />

          <Text style={styles.headerSmall}>TODAY'S HIGHLIGHTS</Text>

          <View style={styles.line} />
        </View>

        <Text style={styles.heading}>{title}</Text>

        {!!description && (
          <Text style={styles.headerDescription}>{description}</Text>
        )}
      </View>

      <FlatList
        horizontal
        pagingEnabled
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + 18}
        snapToAlignment="start"
        data={data}
        keyExtractor={item => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ width: 18 }} />}
        contentContainerStyle={{
          paddingHorizontal: 20,
        }}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 45,
    marginBottom: 25,
  },

  header: {
    paddingHorizontal: 20,
    marginBottom: 24,
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

  headerSmall: {
    color: '#E5E5E5',
    fontSize: 12,
    letterSpacing: 1.6,
    fontFamily: Fonts.SemiBold,
  },

  line: {
    width: 70,
    height: 1,
    backgroundColor: '#444',
    marginLeft: 10,
  },

  heading: {
    color: '#FFF',
    fontSize: 32,
    fontFamily: Fonts.Bold,
    marginTop: 12,
  },

  headerDescription: {
    color: '#A8A8A8',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
    fontFamily: Fonts.Regular,
  },

  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#151515',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.08)',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 12,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },

  content: {
    position: 'absolute',
    bottom: 18,
    left: 18,
    right: 18,
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,.65)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },

  badgeText: {
    color: '#FFB400',
    marginLeft: 6,
    fontSize: 11,
    fontFamily: Fonts.Bold,
  },

  title: {
    color: '#FFF',
    fontSize: 24,
    fontFamily: Fonts.Bold,
  },

  description: {
    color: '#E0E0E0',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    fontFamily: Fonts.Regular,
  },

  button: {
    marginTop: 18,
    backgroundColor: '#FFB400',
    alignSelf: 'flex-start',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },

  buttonText: {
    color: '#000',
    fontSize: 13,
    fontFamily: Fonts.Bold,
    marginRight: 6,
  },
});
