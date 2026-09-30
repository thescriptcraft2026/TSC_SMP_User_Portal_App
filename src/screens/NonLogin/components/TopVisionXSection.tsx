import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import YoutubePlayer from 'react-native-youtube-iframe';
import { WebView } from 'react-native-webview';

import { Fonts } from '../../../constants/Fonts';
import GenreBadge from '../../../components/Badges/GenreBadge';
import Avatar from '../../../components/Avatar/Avatar';

type VisionItem = {
  id: string | number;
  title: string;
  story?: string;
  synopsis?: string;

  image?: string;
  link?: string;

  platform?: 'youtube' | 'instagram';

  avg_rating?: string | number;
  trending_score?: string | number;

  views?: number;
  likes_count?: number;
  comments_count?: number;

  genre?: {
    id?: string;
    name?: string;
  };

  user?: {
    id?: string | number;
    name?: string;
    user_name?: string;
    profile_photo_path?: string;
  };
};
type Props = {
  title?: string;
  description?: string;
  data?: VisionItem[];
};

export default function TopVisionXSection({
  title = 'Vision X',
  description = '',
  data = [],
}: Props) {
  const navigation = useNavigation<any>();

  const [imageErrors, setImageErrors] = useState<any>({});
  const [activeIndex, setActiveIndex] = useState(0);

  const getYoutubeId = (url?: string) => {
    if (!url) return null;

    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?v=))([^#&?]*).*/;

    const match = url.match(regExp);

    return match && match[7].length === 11 ? match[7] : null;
  };

  const renderItem = ({ item, index }: any) => {
    const youtubeId = getYoutubeId(item.link);

    const isYoutube = item.platform === 'youtube';
    const isInstagram = item.platform === 'instagram';

    return (
      <View style={styles.card}>
        {/* MEDIA */}
        <View style={styles.mediaContainer}>
          {isYoutube && youtubeId ? (
            <YoutubePlayer
              height={(CARD_WIDTH * 9) / 16}
              play={activeIndex === index}
              videoId={youtubeId}
              webViewStyle={{
                opacity: 0.99,
              }}
            />
          ) : isInstagram && item.link ? (
            <WebView
              source={{
                uri: item.link,
              }}
              style={styles.webview}
              javaScriptEnabled
              domStorageEnabled
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              scrollEnabled={false}
            />
          ) : (
            <FastImage
              source={
                imageErrors[item.id] || !item.image
                  ? require('../../../assets/images/fallback.png')
                  : {
                      uri: item.image,
                    }
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
          )}
        </View>

        {/* CONTENT */}
        <View style={styles.content}>
          <Text numberOfLines={2} style={styles.title}>
            {item.title}
          </Text>

          <Text numberOfLines={1} style={styles.story}>
            {item.story || item.synopsis}
          </Text>

          <View style={styles.userRow}>
            <Avatar
              uri={item.user?.profile_photo_path}
              name={item.user?.name}
              size={30}
            />

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text numberOfLines={1} style={styles.name}>
                {item.user?.name}
              </Text>

              {!!item.user?.user_name && (
                <Text numberOfLines={1} style={styles.username}>
                  @{item.user.user_name}
                </Text>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              navigation.navigate('VisionXDetails', {
                visionxId: item?.id,
              })
            }
          >
            <Text style={styles.buttonText}>View Vision</Text>

            <Ionicons name="arrow-forward" size={15} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!data.length) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <View style={styles.dot} />

          <Text style={styles.smallTitle}>VISION X</Text>

          <View style={styles.line} />
        </View>

        <Text style={styles.heading}>{title}</Text>

        {!!description && <Text style={styles.description}>{description}</Text>}
      </View>

      <FlatList
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ width: 18 }} />}
        contentContainerStyle={{
          paddingHorizontal: 20,
        }}
        onMomentumScrollEnd={e => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / (CARD_WIDTH + 18),
          );

          setActiveIndex(index);
        }}
      />
    </View>
  );
}
const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.65;

const styles = StyleSheet.create({
  container: {
    marginTop: 45,
    marginBottom: 25,
  },

  header: {
    paddingHorizontal: 20,
    marginBottom: 22,
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

  smallTitle: {
    color: '#E5E5E5',
    fontSize: 12,
    letterSpacing: 1.5,
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

  description: {
    color: '#999',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
    fontFamily: Fonts.Regular,
  },

  card: {
    width: CARD_WIDTH,
    backgroundColor: '#171717',
    borderRadius: 22,
    overflow: 'hidden',

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.05)',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },

  mediaContainer: {
    aspectRatio: 16 / 9,
    backgroundColor: '#111',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  webview: {
    flex: 1,
    backgroundColor: '#000',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  topRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: 'rgba(0,0,0,.6)',

    paddingHorizontal: 10,
    paddingVertical: 6,

    borderRadius: 18,
  },

  rating: {
    color: '#FFF',
    marginLeft: 5,
    fontSize: 12,
    fontFamily: Fonts.Bold,
  },

  content: {
    padding: 16,
  },

  title: {
    color: '#FFF',
    fontSize: 18,
    lineHeight: 26,
    fontFamily: Fonts.Bold,
  },

  story: {
    color: '#B5B5B5',
    fontSize: 13,
    lineHeight: 20,
    fontFamily: Fonts.Regular,
  },

  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,

    borderWidth: 2,
    borderColor: '#FFB400',
  },

  name: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: Fonts.Bold,
  },

  username: {
    color: '#999',
    fontSize: 11,
    marginTop: 2,
    fontFamily: Fonts.Regular,
  },

  stats: {
    marginTop: 18,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statText: {
    color: '#AFAFAF',
    fontSize: 12,
    marginLeft: 5,
    fontFamily: Fonts.Medium,
  },

  scoreText: {
    color: '#FFB400',
    marginLeft: 5,
    fontSize: 12,
    fontFamily: Fonts.Bold,
  },

  button: {
    marginTop: 14,
    backgroundColor: '#FFB400',
    height: 32,
    borderRadius: 21,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonText: {
    color: '#000',
    fontSize: 13,
    fontFamily: Fonts.Bold,
    marginRight: 6,
  },
});
