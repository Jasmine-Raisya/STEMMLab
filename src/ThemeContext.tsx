import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { brandColors } from './tokens';

type Theme = 'light' | 'dark';

export const lightThemeColors = {
  background: brandColors.cream,
  surface: brandColors.blush,
  card: brandColors.blush,
  elevated: brandColors.lightElevated,
  text: brandColors.charcoal,
  heading: brandColors.charcoal,
  muted: brandColors.muted,
  border: brandColors.lightBorder,
  input: brandColors.blush,
  softBlue: brandColors.blush,
  softGreen: 'rgba(207,196,107,0.2)',
  accent: brandColors.oliveGold,
  accentText: brandColors.charcoal,
  cta: brandColors.coral,
  ctaText: brandColors.white,
  danger: brandColors.danger,
};

export const darkThemeColors = {
  background: brandColors.charcoal,
  surface: brandColors.darkSurface,
  card: brandColors.darkCard,
  elevated: brandColors.darkElevated,
  text: '#FFFFFF',
  heading: brandColors.blush,
  muted: brandColors.darkMuted,
  border: brandColors.darkBorder,
  input: '#2A2728',
  softBlue: 'rgba(255,235,243,0.14)',
  softGreen: 'rgba(207,196,107,0.24)',
  accent: brandColors.oliveGold,
  accentText: brandColors.charcoal,
  cta: brandColors.coral,
  ctaText: brandColors.white,
  danger: brandColors.danger,
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
