import React, { useRef, useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Text,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import FastImage from 'react-native-fast-image';
import Video from 'react-native-video';
import Ionicons from '@react-native-vector-icons/ionicons';

const { width, height } = Dimensions.get('window');

type Props = {
  visible: boolean;
  media: {
    type: 'image' | 'video';
    url: string;
  }[];
  initialIndex?: number;
  muted?: boolean;
  onClose: () => void;
};

export default function MediaFullscreenModal({
  visible,
  media = [],
  initialIndex = 0,
  muted = true,
  onClose,
}: Props) {
  const pagerRef = useRef<PagerView>(null);
  const [index, setIndex] = useState(initialIndex);

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent>
      {/* 🔥 FULLSCREEN STATUS BAR */}
      <StatusBar hidden translucent backgroundColor="transparent" />

      <View style={styles.container}>
        {/* CLOSE BUTTON */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>

        {/* CAROUSEL */}
        <PagerView
          ref={pagerRef}
          style={styles.pager}
          initialPage={initialIndex}
          onPageSelected={e => setIndex(e.nativeEvent.position)}
        >
          {media.map((item, i) => (
            <View key={i} style={styles.page}>
              {item.type === 'image' ? (
                <FastImage
                  source={{
                    uri: item.url,
                    priority: FastImage.priority.high,
                  }}
                  style={styles.media}
                  resizeMode={FastImage.resizeMode.contain} // 🔥 FULLSCREEN FIX
                />
              ) : (
                <Video
                  source={{ uri: item.url }}
                  style={styles.media}
                  resizeMode="cover" // 🔥 FULLSCREEN FIX
                  repeat
                  muted={muted}
                  controls
                />
              )}
            </View>
          ))}
        </PagerView>

        {/* COUNTER */}
        {media.length > 1 && (
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {index + 1}/{media.length}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  pager: {
    flex: 1,
  },

  page: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },

  media: {
    width,
    height,
  },

  closeBtn: {
    position: 'absolute',
    top: 40,
    right: 12,
    zIndex: 10,
  },

  counter: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  counterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
