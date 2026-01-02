import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useFocusEffect } from "expo-router";
import React, { useState, useCallback } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFoodScanStore } from "../../state/foodScanStore";
import { useUserStore } from "../../state/userStore";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, language } = useLanguage();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const { isLoggedIn, userName, userEmail, stats, setLoggedIn } = useUserStore((s) => ({
    isLoggedIn: s.isLoggedIn,
    userName: s.userName,
    userEmail: s.userEmail,
    stats: s.stats,
    setLoggedIn: s.setLoggedIn,
  }));
  const scanHistory = useFoodScanStore((s) => s.scanHistory);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // 監聽語言變化，強制重新渲染
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [language]);

  // 當頁面獲得焦點時，強制重新渲染以更新語言
  useFocusEffect(
    useCallback(() => {
      // 當頁面重新獲得焦點時，觸發重新渲染
      setRefreshKey(prev => prev + 1);
    }, [language])
  );

  // 監聽 Firebase Auth 狀態變化，同步用戶信息
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 如果 Firebase 有用戶但 store 沒有，同步信息
        if (!isLoggedIn || userName === "用戶") {
          const displayName = user.displayName || user.email?.split("@")[0] || "用戶";
          setLoggedIn(true, displayName, user.email || undefined);
        }
      } else {
        // 如果 Firebase 沒有用戶但 store 顯示已登入，登出
        if (isLoggedIn) {
          setLoggedIn(false);
        }
      }
    });

    return () => unsubscribe();
  }, [isLoggedIn, userName, setLoggedIn]);

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
      // 登出 Firebase Auth
      await signOut(auth);
      // Clear login state and keep scan history
      setLoggedIn(false);
      setShowLogoutModal(false);
      // 可選：導航到登入頁面
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // 即使 Firebase 登出失敗，也清除本地狀態
      setLoggedIn(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <View key={`profile-${language}`} style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={colorScheme === 'dark' ? ["#1F2937", "#111827"] : ["#F1EFE7", "#E8E6DE"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top }}
        >
          <View className="px-6 pb-8">
            {/* Top Bar */}
            <View className="flex-row items-center justify-between mb-4">
              <View style={{ width: 32, height: 32 }} />
              <Pressable 
                onPress={() => router.push("/onboarding")}
                style={{ backgroundColor: colorScheme === 'dark' ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)', padding: 8, borderRadius: 9999 }}
              >
                <Ionicons name="clipboard-outline" size={20} color={theme.primaryText} />
              </Pressable>
            </View>

            {/* User Profile Card */}
            <View style={{ backgroundColor: colorScheme === 'dark' ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)', borderRadius: 24, padding: 20 }}>
              <View className="flex-row items-center">
                <View style={styles.avatarContainer}>
                  <LinearGradient
                    colors={colorScheme === 'dark' ? ["#374151", "#4B5563"] : ["#FFFFFF", "#F3F4F6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.avatar}
                  >
                    <Ionicons name="person" size={36} color={theme.primaryText} />
                  </LinearGradient>
                </View>
                <View className="ml-4 flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text style={{ fontSize: 24, fontWeight: '700', color: theme.primaryText }}>
                      {isLoggedIn ? userName : t('profile.guestUser')}
                    </Text>
                  </View>
                  {isLoggedIn && userEmail && (
                    <Text style={{ fontSize: 14, color: theme.secondaryText, marginTop: 4 }}>
                      {userEmail}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Menu Sections */}
        <View className="px-6 mt-6">
          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.primaryText, marginBottom: 12 }}>{t('profile.account')}</Text>
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderRadius: 24, overflow: 'hidden' }]}>
            {!isLoggedIn && (
              <Pressable
                style={[styles.menuItem, { borderBottomWidth: 1, borderBottomColor: theme.cardBorder }]}
                onPress={() => router.push("/login")}
              >
                <View className="flex-row items-center flex-1">
                  <View style={[styles.iconContainer, { backgroundColor: colorScheme === 'dark' ? '#7F1D1D' : "#FFE5DC" }]}>
                    <Ionicons name="log-in-outline" size={22} color={theme.primaryText} />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text style={{ fontSize: 16, color: theme.primaryText, fontWeight: '600' }}>{t('profile.loginRegister')}</Text>
                    <Text style={{ fontSize: 12, color: theme.secondaryText, marginTop: 2 }}>{t('profile.enjoyFullFeatures')}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
              </Pressable>
            )}
            <Pressable
              style={styles.menuItem}
              onPress={() => router.push("/settings")}
            >
              <View className="flex-row items-center flex-1">
                <View style={[styles.iconContainer, { backgroundColor: colorScheme === 'dark' ? '#1E3A8A' : "#E0F2FE" }]}>
                  <Ionicons name="person-circle-outline" size={24} color={theme.info} />
                </View>
                <View className="flex-1 ml-3">
                  <Text style={{ fontSize: 16, color: theme.primaryText, fontWeight: '600' }}>{t('profile.personalHealthSettings')}</Text>
                  <Text style={{ fontSize: 12, color: theme.secondaryText, marginTop: 2 }}>{t('profile.customizeGoals')}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
            </Pressable>
          </View>
        </View>

        {/* General Section */}
        <View className="px-6 mt-6">
          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.primaryText, marginBottom: 12 }}>{t('profile.general')}</Text>
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderRadius: 24, overflow: 'hidden' }]}>
            <Pressable 
              style={[styles.menuItem, { borderBottomWidth: 1, borderBottomColor: theme.cardBorder }]}
              onPress={() => router.push("/display-settings")}
            >
              <View className="flex-row items-center flex-1">
                <View style={[styles.iconContainer, { backgroundColor: theme.gray100 }]}>
                  <Ionicons name="color-palette-outline" size={22} color={theme.secondaryText} />
                </View>
                <Text style={{ fontSize: 16, color: theme.primaryText, marginLeft: 12 }}>{t('profile.pageSettings')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
            </Pressable>
            <Pressable 
              style={[styles.menuItem, { borderBottomWidth: 1, borderBottomColor: theme.cardBorder }]}
              onPress={() => router.push("/privacy")}
            >
              <View className="flex-row items-center flex-1">
                <View style={[styles.iconContainer, { backgroundColor: theme.gray100 }]}>
                  <Ionicons name="shield-checkmark-outline" size={22} color={theme.secondaryText} />
                </View>
                <Text style={{ fontSize: 16, color: theme.primaryText, marginLeft: 12 }}>{t('profile.privacyAndSecurity')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
            </Pressable>
            <Pressable 
              style={[styles.menuItem, { borderBottomWidth: 1, borderBottomColor: theme.cardBorder }]}
              onPress={() => router.push("/help-center")}
            >
              <View className="flex-row items-center flex-1">
                <View style={[styles.iconContainer, { backgroundColor: theme.gray100 }]}>
                  <Ionicons name="help-circle-outline" size={22} color={theme.secondaryText} />
                </View>
                <Text style={{ fontSize: 16, color: theme.primaryText, marginLeft: 12 }}>{t('profile.helpCenter')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
            </Pressable>
            <Pressable 
              style={[styles.menuItem, { borderBottomWidth: 1, borderBottomColor: theme.cardBorder }]}
              onPress={() => router.push("/language-settings")}
            >
              <View className="flex-row items-center flex-1">
                <View style={[styles.iconContainer, { backgroundColor: theme.gray100 }]}>
                  <Ionicons name="language-outline" size={22} color={theme.secondaryText} />
                </View>
                <Text style={{ fontSize: 16, color: theme.primaryText, marginLeft: 12 }}>{t('profile.languageSettings')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
            </Pressable>
            <Pressable 
              style={styles.menuItem}
              onPress={() => router.push("/about")}
            >
              <View className="flex-row items-center flex-1">
                <View style={[styles.iconContainer, { backgroundColor: theme.gray100 }]}>
                  <Ionicons name="information-circle-outline" size={22} color={theme.secondaryText} />
                </View>
                <Text style={{ fontSize: 16, color: theme.primaryText, marginLeft: 12 }}>{t('profile.about')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
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
              <Text style={styles.logoutText}>{t('profile.logout')}</Text>
            </Pressable>
          </View>
        )}

        {/* App Info */}
        <View className="px-6 mt-8 mb-6 items-center">
          <Image
            source={require("@/assets/images/logo.png")}
            style={{ width: 48, height: 48, marginBottom: 12, opacity: 0.5 }}
            resizeMode="contain"
          />
          <Text className="text-center text-sm font-semibold text-gray-500">Label Dog v1.0.0</Text>
          <Text className="text-center text-xs text-gray-400 mt-2">
            Label Inspection
          </Text>
          <Text className="text-center text-xs text-gray-400 mt-1">
            © 2025 Label Dog. All rights reserved.
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
          <Pressable style={[styles.modalContent, { backgroundColor: theme.cardBackground }]} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalIconContainer, { backgroundColor: colorScheme === 'dark' ? '#7F1D1D' : '#FEE2E2' }]}>
              <Ionicons name="log-out-outline" size={32} color={theme.error} />
            </View>
            <Text style={[styles.modalTitle, { color: theme.primaryText }]}>{t('profile.confirmLogout')}</Text>
            <Text style={[styles.modalSubtitle, { color: theme.secondaryText }]}>
              {t('profile.logoutMessage')}
            </Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.cancelButton, { backgroundColor: theme.gray100 }]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.secondaryText }]}>{t('profile.cancel')}</Text>
              </Pressable>
              <Pressable
                style={styles.confirmButton}
                onPress={handleLogout}
              >
                <Text style={styles.confirmButtonText}>{t('profile.confirmLogoutButton')}</Text>
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
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
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
