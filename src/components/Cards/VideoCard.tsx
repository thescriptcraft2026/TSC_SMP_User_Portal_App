import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View, TouchableOpacity } from 'react-native';
import Video from 'react-native-video';
import Ionicons from '@react-native-vector-icons/ionicons';
import FastImage from 'react-native-fast-image';

const VideoCard = ({ item, isActive }: any) => {
  const [play, setPlay] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    let t: any;

    if (isActive) {
      setMuted(true); // default mute
      t = setTimeout(() => setPlay(true), 2000);
    } else {
      setPlay(false);
      setMuted(true);
    }

    return () => t && clearTimeout(t);
  }, [isActive]);

  if (!item.video) {
    return <Image source={{ uri: item.poster }} style={styles.media} />;
  }

  return (
    <View style={styles.container}>
      {play ? (
        <Video
          source={{ uri: item.video }}
          style={styles.media}
          resizeMode="cover"
          paused={!play}
          repeat
          muted={muted}
          ignoreSilentSwitch="ignore"
        />
      ) : (
        <>
          <FastImage
            style={styles.media}
            source={{
              uri: item.poster,
              priority: FastImage.priority.normal,
            }}
            resizeMode={FastImage.resizeMode.cover}
          />

          {!isActive && (
            <View
              pointerEvents="none"
              style={[
                styles.media,
                {
                  position: 'absolute',
                  backgroundColor: 'rgba(0,0,0,0.50)',
                },
              ]}
            />
          )}
        </>
      )}

      {/* ▶️ PLAY / PAUSE CENTER */}
      {/* {isActive && (
        <TouchableOpacity
          style={styles.centerBtn}
          onPress={() => setPlay(p => !p)}
          activeOpacity={0.8}
        >
          <Ionicons name={play ? 'pause' : 'play'} size={25} color="#fff" />
        </TouchableOpacity>
      )} */}

      {/* 🔊 MUTE BUTTON TOP RIGHT */}
      {isActive && play && (
        <TouchableOpacity
          style={styles.muteBtn}
          onPress={() => setMuted(m => !m)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={muted ? 'volume-mute' : 'volume-high'}
            size={15}
            color="#fff"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default VideoCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  media: {
    ...StyleSheet.absoluteFillObject,
  },

  centerBtn: {
    position: 'absolute',
    alignSelf: 'center',
    top: '45%',

    backgroundColor: 'rgba(0,0,0,0.45)',
    width: 30,
    height: 30,
    borderRadius: 30,

    alignItems: 'center',
    justifyContent: 'center',
  },

  muteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,

    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: 8,
    borderRadius: 20,
  },
});
