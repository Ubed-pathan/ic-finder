export type AppTheme = {
  name: 'light' | 'dark';
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    primaryAccent: string;
    danger: string;
    warning: string;
  };
  spacing: (factor: number) => number;
  radius: { sm: number; md: number; lg: number; pill: number };
  shadow: { card: string };
};

const spacing = (factor: number) => factor * 4;

export const lightTheme: AppTheme = {
  name: 'light',
  colors: {
    background: '#F4F7FA',
    surface: '#FFFFFF',
    text: '#0B0F14',
    textSecondary: '#4A5A6A',
    border: '#E1E6EC',
    primary: '#0066FF',
    primaryAccent: '#3385FF',
    danger: '#D92D20',
    warning: '#F79009'
  },
  spacing,
  radius: { sm: 4, md: 8, lg: 16, pill: 999 },
  shadow: { card: '0 4px 16px rgba(0,0,0,0.08)' }
};

export const darkTheme: AppTheme = {
  name: 'dark',
  colors: {
    background: '#0B0F14',
    surface: '#162029',
    text: '#F5F9FC',
    textSecondary: '#B8C4CF',
    border: '#2A3945',
    primary: '#3B82F6',
    primaryAccent: '#60A5FA',
    danger: '#F97066',
    warning: '#FDB022'
  },
  spacing,
  radius: { sm: 4, md: 8, lg: 16, pill: 999 },
  shadow: { card: '0 4px 16px rgba(0,0,0,0.4)' }
};

export const themes = { light: lightTheme, dark: darkTheme };
