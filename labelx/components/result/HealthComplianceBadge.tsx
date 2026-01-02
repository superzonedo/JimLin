import { Colors } from "@/constants/theme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface HealthComplianceBadgeProps {
  message?: string;
  subtitle?: string;
}

export default function HealthComplianceBadge({ 
  message,
  subtitle
}: HealthComplianceBadgeProps) {
  const { t } = useLanguage();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  
  return (
    <Animated.View entering={FadeInDown.delay(300).duration(400)} className="mx-6 mt-4">
      <View 
        style={{
          backgroundColor: colorScheme === 'dark' ? '#064E3B' : '#ECFDF5',
          borderRadius: 24,
          padding: 24,
          borderLeftWidth: 4,
          borderLeftColor: theme.success,
        }}
      >
        <View className="flex-row items-center">
          <View style={{
            width: 64,
            height: 64,
            backgroundColor: colorScheme === 'dark' ? '#065F46' : '#D1FAE5',
            borderRadius: 9999,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
          }}>
            <Ionicons name="shield-checkmark" size={32} color={theme.success} />
          </View>
          <View className="flex-1">
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '700', 
              color: theme.primaryText,
              marginBottom: 4,
            }}>
              {message || t('healthCompliance.title')}
            </Text>
            <Text style={{ 
              fontSize: 14, 
              color: theme.secondaryText,
              lineHeight: 20,
            }}>
              {subtitle || t('healthCompliance.subtitle')}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}
