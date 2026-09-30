import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import FastImage from 'react-native-fast-image';
import Video from 'react-native-video';
import YoutubePlayer from 'react-native-youtube-iframe';
import { WebView } from 'react-native-webview';

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
} from '../../../components/MediaViewer/mediaUtils';

import { themeColors } from '../../../theme/colors';

type Props = {
    url?: string;
    type?: string;

    /**
     * Whether this card is currently the active/visible card.
     */
    isActive?: boolean;

    /**
     * Whether the parent FlatList/FlashList is currently scrolling.
     */
    isScrolling?: boolean;

    /**
     * Whether at least 50% of the media is visible.
     */
    mediaVisible?: boolean;
};

const VisionMediaViewer = ({
    url,
    type,
    isActive = false,
    isScrolling = false,
    mediaVisible = true,
}: Props) => {
    const [loading, setLoading] = useState(true);
    const shouldRenderMedia = mediaVisible;
    const shouldPlayMedia =
        isActive &&
        mediaVisible &&
        !isScrolling;



    useEffect(() => {
        setLoading(true);
    }, [url, type]);

    if (!url) {
        return null;
    }

    /**
     * ---------------------------------------------------------
     * HEIGHT
     * ---------------------------------------------------------
     */
    const getHeight = () => {
        switch (type) {
            case 'youtube':
                return 240;

            case 'instagram':
                return 600;

            case 'facebook':
                return 500;

            case 'vimeo':
                return 300;

            case 'google-drive':
                return 450;

            case 'google-docs':
                return 420;

            case 'x':
                return 110;

            case 'image':
                return 450;

            default:
                return 300;
        }
    };

    const mediaHeight = getHeight();

    /**
     * ---------------------------------------------------------
     * IMAGE
     * ---------------------------------------------------------
     */

    const isImageUrl = (uri: string) =>
        /\.(jpg|jpeg|png|gif|bmp|webp|svg|avif)$/i.test(
            uri.split('?')[0],
        );

    const isImageContent =
        type === 'image' || isImageUrl(url);

    if (isImageContent) {
        return (
            <View
                style={[
                    styles.container,
                    {
                        height: mediaHeight,
                    },
                ]}
            >
                <FastImage
                    source={{ uri: url }}
                    style={styles.image}
                    resizeMode={FastImage.resizeMode.cover}
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)}
                    onError={() => setLoading(false)}
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
    /**
     * ---------------------------------------------------------
     * YOUTUBE
     * ---------------------------------------------------------
     */

    const isYoutubeContent =
        type === 'youtube' ||
        isYoutubeUrl(url);

    if (isYoutubeContent) {
        const youtubeId = getYoutubeId(url);

        if (!youtubeId) {
            console.log(
                '[VisionMediaViewer] Invalid YouTube URL:',
                url,
            );

            return null;
        }

        /**
         * Active card + visible + not scrolling
         *
         * This will automatically play when the card becomes
         * active.
         *
         * When scrolling starts:
         *
         * isScrolling = true
         *        ↓
         * play = false
         *
         * When scrolling stops:
         *
         * isScrolling = false
         *        ↓
         * play = true
         */
        const youtubeShouldPlay =
            isActive &&
            shouldRenderMedia &&
            !isScrolling;

        return (
            <View
                style={[
                    styles.container,
                    {
                        height: mediaHeight,
                    },
                ]}
            >
                {shouldRenderMedia ? (
                    <YoutubePlayer
                        height={mediaHeight}
                        videoId={youtubeId}
                        play={youtubeShouldPlay}
                        mute={false}
                        forceAndroidAutoplay={true}
                        webViewProps={{
                            allowsInlineMediaPlayback: true,
                            mediaPlaybackRequiresUserAction: false,
                        }}
                        onReady={() => {
                            console.log(
                                '[VisionMediaViewer] YouTube ready:',
                                youtubeId,
                            );

                            setLoading(false);
                        }}
                        onError={(error: any) => {
                            console.log(
                                '[VisionMediaViewer] YouTube error:',
                                error,
                            );

                            setLoading(false);
                        }}
                        onChangeState={(state: any) => {
                            console.log(
                                '[VisionMediaViewer] YouTube state:',
                                state,
                            );

                            if (state === 'playing') {
                                setLoading(false);
                            }

                            if (
                                state === 'paused' ||
                                state === 'ended'
                            ) {
                                setLoading(false);
                            }
                        }}
                        initialPlayerParams={{
                            controls: true,
                            modestbranding: true,
                            rel: false,
                            playsinline: true,
                        }}
                    />
                ) : (
                    <FastImage
                        source={{
                            uri: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
                        }}
                        style={styles.image}
                        resizeMode={FastImage.resizeMode.cover}
                        onLoadStart={() => setLoading(true)}
                        onLoadEnd={() => setLoading(false)}
                        onError={() => setLoading(false)}
                    />
                )}

                {loading && shouldRenderMedia && (
                    <View
                        pointerEvents="none"
                        style={styles.loader}
                    >
                        <ActivityIndicator
                            size="large"
                            color={themeColors.primary}
                        />
                    </View>
                )}
            </View>
        );
    }


    /**
     * ---------------------------------------------------------
     * INSTAGRAM
     * ---------------------------------------------------------
     */

    if (isInstagramUrl(url)) {
        const instagramAutoContinueJS = `
        (function() {
            var attempts = 0;
            var maxAttempts = 40;

            function findAndClickContinue() {
                attempts++;

                var elements =
                    document.querySelectorAll(
                        'button, a, div, span'
                    );

                for (var i = 0; i < elements.length; i++) {
                    var element = elements[i];

                    var text = (
                        element.innerText ||
                        element.textContent ||
                        ''
                    )
                        .trim()
                        .toLowerCase();

                    if (
                        text === 'continue on web' ||
                        text === 'continue in browser' ||
                        text === 'continue on browser'
                    ) {
                        try {
                            element.click();

                            element.dispatchEvent(
                                new MouseEvent(
                                    'click',
                                    {
                                        bubbles: true,
                                        cancelable: true,
                                        view: window,
                                    }
                                )
                            );

                            return;
                        } catch (e) {
                            console.log(
                                'Instagram click error',
                                e
                            );
                        }
                    }
                }

                if (attempts < maxAttempts) {
                    setTimeout(
                        findAndClickContinue,
                        500
                    );
                }
            }

            setTimeout(
                findAndClickContinue,
                800
            );
        })();

        true;
    `;

        return (
            <View
                style={[
                    styles.container,
                    {
                        height: mediaHeight,
                    },
                ]}
            >
                {shouldRenderMedia ? (
                    <WebView
                        source={{
                            uri: getInstagramEmbedUrl(url),
                        }}
                        style={styles.webView}

                        javaScriptEnabled={true}
                        domStorageEnabled={true}

                        allowsInlineMediaPlayback={true}
                        mediaPlaybackRequiresUserAction={
                            false
                        }

                        scrollEnabled={false}

                        startInLoadingState={true}

                        injectedJavaScript={
                            instagramAutoContinueJS
                        }

                        onLoadStart={() => {
                            setLoading(true);
                        }}

                        onLoadEnd={() => {
                            setLoading(false);
                        }}

                        onError={error => {
                            console.log(
                                '[VisionMediaViewer] Instagram error:',
                                error.nativeEvent,
                            );

                            setLoading(false);
                        }}

                        onHttpError={error => {
                            console.log(
                                '[VisionMediaViewer] Instagram HTTP error:',
                                error.nativeEvent,
                            );
                        }}
                    />
                ) : (
                    <View
                        style={styles.inactiveMedia}
                    >
                        <Text
                            style={styles.inactiveText}
                        >
                            Instagram
                        </Text>
                    </View>
                )}

                {loading &&
                    shouldRenderMedia && (
                        <View
                            pointerEvents="none"
                            style={styles.loader}
                        >
                            <ActivityIndicator
                                size="large"
                                color={
                                    themeColors.primary
                                }
                            />
                        </View>
                    )}
            </View>
        );
    }
    /**
     * ---------------------------------------------------------
     * FACEBOOK
     * ---------------------------------------------------------
     */

    if (isFacebookUrl(url)) {
        return (
            <View
                style={[
                    styles.container,
                    {
                        height: mediaHeight,
                    },
                ]}
            >
                {shouldRenderMedia ? (
                    <WebView
                        source={{
                            uri: getFacebookEmbedUrl(url),
                        }}
                        style={styles.webView}
                        javaScriptEnabled
                        domStorageEnabled
                        allowsInlineMediaPlayback
                        mediaPlaybackRequiresUserAction={false}
                        scrollEnabled={false}
                        startInLoadingState
                        onLoadStart={() => setLoading(true)}
                        onLoadEnd={() => setLoading(false)}
                        onError={() => setLoading(false)}
                    />
                ) : (
                    <View style={styles.inactiveMedia}>
                        <Text style={styles.inactiveText}>
                            Facebook
                        </Text>
                    </View>
                )}

                {loading && shouldRenderMedia && (
                    <View
                        pointerEvents="none"
                        style={styles.loader}
                    >
                        <ActivityIndicator
                            size="large"
                            color={themeColors.primary}
                        />
                    </View>
                )}
            </View>
        );
    }

    /**
     * ---------------------------------------------------------
     * VIMEO
     * ---------------------------------------------------------
     */

    if (isVimeoUrl(url)) {
        return (
            <View
                style={[
                    styles.container,
                    {
                        height: mediaHeight,
                    },
                ]}
            >
                {shouldRenderMedia ? (
                    <WebView
                        source={{
                            uri: getVimeoEmbedUrl(url),
                        }}
                        style={styles.webView}
                        javaScriptEnabled
                        domStorageEnabled
                        allowsInlineMediaPlayback
                        mediaPlaybackRequiresUserAction={false}
                        scrollEnabled={false}
                        startInLoadingState
                        onLoadStart={() => setLoading(true)}
                        onLoadEnd={() => setLoading(false)}
                        onError={() => setLoading(false)}
                    />
                ) : (
                    <View style={styles.inactiveMedia}>
                        <Text style={styles.inactiveText}>
                            Vimeo
                        </Text>
                    </View>
                )}

                {loading && shouldRenderMedia && (
                    <View
                        pointerEvents="none"
                        style={styles.loader}
                    >
                        <ActivityIndicator
                            size="large"
                            color={themeColors.primary}
                        />
                    </View>
                )}
            </View>
        );
    }

    /**
     * ---------------------------------------------------------
     * GOOGLE DRIVE
     * ---------------------------------------------------------
     */

    if (isGoogleDriveUrl(url)) {
        return (
            <View
                style={[
                    styles.container,
                    {
                        height: mediaHeight,
                    },
                ]}
            >
                {shouldRenderMedia ? (
                    <WebView
                        source={{
                            uri: getGoogleDrivePreviewUrl(url),
                        }}
                        style={styles.webView}
                        javaScriptEnabled
                        domStorageEnabled
                        allowsInlineMediaPlayback
                        mediaPlaybackRequiresUserAction={false}
                        scrollEnabled={false}
                        startInLoadingState
                        onLoadStart={() => setLoading(true)}
                        onLoadEnd={() => setLoading(false)}
                        onError={() => setLoading(false)}
                    />
                ) : (
                    <View style={styles.inactiveMedia}>
                        <Text style={styles.inactiveText}>
                            Google Drive
                        </Text>
                    </View>
                )}

                {loading && shouldRenderMedia && (
                    <View
                        pointerEvents="none"
                        style={styles.loader}
                    >
                        <ActivityIndicator
                            size="large"
                            color={themeColors.primary}
                        />
                    </View>
                )}
            </View>
        );
    }

    /**
     * ---------------------------------------------------------
     * GOOGLE DOCS
     * ---------------------------------------------------------
     */

    if (isGoogleDocsUrl(url)) {
        return (
            <View
                style={[
                    styles.container,
                    {
                        height: mediaHeight,
                    },
                ]}
            >
                {shouldRenderMedia ? (
                    <WebView
                        source={{
                            uri: getGoogleDocsEmbedUrl(url),
                        }}
                        style={styles.webView}
                        javaScriptEnabled
                        domStorageEnabled
                        allowsInlineMediaPlayback
                        mediaPlaybackRequiresUserAction={false}
                        scrollEnabled={false}
                        startInLoadingState
                        onLoadStart={() => setLoading(true)}
                        onLoadEnd={() => setLoading(false)}
                        onError={() => setLoading(false)}
                    />
                ) : (
                    <View style={styles.inactiveMedia}>
                        <Text style={styles.inactiveText}>
                            Google Docs
                        </Text>
                    </View>
                )}

                {loading && shouldRenderMedia && (
                    <View
                        pointerEvents="none"
                        style={styles.loader}
                    >
                        <ActivityIndicator
                            size="large"
                            color={themeColors.primary}
                        />
                    </View>
                )}
            </View>
        );
    }

    /**
     * ---------------------------------------------------------
     * X / TWITTER
     * ---------------------------------------------------------
     */

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

    /**
     * ---------------------------------------------------------
     * GENERIC URL
     * ---------------------------------------------------------
     */

    if (/^https?:\/\//i.test(url)) {
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
                    <Text style={styles.linkTitle}>
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

    /**
     * ---------------------------------------------------------
     * DIRECT VIDEO
     * ---------------------------------------------------------
     */

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            style={[
                styles.container,
                {
                    height: mediaHeight,
                },
            ]}
            disabled={
                isScrolling ||
                !shouldRenderMedia
            }
        >
            {shouldRenderMedia ? (
                <Video
                    source={{
                        uri: url,
                    }}
                    style={styles.video}
                    paused={!shouldPlayMedia}
                    resizeMode="cover"
                    repeat={false}
                    controls
                    onLoadStart={() =>
                        setLoading(true)
                    }
                    onLoad={() =>
                        setLoading(false)
                    }
                    onBuffer={({
                        isBuffering,
                    }) =>
                        setLoading(
                            isBuffering,
                        )
                    }
                    onEnd={() => {
                        setLoading(false);
                    }}
                    onError={(
                        error,
                    ) => {
                        console.log(
                            '[VisionMediaViewer] Video error:',
                            error,
                        );

                        setLoading(false);
                    }}
                />
            ) : (
                <View style={styles.inactiveMedia} />
            )}

            {loading && shouldRenderMedia && (
                <View
                    pointerEvents="none"
                    style={styles.loader}
                >
                    <ActivityIndicator
                        size="large"
                        color={themeColors.primary}
                    />
                </View>
            )}
        </TouchableOpacity>
    );
};

export default React.memo(VisionMediaViewer);

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#000',
        // borderRadius: 16,
        overflow: 'hidden',
    },

    image: {
        width: '100%',
        height: '100%',
    },

    webView: {
        flex: 1,
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
        zIndex: 999,
    },

    inactiveMedia: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },

    inactiveText: {
        color: '#777',
        fontSize: 14,
    },

    linkCard: {
        width: '100%',
        minHeight: 100,
        flexDirection: 'row',
        alignItems: 'center',
        // borderRadius: 18,
        borderWidth: 1,
        // borderColor: '#2E3A47',
        // backgroundColor: '#0E1116',
        padding: 16,
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