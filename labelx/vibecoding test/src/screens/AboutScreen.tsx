import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Image, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import UpdateModal from "../components/UpdateModal";
import { checkForUpdates, openUpdateLink, getCurrentVersion } from "../utils/updateChecker";

export default function AboutScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const [isChecking, setIsChecking] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<{
    latestVersion: string;
    currentVersion: string;
    releaseNotes: string;
    updateUrl: string;
    isForceUpdate: boolean;
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCheckUpdate = async () => {
    setIsChecking(true);
    try {
      const result = await checkForUpdates();
      
      if (result.hasUpdate) {
        setUpdateInfo({
          latestVersion: result.latestVersion,
          currentVersion: result.currentVersion,
          releaseNotes: result.releaseNotes || "更新內容請查看應用商店",
          updateUrl: result.updateUrl || "",
          isForceUpdate: result.isForceUpdate || false,
        });
        setShowUpdateModal(true);
      } else {
        Alert.alert(
          "已是最新版本",
          `您目前使用的版本 ${result.currentVersion} 已經是最新版本`,
          [{ text: "確定", style: "default" }]
        );
      }
    } catch (error) {
      Alert.alert(
        "檢查失敗",
        error instanceof Error ? error.message : "無法檢查更新，請稍後再試",
        [{ text: "確定", style: "default" }]
      );
    } finally {
      setIsChecking(false);
    }
  };

  const handleUpdate = async () => {
    if (!updateInfo?.updateUrl) return;
    
    setIsUpdating(true);
    try {
      await openUpdateLink(updateInfo.updateUrl);
      // Keep modal open for force updates, close for optional updates
      if (!updateInfo.isForceUpdate) {
        setShowUpdateModal(false);
      }
    } catch (error) {
      Alert.alert(
        "更新失敗",
        "無法打開應用商店，請稍後再試",
        [{ text: "確定", style: "default" }]
      );
    } finally {
      setIsUpdating(false);
    }
  };

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
          <Text className="text-lg font-semibold text-[#001858] ml-4">關於 LabelX</Text>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* App Logo & Info */}
        <View className="mt-8 items-center px-6">
          <View className="w-24 h-24 rounded-3xl bg-white items-center justify-center mb-4" style={styles.logoCard}>
            <Image
              source={require("../../assets/logo.png")}
              style={{ width: 64, height: 64 }}
              resizeMode="contain"
            />
          </View>
          <Text className="text-2xl font-bold text-[#001858] mb-2">LabelX</Text>
          <Text className="text-base text-gray-600 mb-1">版本 {getCurrentVersion()}</Text>
          <View className="bg-green-100 px-4 py-1.5 rounded-full mt-2">
            <Text className="text-green-700 font-semibold text-sm">最新版本</Text>
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
            <Text className="text-white text-xl font-bold mb-3">我們的使命</Text>
            <Text className="text-white/90 text-base leading-6">
              讓每個人都能輕鬆了解食品成分，做出更健康的飲食選擇。透過 AI 技術，我們致力於打造最智能、最易用的食品標籤分析工具。
            </Text>
          </LinearGradient>
        </View>

        {/* Features */}
        <View className="mt-6 px-6">
          <Text className="text-lg font-bold text-[#001858] mb-4">核心功能</Text>
          <View className="bg-white rounded-3xl p-5" style={styles.card}>
            {[
              { icon: "scan", text: "AI 智能掃描", color: "#3B82F6" },
              { icon: "analytics", text: "健康評分分析", color: "#2CB67D" },
              { icon: "warning", text: "風險成分警示", color: "#FB7185" },
              { icon: "bar-chart", text: "營養數據圖表", color: "#F59E0B" },
            ].map((feature, index) => (
              <View
                key={index}
                className="flex-row items-center py-3"
                style={index < 3 ? styles.featureBorder : {}}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: feature.color + "20" }}
                >
                  <Ionicons name={feature.icon as any} size={20} color={feature.color} />
                </View>
                <Text className="text-base text-gray-800 ml-4">{feature.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Check for Updates */}
        <View className="mt-6 px-6">
          <View className="bg-white rounded-3xl overflow-hidden" style={styles.card}>
            <Pressable 
              className="px-5 py-4 flex-row items-center justify-between"
              onPress={handleCheckUpdate}
              disabled={isChecking}
              style={({ pressed }) => [pressed && styles.buttonPressed]}
            >
              <View className="flex-1">
                <Text className="text-base font-medium text-[#001858] mb-1">檢查更新</Text>
                <Text className="text-sm text-gray-600">確保使用最新版本</Text>
              </View>
              {isChecking ? (
                <ActivityIndicator color="#2CB67D" />
              ) : (
                <Ionicons name="refresh" size={24} color="#2CB67D" />
              )}
            </Pressable>
          </View>
        </View>

        {/* Copyright */}
        <View className="mt-8 px-6 items-center">
          <Text className="text-sm text-gray-500 text-center leading-6">
            © 2025 LabelX. All rights reserved.{"\n"}
            Made with ❤️ for healthier living
          </Text>
        </View>
      </ScrollView>

      {/* Update Modal */}
      {updateInfo && (
        <UpdateModal
          visible={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          onUpdate={handleUpdate}
          latestVersion={updateInfo.latestVersion}
          currentVersion={updateInfo.currentVersion}
          releaseNotes={updateInfo.releaseNotes}
          isForceUpdate={updateInfo.isForceUpdate}
          isUpdating={isUpdating}
        />
      )}
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
  featureBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  buttonPressed: {
    opacity: 0.7,
  },
});
