import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSafeBack } from "@/utils/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Appearance, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const THEME_STORAGE_KEY = "@labelx_theme_preference";

export default function DisplaySettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const safeBack = useSafeBack();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const { t, language } = useLanguage();
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === "dark") {
        setDarkModeEnabled(true);
        Appearance.setColorScheme("dark");
      } else if (savedTheme === "light") {
        setDarkModeEnabled(false);
        Appearance.setColorScheme("light");
      } else {
        // 默認跟隨系統
        const currentScheme = Appearance.getColorScheme();
        setDarkModeEnabled(currentScheme === "dark");
      }
    } catch (error) {
      console.error("Failed to load theme preference:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 監聽主題變化
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: newColorScheme }) => {
      AsyncStorage.getItem(THEME_STORAGE_KEY).then((savedTheme) => {
        if (!savedTheme) {
          // 如果沒有保存的主題，跟隨系統
          setDarkModeEnabled(newColorScheme === "dark");
        }
      });
    });

    return () => subscription.remove();
  }, []);

  const handleDarkModeToggle = async (value: boolean) => {
    try {
      setDarkModeEnabled(value);
      const theme = value ? "dark" : "light";
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
      Appearance.setColorScheme(theme);
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View
        style={{ 
          paddingTop: insets.top,
          backgroundColor: theme.headerBackground,
          borderBottomWidth: 1,
          borderBottomColor: theme.headerBorder,
        }}
      >
        <View className="flex-row items-center px-6 py-4">
          <Pressable onPress={() => safeBack('/(tabs)/profile')}>
            <Ionicons name="arrow-back" size={24} color={theme.iconColor} />
          </Pressable>
          <Text style={{ fontSize: 18, fontWeight: '600', color: theme.primaryText, marginLeft: 16 }}>{t('displaySettings.title')}</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Display Settings Section */}
        <View className="px-6 mt-6">
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderRadius: 24, overflow: 'hidden' }]}>
            {/* Dark Mode Toggle */}
            <View style={styles.settingItem}>
              <View className="flex-row items-center flex-1">
                <View style={[styles.iconContainer, { backgroundColor: theme.gray100 }]}>
                  <Ionicons name="moon-outline" size={22} color={theme.gray400} />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: theme.primaryText }}>{t('displaySettings.darkMode')}</Text>
                  <Text style={{ fontSize: 14, color: theme.secondaryText, marginTop: 4 }}>
                    {t('displaySettings.darkModeDesc')}
                  </Text>
                </View>
              </View>
              {!isLoading && (
                <Switch
                  value={darkModeEnabled}
                  onValueChange={handleDarkModeToggle}
                  trackColor={{ false: colorScheme === 'dark' ? "#4B5563" : "#D1D5DB", true: theme.primary }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={colorScheme === 'dark' ? "#4B5563" : "#D1D5DB"}
                />
              )}
            </View>
          </View>

          {/* Info Section */}
          <View className="mt-4 px-4">
            <View className="flex-row items-start">
              <Ionicons name="information-circle-outline" size={20} color={theme.gray400} />
              <Text style={{ fontSize: 14, color: theme.secondaryText, marginLeft: 8, flex: 1 }}>
                {t('displaySettings.darkModeInfo')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});


