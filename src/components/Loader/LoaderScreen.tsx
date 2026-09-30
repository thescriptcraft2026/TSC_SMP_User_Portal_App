import LottieView from 'lottie-react-native';
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

const LoaderScreen = () => {
  return (
    <View
      style={{
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 50,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <LottieView
        source={require('../../assets/Animation/loader.json')}
        autoPlay
        loop
        style={{
          width: Platform.OS === 'ios' ? 400 : 400,
          height: Platform.OS === 'ios' ? 250 : 400,
        }}
      />
    </View>
  );
};

export default LoaderScreen;

const styles = StyleSheet.create({});
