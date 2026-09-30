import { Platform } from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';

export const requestGalleryPermission = async () => {
  try {
    if (Platform.OS === 'ios') {
      const result = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);

      if (result === RESULTS.GRANTED) {
        return true;
      }

      const requestResult = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);

      if (requestResult === RESULTS.BLOCKED) {
        openSettings();
      }

      return requestResult === RESULTS.GRANTED;
    }

    // Android uses the system Photo Picker.
    // No storage permission is required.
    return true;
  } catch (error) {
    console.log('Gallery permission error', error);
    return false;
  }
};
