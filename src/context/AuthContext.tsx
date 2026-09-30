import { Alert, StyleSheet } from 'react-native';
import { createContext, useState, useContext, useEffect } from 'react';
import api from '../../Instance/Instance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate, navigationRef } from '../../navigationRef';
// import Toast from 'react-native-toast-message';
// import { useToast } from './ToastContext';
import { CommonActions } from '@react-navigation/native';

interface User {
  id: string;
  first_name?: string;
  userId?: string;
  email?: string;
  phone?: string;
}

export const AuthContext = createContext<any>({});

const AuthContextProvider = ({ children }: any) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
//   const { showToast } = useToast();

  const getUser = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      console.log('User Response:', res?.data);

      if (res?.data) {
        const user = res.data;
        setUser(user);
      }
    } catch (err: any) {
      console.log('Error In getUserByToken:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);

      const refreshToken = await AsyncStorage.getItem('userRefreshToken');

      await api.post('/auth/logout', { refreshToken });

      await AsyncStorage.multiRemove(['userAccessToken', 'userRefreshToken']);

      setUser(null);
      navigationRef.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        }),
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Something went wrong. Please try again.';
    } finally {
      setLoading(false);
    }
  };

  const getTokens = async (): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
  }> => {
    try {
      const accessToken = await AsyncStorage.getItem('userAccessToken');
      const refreshToken = await AsyncStorage.getItem('userRefreshToken');
      return { accessToken, refreshToken };
    } catch (err) {
      console.log('Error reading tokens from storage', err);
      return { accessToken: null, refreshToken: null };
    }
  };

  const setTokens = async (
    accessToken?: string | null,
    refreshToken?: string | null,
  ) => {
    try {
      if (accessToken) {
        await AsyncStorage.setItem('userAccessToken', accessToken);
      }
      if (refreshToken) {
        await AsyncStorage.setItem('userRefreshToken', refreshToken);
      }
    } catch (err) {
      console.log('Error setting tokens to storage', err);
    }
  };

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     try {
  //       await getUser();
  //     } catch (error) {
  //       setUser(null);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   checkAuth();
  // }, []);

  useEffect(() => {
    getUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        getUser,
        logout,
        getTokens,
        setTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;

export const useAuth = () => useContext(AuthContext);

const styles = StyleSheet.create({});
