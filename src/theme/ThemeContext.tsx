import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';

type ThemeType = 'light' | 'dark' | 'system';

const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }: any) => {
  const systemTheme = useColorScheme();

  const [theme, setTheme] = useState<ThemeType>('system');

  const getActiveTheme = () => {
    if (theme === 'system') return systemTheme;
    return theme;
  };

  return (
    <ThemeContext.Provider
      value={{
        theme, // user choice
        setTheme,
        activeTheme: getActiveTheme(), // final theme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
