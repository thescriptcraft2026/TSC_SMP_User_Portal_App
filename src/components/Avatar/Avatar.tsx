import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import FastImage from 'react-native-fast-image';

type Props = {
  uri?: any;
  name?: string;
  size?: number;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: () => void;
  borderShow?: boolean;
  onLoadingChange?: (isLoading: boolean) => void; // Add this
};

const FALLBACK_IMAGE = require('../../assets/images/default-profile.jpg');

const Avatar = ({
  uri,
  name = '',
  size = 40,
  onLoadStart,
  onLoadEnd,
  onError,
  borderShow = false,
  onLoadingChange,
}: Props) => {
  const [hasError, setHasError] = useState(false);

  const getInitials = () => {
    if (!name) return '?';

    const parts = name.trim().split(' ');

    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }

    return parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase();
  };

  const bgColor = 'rgba(255,255,255,0.12)';
  const textColor = '#fff';

  const handleLoadStart = () => {
    setHasError(false);
    onLoadStart?.();
  };

  const handleLoadEnd = () => {
    onLoadEnd?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };


  // If there's a URI but it failed to load, show initials as fallback
  if ((!uri || hasError) && name) {
    return (
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: themeColors.card,
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              color: textColor,
              fontSize: size * 0.4,
            },
          ]}
        >
          {getInitials()}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
        },
      ]}
    >
      {uri && !hasError ? (
        <>
          <FastImage
            source={typeof uri === 'string' ? { uri } : uri}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              opacity: 1,
              // borderRadius: 100,
              borderWidth: borderShow ? 3 : 0,
              borderColor: borderShow ? '#fff' : '#fff',
            }}
            resizeMode={FastImage.resizeMode.cover}
            defaultSource={FALLBACK_IMAGE}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
          />
        </>
      ) : name ? (
        <View
          style={{
            backgroundColor: themeColors.card,
            width: size,
            height: size,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: size / 2,
          }}
        >
          <Text
            style={[
              styles.text,
              {
                color: textColor,
                fontSize: size * 0.4,
              },
            ]}
          >
            {getInitials()}
          </Text>
        </View>
      ) : (
        <FastImage
          source={FALLBACK_IMAGE}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
      )}
    </View>
  );
};

export default Avatar;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  text: {
    fontFamily: Fonts.Bold,
  },
});
