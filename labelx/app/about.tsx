import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Alert, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeBack } from "@/utils/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const safeBack = useSafeBack();
  const { t, language } = useLanguage();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckUpdate = async () => {
    setIsChecking(true);
    // Mock update check
    setTimeout(() => {
      setIsChecking(false);
      Alert.alert(
        t('about.latestVersion'),
        t('about.latestVersionMessage'),
        [{ text: t('about.ok'), style: "default" }]
      );
    }, 1000);
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
          <Text style={{ fontSize: 18, fontWeight: '600', color: theme.primaryText, marginLeft: 16 }}>{t('profile.about')}</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* App Logo & Info */}
        <View className="mt-8 items-center px-6">
          <View style={[styles.logoCard, { backgroundColor: theme.cardBackground, borderRadius: 24, width: 96, height: 96, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }]}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={{ width: 64, height: 64 }}
              resizeMode="contain"
            />
          </View>
          <Text style={{ fontSize: 24, fontWeight: '700', color: theme.primaryText, marginBottom: 8 }}>Label Dog</Text>
          <Text style={{ fontSize: 16, color: theme.secondaryText, marginBottom: 4 }}>{t('about.version')} 1.0.0</Text>
          <View style={{ backgroundColor: colorScheme === 'dark' ? '#064E3B' : '#D1FAE5', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 9999, marginTop: 8 }}>
            <Text style={{ color: colorScheme === 'dark' ? '#6EE7B7' : '#047857', fontWeight: '600', fontSize: 14 }}>{t('about.latestVersion')}</Text>
          </View>
        </View>

        {/* Mission Statement */}
        <View className="mt-8 mx-6">
          <LinearGradient
            colors={["#2CB67D", "#249C6A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.missionCard}
          >
            <Ionicons name="heart" size={32} color="white" style={{ marginBottom: 12 }} />
            <Text className="text-white text-xl font-bold mb-3">{t('about.ourMission')}</Text>
            <Text className="text-white/90 text-base leading-6">
              {t('about.missionDescription')}
            </Text>
          </LinearGradient>
        </View>

        {/* Features */}
        <View className="mt-6 px-6">
          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.primaryText, marginBottom: 16 }}>{t('about.coreFeatures')}</Text>
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderRadius: 24, padding: 20 }]}>
            {[
              { icon: "scan", text: t('about.aiScan'), color: "#3B82F6" },
              { icon: "analytics", text: t('about.healthScoreAnalysis'), color: "#2CB67D" },
              { icon: "warning", text: t('about.riskIngredientAlert'), color: "#FB7185" },
              { icon: "bar-chart", text: t('about.nutritionChart'), color: "#F59E0B" },
            ].map((feature, index) => (
              <View
                key={index}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: index < 3 ? 1 : 0, borderBottomColor: theme.cardBorder }}
              >
                <View
                  style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: feature.color + "20" }}
                >
                  <Ionicons name={feature.icon as any} size={20} color={feature.color} />
                </View>
                <Text style={{ fontSize: 16, color: theme.primaryText, marginLeft: 16 }}>{feature.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Check for Updates */}
        <View className="mt-6 px-6">
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderRadius: 24, overflow: 'hidden' }]}>
            <Pressable 
              style={{ paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
              onPress={handleCheckUpdate}
              disabled={isChecking}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '500', color: theme.primaryText, marginBottom: 4 }}>{t('about.checkUpdate')}</Text>
                <Text style={{ fontSize: 14, color: theme.secondaryText }}>{t('about.ensureLatestVersion')}</Text>
              </View>
              {isChecking ? (
                <ActivityIndicator color={theme.primary} />
              ) : (
                <Ionicons name="refresh" size={24} color={theme.primary} />
              )}
            </Pressable>
          </View>
        </View>

        {/* Copyright */}
        <View className="mt-8 px-6 items-center">
          <Text style={{ fontSize: 14, color: theme.secondaryText, textAlign: 'center', lineHeight: 20 }}>
            © 2025 Label Dog. All rights reserved.{"\n"}
            Made with ❤️ for healthier living
          </Text>
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
  logoCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  missionCard: {
    borderRadius: 24,
    padding: 24,
    shadowColor: "#2CB67D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonPressed: {
    opacity: 0.7,
  },
});

