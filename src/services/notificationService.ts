import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import VersionCheck from 'react-native-version-check';

import notifee, {
  AndroidImportance,
  AndroidStyle,
  EventType,
} from '@notifee/react-native';

import api from '../../Instance/Instance';
import { navigationRef } from '../../navigationRef';
import { handleDeepLink } from '../utils/handleDeepLink';
import { setPendingDeepLink } from '../utils/deepLinkStore';

const INSTALLATION_ID_KEY = 'notificationInstallationId';

const getInstallationId = async () => {
  const existing = await AsyncStorage.getItem(INSTALLATION_ID_KEY);
  if (existing) return existing;

  const generated = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  await AsyncStorage.setItem(INSTALLATION_ID_KEY, generated);
  return generated;
};

// 🔥 EXTRACT DEEP LINK FROM PAYLOAD
export const extractDeepLink = (data: any): string | null => {
  if (!data) return null;

  // 1. Explicit deep link fields
  if (data.deep_link) return String(data.deep_link).trim();
  if (data.link) return String(data.link).trim();
  if (data.url) return String(data.url).trim();

  // 2. Synthesize deep link from type and entity IDs
  const type = String(data.type || '').toLowerCase();
  const id =
    data.id ||
    data.contest_id ||
    data.opportunity_id ||
    data.post_id ||
    data.book_id ||
    data.movie_id ||
    data.synopsis_id ||
    data.visionx_id ||
    data.user_id ||
    data.userId;

  if (type === 'contest' || type === 'contest_created') {
    return id ? `tsc://contest/${id}` : 'tsc://contests';
  }
  if (
    type === 'post' ||
    type === 'post_created' ||
    type === 'post_liked' ||
    type === 'post_comment'
  ) {
    return id ? `tsc://post/${id}` : 'tsc://posts';
  }
  if (type === 'opportunity' || type === 'opportunity_created') {
    return id ? `tsc://opportunity/${id}` : 'tsc://opportunities';
  }
  if (type === 'book' || type === 'book_created') {
    return id ? `tsc://book/${id}` : 'tsc://books';
  }
  if (type === 'movie' || type === 'movie_review') {
    return id ? `tsc://movie/${id}` : 'tsc://movies';
  }
  if (type === 'synopsis' || type === 'synopsis_created') {
    return id ? `tsc://synopsis/${id}` : 'tsc://synopses';
  }
  if (type === 'visionx' || type === 'vision_created') {
    return id ? `tsc://visionx/${id}` : 'tsc://visionx';
  }
  if (type === 'profile' || type === 'user') {
    const username = data.username || id;
    return username ? `tsc://profile/${username}` : null;
  }
  if (type === 'chat' || type === 'chat_message') {
    const roomId = data.roomId || data.room_id || data.chat_id || id;
    return roomId ? `tsc://chat/${roomId}` : 'tsc://chats';
  }
  if (
    type === 'notification' ||
    type === 'notifications' ||
    type === 'announcement' ||
    type === 'general'
  ) {
    return 'tsc://notification';
  }

  return null;
};

// 🔥 EXTRACT NOTIFICATION CONTENT
export const extractNotificationContent = (remoteMessage: any) => {
  const data = remoteMessage?.data || {};
  const notification = remoteMessage?.notification || {};

  const title =
    notification.title ||
    data.title ||
    data.name ||
    'TheScriptCraft';

  const body =
    notification.body ||
    data.body ||
    data.message ||
    data.description ||
    '';

  const image =
    notification.android?.imageUrl ||
    data.image ||
    data.imageUrl ||
    '';

  const deepLink = extractDeepLink(data);

  return { title, body, image, deepLink, data };
};

// 🔥 SAVE FCM TOKEN TO BACKEND
export const saveFcmToken = async (token: string) => {
  try {
    const response = await api.post('/auth/fcm-token', {
      fcm_token: token,
      platform: Platform.OS,
      app_version: VersionCheck.getCurrentVersion(),
      installation_id: await getInstallationId(),
    });

    return response.data;
  } catch (error: any) {
    console.log('SAVE TOKEN ERROR => ', error?.response?.status || error.message);
  }
};

// 🔥 CREATE NOTIFICATION CHANNEL
export const createNotificationChannel = async () => {
  try {
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });

    console.log('Notification Channel Created');
  } catch (error) {
    console.log('CHANNEL ERROR => ', error);
  }
};

// 🔥 GET FCM TOKEN
export const getFcmToken = async () => {
  try {
    const token = await messaging().getToken();
    await saveFcmToken(token);
    return token;
  } catch (error) {
    console.log('FCM TOKEN ERROR => ', error);
  }
};

// 🔥 CLEAR FCM TOKEN ON LOGOUT
export const clearFcmToken = async () => {
  try {
    await messaging().deleteToken();
  } catch (error) {
    console.log('CLEAR FCM TOKEN ERROR => ', error);
  }
};

// 🔥 TOKEN REFRESH LISTENER
export const tokenRefreshListener = () => {
  return messaging().onTokenRefresh(async token => {
    await saveFcmToken(token);
  });
};

