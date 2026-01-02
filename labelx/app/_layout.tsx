import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../global.css';

import { LanguageProvider } from '@/contexts/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { loadLanguage } from '@/utils/i18n';

export const unstable_settings = {
  anchor: '(tabs)',
};

const THEME_STORAGE_KEY = "@labelx_theme_preference";

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    loadThemePreference();
    loadLanguage(); // 載入語言設定
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === "dark" || savedTheme === "light") {
        setColorScheme(savedTheme);
        Appearance.setColorScheme(savedTheme);
      } else {
        setColorScheme(systemColorScheme || 'light');
      }
    } catch (error) {
      console.error("Failed to load theme preference:", error);
      setColorScheme(systemColorScheme || 'light');
    }
  };

  // Listen for theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: newColorScheme }) => {
      // 當主題改變時，更新 colorScheme
      if (newColorScheme) {
        setColorScheme(newColorScheme);
      }
    });

    return () => subscription.remove();
  }, []);

  if (colorScheme === null) {
    return null; // Prevent flash of wrong theme
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LanguageProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="result" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="uitest1" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="prompt-test" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="login" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="settings" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="display-settings" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="notification-settings" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="privacy" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="help-center" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="about" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="language-settings" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </LanguageProvider>
    </GestureHandlerRootView>
  );
}
