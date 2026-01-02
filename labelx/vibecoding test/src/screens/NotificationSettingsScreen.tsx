import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function NotificationSettingsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const [pushEnabled, setPushEnabled] = useState(true);
  const [scanReminder, setScanReminder] = useState(true);

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      {/* Header */}
      <View
        style={{ paddingTop: insets.top }}
        className="bg-white border-b border-gray-200"
      >
        <View className="flex-row items-center px-6 py-4">
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </Pressable>
          <Text className="text-lg font-semibold text-[#001858] ml-4">通知設定</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Push Notifications */}
        <View className="mt-6 px-6">
          <View className="bg-white rounded-3xl overflow-hidden" style={styles.card}>
            <View className="px-5 py-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center mb-1">
                    <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3">
                      <Ionicons name="notifications" size={18} color="#3B82F6" />
                    </View>
                    <Text className="text-base font-semibold text-[#001858]">推播通知</Text>
                  </View>
                  <Text className="text-sm text-gray-600 ml-11">接收所有通知提醒</Text>
                </View>
                <Switch
                  value={pushEnabled}
                  onValueChange={setPushEnabled}
                  trackColor={{ false: "#E5E7EB", true: "#2CB67D" }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Notification Types */}
        <View className="mt-6 px-6">
          <Text className="text-sm font-semibold text-gray-500 mb-3 ml-2">通知類型</Text>
          <View className="bg-white rounded-3xl overflow-hidden" style={styles.card}>
            {/* Scan Reminder */}
            <View className="px-5 py-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-base font-medium text-[#001858] mb-1">掃描提醒</Text>
                  <Text className="text-sm text-gray-600">每日提醒您掃描食品標籤</Text>
                </View>
                <Switch
                  value={scanReminder}
                  onValueChange={setScanReminder}
                  trackColor={{ false: "#E5E7EB", true: "#2CB67D" }}
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
