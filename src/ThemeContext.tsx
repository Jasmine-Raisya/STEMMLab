import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export const lightThemeColors = {
  background: '#F2E7DF',
  surface: '#FFF4EE',
  card: '#FFEBF3',
  elevated: '#FFF8F3',
  text: '#343133',
  heading: '#343133',
  muted: '#806E63',
  border: '#D5C8BE',
  input: '#FFF8F3',
  softBlue: '#FFEBF3',
  softGreen: '#CFC46B',
  accent: '#CFC46B',
  accentText: '#343133',
  cta: '#F5674D',
  ctaText: '#FFFFFF',
};

export const darkThemeColors = {
  background: '#343133',
  surface: '#433D3B',
  card: '#4D4643',
  elevated: '#5A514D',
  text: '#FFF8F3',
  heading: '#FFEBF3',
  muted: '#E0D1C7',
  border: '#756A64',
  input: '#433D3B',
  softBlue: 'rgba(255,235,243,0.14)',
  softGreen: 'rgba(207,196,107,0.24)',
  accent: '#CFC46B',
  accentText: '#343133',
  cta: '#F5674D',
  ctaText: '#FFFFFF',
};

export type ThemeColors = typeof lightThemeColors;

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    AsyncStorage.getItem('theme').then((saved) => {
      if (saved === 'dark' || saved === 'light') setTheme(saved);
    });
  }, []);

  const toggleTheme = () => {
    setTheme((previous) => {
      const next = previous === 'light' ? 'dark' : 'light';
      void AsyncStorage.setItem('theme', next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, colors: theme === 'dark' ? darkThemeColors : lightThemeColors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}

export function useThemeColors() {
  return useContext(ThemeContext)?.colors ?? lightThemeColors;
}
