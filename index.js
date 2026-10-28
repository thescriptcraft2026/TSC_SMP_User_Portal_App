/**
 * @format
 */

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  AndroidStyle,
  EventType,
} from '@notifee/react-native';

import App from './App';
import { name as appName } from './app.json';
import { logError } from './src/utils/simpleCrashLogger';

// Save the default handler
const defaultHandler = ErrorUtils.getGlobalHandler();

// 🔥 GLOBAL CRASH HANDLER
ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.log('========================================');
  console.log('🚨 CRASH DETECTED 🚨');
  console.log('========================================');
  console.log('Is Fatal:', isFatal);
  console.log('Error Message:', error?.message);
  console.log('Error Stack:', error?.stack);
  console.log('========================================');
  
  // Save to file
  logError(error, `GLOBAL_CRASH_${isFatal ? 'FATAL' : 'NON_FATAL'}`);
  
  // Call default handler
  if (defaultHandler) {
    defaultHandler(error, isFatal);
  }
});

// 🔥 NOTIFEE BACKGROUND EVENTS
notifee.onBackgroundEvent(async ({ type, detail }) => {
  console.log('Notifee Background Event => ', type, detail);
});

// 🔥 FIREBASE BACKGROUND MESSAGE
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Firebase Background Message Received => ', remoteMessage);

  // Notification messages are displayed automatically by Firebase / APNs while
  // backgrounded. Only display data-only messages here (common for Admin Dashboard pushes)
  // to avoid duplicates.
  if (remoteMessage?.notification) return;

  const data = remoteMessage?.data || {};
  const title = data.title || data.name || 'TheScriptCraft';
  const body = data.body || data.message || data.description || '';
  const image = data.image || data.imageUrl || '';

  await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });

  await notifee.displayNotification({
    title,
    body,

    android: {
      channelId: 'default',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      smallIcon: 'ic_notification',
      largeIcon: image || 'https://tscapi.accurateweb.in/uploads/logo.png',
      circularLargeIcon: true,
      color: '#F6A500',
      style: image
        ? {
            type: AndroidStyle.BIGPICTURE,
            picture: image,
          }
        : undefined,
      pressAction: {
        id: 'default',
      },
    },

    ios: {
      sound: 'default',
    },
    data,
  });
});

AppRegistry.registerComponent(appName, () => App);
