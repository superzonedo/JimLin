import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeBack } from "@/utils/navigation";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { useLanguage } from "@/contexts/LanguageContext";
import { type Language } from "@/utils/i18n";

export default function LanguageSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const safeBack = useSafeBack();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const { language, t, setLanguage } = useLanguage();
  
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);

  const languages: Array<{ id: Language; label: string; flag: string }> = [
    { id: "zh-TW", label: "繁體中文", flag: "🇹🇼" },
    { id: "zh-CN", label: "简体中文", flag: "🇨🇳" },
    { id: "en", label: "English", flag: "🇺🇸" },
  ];

  useEffect(() => {
    // 當 Context 中的語言變化時，更新本地狀態
    setSelectedLanguage(language);
  }, [language]);

  const handleLanguageSelect = async (langId: Language) => {
    // 無論是否相同，都執行切換，確保觸發更新
    await setLanguage(langId);
    setSelectedLanguage(langId);
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
          <Text style={{ fontSize: 18, fontWeight: '600', color: theme.primaryText, marginLeft: 16 }}>
            {t('languageSettings.title')}
          </Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 mt-6">
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderRadius: 24, overflow: 'hidden' }]}>
            {languages.map((lang, index) => {
              const isSelected = selectedLanguage === lang.id;
              return (
                <Pressable
                  key={lang.id}
                  onPress={() => handleLanguageSelect(lang.id)}
                  style={[
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 16,
                      backgroundColor: isSelected 
                        ? (colorScheme === 'dark' ? '#064E3B' : '#ECFDF5')
                        : 'transparent',
                    },
                    index < languages.length - 1 ? styles.itemBorder : {},
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Text style={{ fontSize: 24, marginRight: 12 }}>{lang.flag}</Text>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: '500',
                      color: isSelected 
                        ? (colorScheme === 'dark' ? '#6EE7B7' : '#059669')
                        : theme.primaryText,
                    }}>
                      {lang.label}
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={{
                      width: 24,
                      height: 24,
                      borderRadius: 9999,
                      backgroundColor: theme.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Ionicons name="checkmark" size={16} color="white" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="px-6 mt-4">
          <View style={{
            backgroundColor: colorScheme === 'dark' ? '#1E3A5F' : '#DBEAFE',
            borderRadius: 16,
            padding: 16,
          }}>
            <View className="flex-row">
              <Ionicons name="information-circle" size={20} color={theme.info} />
              <Text style={{
                fontSize: 14,
                color: colorScheme === 'dark' ? '#93C5FD' : '#1E40AF',
                marginLeft: 12,
                flex: 1,
                lineHeight: 20,
              }}>
                {t('languageSettings.changeLanguageNote')}
              </Text>
            </View>
          </View>
        </View>

        {/* Current Language Display */}
        <View className="px-6 mt-6">
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderRadius: 16, padding: 20 }]}>
            <Text style={{
              fontSize: 12,
              color: theme.gray500,
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 8,
            }}>
              {t('languageSettings.currentLanguage')}
            </Text>
            <View className="flex-row items-center">
              <Text style={{ fontSize: 32, marginRight: 12 }}>
                {languages.find(l => l.id === selectedLanguage)?.flag}
              </Text>
              <Text style={{
                fontSize: 20,
                fontWeight: '700',
                color: theme.primaryText,
              }}>
                {languages.find(l => l.id === selectedLanguage)?.label}
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
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
});

