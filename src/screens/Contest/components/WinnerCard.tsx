import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Fonts } from '../../../constants/Fonts';

interface WinnerCardProps {
  name: string;
  tagline?: any;
  avatar: string;
}

const WinnerCard = ({ name, tagline, avatar }: WinnerCardProps) => {
  const [imageError, setImageError] = React.useState(false);
  const hasValidAvatar =
    typeof avatar === 'string' &&
    avatar.trim() !== '' &&
    avatar.trim().toLowerCase() !== 'null' &&
    avatar.trim().toLowerCase() !== 'undefined';

  return (
    <ImageBackground
      source={require('../../../assets/images/2834.jpg')}
      style={styles.container}
      imageStyle={styles.bgImage}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.avatarWrapper}>
            <FastImage
              source={require('../../../assets/images/circle-stars.png')}
              style={styles.winnerFrame}
              resizeMode={FastImage.resizeMode.contain}
            />

            <FastImage
              source={
                hasValidAvatar && !imageError
                  ? { uri: avatar }
                  : require('../../../assets/images/default-profile.jpg')
              }
              style={styles.avatar}
              resizeMode={FastImage.resizeMode.cover}
              onError={() => setImageError(true)}
            />
          </View>

          <FastImage
            source={require('../../../assets/images/winner2.png')}
            style={styles.winnerRibbon}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>

        <View style={styles.nameContainer}>
          <Text style={styles.name}>{name}</Text>

          {!!tagline && <Text style={styles.tagline}>{tagline}</Text>}
        </View>
      </View>
    </ImageBackground>
  );
};

export default WinnerCard;

const styles = StyleSheet.create({
  container: {
    // marginVertical: 20,
    borderRadius: 20,
    overflow: 'hidden', // 🔥 important for rounded bg
    height: 162,
  },

  bgImage: {
    borderRadius: 20,
  },

  /* 🔥 DARK OVERLAY */
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.5)', // 👈 adjust 0.4–0.7
    borderRadius: 20,
  },

  card: {
    alignItems: 'center',
    paddingBottom: 10,
  },

  avatarWrapper: {
    width: 190,
    height: 190,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  winnerFrame: {
    position: 'absolute',
    width: 100,
    height: 100,
    top: 5,
    left: 45,
  },

  winnerRibbon: {
    width: '100%',
    height: 60,
    position: 'absolute',
    bottom: 75,
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 100,
    marginTop: -80,
  },

  nameContainer: {
    alignItems: 'center',
    marginTop: -90,
  },

  name: {
    fontSize: 21,
    color: '#FFD700',
    fontFamily: Fonts.Bold,
    letterSpacing: 1,

    // ✨ glow effect
    textShadowColor: 'rgba(255, 215, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },

  tagline: {
    fontSize: 13,
    color: '#ccc',
    letterSpacing: 0.5,
    fontFamily: Fonts.Medium,
  },
});
