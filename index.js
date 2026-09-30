/**
 * @format
 */

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
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
  console.log('Background Message => ', remoteMessage);
  
  await notifee.createChannel({
    id: 'default_sound',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });
  
  await notifee.displayNotification({
    title: remoteMessage?.notification?.title || 'Notification',
    body: remoteMessage?.notification?.body || '',
    
    android: {
      channelId: 'default_sound',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      pressAction: {
        id: 'default',
      },
    },
    
    ios: {
      sound: 'default',
    },
  });
});

AppRegistry.registerComponent(appName, () => App);