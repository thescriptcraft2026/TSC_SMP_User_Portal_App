import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';

import LottieView from 'lottie-react-native';

import { themeColors } from '../../theme/colors';
import { Fonts } from '../../constants/Fonts';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = {
  title?: string;
  description?: string;
  buttonText?: string;
  onPress?: () => void;
};

const SuccessScreen = ({
  title,
  description,
  buttonText = 'Continue',
  onPress,
}: Props) => {
  const isDark = useColorScheme() === 'dark';

  const bgColor = isDark ? themeColors.black : themeColors.white;
  const textColor = isDark ? themeColors.white : themeColors.black;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.content}>
        <LottieView
          source={require('../../assets/lottie/Sucesso.json')}
          autoPlay
          loop={true}
          style={styles.animation}
          
        />

        <Text style={[styles.title, { color: textColor }]}>{title}</Text>

        {description && <Text style={styles.description}>{description}</Text>}
      </View>

      {onPress && (
        <View style={styles.buttonContainer}>
          <PrimaryButton title={buttonText} onPress={onPress} />
        </View>
      )}
    </SafeAreaView>
  );
};

export default SuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 25,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  animation: {
    width: 250,
    height: 250,
  },

  title: {
    fontSize: 26,
    fontFamily: Fonts.Bold,
    textAlign: 'center',
    marginTop: 10,
  },

  description: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
    lineHeight: 20,
  },

  buttonContainer: {
    marginBottom: 20,
  },
});
