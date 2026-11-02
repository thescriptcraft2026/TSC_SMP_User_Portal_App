import { appleAuth } from '@invertase/react-native-apple-authentication';

export interface AppleAuthPayload {
  identity_token: string;
  authorization_code?: string;
  email?: string | null;
  full_name?: {
    given_name?: string | null;
    family_name?: string | null;
  } | null;
}

export const isAppleAuthSupported = (): boolean => {
  return appleAuth.isSupported;
};

export const signInWithApple = async (): Promise<AppleAuthPayload> => {
  const appleAuthRequestResponse = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
  });

  const { identityToken, authorizationCode, email, fullName, user } =
    appleAuthRequestResponse;

  if (!identityToken) {
    throw new Error('Apple Sign-In failed: No identity token returned.');
  }

  try {
    const credentialState = await appleAuth.getCredentialStateForUser(user);
    console.log('Apple credential state:', credentialState);
  } catch (stateErr) {
    console.warn('Could not check credential state for user:', stateErr);
  }

  return {
    identity_token: identityToken,
    authorization_code: authorizationCode || undefined,
    email: email || null,
    full_name: fullName
      ? {
          given_name: fullName.givenName || null,
          family_name: fullName.familyName || null,
        }
      : null,
  };
};
