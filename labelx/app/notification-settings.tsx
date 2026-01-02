import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeBack } from "@/utils/navigation";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const safeBack = useSafeBack();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  
  const [pushEnabled, setPushEnabled] = useState(true);
  const [scanReminder, setScanReminder] = useState(true);

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
          <Text style={{ fontSize: 18, fontWeight: '600', color: theme.primaryText, marginLeft: 16 }}>通知設定</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Push Notifications */}
        <View className="mt-6 px-6">
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderRadius: 24, overflow: 'hidden' }]}>
            <View className="px-5 py-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center mb-1">
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colorScheme === 'dark' ? '#1E3A8A' : '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                      <Ionicons name="notifications" size={18} color={theme.info} />
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: theme.primaryText }}>推播通知</Text>
                  </View>
                  <Text style={{ fontSize: 14, color: theme.secondaryText, marginLeft: 44 }}>接收所有通知提醒</Text>
                </View>
                <Switch
                  value={pushEnabled}
                  onValueChange={setPushEnabled}
                  trackColor={{ false: colorScheme === 'dark' ? "#4B5563" : "#E5E7EB", true: theme.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Notification Types */}
        <View className="mt-6 px-6">
          <Text style={{ fontSize: 14, fontWeight: '600', color: theme.secondaryText, marginBottom: 12, marginLeft: 8 }}>通知類型</Text>
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderRadius: 24, overflow: 'hidden' }]}>
            {/* Scan Reminder */}
            <View className="px-5 py-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text style={{ fontSize: 16, fontWeight: '500', color: theme.primaryText, marginBottom: 4 }}>掃描提醒</Text>
                  <Text style={{ fontSize: 14, color: theme.secondaryText }}>每日提醒您掃描食品標籤</Text>
                </View>
                <Switch
                  value={scanReminder}
                  onValueChange={setScanReminder}
                  trackColor={{ false: colorScheme === 'dark' ? "#4B5563" : "#E5E7EB", true: theme.primary }}
                  thumbColor="#FFFFFF"
                  disabled={!pushEnabled}
                />
              </View>
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

