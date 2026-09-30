import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import YoutubePlayer from 'react-native-youtube-iframe';
import { WebView } from 'react-native-webview';
import { useIsFocused } from '@react-navigation/native';

import { themeColors } from '../../theme/colors';
import { useToast } from '../Toast/ToastProvider';
import { getGoogleDrivePreviewUrl } from '../MediaViewer/mediaUtils';

type Platform =
  | 'youtube'
  | 'instagram'
  | 'facebook'
  | 'vimeo'
  | 'google-drive'
  | 'google-docs'
  | 'x'
  | 'image'
  | string;

type Props = {
  platform?: Platform;
  link?: string;
  image?: string;
  height?: number;
  onPress?: () => void;
  isVisible?: boolean;
  isScrolling?: boolean;
};

// Platform-specific configurations
const PLATFORM_CONFIGS = {
  youtube: { height: 240, bgColor: '#000' },
  instagram: { height: 500, bgColor: '#000' },
  facebook: { height: 500, bgColor: '#000' },
  vimeo: { height: 300, bgColor: '#000' },
  'google-drive': { height: 450, bgColor: '#000' },
  'google-docs': { height: 420, bgColor: '#fff' },
  x: { height: 500, bgColor: '#000' },
  image: { height: 450, bgColor: '#111' },
  default: { height: 300, bgColor: '#111' },
} as const;

