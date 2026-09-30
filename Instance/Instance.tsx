import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createNavigationContainerRef,
  CommonActions,
} from '@react-navigation/native';
import Config from 'react-native-config';

export const navigationRef = createNavigationContainerRef();

export const DEFAULT_API_BASE_URL = 'https://betatscapi.thescriptcraft.com/v1/user';
export const DEFAULT_SOCKET_URL = 'https://betatscapi.thescriptcraft.com';

export const API_BASE_URL = Config.API_BASE_URL || DEFAULT_API_BASE_URL;
export const SOCKET_URL = Config.SOCKET_URL || DEFAULT_SOCKET_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

console.log('🔥 API BASE URL:', API_BASE_URL);
console.log('🔥 SOCKET URL:', SOCKET_URL);

export const getAccessToken = async () => {
  return await AsyncStorage.getItem('userAccessToken');
};

// Request interceptor
api.interceptors.request.use(
  async config => {
    const token = await getAccessToken();
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

const refreshApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export const refreshToken = async () => {
  try {
    const storedRefreshToken = await AsyncStorage.getItem('userRefreshToken');

    console.log('refresh token', storedRefreshToken);

    if (
      !storedRefreshToken ||
      storedRefreshToken === 'null' ||
      storedRefreshToken === 'undefined'
    ) {
      console.log('No valid refresh token found');
      return null;
    }

    const res = await refreshApi.post('/auth/refresh-token', {
      refreshToken: storedRefreshToken,
    });

    console.log('refresh response', res?.data);

    const newAccessToken =
      res?.data?.accessToken || res?.data?.data?.accessToken;

    const newRefreshToken =
      res?.data?.refreshToken || res?.data?.data?.refreshToken;

    if (!newAccessToken) {
      console.log('No access token returned');

      await AsyncStorage.multiRemove(['userAccessToken', 'userRefreshToken']);

      return null;
    }

    // save access token
    await AsyncStorage.setItem('userAccessToken', String(newAccessToken));

    // save refresh token if backend returns new one
    if (newRefreshToken) {
      await AsyncStorage.setItem('userRefreshToken', String(newRefreshToken));
    }

    return newAccessToken;
  } catch (error: any) {
    console.log('Error refreshing token:', error?.response?.data || error);

    if (error?.response?.status === 401) {
      await AsyncStorage.multiRemove(['userAccessToken', 'userRefreshToken']);
    }

    return null;
  }
};

api.interceptors.response.use(
  response => response,
  async error => {
    try {
      const originalRequest = error?.config;
      const status = error?.response?.status;

      // ✅ ADD HERE
      if (
        status === 401 &&
        originalRequest?.url?.includes('/auth/refresh-token')
      ) {
        await AsyncStorage.multiRemove(['userAccessToken', 'userRefreshToken']);

        if (navigationRef.isReady()) {
          navigationRef.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Onboarding' }],
            }),
          );
        }

        return Promise.reject(error);
      }

      // existing code
      if (status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        let refreshPromise: Promise<string | null> | null = null;
        if (!refreshPromise) {
          refreshPromise = refreshToken().finally(() => {
            refreshPromise = null;
          });
        }

        const newAccessToken = await refreshPromise;

        if (newAccessToken) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return api(originalRequest);
        }

        // Refresh failed → logout
        await AsyncStorage.multiRemove(['userAccessToken', 'userRefreshToken']);

        if (navigationRef.isReady()) {
          navigationRef.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Onboarding' }],
            }),
          );
        }

        return Promise.reject(error);
      }

      if (status === 401 && originalRequest && originalRequest._retry) {
        try {
          if (
            typeof navigationRef?.isReady === 'function' &&
            navigationRef.isReady()
          ) {
            const currentRoute = navigationRef.getCurrentRoute() as
              | { name?: string }
              | undefined;

            const isAuthRoute = currentRoute?.name?.includes?.('Auth');

            if (!isAuthRoute) {
              navigationRef.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Onboarding' }],
                }),
              );
            }
          }
        } catch (navError) {
          console.log('Navigation error while handling 401:', navError);
        }
      }
    } catch (internalErr) {
      console.log('Interceptor internal error:', internalErr);
    }

    return Promise.reject(error);
  },
);

export default api;
