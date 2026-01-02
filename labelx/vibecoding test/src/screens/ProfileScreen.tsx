import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Image, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { ProfileStackParamList } from "../types/navigation";
import { useUserStore } from "../state/userStore";
import { useFoodScanStore } from "../state/foodScanStore";
import { useLanguage } from "../i18n";

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { isLoggedIn, userName, stats, setLoggedIn, resetOnboarding } = useUserStore();
  const scanHistory = useFoodScanStore((s) => s.scanHistory);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { t } = useLanguage();

  // Calculate stats from scan history
  const totalScans = scanHistory.length;
  const avgScore =
    scanHistory.length > 0
      ? Math.round(
          scanHistory.reduce((sum, scan) => sum + scan.healthScore, 0) / scanHistory.length
        )
      : 0;
  const healthyCount = scanHistory.filter((scan) => scan.healthScore >= 71).length;
  const healthyPercentage = totalScans > 0 ? Math.round((healthyCount / totalScans) * 100) : 0;

  const handleLogout = async () => {
    try {
      // Clear login state and keep scan history
      setLoggedIn(false);

      // Clear current result only, keep scan history
      useFoodScanStore.setState({
        currentResult: null,
      });

      setShowLogoutModal(false);
    } catch (error) {
      console.error("Logout error:", error);
      setLoggedIn(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <View className="flex-1 bg-[#FFFFFF]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={["#F1EFE7", "#E8E6DE"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top }}
        >
          <View className="px-6 pb-8">
            {/* Top Bar */}
            <View className="flex-row items-center justify-between mt-4 mb-6">
              <Image
                source={require("../../assets/logo.png")}
                style={{ width: 32, height: 32 }}
                resizeMode="contain"
              />
              <Pressable 
                onPress={() => navigation.navigate("Settings")}
                className="bg-white/90 p-2 rounded-full"
              >
                <Ionicons name="settings-outline" size={24} color="#001858" />
              </Pressable>
            </View>

            {/* User Profile Card */}
            <View className="bg-white/80 backdrop-blur rounded-3xl p-5">
              <View className="flex-row items-center">
                <View style={styles.avatarContainer}>
                  <LinearGradient
                    colors={["#FFFFFF", "#F3F4F6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.avatar}
                  >
                    <Ionicons name="person" size={36} color="#001858" />
                  </LinearGradient>
                </View>
                <View className="ml-4 flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-2xl font-bold text-[#001858]">
                      {isLoggedIn ? userName : t.profile.guestUser}
                    </Text>
                  </View>
                </View>
              </View>
              
              {/* Quick Stats */}
              <View className="flex-row mt-5 pt-5 border-t border-gray-200">
                <View className="flex-1 items-center">
                  <Text className="text-2xl font-bold text-[#001858]">{totalScans}</Text>
                  <Text className="text-gray-600 text-xs mt-1">{t.profile.totalScans}</Text>
                </View>
                <View className="w-px bg-gray-200" />
                <View className="flex-1 items-center">
                  <Text className="text-2xl font-bold text-[#001858]">{avgScore}</Text>
                  <Text className="text-gray-600 text-xs mt-1">{t.profile.avgScore}</Text>
                </View>
                <View className="w-px bg-gray-200" />
                <View className="flex-1 items-center">
                  <Text className="text-2xl font-bold text-[#001858]">{stats.scanStreak}</Text>
                  <Text className="text-gray-600 text-xs mt-1">{t.profile.streakDays}</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Detailed Stats Cards */}
        <View className="px-6 mt-6">
          <Text className="text-lg font-bold text-[#001858] mb-3">{t.profile.healthData}</Text>
          <View className="flex-row justify-between mb-3">
            <View style={[styles.statCard, { flex: 1, marginRight: 6, backgroundColor: "#F3D2C1", padding: 20, alignItems: "center", justifyContent: "center" }]}>
              <Ionicons name="checkmark-circle" size={28} color="#001858" />
              <Text className="text-[#001858] text-3xl font-bold mt-2">{healthyPercentage}%</Text>
              <Text className="text-gray-600 text-xs mt-1">{t.profile.healthyProducts}</Text>
            </View>
            <View style={[styles.statCard, { flex: 1, marginLeft: 6, backgroundColor: "#F3D2C1", padding: 20, alignItems: "center", justifyContent: "center" }]}>
              <Ionicons name="flame" size={28} color="#2CB67D" />
              <Text className="text-[#001858] text-3xl font-bold mt-2">{stats.scanStreak}</Text>
              <Text className="text-gray-600 text-xs mt-1">{t.profile.consecutiveScans}</Text>
            </View>
          </View>
        </View>



        {/* Menu Sections */}
        <View className="px-6 mt-6">
          <Text className="text-lg font-bold text-[#001858] mb-3">{t.profile.account}</Text>
          <View className="bg-[#FFFFFF] rounded-3xl overflow-hidden" style={styles.card}>
            {!isLoggedIn && (
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  /* Mock login */
                }}
              >
                <View className="flex-row items-center flex-1">
                  <View style={[styles.iconContainer, { backgroundColor: "#FFE5DC" }]}>
                    <Ionicons name="log-in-outline" size={22} color="#001858" />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-base text-[#001858] font-semibold">{t.profile.loginRegister}</Text>
                    <Text className="text-xs text-gray-500 mt-0.5">{t.profile.enjoyFullFeatures}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </Pressable>
            )}

            <Pressable
              style={styles.menuItem}
              onPress={() => navigation.navigate("Settings")}
            >
              <View className="flex-row items-center flex-1">
                <View style={[styles.iconContainer, { backgroundColor: "#E0F2FE" }]}>
                  <Ionicons name="person-circle-outline" size={24} color="#0EA5E9" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-base text-[#001858] font-semibold">{t.profile.personalPreferences}</Text>
                  <Text className="text-xs text-gray-500 mt-0.5">{t.profile.customizeGoals}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>

          </View>
        </View>

        {/* General Section */}
        <View className="px-6 mt-6">
          <Text className="text-lg font-bold text-[#001858] mb-3">{t.profile.general}</Text>
          <View className="bg-[#FFFFFF] rounded-3xl overflow-hidden" style={styles.card}>
            <Pressable
              style={styles.menuItem}
              onPress={() => navigation.navigate("NotificationSettings")}
            >
              <View className="flex-row items-center flex-1">
                <View style={[styles.iconContainer, { backgroundColor: "#F3F4F6" }]}>
                  <Ionicons name="notifications-outline" size={22} color="#9CA3AF" />
                </View>
                <Text className="text-base text-[#001858] ml-3">{t.settings.notifications}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => navigation.navigate("Privacy")}
            >
              <View className="flex-row items-center flex-1">
                <View style={[styles.iconContainer, { backgroundColor: "#F3F4F6" }]}>
                  <Ionicons name="shield-checkmark-outline" size={22} color="#9CA3AF" />
                </View>
                <Text className="text-base text-[#001858] ml-3">{t.settings.privacy}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => navigation.navigate("HelpCenter")}
            >
              <View className="flex-row items-center flex-1">
                <View style={[styles.iconContainer, { backgroundColor: "#F3F4F6" }]}>
                  <Ionicons name="help-circle-outline" size={22} color="#9CA3AF" />
                </View>
                <Text className="text-base text-[#001858] ml-3">{t.settings.helpCenter}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => navigation.navigate("LanguageSettings")}
            >
              <View className="flex-row items-center flex-1">
                <View style={[styles.iconContainer, { backgroundColor: "#F3F4F6" }]}>
                  <Ionicons name="language-outline" size={22} color="#9CA3AF" />
                </View>
                <Text className="text-base text-[#001858] ml-3">{t.settings.language}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={() => navigation.navigate("About")}
            >
              <View className="flex-row items-center flex-1">
                <View style={[styles.iconContainer, { backgroundColor: "#F3F4F6" }]}>
                  <Ionicons name="information-circle-outline" size={22} color="#9CA3AF" />
                </View>
                <Text className="text-base text-[#001858] ml-3">{t.settings.about}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>

            <Pressable
              style={[styles.menuItem, { borderBottomWidth: 0 }]}
              onPress={() => resetOnboarding()}
            >
              <View className="flex-row items-center flex-1">
                <View style={[styles.iconContainer, { backgroundColor: "#FEF3C7" }]}>
                  <Ionicons name="refresh-outline" size={22} color="#F59E0B" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-base text-[#001858] font-semibold">{t.settings.restartOnboarding}</Text>
                  <Text className="text-xs text-gray-500 mt-0.5">{t.settings.restartOnboardingDesc}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </Pressable>
          </View>
        </View>

        {/* Logout Button - Only show when logged in */}
        {isLoggedIn && (
          <View className="px-6 mt-6">
            <Pressable
              style={styles.logoutButton}
              onPress={() => setShowLogoutModal(true)}
            >
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={styles.logoutText}>{t.profile.logout}</Text>
            </Pressable>
          </View>
        )}

        {/* App Info */}
        <View className="px-6 mt-8 mb-6 items-center">
          <Image
            source={require("../../assets/logo.png")}
            style={{ width: 48, height: 48, marginBottom: 12, opacity: 0.5 }}
            resizeMode="contain"
          />
          <Text className="text-center text-sm font-semibold text-gray-500">LabelX v1.0.0</Text>
          <Text className="text-center text-xs text-gray-400 mt-2">
            Label Inspection
          </Text>
          <Text className="text-center text-xs text-gray-400 mt-1">
            © 2025 LabelX. All rights reserved.
          </Text>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowLogoutModal(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="log-out-outline" size={32} color="#EF4444" />
            </View>
            <Text style={styles.modalTitle}>{t.profile.confirmLogout}</Text>
            <Text style={styles.modalSubtitle}>
              {t.profile.logoutMessage}
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelButtonText}>{t.common.cancel}</Text>
              </Pressable>
              <Pressable
                style={styles.confirmButton}
                onPress={handleLogout}
              >
                <Text style={styles.confirmButtonText}>{t.common.confirm}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  avatarContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  statCard: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statGradient: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  logoutText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#001858",
    marginBottom: 12,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
