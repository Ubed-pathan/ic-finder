import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { AppTheme, darkTheme, lightTheme } from './themes';

export type ThemeContextValue = {
  theme: AppTheme;
  mode: 'light' | 'dark' | 'system';
  setMode: (m: 'light' | 'dark' | 'system') => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<React.PropsWithChildren>
= ({ children }) => {
  const system = useColorScheme();
  const [mode, setMode] = useState<'light' | 'dark' | 'system'>('system');

  const theme = useMemo(() => {
    const resolved = mode === 'system' ? system ?? 'light' : mode;
    return resolved === 'dark' ? darkTheme : lightTheme;
  }, [mode, system]);

  const value = useMemo(() => ({ theme, mode, setMode }), [theme, mode]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
