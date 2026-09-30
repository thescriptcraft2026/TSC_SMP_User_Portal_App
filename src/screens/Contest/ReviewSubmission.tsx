import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  ScrollView,
  StatusBar,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import AuthHeader from '../../components/Header/AuthHeader';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import FastImage from 'react-native-fast-image';
import { Fonts } from '../../constants/Fonts';
import { WebView } from 'react-native-webview';
import { themeColors } from '../../theme/colors';

const ReviewSubmission = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isDark = true;

  const { formData } = route.params;

  // ✅ FIXED TIMER (30 seconds)
  const [timeLeft, setTimeLeft] = useState(300);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleBack = () => navigation.goBack();

  const handleEdit = () => {
    if (timeLeft === 0) return;
    navigation.goBack();
  };

  const handleFinalSubmit = () => {
    console.log('FINAL SUBMIT:', formData);

    navigation.replace('SuccessScreen'); // 🔥 smooth transition
  };

  const getEmbedUrl = () => {
    if (formData.platform === 'Youtube') {
      return formData.url.replace('watch?v=', 'embed/');
    }
    return formData.url;
  };

  // ✅ THEME COLORS
  const bg = isDark ? themeColors.black : themeColors.appBackground;
  const cardBg = isDark ? themeColors.card : themeColors.white;
  const textSecondary = isDark ? '#aaa' : '#666';

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: bg }}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        translucent
        barStyle={'light-content'}
      />
      <AuthHeader
        showBack={false}
        title="Review Submission"
        onBack={handleBack}
      />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginBottom: 10 }}>
          {/* 🔥 STEPPER */}
          <View style={styles.stepper}>
            <Text style={styles.activeStep}>1 Fill</Text>
            <Text style={styles.arrow}>→</Text>
            <Text style={styles.activeStep}>2 Review</Text>
            <Text style={styles.inactiveStep}>→ 3 Submit</Text>
          </View>

          {/* ⏱️ TIMER */}
          <Text style={styles.timer}>
            {timeLeft > 0
              ? `Edit allowed for ${timeLeft}s`
              : 'Edit time expired'}
          </Text>
        </View>
        <Card label="Title" value={formData.title} />
        <Card label="Description" value={formData.description} />
        <Card label="Platform" value={formData.platform} />
        <Card label="URL" value={formData.url} link />

        {/* 🔥 VIDEO PREVIEW */}
        {formData.url && (
          <View style={[styles.previewCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.label, { color: textSecondary }]}>
              Preview
            </Text>

            <View style={styles.webContainer}>
              <WebView source={{ uri: getEmbedUrl() }} style={styles.webview} />
            </View>
          </View>
        )}

        {/* IMAGE */}
        {formData.images?.[0] && (
          <View style={[styles.previewCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.label, { color: textSecondary }]}>Poster</Text>
            <FastImage
              source={{ uri: formData.images[0] }}
              style={styles.image}
            />
          </View>
        )}
        {/* 🔥 FIXED BOTTOM BUTTON */}
        <View style={[styles.bottomContainer]}>
          <PrimaryButton
            title={timeLeft === 0 ? 'Edit Disabled' : 'Edit'}
            onPress={handleEdit}
            style={[styles.ctaButton, { opacity: timeLeft === 0 ? 0.5 : 1 }]}
          />

          <PrimaryButton
            title="Submit"
            onPress={handleFinalSubmit}
            style={styles.ctaButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReviewSubmission;

const Card = ({ label, value, link }: any) => {
  const isDark = true;

  return (
    <View
      style={[
        styles.previewCard,
        {
          backgroundColor: isDark ? themeColors.card : themeColors.white,
        },
      ]}
    >
      <Text style={[styles.label, { color: isDark ? '#aaa' : '#666' }]}>
        {label}
      </Text>

      <Text
        style={{
          fontSize: 16,
          marginTop: 6,
          color: link ? '#4A90E2' : isDark ? '#fff' : '#111',
          fontFamily: Fonts.Medium,
        }}
      >
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  stepper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    gap: 6,
  },

  activeStep: {
    fontSize: 13,
    fontFamily: Fonts.Bold,
    color: '#4A90E2',
  },

  arrow: {
    color: '#4A90E2',
  },

  inactiveStep: {
    fontSize: 13,
    color: '#888',
  },

  timer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#ff4d4f',
  },

  previewCard: {
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    paddingVertical: 10,
  },

  label: {
    fontSize: 12,
    fontFamily: Fonts.Medium,
  },

  webContainer: {
    overflow: 'hidden',
    borderRadius: 12,
    marginTop: 10,
  },

  webview: {
    height: 200,
  },

  image: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginTop: 10,
  },

  bottomContainer: {
    flexDirection: 'row',
    gap: 10,
  },

  ctaButton: {
    flex: 1,
    height: 52,
    borderRadius: 30,
  },
});
