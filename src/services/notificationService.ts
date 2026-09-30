import messaging from '@react-native-firebase/messaging';

import notifee, {
  AndroidImportance,
  AndroidStyle,
  EventType,
} from '@notifee/react-native';

import api from '../../Instance/Instance';
import { Alert } from 'react-native';

// 🔥 SAVE FCM TOKEN TO BACKEND
const saveFcmToken = async (token: string) => {
  try {
    const response = await api.post('/auth/fcm-token', {
      fcm_token: token,
    });

    console.log('FCM TOKEN SAVED => ', JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error: any) {
    console.log(
      'SAVE TOKEN ERROR => ',
      JSON.stringify(error?.response?.data || error.message, null, 2),
    );
  }
};

// 🔥 CREATE NOTIFICATION CHANNEL
export const createNotificationChannel = async () => {
  try {
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });

    console.log('Notification Channel Created');
  } catch (error) {
    console.log('CHANNEL ERROR => ', error);
  }
};

// 🔥 GET FCM TOKEN
export const getFcmToken = async () => {
  try {
    // 🔥 DELETE OLD TOKEN
    // await messaging().deleteToken();

    // 🔥 GENERATE NEW TOKEN
    const token = await messaging().getToken();

    console.log('FCM TOKEN => ', token);
    // Alert.alert('FCM TOKEN', token);

    await saveFcmToken(token);

    return token;
  } catch (error) {
    console.log('FCM TOKEN ERROR => ', error);
  }
};

// 🔥 TOKEN REFRESH LISTENER
export const tokenRefreshListener = () => {
  return messaging().onTokenRefresh(async token => {
    console.log('NEW FCM TOKEN => ', token);

    await saveFcmToken(token);
  });
};

// 🔥 REQUEST USER PERMISSION
export const requestUserPermission = async () => {
  try {
    await messaging().registerDeviceForRemoteMessages();
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
    const title = remoteMessage?.notification?.title || 'ScriptCraft';

    const body = remoteMessage?.notification?.body || '';

    const image = remoteMessage?.data?.image || '';

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

      data: remoteMessage?.data || {},
    });
  } catch (error) {
    console.log('DISPLAY NOTIFICATION ERROR => ', error);
  }
};

// 🔥 NOTIFICATION LISTENERS
export const notificationListener = async () => {
  const unsubscribeMessage = messaging().onMessage(async remoteMessage => {
    console.log(
      'Foreground Notification => ',
      JSON.stringify(remoteMessage, null, 2),
    );

    await displayNotification(remoteMessage);
  });

  const unsubscribeOpen = messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Opened from background => ', remoteMessage);
  });

  const remoteMessage = await messaging().getInitialNotification();

  if (remoteMessage) {
    console.log('Opened from quit state => ', remoteMessage);
  }

  const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
    switch (type) {
      case EventType.PRESS:
        console.log('Notification Pressed => ', detail.notification);
        break;
    }
  });

  return () => {
    unsubscribeMessage();
    unsubscribeOpen();
    unsubscribeNotifee();
  };
};
