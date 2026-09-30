import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Fonts } from '../../constants/Fonts';

const SuccessScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isDark = true;
  const { contestId } = route.params || {};
  const [countdown, setCountdown] = useState(10);

  const hasNavigated = useRef(false);

  // const goToContest = () => {
  //   if (hasNavigated.current) return;

  //   hasNavigated.current = true;

  //   navigation.replace('ContestDetails', {
  //     contestId,
  //   });
  // };

  const goToContest = () => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    navigation.pop(2);
  };


  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      goToContest();
    }
  }, [countdown]);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? '#000' : '#fff' },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.emoji}>🎉</Text>

        <Text
          style={[
            styles.title,
            { color: isDark ? '#fff' : '#111' },
          ]}
        >
          Submission Successful
        </Text>

        <Text style={styles.subtitle}>
          Your entry has been submitted successfully.
          {'\n'}
          Redirecting in {countdown} second
          {countdown !== 1 ? 's' : ''}...
        </Text>
      </View>

      <PrimaryButton
        title="Go Back"
        onPress={goToContest}
      />
    </SafeAreaView>
  );
};

export default SuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emoji: {
    fontSize: 60,
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontFamily: Fonts.Bold,
  },

  subtitle: {
    marginTop: 10,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },

  button: {
    height: 52,
    borderRadius: 30,
  },
});