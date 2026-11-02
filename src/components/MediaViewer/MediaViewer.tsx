import React, { memo, useEffect, useState } from 'react';
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
  isInstagramPostUrl,
  isInstagramUrl,
  isTwitterUrl,
  isVideoUrl,
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

  const trimmed = url.trim();
  const normalizedUrl =
    trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;

  // Reset loading and add safety timeout to prevent infinite spinners
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, [normalizedUrl]);

  const isImageUrl = (uri: string) =>
    /\.(jpg|jpeg|png|gif|bmp|webp|svg|avif)$/i.test(uri.split('?')[0]);

  // ------------------------
  // IMAGE
  // ------------------------
  if (isImageUrl(normalizedUrl)) {
    return (
      <View style={[styles.container, { height: 450 }]}>
        <FastImage
          source={{ uri: normalizedUrl }}
          style={styles.image}
          resizeMode={FastImage.resizeMode.cover}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => setLoading(false)}
        />

        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={themeColors.primary} />
          </View>
        )}
      </View>
    );
  }

  // ------------------------
  // YOUTUBE
  // ------------------------
  if (isYoutubeUrl(normalizedUrl)) {
    const videoId = getYoutubeId(normalizedUrl);

    if (videoId) {
      return (
        <View style={[styles.container, { height }]}>
          <YoutubePlayer
            height={height}
            play={!paused}
            videoId={videoId}
            onReady={() => setLoading(false)}
            onError={() => setLoading(false)}
          />

          {loading && (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={themeColors.primary} />
            </View>
          )}
        </View>
      );
    }

    // Fallback if no specific videoId (e.g. channel URL or generic youtube.com)
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.linkCard}
        onPress={() => Linking.openURL(normalizedUrl)}
      >
        <View style={styles.iconBox}>
          <Text style={[styles.iconText, { color: '#ff0000' }]}>▶</Text>
        </View>

        <View style={styles.linkContent}>
          <Text style={styles.linkTitle}>View on YouTube</Text>
          <Text style={styles.linkDomain}>youtube.com</Text>
          <Text numberOfLines={1} style={styles.linkUrl}>
            {normalizedUrl}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  // ------------------------
  // INSTAGRAM
  // ------------------------
  if (isInstagramUrl(normalizedUrl)) {
    if (isInstagramPostUrl(normalizedUrl)) {
      const webUrl = getInstagramEmbedUrl(normalizedUrl);
      return (
        <View style={{ height: 500, borderRadius: 12, overflow: 'hidden' }}>
          <WebView
            source={{ uri: webUrl }}
            style={{ height: 500, borderRadius: 12 }}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            startInLoadingState
            onLoadEnd={() => setLoading(false)}
            onError={() => setLoading(false)}
            renderLoading={() => (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color={themeColors.primary} />
              </View>
            )}
          />
        </View>
      );
    }

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.linkCard}
        onPress={() => Linking.openURL(normalizedUrl)}
      >
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>📸</Text>
        </View>

        <View style={styles.linkContent}>
          <Text style={styles.linkTitle}>View on Instagram</Text>
          <Text style={styles.linkDomain}>instagram.com</Text>
          <Text numberOfLines={1} style={styles.linkUrl}>
            {normalizedUrl}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  // ------------------------
  // WEBVIEW URLS (Facebook, Google Drive, Docs, Vimeo)
  // ------------------------
  let webUrl: string | null = null;
  let webHeight = 500;

  if (isFacebookUrl(normalizedUrl)) {
    webUrl = getFacebookEmbedUrl(normalizedUrl);
  } else if (isGoogleDriveUrl(normalizedUrl)) {
    webUrl = getGoogleDrivePreviewUrl(normalizedUrl);
  } else if (isGoogleDocsUrl(normalizedUrl)) {
    webUrl = getGoogleDocsEmbedUrl(normalizedUrl);
    webHeight = 420;
  } else if (isVimeoUrl(normalizedUrl)) {
    webUrl = getVimeoEmbedUrl(normalizedUrl);
    webHeight = height;
  }

  if (webUrl) {
    return (
      <View style={{ height: webHeight, borderRadius: 12, overflow: 'hidden' }}>
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
          onLoadEnd={() => setLoading(false)}
          onError={() => setLoading(false)}
          renderLoading={() => (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={themeColors.primary} />
            </View>
          )}
        />
      </View>
    );
  }

  // ------------------------
  // TWITTER / X
  // ------------------------
  if (isTwitterUrl(normalizedUrl)) {
    let host = 'x.com';
    try {
      host = new URL(normalizedUrl).hostname.replace('www.', '');
    } catch {}

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.linkCard}
        onPress={() => Linking.openURL(normalizedUrl)}
      >
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>𝕏</Text>
        </View>

        <View style={styles.linkContent}>
          <Text style={styles.linkTitle}>View post on X</Text>
          <Text style={styles.linkDomain}>{host}</Text>
          <Text numberOfLines={1} style={styles.linkUrl}>
            {normalizedUrl}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  // ------------------------
  // DIRECT VIDEO FILES (.mp4, .mov, .m4v, .m3u8, etc.)
  // ------------------------
  if (isVideoUrl(normalizedUrl)) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.videoWrapper, { height }]}
        onPress={() => setPaused(!paused)}
      >
        <Video
          source={{ uri: normalizedUrl }}
          style={styles.video}
          paused={paused}
          resizeMode="cover"
          repeat
          onLoad={() => setLoading(false)}
          onLoadStart={() => setLoading(true)}
          onError={() => setLoading(false)}
          onBuffer={({ isBuffering }) => setLoading(isBuffering)}
        />

        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={themeColors.primary} />
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // ------------------------
  // GENERIC WEBSITE / CONTENT LINK CARD
  // ------------------------
  let host = '';
  try {
    host = new URL(normalizedUrl).hostname.replace('www.', '');
  } catch {
    host = normalizedUrl;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.linkCard}
      onPress={() => Linking.openURL(normalizedUrl)}
    >
      <View style={styles.iconBox}>
        <Text style={styles.iconText}>🌐</Text>
      </View>

      <View style={styles.linkContent}>
        <Text numberOfLines={1} style={styles.linkTitle}>
          {host}
        </Text>
        <Text numberOfLines={1} style={styles.linkUrl}>
          {normalizedUrl}
        </Text>
      </View>
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
    color: themeColors.white,
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
