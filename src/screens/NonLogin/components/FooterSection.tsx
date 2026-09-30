import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableOpacity,
  Linking,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import FastImage from 'react-native-fast-image';

import { Fonts } from '../../../constants/Fonts';
import { themeColors } from '../../../theme/colors';
import Facebook from '../../../assets/SVG/Facebook';
import Twitter from '../../../assets/SVG/Twitter';
import YouTube from '../../../assets/SVG/YouTube';
import Instagram from '../../../assets/SVG/Instagram';
import InAppBrowser from 'react-native-inappbrowser-reborn';

const { width } = Dimensions.get('window');

// Responsive font size
const BRAND_FONT_SIZE = Math.max(42, Math.min(width * 0.14, 58));

export default function FooterSection() {

  const openUrl = async (url: string) => {
    try {
      const isAvailable = await InAppBrowser.isAvailable();

      if (isAvailable) {
        await InAppBrowser.open(url, {
          // iOS
          dismissButtonStyle: 'cancel',
          preferredBarTintColor: '#000000',
          preferredControlTintColor: '#FFFFFF',
          readerMode: false,
          animated: true,
          modalPresentationStyle: 'overFullScreen',
          modalTransitionStyle: 'coverVertical',
          modalEnabled: true,
          enableBarCollapsing: false,

          // Android
          showTitle: true,
          toolbarColor: '#000000',
          secondaryToolbarColor: '#000000',
          navigationBarColor: '#000000',
          enableUrlBarHiding: true,
          enableDefaultShare: true,
          forceCloseOnRedirection: true,

          animations: {
            startEnter: 'slide_in_right',
            startExit: 'slide_out_left',
            endEnter: 'slide_in_left',
            endExit: 'slide_out_right',
          },
        });

        return;
      }

      // Fallback if InAppBrowser is not available
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.log('InAppBrowser Error:', error);

      // Final fallback
      try {
        await Linking.openURL(url);
      } catch (fallbackError) {
        console.log('URL Error:', fallbackError);
      }
    }
  };

  const getCurrentYear = () => {
    return new Date().getFullYear();
  }

  return (
    <View style={styles.container}>


      <View style={{ marginVertical: 12 }}>
        <Text style={{ fontSize: 22, fontFamily: Fonts.Bold, color: themeColors.gray, marginBottom: 6, textAlign: "center" }}>Quick links</Text>
        <View style={styles.linksRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              openUrl('https://www.thescriptcraft.com/about')
            }
          >
            <Text style={styles.linkText}>About Us</Text>
          </TouchableOpacity>

          <View style={styles.dot} />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              openUrl('https://www.thescriptcraft.com/disclaimer')
            }
          >
            <Text style={styles.linkText}>Disclaimer</Text>
          </TouchableOpacity>

          <View style={styles.dot} />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              openUrl('https://www.thescriptcraft.com/faqs')
            }
          >
            <Text style={styles.linkText}>FAQs</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.linksRow, { marginTop: 10 }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              openUrl('https://www.thescriptcraft.com/terms-conditions')
            }
          >
            <Text style={styles.linkText}>Terms and Conditions</Text>
          </TouchableOpacity>

          <View style={styles.dot} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              openUrl('https://www.thescriptcraft.com/privacy-policy')
            }
          >
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ marginVertical: 12 }}>
        <Text style={{ fontSize: 22, fontFamily: Fonts.Bold, color: themeColors.gray, marginBottom: 6, textAlign: "center" }}>Contact</Text>
        <View style={styles.linksRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Linking.openURL('mailto:admin@thescriptcraft.com')}
          >
            <Text style={styles.linkText}>admin@thescriptcraft.com</Text>
          </TouchableOpacity>

          <View style={styles.dot} />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Linking.openURL('mailto:team@thescriptcraft.com')}
          >
            <Text style={styles.linkText}>team@thescriptcraft.com</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ marginVertical: 12 }}>
        <Text
          style={{
            fontSize: 22,
            fontFamily: Fonts.Bold,
            color: themeColors.gray,
            textAlign: 'center',
          }}>
          Follow Us
        </Text>

        <View style={styles.socialRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => openUrl('https://www.facebook.com/TSCWriters')}
          >
            <Facebook color={themeColors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => openUrl('https://x.com/TSCWriters')}
          >
            <Twitter color={themeColors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={{ marginTop: 6 }}
            onPress={() => openUrl('https://www.youtube.com/@TSCWriters')}
          >
            <YouTube size={42} color={themeColors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => openUrl('https://www.instagram.com/tscwriters/')}
          >
            <Instagram color={themeColors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <MaskedView
        style={styles.maskedView}
        maskElement={
          <View style={styles.maskContainer}>
            <Text
              style={styles.brandText}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.55}
            >
              The Script Craft
            </Text>
          </View>
        }
      >
        <LinearGradient
          colors={[
            '#4A2F08',
            '#6E4810',
            '#9A6916',
            '#C98712',
            '#EB9D08',
          ]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </MaskedView>

      <Text style={styles.copyright}>
        Copyright {getCurrentYear()} All Rights Reserved by{' '}
        <Text style={styles.copyrightBrand}>The Script Craft</Text>
      </Text>
      <Text style={styles.division}>
        (Division of MAGNETAR ENTERTAINMENT)
      </Text>

      <View style={styles.legalRow}>
        <Text style={[styles.division, { marginRight: 10 }]}>
          Our legal advisor
        </Text>

        <FastImage
          source={require('../../../assets/images/legal.png')}
          style={styles.legalLogo}
          resizeMode={FastImage.resizeMode.contain}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },

  maskedView: {
    width: '100%',
    height: BRAND_FONT_SIZE + 20,
    marginBottom: 10,
  },

  maskContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  brandText: {
    width: '100%',
    fontSize: BRAND_FONT_SIZE,
    fontFamily: Fonts.Bold,
    color: '#000',
    textAlign: 'center',
    letterSpacing: -2,
    includeFontPadding: false,
  },

  copyright: {
    color: '#8A8A8A',
    fontSize: 12,
    textAlign: 'center',
    fontFamily: Fonts.Medium,
    paddingHorizontal: 20,
  },

  copyrightBrand: {
    color: '#FFFFFF',
    fontFamily: Fonts.Bold, // or use your custom font
  },

  division: {
    color: '#666',
    fontSize: 11,
    textAlign: 'center',
    fontFamily: Fonts.Regular,
    paddingHorizontal: 20,
  },

  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },

  linkText: {
    color: '#B5B5B5',
    fontSize: 14,
    fontFamily: Fonts.Medium,
    textAlign: 'center',
  },

  dot: {
    width: 4,
    height: 4,
    borderRadius: 10,
    backgroundColor: '#666',
    marginHorizontal: 10,
  },

  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'center',
    marginTop: 20,
  },

  legalLogo: {
    width: 50,
    height: 40,
  },

  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
});
