import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  useColorScheme,
  ImageBackground,
  StatusBar,
  Alert,
  Text,
  Platform,
  Linking,
} from 'react-native';
import { themeColors } from '../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { getUserThunk } from '../redux/slices/authSlice';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import { reset } from '../../navigationRef';
import {
  clearPendingDeepLink,
  getPendingDeepLink,
} from '../utils/deepLinkStore';
import { handleDeepLink } from '../utils/handleDeepLink';
import { CommonActions } from '@react-navigation/native';

const SplashScreen = ({ navigation }: any) => {
  const isDark = true;
  const dispatch = useDispatch<any>();
  const { loading, user } = useSelector((state: any) => state.auth);

  const logoScale = useRef(new Animated.Value(0)).current;
  const nodesOpacity = useRef(new Animated.Value(0)).current;
  const nodePulse = useRef(new Animated.Value(1)).current;

  const glassBg = 'rgba(255,255,255,0.09)';

  const glassBorder = 'rgba(255,255,255,0.9)';

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(nodesOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(nodePulse, {
          toValue: 1.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(nodePulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    const openPendingDeepLink = () => {
      setTimeout(() => {
        const url = getPendingDeepLink();

        if (url) {
          clearPendingDeepLink();

          setTimeout(() => {
            handleDeepLink(url);
          }, 300);
        }
      }, 500);
    };

    const init = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem(
          'hasSeenOnboarding',
        );

        let userData = null;

        try {
          userData = await dispatch(getUserThunk()).unwrap();
        } catch (err: any) {
          console.log('getUser failed:', err);

          const errorMessage =
            err?.message ||
            err?.data?.message ||
            err?.payload?.message ||
            '';

          // 🚨 USER DOES NOT EXIST / INVALID ACCOUNT
          if (
            errorMessage?.toLowerCase().includes('user not found')
          ) {
            console.log('User not found → clearing session');

            await AsyncStorage.multiRemove([
              'userAccessToken',
              'userRefreshToken',
            ]);

            reset('Auth');
            return;
          }

          // Any other authentication/token error
          if (
            err?.status === 401 ||
            err?.response?.status === 401 ||
            err?.data?.statusCode === 401
          ) {
            console.log('Unauthorized → clearing session');

            await AsyncStorage.multiRemove([
              'userAccessToken',
              'userRefreshToken',
            ]);

            reset('Auth');
            return;
          }
        }



        // ==========================================
        // VALID USER
        // ==========================================
        if (userData) {
          const user = userData?.data;

          const hasPrimary = user?.added_primary_roles === true;
          const hasUserName = user?.user_name;

          if (!hasUserName) {
            reset('Auth', {
              screen: 'AddUserName',
            });

            return;
          }

          // Roles not completed
          if (!hasPrimary) {
            reset('Auth', {
              screen: 'RoleSetupScreen',
            });
            return;
          }

          // Profile setup completed
          reset('App');
          openPendingDeepLink();
          return;
        }

        // ==========================================
        // NO USER DATA
        // ==========================================
        const token = await AsyncStorage.getItem('userAccessToken');

        if (!token) {
          if (hasSeenOnboarding !== 'true') {
            reset('onBoarding');
          } else {
            reset('Auth');
          }

          return;
        }

        // IMPORTANT:
        // Do NOT automatically send the user to App just
        // because a token exists.
        //
        // If getUserThunk failed, the session should be considered
        // invalid instead of opening App.
        console.log('Unable to validate user session → Auth');

        await AsyncStorage.multiRemove([
          'userAccessToken',
          'userRefreshToken',
        ]);

        reset('Auth');
      } catch (error) {
        console.log('Error checking onboarding:', error);

        await AsyncStorage.multiRemove([
          'userAccessToken',
          'userRefreshToken',
        ]);

        reset('Auth');
      }
    };
    // ✅ HOLD SPLASH FOR 3 SEC
    const timer = setTimeout(() => {
      init();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <StatusBar
        translucent
        barStyle="light-content"
      />

      <View style={styles.container}>
        {/* 🎬 BACKGROUND VIDEO */}
        <Video
          source={require('../assets/videos/centervideo.mp4')}
          style={styles.bgVideo}
          resizeMode="cover" // 🔥 IMPORTANT
          repeat
          muted
          paused={false}
          playInBackground={false}
          playWhenInactive={false}
          ignoreSilentSwitch="obey"
        />

        {/* 🔥 OVERLAY */}
        <LinearGradient
          colors={['rgba(0,0,0,1)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.2)']}
          style={styles.overlay}
        />

        {/* 🌍 LOGO */}
        <Animated.View
          style={[
            styles.topLogoContainer,
            {
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Animated.Image
            source={require('../assets/Logo/logo.png')}
            style={styles.topLogo}
          />
        </Animated.View>
      </View>
    </>
  );
};

export default SplashScreen;

const nodePosition: any = {
  topLeft: { top: 20, left: 20 },
  topRight: { top: 20, right: 20 },
  bottomLeft: { bottom: 20, left: 20 },
  bottomRight: { bottom: 20, right: 20 },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },

  bgVideo: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  topLogoContainer: {
    position: 'absolute',

    top: Platform.OS === 'ios' ? 90 : 70,

    alignItems: 'center',
    justifyContent: 'center',

    width: '100%',

    zIndex: 20,
  },

  topLogo: {
    width: 220, // 🔥 smaller
    height: 220,

    resizeMode: 'contain',
  },
});
