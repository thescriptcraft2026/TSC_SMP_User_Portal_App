import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';

import FastImage from 'react-native-fast-image';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';

type Props = {
  url: string;
  username?: string;
  onPress?: () => void; // ✅ ADD THIS
};

const InstagramCard = ({ url, username = 'vision_user', onPress }: Props) => {
  const [error, setError] = useState(false);

  const type = useMemo(() => {
    if (url.includes('/reel/')) return 'reel';
    if (url.includes('/p/')) return 'post';
    return 'post';
  }, [url]);

  const postId = useMemo(() => {
    const match = url.match(/\/(reel|p)\/([^/?]+)/);
    return match ? match[2] : null;
  }, [url]);

  const thumbnail = postId
    ? `https://www.instagram.com/p/${postId}/media/?size=l`
    : null;

  const handleOpen = async () => {
    const appUrl = `instagram://media?id=${postId}`;

    const supported = await Linking.canOpenURL(appUrl);

    if (supported) {
      Linking.openURL(appUrl);
    } else {
      Linking.openURL(url);
    }
  };
  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress} // ✅ USE PROP
      style={[styles.container, { aspectRatio: type === 'reel' ? 10 / 16 : 1 }]}
    >
      {thumbnail && !error ? (
        <>
          {/* IMAGE */}
          <FastImage
            source={{ uri: thumbnail }}
            style={styles.thumbnail}
            resizeMode="cover"
            onError={() => setError(true)}
          />

          {/* TOP GRADIENT */}
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent']}
            style={styles.topGradient}
          />

          {/* BOTTOM GRADIENT */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            style={styles.bottomGradient}
          />

          {/* USER INFO */}
          <View style={styles.userRow}>
            <View style={styles.avatar} />
            <Text style={styles.username}>{username}</Text>
          </View>

          {/* TYPE BADGE */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {type === 'reel' ? 'Reel' : 'Post'}
            </Text>
          </View>

          {/* ▶ PLAY BUTTON (for reels) */}
          {type === 'reel' && (
            <View style={styles.playButton}>
              <Ionicons name="play" size={20} color="#fff" />
            </View>
          )}

          {/* BOTTOM CONTENT */}
          <View style={styles.bottomContent}>
            <Text style={styles.title} numberOfLines={2}>
              Watch this {type} on Instagram
            </Text>

            <View style={styles.cta}>
              <Ionicons name="logo-instagram" size={16} color="#fff" />
              <Text style={styles.ctaText}>Open</Text>
            </View>
          </View>
        </>
      ) : (
        <View style={styles.fallback}>
          <Ionicons name="logo-instagram" size={40} color="#E1306C" />
          <Text style={{ color: '#fff' }}>Open on Instagram</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default InstagramCard;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    borderRadius: 20,
    overflow: 'hidden',
    // height: 420,
    backgroundColor: '#000',
  },

  thumbnail: {
    width: '100%',
    height: '100%',
  },

  topGradient: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 100,
  },

  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '55%',
  },

  userRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    marginRight: 8,
  },

  username: {
    color: '#fff',
    fontWeight: '600',
  },

  badge: {
    position: 'absolute',
    top: 14,
    right: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },

  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  bottomContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },

  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  ctaText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
});