const EmbeddedMedia = ({
  platform = 'image',
  link,
  image,
  height = 240,
  onPress,
  isVisible = true,
  isScrolling = false,
}: Props) => {
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const isFocused = useIsFocused();
  const youtubePlayerRef = useRef<any>(null);
  const { show } = useToast();

  const mediaIsVisible = isFocused && isVisible;

  /**
   * Track when media becomes visible for the first time
   */
  useEffect(() => {
    if (mediaIsVisible && !isScrolling) {
      setHasBeenVisible(true);
    }
  }, [mediaIsVisible, isScrolling]);



  /**
   * Normalize and validate platform
   */
  const normalizedPlatform = useMemo(() => {
    if (!platform) return 'image';
    return platform.toLowerCase().trim();
  }, [platform]);

  /**
 * Reset state when media changes
 */
  useEffect(() => {
    setLoading(true);
    setIsPlaying(false);
    setHasBeenVisible(false);
  }, [normalizedPlatform, link, image]);

  /**
   * Extract YouTube ID from URL
   */
  const youtubeId = useMemo(() => {
    if (!link) return null;

    try {
      const url = new URL(link);

      // Handle youtu.be/VIDEO_ID
      if (url.hostname.includes('youtu.be')) {
        return url.pathname.replace('/', '').split('/')[0] || null;
      }

      // Handle youtube.com/watch?v=VIDEO_ID
      const watchId = url.searchParams.get('v');
      if (watchId) return watchId;

      // Handle youtube.com/embed/VIDEO_ID
      const embedMatch = url.pathname.match(/embed\/([^/]+)/);
      if (embedMatch?.[1]) return embedMatch[1];

      // Handle youtube.com/shorts/VIDEO_ID
      const shortsMatch = url.pathname.match(/shorts\/([^/]+)/);
      if (shortsMatch?.[1]) return shortsMatch[1];

      return null;
    } catch {
      return null;
    }
  }, [link]);

  const isYoutubeContent = useMemo(() => {
    return normalizedPlatform === 'youtube' || !!youtubeId;
  }, [normalizedPlatform, youtubeId]);

  /**
   * Generate embed URLs for various platforms
   */
  const embedUrls = useMemo(() => {
    if (!link) return {};

    try {
      const url = new URL(link);

      // Instagram
      if (normalizedPlatform === 'instagram') {
        const match = url.pathname.match(/\/(p|reel|reels|tv)\/([^/]+)/);
        if (match?.[2]) {
          return {
            instagram: `https://www.instagram.com/${match[1]}/${match[2]}/embed`,
          };
        }
      }

      // Vimeo
      if (normalizedPlatform === 'vimeo') {
        if (url.hostname.includes('player.vimeo.com')) {
          return { vimeo: link };
        }
        const match = url.pathname.match(/(?:video\/)?(\d+)/);
        if (match?.[1]) {
          return { vimeo: `https://player.vimeo.com/video/${match[1]}` };
        }
      }

      // Facebook
      if (normalizedPlatform === 'facebook') {
        return {
          facebook: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
            link
          )}&show_text=false&width=560`,
        };
      }

      // Google Docs/Drive
      if (normalizedPlatform === 'google-docs' || normalizedPlatform === 'google-drive') {
        return { googleDocs: link };
      }

      return {};
    } catch {
      return {};
    }
  }, [link, normalizedPlatform]);

  /**
   * X/Twitter embed HTML
   */
  const xEmbedHtml = useMemo(() => {
    if (!link || normalizedPlatform !== 'x') return '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            html, body {
              margin: 0;
              padding: 0;
              background: #000;
              width: 100%;
              min-height: 100%;
            }
            .twitter-tweet {
              margin: 0 !important;
            }
          </style>
        </head>
        <body>
          <blockquote class="twitter-tweet" data-dnt="true">
            <a href="${link}"></a>
          </blockquote>
          <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
        </body>
      </html>
    `;
  }, [link, normalizedPlatform]);

  /**
   * Handle YouTube video control on scroll
   */
  useEffect(() => {
    if (!isYoutubeContent || !youtubePlayerRef.current) return;

    const shouldStop = !isVisible || isScrolling || !mediaIsVisible;

    if (shouldStop && isPlaying) {
      console.log('[EmbeddedMedia] Stopping YouTube video');

      try {
        // Stop video with multiple methods for reliability
        youtubePlayerRef.current.stopVideo();
        youtubePlayerRef.current.pauseVideo();
        setIsPlaying(false);
      } catch (error) {
        console.log('[EmbeddedMedia] Error stopping video:', error);
      }
    }
  }, [isVisible, isScrolling, mediaIsVisible, isYoutubeContent, isPlaying]);

  /**
   * Get media height based on platform
   */
  const getMediaHeight = useCallback(() => {
    const config = PLATFORM_CONFIGS[normalizedPlatform as keyof typeof PLATFORM_CONFIGS];
    return config?.height || height || PLATFORM_CONFIGS.default.height;
  }, [normalizedPlatform, height]);

  /**
   * Render generic WebView
   */
  const renderWebView = useCallback(
    (source: any, options?: { backgroundColor?: string; injectedJavaScript?: string }) => {
      return (
        <WebView
          source={source}
          style={[
            styles.webView,
            { backgroundColor: options?.backgroundColor || '#000' },
          ]}
          javaScriptEnabled
          domStorageEnabled
          thirdPartyCookiesEnabled
          sharedCookiesEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          allowsFullscreenVideo
          mixedContentMode="always"
          scrollEnabled={false}
          nestedScrollEnabled
          startInLoadingState={false}
          setSupportMultipleWindows={false}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={(error) => {
            console.log(`[EmbeddedMedia] WebView error:`, error.nativeEvent);
            setLoading(false);
          }}
          onHttpError={(error) => {
            console.log(`[EmbeddedMedia] HTTP error:`, error.nativeEvent);
          }}
          injectedJavaScript={options?.injectedJavaScript}
        />
      );
    },
    []
  );

  /**
   * Check if media should be rendered
   * Only render when visible or has been visible before (for smooth transitions)
   */
  const shouldRenderMedia = mediaIsVisible || hasBeenVisible;

  const mediaHeight = getMediaHeight();

  return (
    <TouchableOpacity
      activeOpacity={1}
      disabled={!onPress}
      onPress={onPress}
    >
      <View style={[styles.container, { height: mediaHeight }]}>
        {/* ==================================================== */}
        {/* YOUTUBE PLAYER - Only render when visible */}
        {/* ==================================================== */}
        {shouldRenderMedia && isYoutubeContent && youtubeId ? (
          <YoutubePlayer
            key={youtubeId}
            ref={youtubePlayerRef}
            height={mediaHeight}
            play={mediaIsVisible && !isScrolling && isPlaying}
            videoId={youtubeId}
            forceAndroidAutoplay={false}
            onReady={() => {
              console.log('[EmbeddedMedia] YouTube ready:', youtubeId);
              setLoading(false);
            }}
            onError={(error: any) => {
              console.log('[EmbeddedMedia] YouTube error:', error);
              setLoading(false);
              show({
                type: 'error',
                title: typeof error === 'string' ? error : 'Unable to play YouTube video',
              });
            }}
            initialPlayerParams={{
              controls: true,
              modestbranding: true,
              rel: false,
              playsinline: true,
            }}
            webViewStyle={styles.youtubeWebView}
            webViewProps={{
              nestedScrollEnabled: true,
              mediaPlaybackRequiresUserAction: true,
              allowsFullscreenVideo: true,
              mixedContentMode: 'always',
            }}
            onChangeState={(state: any) => {
              console.log('[EmbeddedMedia] YouTube state:', state);

              if (state === 'playing') {
                setIsPlaying(true);
              } else if (state === 'paused' || state === 'ended') {
                setIsPlaying(false);
              }
            }}
          />
        ) : isYoutubeContent ? (
          // Placeholder while not visible
          <View style={[styles.placeholder, { height: mediaHeight }]}>
            <ActivityIndicator size="small" color={themeColors.primary} />
          </View>
        ) : null}

        {/* ==================================================== */}
        {/* INSTAGRAM - Only render when visible */}
        {/* ==================================================== */}
        {shouldRenderMedia &&
          normalizedPlatform === 'instagram' &&
          embedUrls.instagram &&
          mediaIsVisible &&
          renderWebView({ uri: embedUrls.instagram }, { backgroundColor: '#000' })}

        {/* ==================================================== */}
        {/* FACEBOOK - Only render when visible */}
        {/* ==================================================== */}
        {shouldRenderMedia &&
          normalizedPlatform === 'facebook' &&
          embedUrls.facebook &&
          mediaIsVisible &&
          renderWebView({ uri: embedUrls.facebook }, { backgroundColor: '#000' })}

        {/* ==================================================== */}
        {/* VIMEO - Only render when visible */}
        {/* ==================================================== */}
        {shouldRenderMedia &&
          normalizedPlatform === 'vimeo' &&
          embedUrls.vimeo &&
          mediaIsVisible &&
          renderWebView({ uri: embedUrls.vimeo }, { backgroundColor: '#000' })}

        {/* ==================================================== */}
        {/* GOOGLE DRIVE - Only render when visible */}
        {/* ==================================================== */}
        {shouldRenderMedia &&
          normalizedPlatform === 'google-drive' &&
          link &&
          mediaIsVisible && (
            <WebView
              source={{ uri: getGoogleDrivePreviewUrl(link) }}
              style={styles.webView}
              javaScriptEnabled
              domStorageEnabled
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              scrollEnabled={false}
              startInLoadingState
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
              onError={(error) => {
                console.log('[EmbeddedMedia] Google Drive error:', error.nativeEvent);
                setLoading(false);
              }}
            />
          )}

        {/* ==================================================== */}
        {/* GOOGLE DOCS - Only render when visible */}
        {/* ==================================================== */}
        {shouldRenderMedia &&
          normalizedPlatform === 'google-docs' &&
          embedUrls.googleDocs &&
          mediaIsVisible &&
          renderWebView(
            { uri: embedUrls.googleDocs },
            { backgroundColor: '#fff' }
          )}

        {/* ==================================================== */}
        {/* X / TWITTER - Only render when visible */}
        {/* ==================================================== */}
        {shouldRenderMedia &&
          normalizedPlatform === 'x' &&
          link &&
          mediaIsVisible &&
          renderWebView(
            { html: xEmbedHtml, baseUrl: 'https://x.com' },
            { backgroundColor: '#000' }
          )}

        {/* ==================================================== */}
        {/* IMAGE FALLBACK - Always render images */}
        {/* ==================================================== */}
        {!isYoutubeContent &&
          normalizedPlatform !== 'instagram' &&
          normalizedPlatform !== 'facebook' &&
          normalizedPlatform !== 'vimeo' &&
          normalizedPlatform !== 'google-drive' &&
          normalizedPlatform !== 'google-docs' &&
          normalizedPlatform !== 'x' && (
            <FastImage
              source={{ uri: image || link }}
              style={[styles.image, { height: mediaHeight, opacity: loading ? 0 : 1 }]}
              resizeMode={FastImage.resizeMode.cover}
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
              onError={() => setLoading(false)}
            />
          )}

        {/* ==================================================== */}
        {/* LOADING INDICATOR */}
        {/* ==================================================== */}
        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="small" color={themeColors.primary} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(EmbeddedMedia);

/* ============================================================ */
/* STYLES */
/* ============================================================ */

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#111',
    overflow: 'hidden',
  },

  webView: {
    flex: 1,
    width: '100%',
    backgroundColor: '#000',
  },

  youtubeWebView: {
    opacity: 0.99,
  },

  image: {
    width: '100%',
    backgroundColor: '#111',
  },

  placeholder: {
    width: '100%',
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
    zIndex: 10,
  },
});