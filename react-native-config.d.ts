declare module 'react-native-config' {
  export interface NativeConfig {
    API_BASE_URL: string;
    SOCKET_URL: string;
  }

  const Config: NativeConfig;

  export default Config;
}