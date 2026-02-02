import React from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { StorageKeys } from '@app/utils/constants';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  // Backgrounds
  background: string;
  surface: string;
  card: string;
  // Text
  text: string;
  textSecondary: string;
  textMuted: string;
  // Accents
  primary: string;
  primaryLight: string;
  secondary: string;
  // Status
  success: string;
  warning: string;
  error: string;
  info: string;
  // UI
  border: string;
  divider: string;
  overlay: string;
  // Special
  gradientStart: string;
  gradientEnd: string;
}

const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F8F9FA',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#4A4A68',
  textMuted: '#8A8AA3',
  primary: '#4A90E2',
  primaryLight: '#E8F1FA',
  secondary: '#7B68EE',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  border: '#E8E8EF',
  divider: '#F0F0F5',
  overlay: 'rgba(0, 0, 0, 0.5)',
  gradientStart: '#4A90E2',
  gradientEnd: '#7B68EE',
};

const darkColors: ThemeColors = {
  background: '#0F0F1A',
  surface: '#1A1A2E',
  card: '#252542',
  text: '#FFFFFF',
  textSecondary: '#B8B8D0',
  textMuted: '#6A6A88',
  primary: '#5BA3F5',
  primaryLight: '#2A3A5A',
  secondary: '#9B8AF5',
  success: '#66BB6A',
  warning: '#FFB74D',
  error: '#EF5350',
  info: '#42A5F5',
  border: '#3A3A55',
  divider: '#2A2A45',
  overlay: 'rgba(0, 0, 0, 0.7)',
  gradientStart: '#5BA3F5',
  gradientEnd: '#9B8AF5',
};

interface ThemeState {
  // State
  mode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;

  // Actions
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  getEffectiveColors: (systemIsDark: boolean) => ThemeColors;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // Initial state
      mode: 'system',
      colors: lightColors,
      isDark: false,

      // Set theme mode
      setMode: (mode) => {
        const systemIsDark = false; // Will be determined by hook
        const isDark = mode === 'dark' || (mode === 'system' && systemIsDark);
        const colors = isDark ? darkColors : lightColors;
        set({ mode, colors, isDark });
      },

      // Toggle between light and dark
      toggleTheme: () => {
        const { mode, isDark } = get();
        const newMode = isDark ? 'light' : 'dark';
        const newColors = !isDark ? darkColors : lightColors;
        set({ mode: newMode, colors: newColors, isDark: !isDark });
      },

      // Get effective colors based on system theme
      getEffectiveColors: (systemIsDark) => {
        const { mode } = get();
        const isDark = mode === 'dark' || (mode === 'system' && systemIsDark);
        return isDark ? darkColors : lightColors;
      },
    }),
    {
      name: StorageKeys.theme,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ mode: state.mode }),
    }
  )
);

// Hook to sync with system theme
export const useSyncTheme = () => {
  const systemColorScheme = useColorScheme();
  const { mode, setMode, getEffectiveColors } = useThemeStore();

  // Update colors when system theme changes
  React.useEffect(() => {
    if (mode === 'system') {
      const isDark = systemColorScheme === 'dark';
      const colors = getEffectiveColors(isDark);
      useThemeStore.setState({ colors, isDark });
    }
  }, [systemColorScheme, mode]);

  return systemColorScheme;
};
