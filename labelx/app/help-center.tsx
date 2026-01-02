import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeBack } from "@/utils/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

export default function HelpCenterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const safeBack = useSafeBack();
  const { t, language } = useLanguage();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const faqCategories = [
    {
      title: t('helpCenter.basicFeatures'),
      icon: "help-circle" as const,
      color: "#3B82F6",
      items: [
        {
          id: 1,
          question: t('helpCenter.howToScan'),
          answer: t('helpCenter.howToScanAnswer')
        },
        {
          id: 2,
          question: t('helpCenter.howScoreCalculated'),
          answer: t('helpCenter.howScoreCalculatedAnswer')
        },
        {
          id: 3,
          question: t('helpCenter.canUploadPhoto'),
          answer: t('helpCenter.canUploadPhotoAnswer')
        }
      ]
    },
    {
      title: t('helpCenter.advancedFeatures'),
      icon: "star" as const,
      color: "#F59E0B",
      items: [
        {
          id: 4,
          question: t('helpCenter.whatIsAllergenAlert'),
          answer: t('helpCenter.whatIsAllergenAlertAnswer')
        },
        {
          id: 5,
          question: t('helpCenter.howToViewHistory'),
          answer: t('helpCenter.howToViewHistoryAnswer')
        },
        {
          id: 6,
          question: t('helpCenter.canFavoriteProduct'),
          answer: t('helpCenter.canFavoriteProductAnswer')
        }
      ]
    },
    {
      title: t('helpCenter.accountAndSubscription'),
      icon: "card" as const,
      color: "#2CB67D",
      items: [
        {
          id: 7,
          question: t('helpCenter.proBenefits'),
          answer: t('helpCenter.proBenefitsAnswer')
        },
        {
          id: 8,
          question: t('helpCenter.howToUpgradePro'),
          answer: t('helpCenter.howToUpgradeProAnswer')
        },
        {
          id: 9,
          question: t('helpCenter.canCancelSubscription'),
          answer: t('helpCenter.canCancelSubscriptionAnswer')
        }
      ]
    },
    {
      title: t('helpCenter.troubleshooting'),
      icon: "warning" as const,
      color: "#EF4444",
      items: [
        {
          id: 10,
          question: t('helpCenter.scanResultInaccurate'),
          answer: t('helpCenter.scanResultInaccurateAnswer')
        },
        {
          id: 11,
          question: t('helpCenter.whySomeIngredientsNotRecognized'),
          answer: t('helpCenter.whySomeIngredientsNotRecognizedAnswer')
        },
        {
          id: 12,
          question: t('helpCenter.appCrashOrLag'),
          answer: t('helpCenter.appCrashOrLagAnswer')
        }
      ]
    }
  ];

  const toggleFAQ = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
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
          <Text style={{ fontSize: 18, fontWeight: '600', color: theme.primaryText, marginLeft: 16 }}>{t('helpCenter.title')}</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* FAQ Categories */}
        {faqCategories.map((category, categoryIndex) => (
          <View key={categoryIndex} className="mt-6 px-6">
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginLeft: 8 }}>
              <View 
                style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 8, backgroundColor: category.color + "20" }}
              >
                <Ionicons name={category.icon} size={18} color={category.color} />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.primaryText }}>{category.title}</Text>
            </View>
            <View style={[styles.card, { backgroundColor: theme.cardBackground, borderRadius: 24, overflow: 'hidden' }]}>
              {category.items.map((item, index) => (
                <View key={item.id}>
                  <Pressable
                    onPress={() => toggleFAQ(item.id)}
                    style={{ paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: index < category.items.length - 1 && expandedId !== item.id ? 1 : 0, borderBottomColor: theme.cardBorder }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ flex: 1, fontSize: 16, fontWeight: '500', color: theme.primaryText, marginRight: 12 }}>
                        {item.question}
                      </Text>
                      <Ionicons
                        name={expandedId === item.id ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={theme.secondaryText}
                      />
                    </View>
                    {expandedId === item.id && (
                      <Text style={{ fontSize: 14, color: theme.secondaryText, marginTop: 12, lineHeight: 20 }}>
                        {item.answer}
                      </Text>
                    )}
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        ))}
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

