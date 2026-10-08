import React, { useEffect } from 'react';
import {
  StyleSheet,
  Platform,
  StatusBar,
  useColorScheme,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import Navigator from './Navigator';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider, useSelector } from 'react-redux';
import analytics from '@react-native-firebase/analytics';
import {
  request,
  PERMISSIONS,
  RESULTS,
  checkNotifications,
  requestNotifications,
} from 'react-native-permissions';
import { store } from './src/redux/store';
import { ToastProvider } from './src/components/Toast/ToastProvider';
import { SocketProvider } from './src/context/SocketContext';
import {
  createNotificationChannel,
  notificationListener,
  requestUserPermission,
} from './src/services/notificationService';
import { setPendingDeepLink } from './src/utils/deepLinkStore';
import { handleDeepLink } from './src/utils/handleDeepLink';
import {
  checkInstallReferrerOnce,
  openPendingContest,
  saveReferralFromUrl,
} from './src/referral/referralService';

import UpdateModal from './src/components/Modals/UpdateModal';
import { checkAppUpdate, redirectToStore } from './src/services/updateService';
import { useState } from 'react';

const AppWrapper = () => {
  const userId = useSelector((state: any) => state.auth?.user?.id);

  // 🔄 Update state
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [updateInfo, setUpdateInfo] = useState({
    latestVersion: '',
    storeUrl: '',
    isForceUpdate: false,
    releaseNotes: '',
  });

  // 🔥 NOTIFICATION + DEEPLINK SETUP
  useEffect(() => {
    let notificationCleanup: (() => void) | undefined;
    let unsubscribeTokenRefresh: (() => void) | undefined;


    const init = async () => {
      try {
        console.log('====================');
        console.log('APP INIT START');
        console.log('====================');

        // ✅ CHECK ALL PERMISSIONS
        await checkPermissions();

        // ✅ FCM PERMISSION
        unsubscribeTokenRefresh = await requestUserPermission();

        // ✅ CREATE CHANNEL
        await createNotificationChannel();

        // ✅ START LISTENERS
        notificationCleanup = await notificationListener();

        // ✅ CHECK FOR APP UPDATE
        // Wrap in a tiny delay to ensure the splash screen or initial layout doesn't overlap immediately
        setTimeout(async () => {
          try {
            console.log('🔍 Starting update check...');

            const updateResult = await checkAppUpdate();

            console.log('🚀 APP.TSX UPDATE RESULT:', updateResult);
            console.log('🚀 needsUpdate:', updateResult.needsUpdate);

            if (updateResult.needsUpdate) {
              console.log('🔴 SHOWING UPDATE MODAL');

              setUpdateInfo({
                latestVersion: updateResult.latestVersion,
                storeUrl: updateResult.storeUrl,
                isForceUpdate: updateResult.isForceUpdate,
                releaseNotes: updateResult.releaseNotes || '',
              });

              setUpdateModalVisible(true);
            }
          } catch (updateErr) {
            console.log('❌ Update check error inside init:', updateErr);
          }
        }, 1500);
      } catch (error) {
        console.log('====================');
        console.log('APP INIT ERROR =>', error);
        console.log('====================');
      }
    };

    init();



    // Contest links are saved as a referral (influencer + contestId) and opened
    // by openPendingContest once the user is inside the App stack.
    const subscription = Linking.addEventListener('url', async ({ url }) => {
      if (await saveReferralFromUrl(url)) {
        openPendingContest();
      } else {
        handleDeepLink(url);
      }
    });

    Linking.getInitialURL().then(async url => {
      if (!url) return;
      if (await saveReferralFromUrl(url)) {
        openPendingContest();
      } else {
        setPendingDeepLink(url);
      }
    });

    checkInstallReferrerOnce();

    return () => {
      subscription.remove();

      // Cleanup FCM token refresh listener
      unsubscribeTokenRefresh?.();

      // Cleanup notification listeners
      notificationCleanup?.();
    };
  }, []);

  // 🔥 REQUEST NOTIFICATION PERMISSION
  const requestNotificationPermission = async () => {
    try {
      const { status } = await checkNotifications();

      if (status !== RESULTS.GRANTED) {
        await requestNotifications(['alert', 'sound', 'badge']);
      }
    } catch (error) {
      console.log('Notification permission error', error);
    }
  };

  // 🔥 CHECK APP PERMISSIONS
  const checkPermissions = async () => {
    try {
      // ✅ NOTIFICATION
      await requestNotificationPermission();

      if (Platform.OS === 'android') {
        // await request(PERMISSIONS.ANDROID.CAMERA);

        // await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);

        if (Platform.Version >= 33) {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
        }
      }

      if (Platform.OS === 'ios') {
        // await request(PERMISSIONS.IOS.CAMERA);

        await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
      }
    } catch (error) {
      console.log('Permission error', error);
    }
  };

  useEffect(() => {
    const trackAppOpen = async () => {
      try {
        await analytics().logEvent('app_opened');
        console.log('✅ Analytics event sent');
      } catch (error) {
        console.log('❌ Analytics error:', error);
      }
    };

    trackAppOpen();
  }, []);

  return (
    <SocketProvider userId={userId}>
      <PaperProvider>
        <StatusBar
          translucent
          barStyle="light-content"
        />

        <ToastProvider>
          <Navigator />
          <UpdateModal
            visible={updateModalVisible}
            onClose={() => setUpdateModalVisible(false)}
            onUpdate={() => redirectToStore(updateInfo.storeUrl)}
            isForceUpdate={updateInfo.isForceUpdate}
            latestVersion={updateInfo.latestVersion}
            releaseNotes={updateInfo.releaseNotes}
          />
        </ToastProvider>
      </PaperProvider>
    </SocketProvider>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AppWrapper />
    </Provider>
  );
};

export default App;

const styles = StyleSheet.create({});
