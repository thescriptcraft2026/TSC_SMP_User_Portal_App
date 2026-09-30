import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Fonts } from '../../../constants/Fonts';

const { width } = Dimensions.get('window');

const CommunitySection = () => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../assets/images/scroll-image.webp')}
        resizeMode="cover"
        imageStyle={styles.image}
        style={styles.banner}
      >
        {/* Overlay */}
        <View style={styles.overlay} />

        {/* Content */}
        <View style={styles.content}>

          <Text style={styles.orangeText}>
            Join Our
          </Text>
          <Text style={styles.title}>
            #CreativeCommunity!
          </Text>

          <Text style={styles.description}>
            The Script Craft is a secure, collaborative platform for Script
            Writers, Producers and Directors, enabling synopsis storage,
            management and networking while ensuring privacy and security.
          </Text>

        </View>

      </ImageBackground>
    </View>
  );
};

export default CommunitySection;

const styles = StyleSheet.create({
  container: {
    // paddingHorizontal: 20,
    // paddingBottom: 10,
    backgroundColor: '#0F0F0F',
  },

  banner: {
    width: '100%',
    height: 360,
    justifyContent: 'center',
  },

  image: {
    borderRadius: 0,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 0,
  },

  content: {
    // width: '60%',
    paddingHorizontal: 35,
  },

  orangeText: {
    fontSize: 30,
    fontFamily:Fonts.Bold,
    color: '#F4A100',
  },

  title: {
    fontSize: 30,
      fontFamily:Fonts.Black,
    color: '#fff',
  },

  description: {
    color: '#F2F2F2',
    fontSize: 18,
    fontFamily:Fonts.Regular,
  },
});