// 🔥 REQUEST USER PERMISSION
export const requestUserPermission = async () => {
  try {
    if (Platform.OS === 'ios') {
      await messaging().registerDeviceForRemoteMessages();
    }

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
    }

    const authStatus = await messaging().requestPermission();

    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log('Notification permission denied');
      return;
    }

    console.log('Notification permission granted');

    // 🔥 CREATE CHANNEL
    await createNotificationChannel();

    // 🔥 GET TOKEN + SAVE TO BACKEND
    await getFcmToken();

    // 🔥 TOKEN REFRESH LISTENER
    const unsubscribeTokenRefresh = tokenRefreshListener();

    return unsubscribeTokenRefresh;
  } catch (error) {
    console.log('PERMISSION ERROR => ', error);
  }
};

// 🔥 DISPLAY LOCAL NOTIFICATION
export const displayNotification = async (remoteMessage: any) => {
  try {
    const { title, body, image, deepLink, data } =
      extractNotificationContent(remoteMessage);

    // Ensure notification channel exists on Android
    if (Platform.OS === 'android') {
      await createNotificationChannel();
    }

    // On iOS, if remoteMessage has a native notification payload,
    // iOS UNUserNotificationCenter will display it natively in foreground.
    if (Platform.OS === 'ios' && remoteMessage?.notification) {
      return;
    }

    await notifee.displayNotification({
      title,
      body,

      android: {
        channelId: 'default',
        smallIcon: 'ic_notification',
        largeIcon: image || 'https://tscapi.accurateweb.in/uploads/logo.png',
        circularLargeIcon: true,
        color: '#F6A500',
        pressAction: {
          id: 'default',
        },
        importance: AndroidImportance.HIGH,
        sound: 'default',
        showTimestamp: true,
        timestamp: Date.now(),
        style: image
          ? {
              type: AndroidStyle.BIGPICTURE,
              picture: image,
            }
          : undefined,
      },

      ios: {
        sound: 'default',
        foregroundPresentationOptions: {
          badge: true,
          sound: true,
          banner: true,
          list: true,
        },
      },

      data: {
        ...data,
        deep_link: deepLink || data?.deep_link,
      },
    });
  } catch (error) {
    console.log('DISPLAY NOTIFICATION ERROR => ', error);
  }
};

// 🔥 HANDLE NOTIFICATION TAP / PRESS
export const handleNotificationPress = (payload: any) => {
  const data = payload?.data || payload?.notification?.data || payload || {};
  const deepLink = extractDeepLink(data);

  console.log('Handling Notification Press => deep_link:', deepLink);

  const targetLink = deepLink || 'tsc://notification';
  setPendingDeepLink(targetLink);

  // If navigation is ready and NOT on Splash screen, navigate immediately.
  // Otherwise, Splash screen's openPendingDeepLink will consume it after session verification.
  const currentRouteName =
    navigationRef.isReady() && typeof navigationRef.getCurrentRoute === 'function'
      ? (navigationRef.getCurrentRoute() as any)?.name
      : null;

  if (navigationRef.isReady() && currentRouteName && currentRouteName !== 'Splash') {
    handleDeepLink(targetLink);
  }
};

// 🔥 CHECK INITIAL NOTIFICATION ON APP START (COLD START)
export const checkInitialNotification = async () => {
  try {
    // 1. Check FCM initial notification
    const fcmInitial = await messaging().getInitialNotification();
    if (fcmInitial) {
      console.log('App opened from FCM cold start =>', fcmInitial);
      handleNotificationPress(fcmInitial);
      return;
    }

    // 2. Check Notifee initial notification
    const notifeeInitial = await notifee.getInitialNotification();
    if (notifeeInitial) {
      console.log('App opened from Notifee cold start =>', notifeeInitial);
      handleNotificationPress({
        data: notifeeInitial.notification?.data,
      });
      return;
    }
  } catch (error) {
    console.log('CHECK INITIAL NOTIFICATION ERROR =>', error);
  }
};

// 🔥 NOTIFICATION LISTENERS
export const notificationListener = async () => {
  // 1. Foreground FCM message listener
  const unsubscribeMessage = messaging().onMessage(async remoteMessage => {
    console.log(
      'Foreground Notification Received => ',
      JSON.stringify(remoteMessage, null, 2),
    );

    await displayNotification(remoteMessage);
  });

  // 2. Background FCM notification tap listener
  const unsubscribeOpen = messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Opened from background via FCM => ', remoteMessage);
    handleNotificationPress(remoteMessage);
  });

  // 3. Foreground Notifee banner tap listener
  const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
    switch (type) {
      case EventType.PRESS:
        console.log('Foreground Notifee Banner Pressed => ', detail.notification);
        handleNotificationPress({
          data: detail.notification?.data,
        });
        break;
    }
  });

  return () => {
    unsubscribeMessage();
    unsubscribeOpen();
    unsubscribeNotifee();
  };
};

