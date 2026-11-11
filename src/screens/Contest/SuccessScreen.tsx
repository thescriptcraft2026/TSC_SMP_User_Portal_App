import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Clipboard,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { Fonts } from '../../constants/Fonts';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import { useToast } from '../../components/Toast/ToastProvider';

const SuccessScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { show } = useToast();

  const { contestId, participantId, shareToken, title, bookContest, selectedBooks = [] } = route.params || {};

  const [copied, setCopied] = useState(false);

  const shareUrl =
    contestId && participantId
      ? `https://www.thescriptcraft.com/contests/${contestId}/participants/${participantId}`
      : contestId
      ? `https://www.thescriptcraft.com/contests/${contestId}`
      : 'https://www.thescriptcraft.com/contests';

  const bookBundleUrl = bookContest && contestId && participantId
    ? `https://www.thescriptcraft.com/contests/${contestId}/book-submissions/${shareToken || participantId}`
    : shareUrl;

  const handleShare = async () => {
    try {
      await Share.share({
        title: title || 'The Script Craft Contest Entry',
        message: bookBundleUrl,
      });
    } catch (error) {
      console.log('Error sharing contest link:', error);
    }
  };

  const handleCopy = () => {
    try {
      Clipboard.setString(bookBundleUrl);
      setCopied(true);
      show({
        type: 'success',
        title: 'Link copied to clipboard!',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.log('Error copying to clipboard:', e);
    }
  };

  const goToContest = () => {
    navigation.pop(2);
  };

  const viewSubmission = () => {
    if (bookContest) {
      navigation.replace('BookContestSubmissions', {
        contestId,
        id: contestId,
        contestTitle: title,
        selectedBooks,
      });
      return;
    }
    if (participantId) {
      navigation.replace('ParticipateDetails', {
        id: participantId,
      });
    } else {
      goToContest();
    }
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom', 'left', 'right']}
    >
      <StatusBar translucent barStyle="light-content" />

      {/* Top Header with Close Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goToContest}
          style={styles.closeButton}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Celebration / Success Icon */}
        <View style={styles.iconCircle}>
          <Text style={styles.emoji}>🎉</Text>
        </View>

        <Text style={styles.title}>{bookContest ? 'Books Submitted' : 'Submission Successful'}</Text>

        <Text style={styles.subtitle}>
          {bookContest ? `${selectedBooks.length} book${selectedBooks.length === 1 ? '' : 's'} submitted to the contest.` : 'Your entry has been submitted successfully.'}
        </Text>

        {/* Entry Title if available */}
        {!!title && (
          <View style={styles.entryCard}>
            <Text style={styles.entryLabel}>ENTRY</Text>
            <Text style={styles.entryTitle} numberOfLines={2}>
              {title}
            </Text>
          </View>
        )}

        {bookContest && selectedBooks.length > 0 && (
          <View style={styles.entryCard}>
            <Text style={styles.entryLabel}>SUBMITTED BOOKS</Text>
            {selectedBooks.map((book: any) => <Text key={book.id} style={styles.entryTitle} numberOfLines={1}>• {book.title}</Text>)}
          </View>
        )}

        {/* Shareable Link Box */}
        <View style={styles.linkContainer}>
          <Text style={styles.linkLabel}>SHAREABLE LINK</Text>

          <View style={styles.linkRow}>
            <View style={styles.linkIconWrapper}>
              <Ionicons name="link-outline" size={18} color="#EB9D08" />
            </View>

            <Text
              style={styles.linkText}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {bookBundleUrl}
            </Text>

            <TouchableOpacity
              onPress={handleCopy}
              style={[styles.copyButton, copied && styles.copyButtonActive]}
              activeOpacity={0.8}
            >
              <Ionicons
                name={copied ? 'checkmark' : 'copy-outline'}
                size={16}
                color={copied ? '#fff' : '#EB9D08'}
              />
              <Text
                style={[styles.copyText, copied && styles.copyTextActive]}
              >
                {copied ? 'Copied' : 'Copy'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Primary Action: Share Button */}
        <PrimaryButton
          title="Share"
          icon={<Ionicons name="share-social-outline" size={20} color="#fff" />}
          onPress={handleShare}
          style={styles.shareButton}
          marginTop={24}
        />

        {/* Secondary Navigation Options */}
        <View style={styles.secondaryActions}>
          {!!participantId && (
            <PrimaryButton
              title="View Submission"
              variant="outline"
              icon={<Ionicons name="eye-outline" size={18} color="#EB9D08" />}
              onPress={viewSubmission}
              marginTop={12}
            />
          )}

          <TouchableOpacity
            style={styles.doneButton}
            onPress={goToContest}
            activeOpacity={0.7}
          >
            <Text style={styles.doneText}>Back to Contest</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090d',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 32,
  },

  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(235, 157, 8, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(235, 157, 8, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },

  emoji: {
    fontSize: 44,
  },

  title: {
    fontSize: 24,
    fontFamily: Fonts.Bold,
    color: '#fff',
    textAlign: 'center',
  },

  subtitle: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: Fonts.Regular,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 20,
  },

  entryCard: {
    marginTop: 20,
    backgroundColor: '#16181d',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#262930',
  },

  entryLabel: {
    fontSize: 11,
    fontFamily: Fonts.SemiBold,
    color: '#EB9D08',
    letterSpacing: 0.8,
    marginBottom: 4,
  },

  entryTitle: {
    fontSize: 15,
    fontFamily: Fonts.Medium,
    color: '#fff',
    lineHeight: 20,
  },

  linkContainer: {
    marginTop: 20,
  },

  linkLabel: {
    fontSize: 11,
    fontFamily: Fonts.SemiBold,
    color: '#8e8e93',
    letterSpacing: 0.8,
    marginBottom: 8,
  },

  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16181d',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#262930',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },

  linkIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  linkText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.Regular,
    color: '#d4d4d4',
  },

  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(235, 157, 8, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(235, 157, 8, 0.3)',
  },

  copyButtonActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },

  copyText: {
    fontSize: 12,
    fontFamily: Fonts.SemiBold,
    color: '#EB9D08',
  },

  copyTextActive: {
    color: '#fff',
  },

  shareButton: {
    height: 52,
    borderRadius: 26,
  },

  secondaryActions: {
    marginTop: 8,
  },

  doneButton: {
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },

  doneText: {
    fontSize: 15,
    fontFamily: Fonts.Medium,
    color: '#8e8e93',
  },
});
