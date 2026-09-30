import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import YoutubePlayer from 'react-native-youtube-iframe';

import { Fonts } from '../../../constants/Fonts';

const { width } = Dimensions.get('window');

const CARD_MARGIN = 12;
const CARD_WIDTH = (width - CARD_MARGIN * 3) / 2;

interface TutorialCardProps {
  title: string;
  youtubeId: string;
  onPress?: () => void;
}

const TutorialCard = ({ title, youtubeId, onPress }: TutorialCardProps) => {
  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={onPress}>
      {/* YOUTUBE IFRAME */}
      <View style={styles.videoContainer}>
        <YoutubePlayer
          height={110}
          play={false}
          videoId={youtubeId}
          initialPlayerParams={{
            controls: false,
            modestbranding: true,
            rel: false,
            showClosedCaptions: false,
          }}
          webViewStyle={{
            opacity: 0.99,
            backgroundColor: 'transparent',
          }}
        />

        {/* CLICK OVERLAY */}
        <TouchableOpacity
          activeOpacity={1}
          style={styles.touchOverlay}
          onPress={onPress}
        />
      </View>

      {/* CONTENT */}
      <View style={styles.footer}>
        <Text numberOfLines={2} style={styles.title}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default TutorialCard;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#0B0B12',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginBottom: 14,
  },

  videoContainer: {
    width: '100%',
    height: 110,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },

  touchOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },

  footer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },

  title: {
    color: '#fff',
    fontSize: 15,
    fontFamily: Fonts.Bold,
    lineHeight: 22,
  },
});
