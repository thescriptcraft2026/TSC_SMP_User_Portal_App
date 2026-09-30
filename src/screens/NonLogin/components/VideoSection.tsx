import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import YoutubePlayer from 'react-native-youtube-iframe';

const { width } = Dimensions.get('window');

const VideoSection = () => {
    const [playing, setPlaying] = useState(false);

    const onStateChange = useCallback((state: string) => {
        if (state === 'ended') {
            setPlaying(false);
        }
    }, []);

    return (
        <View style={styles.container}>
            {/* Local Video */}
            {/* <View style={styles.playerContainer}>
                <Video
                    source={require('../../../assets/videos/heroVideo.mp4')}
                    style={styles.video}
                    resizeMode="cover"
                    repeat
                    paused={false}
                    muted
                />
            </View> */}

            {/* YouTube Video */}
            <View style={[styles.playerContainer, { marginTop: 20 }]}>
                <YoutubePlayer
                    height={220}
                    width={width - 20}
                    play={playing}
                    videoId="njrXFp_X1s4"
                    onChangeState={onStateChange}
                    initialPlayerParams={{
                        autoplay: true,
                        controls: true,
                        modestbranding: true,
                        rel: false,
                        mute: true, // Recommended for autoplay
                    }}
                />
            </View>
        </View>
    );
};

export default VideoSection;

const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: '#0F0F0F',
        borderRadius: 20,
    },

    playerContainer: {
        overflow: 'hidden',
        borderRadius: 20,
        alignItems: 'center',
    },

    video: {
        width: '100%',
        height: 220,
        borderRadius: 20,
    },
});