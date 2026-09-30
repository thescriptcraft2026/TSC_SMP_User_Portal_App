import VersionCheck from 'react-native-version-check';
import { Linking, Platform } from 'react-native';

export interface UpdateCheckResult {
  releaseNotes: string;
  needsUpdate: boolean;
  latestVersion: string;
  storeUrl: string;
  isForceUpdate: boolean;
}

const MOCK_UPDATE_FOR_TESTING = false;

const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.rnscriptcarft';

const PLAY_STORE_DEEP_LINK =
  'market://details?id=com.rnscriptcarft';

const APP_STORE_URL =
  'https://apps.apple.com/us/app/the-script-craft/id6757950789';

export const checkAppUpdate = async (): Promise<UpdateCheckResult> => {
  const currentVersion = VersionCheck.getCurrentVersion();

  const storeUrl =
    Platform.OS === 'ios'
      ? APP_STORE_URL
      : PLAY_STORE_URL;

  try {
    console.log('========== APP UPDATE CHECK ==========');
    console.log('Platform:', Platform.OS);
    console.log('Current Version:', currentVersion);

    // TESTING
    if (MOCK_UPDATE_FOR_TESTING) {
      const mockResult = {
        needsUpdate: true,
        latestVersion: '3.0.0',
        storeUrl: APP_STORE_URL,
        isForceUpdate: true,
        releaseNotes: 'Bug fixes and performance improvements.',
      };

      console.log('🧪 MOCK UPDATE RESULT:', mockResult);

      return mockResult;
    }

    let latestVersion = currentVersion;

    try {
      const update = await VersionCheck.needUpdate();

      console.log('VersionCheck result:', update);

      latestVersion = update?.latestVersion || currentVersion;

      const needsUpdate = update?.isNeeded === true;

      console.log('Latest Version:', latestVersion);
      console.log('Needs Update:', needsUpdate);

      let isForceUpdate = false;

      if (needsUpdate) {
        const currentMajor = parseInt(
          currentVersion.split('.')[0],
          10,
        );

        const latestMajor = parseInt(
          latestVersion.split('.')[0],
          10,
        );

        isForceUpdate = latestMajor > currentMajor;
      }

      console.log('Force Update:', isForceUpdate);
      console.log('=====================================');

      return {
        needsUpdate,
        latestVersion,
        storeUrl,
        isForceUpdate,
        releaseNotes: '',
      };
    } catch (versionError) {
      console.error(
        'VersionCheck.needUpdate() failed:',
        versionError,
      );

      return {
        needsUpdate: false,
        latestVersion: currentVersion,
        storeUrl,
        isForceUpdate: false,
        releaseNotes: '',
      };
    }
  } catch (error) {
    console.error('Error checking app update:', error);

    return {
      needsUpdate: false,
      latestVersion: currentVersion,
      storeUrl,
      isForceUpdate: false,
      releaseNotes: '',
    };
  }
};

export const redirectToStore = async (storeUrl: string) => {
  try {
    const url =
      Platform.OS === 'ios'
        ? APP_STORE_URL
        : PLAY_STORE_DEEP_LINK;

    console.log('Opening store:', url);

    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
      await Linking.openURL(url);
      return;
    }

    await Linking.openURL(storeUrl);
  } catch (error) {
    console.error('Error opening store:', error);

    const fallback =
      Platform.OS === 'ios'
        ? APP_STORE_URL
        : PLAY_STORE_URL;

    try {
      await Linking.openURL(fallback);
    } catch (fallbackError) {
      console.error(
        'Failed to open fallback URL:',
        fallbackError,
      );
    }
  }
};