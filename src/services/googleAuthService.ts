import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';
import Config from 'react-native-config';

// Web Client ID from google-services.json (Project 929927785688 / the-script-craft-e8e1d)
// where com.rnscriptcarft is registered.
export const GOOGLE_WEB_CLIENT_ID =
  (Config as any)?.GOOGLE_WEB_CLIENT_ID ||
  '929927785688-sn7ai7n0q338a46jltjotn7i5hpi4198.apps.googleusercontent.com';

// iOS Client ID from GoogleService-Info.plist
export const GOOGLE_IOS_CLIENT_ID =
  (Config as any)?.GOOGLE_IOS_CLIENT_ID ||
  '929927785688-fv4hgmo5fvv58e40i0gbp3ld4irtjd1l.apps.googleusercontent.com';

let isConfigured = false;

export const configureGoogleSignIn = () => {
  if (isConfigured) return;

  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: Platform.OS === 'ios' ? GOOGLE_IOS_CLIENT_ID : undefined,
    offlineAccess: false,
    scopes: ['profile', 'email'],
  });

  isConfigured = true;
};

export const signInWithGoogle = async (): Promise<string> => {
  configureGoogleSignIn();

  await GoogleSignin.hasPlayServices({
    showPlayServicesUpdateDialog: true,
  });

  const response = await GoogleSignin.signIn();
  const idToken = response?.data?.idToken || (response as any)?.idToken;

  if (!idToken) {
    throw new Error('Google did not return an ID token.');
  }

  return idToken;
};

export const signOutGoogle = async () => {
  try {
    await GoogleSignin.signOut();
  } catch (err) {
    console.log('Google SignOut error:', err);
  }
};

export { statusCodes };
