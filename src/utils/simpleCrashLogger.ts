import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

const LOG_FILE = `${RNFS.DocumentDirectoryPath}/crash_log.txt`;

export const logError = async (error:any, context = '') => {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = `
[${timestamp}] 
Context: ${context}
Message: ${error?.message || error}
Stack: ${error?.stack || 'No stack'}
Platform: ${Platform.OS}
==========
`;

    const exists = await RNFS.exists(LOG_FILE);
    if (exists) {
      const existing = await RNFS.readFile(LOG_FILE);
      await RNFS.writeFile(LOG_FILE, existing + logEntry);
    } else {
      await RNFS.writeFile(LOG_FILE, logEntry);
    }

    console.log('Error logged to:', LOG_FILE);
  } catch (e) {
    console.log('Failed to log error:', e);
  }
};

export const getLogs = async () => {
  try {
    const exists = await RNFS.exists(LOG_FILE);
    if (exists) {
      return await RNFS.readFile(LOG_FILE);
    }
    return 'No logs yet';
  } catch (e) {
    return 'Error reading logs';
  }
};

export const clearLogs = async () => {
  try {
    const exists = await RNFS.exists(LOG_FILE);
    if (exists) {
      await RNFS.unlink(LOG_FILE);
      return true;
    }
    return false;
  } catch (e) {
    console.log('Error clearing logs:', e);
    return false;
  }
};
