import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ProfileStackParamList } from "../types/navigation";
import { useSubscriptionStore } from "../state/subscriptionStore";
import Animated, { FadeInDown } from "react-native-reanimated";

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

export default function SubscriptionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { isPremium, setSubscription } = useSubscriptionStore();
  const [selectedPlan, setSelectedPlan] = useState<"1month" | "12months">("12months");

  const features = [
    { icon: "close-circle", text: "無廣告體驗", color: "#FB7185" },
    { icon: "notifications", text: "過敏原提醒", color: "#FBBF24" },
    { icon: "bar-chart", text: "進階營養分析", color: "#2CB67D" },
    { icon: "target", text: "個人健康目標", color: "#C084FC" },
  ];

  const handleSubscribe = () => {
    // This is now a legacy screen - redirect to new PaywallScreen
    // Or keep as subscription management screen
    const expiresAt = new Date();
    if (selectedPlan === "1month") {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    setSubscription(selectedPlan, expiresAt);
    Alert.alert(
      "訂閱成功！",
      `您已成功訂閱${selectedPlan === "1month" ? "1 個月" : "年"}度方案`,
      [
        {
          text: "確定",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-[#FFFFFF]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{ paddingTop: insets.top }}
          className="bg-gradient-to-b from-yellow-400 to-orange-500 px-6 pb-8"
        >
          <Pressable onPress={() => navigation.goBack()} className="mb-4">
            <Ionicons name="close" size={28} color="white" />
          </Pressable>
          <Text className="text-3xl font-bold text-white mb-2">升級至高級版</Text>
          <Text className="text-lg text-white/90">解鎖所有功能，享受完整體驗</Text>
        </View>

        {/* Features List */}
        <View className="px-6 -mt-4">
          <View className="bg-[#FFFFFF] rounded-3xl p-6" style={styles.card}>
            <Text className="text-xl font-bold text-[#001858] mb-4">高級功能</Text>
            {features.map((feature, index) => (
              <Animated.View
                key={index}
                entering={FadeInDown.delay(index * 100).duration(400)}
                className="flex-row items-center mb-4"
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: feature.color + "20" }}
                >
                  <Ionicons name={feature.icon as any} size={20} color={feature.color} />
                </View>
                <Text className="text-base text-gray-800 ml-4 flex-1">{feature.text}</Text>
                <Ionicons name="checkmark-circle" size={24} color="#2CB67D" />
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Pricing Plans */}
        <View className="px-6 mt-6">
          <Text className="text-xl font-bold text-[#001858] mb-4">選擇方案</Text>

          {/* Yearly Plan */}
          <Pressable
            onPress={() => setSelectedPlan("12months")}
            className={`bg-[#FFFFFF] rounded-3xl p-6 mb-4 ${
              selectedPlan === "12months" ? "border-4 border-green-500" : ""
            }`}
            style={styles.card}
          >
            {selectedPlan === "12months" && (
              <View className="absolute top-4 right-4 bg-green-500 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-bold">已選擇</Text>
              </View>
            )}
            <View className="bg-yellow-100 self-start px-3 py-1 rounded-full mb-3">
              <Text className="text-yellow-700 text-xs font-bold">最超值</Text>
            </View>
            <View className="flex-row items-end mb-2">
              <Text className="text-4xl font-bold text-[#001858]">$39.99</Text>
              <Text className="text-lg text-gray-600 ml-2 mb-1">/年</Text>
            </View>
            <Text className="text-base text-green-600 font-semibold mb-2">
              相當於每月 $3.33，節省 83%
            </Text>
            <Text className="text-sm text-gray-600">一次付款，全年暢享所有功能</Text>
          </Pressable>

          {/* Monthly Plan */}
          <Pressable
            onPress={() => setSelectedPlan("1month")}
            className={`bg-[#FFFFFF] rounded-3xl p-6 ${
              selectedPlan === "1month" ? "border-4 border-green-500" : ""
            }`}
            style={styles.card}
          >
            {selectedPlan === "1month" && (
              <View className="absolute top-4 right-4 bg-green-500 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-bold">已選擇</Text>
              </View>
            )}
            <View className="flex-row items-end mb-2">
              <Text className="text-4xl font-bold text-[#001858]">$19.99</Text>
              <Text className="text-lg text-gray-600 ml-2 mb-1">/月</Text>
            </View>
            <Text className="text-sm text-gray-600">按月訂閱，隨時可取消</Text>
          </Pressable>
        </View>

        {/* Free vs Premium Comparison */}
        <View className="px-6 mt-8">
          <Text className="text-xl font-bold text-[#001858] mb-4">功能比較</Text>
          <View className="bg-[#FFFFFF] rounded-3xl overflow-hidden" style={styles.card}>
            <View className="flex-row border-b border-gray-200 p-4 bg-[#FFFFFF]">
              <Text className="flex-1 font-semibold text-[#001858]">功能</Text>
              <Text className="w-20 text-center font-semibold text-[#001858]">免費</Text>
              <Text className="w-20 text-center font-semibold text-yellow-600">高級</Text>
            </View>

            {[
              { feature: "基本掃描", free: true, premium: true },
              { feature: "健康評分", free: true, premium: true },
              { feature: "成分分析", free: true, premium: true },
              { feature: "掃描歷史", free: "限5筆", premium: "無限" },
              { feature: "無廣告", free: false, premium: true },
              { feature: "過敏原提醒", free: false, premium: true },
              { feature: "進階圖表", free: false, premium: true },
            ].map((item, index) => (
              <View
                key={index}
                className="flex-row items-center p-4 border-b border-gray-100"
              >
                <Text className="flex-1 text-gray-800">{item.feature}</Text>
                <View className="w-20 items-center">
                  {typeof item.free === "boolean" ? (
                    item.free ? (
                      <Ionicons name="checkmark" size={24} color="#2CB67D" />
                    ) : (
                      <Ionicons name="close" size={24} color="#FB7185" />
                    )
                  ) : (
                    <Text className="text-sm text-gray-600">{item.free}</Text>
                  )}
                </View>
                <View className="w-20 items-center">
                  {typeof item.premium === "boolean" ? (
                    item.premium ? (
                      <Ionicons name="checkmark" size={24} color="#2CB67D" />
                    ) : (
                      <Ionicons name="close" size={24} color="#FB7185" />
                    )
                  ) : (
                    <Text className="text-sm text-gray-600">{item.premium}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Terms */}
        <View className="px-6 mt-6">
          <Text className="text-xs text-center text-gray-500 leading-5">
            訂閱將自動續訂，除非在當前訂閱期結束前至少24小時關閉自動續訂。
            您可以隨時在帳戶設定中管理訂閱並關閉自動續訂。
          </Text>
          <View className="flex-row items-center justify-center mt-4">
            <Pressable className="mx-2">
              <Text className="text-sm text-blue-600">服務條款</Text>
            </Pressable>
            <Text className="text-gray-400">•</Text>
            <Pressable className="mx-2">
              <Text className="text-sm text-blue-600">隱私政策</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Subscribe Button */}
      <View
        style={{
          paddingBottom: insets.bottom + 20,
          paddingTop: 16,
        }}
        className="absolute bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-gray-200 px-6"
      >
        {isPremium ? (
          <View className="bg-green-100 py-4 rounded-full items-center">
            <Text className="text-[#001858] font-bold text-lg">您已是高級會員</Text>
          </View>
        ) : (
          <Pressable
            onPress={handleSubscribe}
            className="bg-gradient-to-r from-green-500 to-emerald-600 py-4 rounded-full items-center"
            style={styles.subscribeButton}
          >
            <Text className="text-white font-bold text-lg">
              立即訂閱 {selectedPlan === "1month" ? "$19.99/月" : "$39.99/年"}
            </Text>
          </Pressable>
        )}
        <Pressable className="mt-3">
          <Text className="text-center text-sm text-gray-600">恢復購買</Text>
        </Pressable>
      </View>
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
  subscribeButton: {
    shadowColor: "#2CB67D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
