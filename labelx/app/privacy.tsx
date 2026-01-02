import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeBack } from "@/utils/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

export default function PrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const safeBack = useSafeBack();
  const { t, language } = useLanguage();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  
  const [analytics, setAnalytics] = useState(true);

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
          <Text style={{ fontSize: 18, fontWeight: '600', color: theme.primaryText, marginLeft: 16 }}>{t('privacy.title')}</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Privacy Settings */}
        <View className="mt-6 px-6">
          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.secondaryText, marginBottom: 12, marginLeft: 8 }}>{t('privacy.dataCollection')}</Text>
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderRadius: 24, overflow: 'hidden' }]}>
            {/* Analytics */}
            <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, marginRight: 16 }}>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: theme.primaryText, marginBottom: 4 }}>{t('privacy.useAnalytics')}</Text>
                  <Text style={{ fontSize: 14, color: theme.secondaryText }}>{t('privacy.analyticsDesc')}</Text>
                </View>
                <Switch
                  value={analytics}
                  onValueChange={setAnalytics}
                  trackColor={{ false: colorScheme === 'dark' ? "#4B5563" : "#E5E7EB", true: theme.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Legal Documents */}
        <View className="mt-6 px-6">
          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.secondaryText, marginBottom: 12, marginLeft: 8 }}>{t('privacy.legalDocuments')}</Text>
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderRadius: 24, overflow: 'hidden' }]}>
            <Pressable 
              onPress={() => {
                console.log("Navigate to Privacy Policy");
              }}
              style={{ paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.cardBorder, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Text style={{ fontSize: 16, color: theme.primaryText }}>{t('privacy.privacyPolicy')}</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
            </Pressable>
            
            <Pressable 
              onPress={() => {
                console.log("Navigate to Terms of Service");
              }}
              style={{ paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.cardBorder, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Text style={{ fontSize: 16, color: theme.primaryText }}>{t('privacy.termsOfService')}</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
            </Pressable>

            <Pressable 
              onPress={() => {
                console.log("Navigate to Cookie Policy");
              }}
              style={{ paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Text style={{ fontSize: 16, color: theme.primaryText }}>{t('privacy.cookiePolicy')}</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
            </Pressable>
          </View>
        </View>

        {/* Info Note */}
        <View style={{ marginTop: 24, marginHorizontal: 24, backgroundColor: colorScheme === 'dark' ? '#064E3B' : '#D1FAE5', borderRadius: 16, padding: 16 }}>
          <View style={{ flexDirection: 'row' }}>
            <Ionicons name="shield-checkmark" size={20} color={theme.primary} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colorScheme === 'dark' ? '#6EE7B7' : '#047857', marginBottom: 4 }}>{t('privacy.privacyImportant')}</Text>
              <Text style={{ fontSize: 14, color: colorScheme === 'dark' ? '#A7F3D0' : '#065F46', lineHeight: 20 }}>
                {t('privacy.privacyDesc')}
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
});

