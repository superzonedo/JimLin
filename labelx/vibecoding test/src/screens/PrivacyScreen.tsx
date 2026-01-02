import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "../types/navigation";

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

export default function PrivacyScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  
  const [analytics, setAnalytics] = useState(true);

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
          <Text className="text-lg font-semibold text-[#001858] ml-4">隱私與安全</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Privacy Settings */}
        <View className="mt-6 px-6">
          <Text className="text-sm font-semibold text-gray-500 mb-3 ml-2">數據收集</Text>
          <View className="bg-white rounded-3xl overflow-hidden" style={styles.card}>
            {/* Analytics */}
            <View className="px-5 py-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-base font-medium text-[#001858] mb-1">使用數據分析</Text>
                  <Text className="text-sm text-gray-600">幫助我們改善應用體驗</Text>
                </View>
                <Switch
                  value={analytics}
                  onValueChange={setAnalytics}
                  trackColor={{ false: "#E5E7EB", true: "#2CB67D" }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Legal Documents */}
        <View className="mt-6 px-6">
          <Text className="text-sm font-semibold text-gray-500 mb-3 ml-2">法律條款</Text>
          <View className="bg-white rounded-3xl overflow-hidden" style={styles.card}>
            <Pressable 
              onPress={() => navigation.navigate("PrivacyPolicy")}
              className="px-5 py-4 border-b border-gray-100 flex-row items-center justify-between"
            >
              <Text className="text-base text-[#001858]">隱私政策</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
            
            <Pressable 
              onPress={() => navigation.navigate("TermsOfService")}
              className="px-5 py-4 border-b border-gray-100 flex-row items-center justify-between"
            >
              <Text className="text-base text-[#001858]">服務條款</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>

            <Pressable 
              onPress={() => navigation.navigate("CookiePolicy")}
              className="px-5 py-4 flex-row items-center justify-between"
            >
              <Text className="text-base text-[#001858]">Cookie 政策</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          </View>
        </View>

        {/* Info Note */}
        <View className="mt-6 mx-6 bg-green-50 rounded-2xl p-4">
          <View className="flex-row">
            <Ionicons name="shield-checkmark" size={20} color="#2CB67D" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-semibold text-gray-800 mb-1">您的隱私很重要</Text>
              <Text className="text-sm text-gray-700 leading-5">
                我們致力於保護您的個人資料，所有數據都經過加密處理。
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
