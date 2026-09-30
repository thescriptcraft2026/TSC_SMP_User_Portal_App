import React, { memo, useState } from 'react';
import {
  ActivityIndicator,
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  Linking,
} from 'react-native';

import FastImage from 'react-native-fast-image';
import Video from 'react-native-video';
import YoutubePlayer from 'react-native-youtube-iframe';
import { WebView } from 'react-native-webview';

import { themeColors } from '../../theme/colors';

import {
  getFacebookEmbedUrl,
  getGoogleDocsEmbedUrl,
  getGoogleDrivePreviewUrl,
  getInstagramEmbedUrl,
  getTwitterEmbedUrl,
  getVimeoEmbedUrl,
  getYoutubeId,
  isFacebookUrl,
  isGoogleDocsUrl,
  isGoogleDriveUrl,
  isInstagramUrl,
  isTwitterUrl,
  isVimeoUrl,
  isYoutubeUrl,
} from './mediaUtils';

type Props = {
  url?: string;
  height?: number;
};

const MediaViewer = ({ url, height = 220 }: Props) => {
  const [paused, setPaused] = useState(true);
  const [loading, setLoading] = useState(true);

  if (!url) {
    return null;
  }

  const isImageUrl = (uri: string) =>
    /\.(jpg|jpeg|png|gif|bmp|webp|svg|avif)$/i.test(
      uri.split('?')[0],
    );

  const isHttpUrl = /^https?:\/\//i.test(url);

  // ------------------------
  // IMAGE
  // ------------------------

  if (isImageUrl(url)) {
    return (
      <View style={[styles.container, { height: 450 }]}>
        <FastImage
          source={{ uri: url }}
          style={styles.image}
          resizeMode={FastImage.resizeMode.cover}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
        />

        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator
              size="large"
              color={themeColors.primary}
            />
          </View>
        )}
      </View>
    );
  }

  // ------------------------
  // YOUTUBE
  // ------------------------

  if (isYoutubeUrl(url)) {
    return (
      <View style={[styles.container, { height }]}>
        <YoutubePlayer
          height={height}
          play={!paused}
          videoId={getYoutubeId(url) || ''}
          onReady={() => setLoading(false)}
        />

        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator
              size="large"
              color={themeColors.primary}
            />
          </View>
        )}
      </View>
    );
  }

  // ------------------------
  // WEBVIEW URLS
  // ------------------------

  let webUrl: string | null = null;
  let webHeight = 500;

  if (isInstagramUrl(url)) {
    webUrl = getInstagramEmbedUrl(url);
  } else if (isFacebookUrl(url)) {
    webUrl = getFacebookEmbedUrl(url);
  } else if (isGoogleDriveUrl(url)) {
    webUrl = getGoogleDrivePreviewUrl(url);
  } else if (isGoogleDocsUrl(url)) {
    webUrl = getGoogleDocsEmbedUrl(url);
    webHeight = 420;
  } else if (isVimeoUrl(url)) {
    webUrl = getVimeoEmbedUrl(url);
    webHeight = height;
  }

  if (webUrl) {
    return (
      <WebView
        source={{ uri: webUrl }}
        style={{
          height: webHeight,
          borderRadius: 12,
        }}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loader}>
            <ActivityIndicator
              size="large"
              color={themeColors.primary}
            />
          </View>
        )}
      />
    );
  }

  // ------------------------
  // TWITTER / X
  // ------------------------

  if (isTwitterUrl(url)) {
    let host = 'x.com';

    try {
      host = new URL(url).hostname.replace('www.', '');
    } catch { }

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.linkCard}
        onPress={() => Linking.openURL(url)}
      >
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>𝕏</Text>
        </View>

        <View style={styles.linkContent}>
          <Text style={styles.linkTitle}>
            View post on X
          </Text>

          <Text style={styles.linkDomain}>
            {host}
          </Text>

          <Text
            numberOfLines={1}
            style={styles.linkUrl}
          >
            {url}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  // ------------------------
  // GENERIC WEBSITE
  // ------------------------

  if (isHttpUrl) {
    let host = '';

    try {
      host = new URL(url).hostname.replace('www.', '');
    } catch { }

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.linkCard}
        onPress={() => Linking.openURL(url)}
      >
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>🌐</Text>
        </View>

        <View style={styles.linkContent}>
          <Text
            numberOfLines={1}
            style={styles.linkTitle}
          >
            {host}
          </Text>

          <Text
            numberOfLines={1}
            style={styles.linkUrl}
          >
            {url}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  // ------------------------
  // VIDEO
  // ------------------------

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.videoWrapper, { height }]}
      onPress={() => setPaused(!paused)}
    >
      <Video
        source={{ uri: url }}
        style={styles.video}
        paused={paused}
        resizeMode="cover"
        repeat
        onLoad={() => setLoading(false)}
        onLoadStart={() => setLoading(true)}
        onBuffer={({ isBuffering }) =>
          setLoading(isBuffering)
        }
      />

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator
            size="large"
            color={themeColors.primary}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default memo(MediaViewer);

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  videoWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },

  video: {
    ...StyleSheet.absoluteFillObject,
  },

  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },

  // -------------------------
  // Link Preview Card
  // -------------------------

  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2E3A47',

    backgroundColor: '#0E1116',

    padding: 16,
    minHeight: 90,
  },

  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 10,

    backgroundColor: '#1B222C',

    justifyContent: 'center',
    alignItems: 'center',

    marginRight: 14,
  },

  iconText: {
    fontSize: 24,
    color:themeColors.white
  },

  linkContent: {
    flex: 1,
  },

  linkTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },

  linkDomain: {
    color: '#A0A7B4',
    marginTop: 2,
    fontSize: 13,
  },

  linkUrl: {
    color: '#6EA8FF',
    marginTop: 4,
    fontSize: 13,
  },
});