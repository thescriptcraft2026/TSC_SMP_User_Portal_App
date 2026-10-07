import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import Clipboard from '@react-native-clipboard/clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Fonts } from '../../constants/Fonts';
import { themeColors } from '../../theme/colors';
import { useToast } from '../../components/Toast/ToastProvider';

const SuccessScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { contestId, participantId } = route.params || {};
  const { show } = useToast();
  const [countdown, setCountdown] = useState(10);
  const [copied, setCopied] = useState(false);

  const participantUrl = participantId
    ? `https://thescriptcraft.com/contests/${contestId}/participants/${participantId}`
    : '';

  const copyLink = () => {
    if (!participantUrl) return;
    Clipboard.setString(participantUrl);
    setCopied(true);
    show({ type: 'success', title: 'Link copied' });
  };

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
    // keep the screen so the user can copy the link
    if (participantUrl) return;
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
  }, [participantUrl]);

  useEffect(() => {
    if (countdown === 0) {
      goToContest();
    }
  }, [countdown]);

  return (
    <LinearGradient
      colors={[
        themeColors.successBgTop,
        themeColors.successBgMid,
        themeColors.successBgBottom,
      ] as string[]}
      style={styles.flex}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <LinearGradient
            colors={[
              themeColors.goldLight,
              themeColors.goldMid,
              themeColors.goldDark,
            ] as string[]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={styles.coin}
          >
            <View style={styles.coinRing}>
              <Ionicons name="checkmark" size={46} color={themeColors.onGold} />
            </View>
          </LinearGradient>

          <Text style={styles.title}>Entry sealed.</Text>

          <Text style={styles.subtitle}>
            Your story has been submitted to the contest successfully. We'll get
            back to you if your submission is selected.
          </Text>

          {!!participantUrl && (
            <>
              <Text style={styles.shareLabel}>SHARE YOUR CONTEST ENTRY</Text>
              <View style={styles.linkPill}>
                <Text style={styles.linkText} numberOfLines={1}>
                  {participantUrl}
                </Text>
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={copyLink}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={copied ? 'checkmark' : 'copy-outline'}
                    size={14}
                    color={themeColors.gold}
                  />
                  <Text style={styles.copyText}>
                    {copied ? 'Copied' : 'Copy link'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {!participantUrl && (
            <Text style={styles.redirect}>
              Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
            </Text>
          )}

          <TouchableOpacity
            style={styles.back}
            onPress={goToContest}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={14} color={themeColors.gold} />
            <Text style={styles.backText}>Back to contest</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SuccessScreen;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  coin: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: themeColors.shadow,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  coinRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    borderColor: themeColors.goldRing,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginTop: 28,
    fontSize: 40,
    fontFamily: Fonts.Italic,
    color: themeColors.gold,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 20,
    fontSize: 15,
    fontFamily: Fonts.Regular,
    color: themeColors.mutedText,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 340,
  },
  redirect: {
    marginTop: 20,
    fontSize: 13,
    fontFamily: Fonts.Medium,
    color: themeColors.gold,
  },
  shareLabel: {
    marginTop: 36,
    fontSize: 13,
    fontFamily: Fonts.SemiBold,
    color: themeColors.white,
    letterSpacing: 1.6,
  },
  linkPill: {
    marginTop: 16,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 18,
    paddingRight: 8,
    paddingVertical: 8,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: themeColors.goldBorder,
    backgroundColor: themeColors.surfaceFaint,
  },
  linkText: {
    flex: 1,
    color: themeColors.mutedTextDim,
    fontFamily: Fonts.Regular,
    fontSize: 12,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: themeColors.goldBorderStrong,
  },
  copyText: {
    color: themeColors.gold,
    fontFamily: Fonts.Medium,
    fontSize: 12,
  },
  back: {
    marginTop: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backText: {
    color: themeColors.gold,
    fontFamily: Fonts.Medium,
    fontSize: 15,
  },
});
