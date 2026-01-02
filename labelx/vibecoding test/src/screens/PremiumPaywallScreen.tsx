import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  ImageBackground,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useSubscriptionStore } from "../state/subscriptionStore";
import { purchasePackage, getOfferings } from "../lib/revenuecatClient";
import type { PurchasesPackage } from "react-native-purchases";

interface PremiumPaywallScreenProps {
  onClose?: () => void;
  source?: "scan_result" | "profile" | "onboarding";
}

export default function PremiumPaywallScreen({ onClose }: PremiumPaywallScreenProps) {
  const navigation = useNavigation();
  const { isPremium } = useSubscriptionStore((s) => ({
    isPremium: s.isPremium,
  }));

  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [monthlyPackage, setMonthlyPackage] = useState<PurchasesPackage | null>(null);
  const [errorModal, setErrorModal] = useState({ visible: false, title: "", message: "" });
  const [successModal, setSuccessModal] = useState(false);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    setIsLoading(true);
    const result = await getOfferings();

    if (result.ok && result.data?.current) {
      const monthly = result.data.current.availablePackages.find(
        (pkg) => pkg.identifier === "$rc_monthly"
      );
      setMonthlyPackage(monthly || null);
    }

    setIsLoading(false);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigation.goBack();
    }
  };

  const handlePurchase = async () => {
    if (!monthlyPackage) {
      setErrorModal({
        visible: true,
        title: "錯誤",
        message: "無法載入訂閱方案，請稍後再試",
      });
      return;
    }

    setIsPurchasing(true);

    const result = await purchasePackage(monthlyPackage);

    if (result.ok) {
      // Update subscription store
      useSubscriptionStore.getState().syncFromRevenueCat();

      // Show success
      setSuccessModal(true);
      setTimeout(() => {
        setSuccessModal(false);
        // Navigate to Home tab after successful purchase
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "HomeTab" }],
          })
        );
      }, 2000);
    } else {
      if (result.reason !== "web_not_supported") {
        setErrorModal({
          visible: true,
          title: "購買失敗",
          message: "購買過程中發生錯誤，請稍後再試",
        });
      }
    }

    setIsPurchasing(false);
  };

  const handleRestorePurchases = async () => {
    setIsPurchasing(true);

    await useSubscriptionStore.getState().syncFromRevenueCat();

    const currentIsPremium = useSubscriptionStore.getState().isPremium;

    if (currentIsPremium) {
      setSuccessModal(true);
      setTimeout(() => {
        setSuccessModal(false);
        // Navigate to Home tab after successful restore
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "HomeTab" }],
          })
        );
      }, 2000);
    } else {
      setErrorModal({
        visible: true,
        title: "未找到購買記錄",
        message: "我們沒有找到與此帳號相關的購買記錄",
      });
    }

    setIsPurchasing(false);
  };

  const formatPrice = () => {
    if (!monthlyPackage) return "$4.99";
    return monthlyPackage.product.priceString;
  };

  const features = [
    {
      icon: "sparkles" as const,
      title: "個性化過敏原分析",
      description: "根據您的健康設定，精準檢測產品中的潛在過敏原",
    },
    {
      icon: "shield-checkmark" as const,
      title: "疾病風險警示",
      description: "針對您的健康狀況，智能分析成分對疾病的影響",
    },
    {
      icon: "trending-up" as const,
      title: "健康目標追蹤",
      description: "自動檢查產品是否符合您的個人健康目標",
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header with close button */}
      <SafeAreaView edges={["top"]} style={styles.header}>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#001858" />
        </Pressable>
      </SafeAreaView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <ImageBackground
            source={require("../../assets/logo.png")}
            style={styles.heroBackground}
            imageStyle={styles.heroBackgroundImage}
          >
            <LinearGradient
              colors={["rgba(44, 182, 125, 0.15)", "rgba(44, 182, 125, 0.05)"]}
              style={styles.heroGradient}
            >
              <View style={styles.premiumBadge}>
                <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                <Text style={styles.premiumBadgeText}>PREMIUM</Text>
              </View>

              <Text style={styles.heroTitle}>解鎖個性化健康分析</Text>
              <Text style={styles.heroSubtitle}>
                專為您的健康需求量身打造的智能掃描體驗
              </Text>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Ionicons name={feature.icon} size={28} color="#2CB67D" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
              <View style={styles.featureCheck}>
                <Ionicons name="checkmark-circle" size={20} color="#2CB67D" />
              </View>
            </View>
          ))}
        </View>

        {/* Free vs Premium Comparison */}
        <View style={styles.comparisonSection}>
          <Text style={styles.comparisonTitle}>功能比較</Text>

          <View style={styles.comparisonTable}>
            {/* Free Column */}
            <View style={styles.comparisonColumn}>
              <View style={styles.comparisonHeader}>
                <Text style={styles.comparisonHeaderText}>免費版</Text>
              </View>

              <View style={styles.comparisonItem}>
                <Ionicons name="checkmark" size={18} color="#2CB67D" />
                <Text style={styles.comparisonItemText}>基本掃描功能</Text>
              </View>

              <View style={styles.comparisonItem}>
                <Ionicons name="checkmark" size={18} color="#2CB67D" />
                <Text style={styles.comparisonItemText}>成分安全檢測</Text>
              </View>

              <View style={styles.comparisonItem}>
                <Ionicons name="close" size={18} color="#9CA3AF" />
                <Text style={[styles.comparisonItemText, styles.disabledText]}>
                  個性化分析
                </Text>
              </View>

              <View style={styles.comparisonItem}>
                <Ionicons name="close" size={18} color="#9CA3AF" />
                <Text style={[styles.comparisonItemText, styles.disabledText]}>
                  過敏原檢測
                </Text>
              </View>

              <View style={styles.comparisonItem}>
                <Ionicons name="close" size={18} color="#9CA3AF" />
                <Text style={[styles.comparisonItemText, styles.disabledText]}>
                  疾病風險警示
                </Text>
              </View>
            </View>

            {/* Premium Column */}
            <View style={[styles.comparisonColumn, styles.premiumColumn]}>
              <View style={[styles.comparisonHeader, styles.premiumHeader]}>
                <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                <Text style={styles.premiumHeaderText}>Premium</Text>
              </View>

              <View style={styles.comparisonItem}>
                <Ionicons name="checkmark" size={18} color="#2CB67D" />
                <Text style={styles.comparisonItemText}>基本掃描功能</Text>
              </View>

              <View style={styles.comparisonItem}>
                <Ionicons name="checkmark" size={18} color="#2CB67D" />
                <Text style={styles.comparisonItemText}>成分安全檢測</Text>
              </View>

              <View style={styles.comparisonItem}>
                <Ionicons name="checkmark" size={18} color="#2CB67D" />
                <Text style={[styles.comparisonItemText, styles.boldText]}>
                  個性化分析
                </Text>
              </View>

              <View style={styles.comparisonItem}>
                <Ionicons name="checkmark" size={18} color="#2CB67D" />
                <Text style={[styles.comparisonItemText, styles.boldText]}>
                  過敏原檢測
                </Text>
              </View>

              <View style={styles.comparisonItem}>
                <Ionicons name="checkmark" size={18} color="#2CB67D" />
                <Text style={[styles.comparisonItemText, styles.boldText]}>
                  疾病風險警示
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.pricingSection}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2CB67D" />
            </View>
          ) : (
            <View style={styles.pricingCard}>
              <View style={styles.pricingHeader}>
                <View>
                  <Text style={styles.pricingTitle}>Premium 訂閱</Text>
                  <Text style={styles.pricingSubtitle}>解鎖所有功能</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{formatPrice()}</Text>
                  <Text style={styles.pricePeriod}>/月</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Trust indicators */}
        <View style={styles.trustSection}>
          <View style={styles.trustItem}>
            <Ionicons name="shield-checkmark" size={16} color="#6B7280" />
            <Text style={styles.trustText}>安全透過 App Store 付款</Text>
          </View>
          <View style={styles.trustItem}>
            <Text style={styles.trustText}>隨時可取消訂閱</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomSection}>
        <Pressable
          onPress={handlePurchase}
          disabled={isPurchasing || isLoading}
          style={[
            styles.ctaButton,
            (isPurchasing || isLoading) && styles.ctaButtonDisabled,
          ]}
        >
          <LinearGradient
            colors={["#2CB67D", "#26A56A"]}
            style={styles.ctaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isPurchasing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                <Text style={styles.ctaButtonText}>開始使用 Premium</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>

        <Pressable onPress={handleRestorePurchases} disabled={isPurchasing} style={styles.restoreButton}>
          <Text style={styles.restoreButtonText}>恢復購買</Text>
        </Pressable>

        <Pressable style={styles.legalButton}>
          <Text style={styles.legalText}>隱私政策與使用條款</Text>
        </Pressable>
      </View>

      {/* Error Modal */}
      <Modal
        visible={errorModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setErrorModal({ ...errorModal, visible: false })}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setErrorModal({ ...errorModal, visible: false })}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="close-circle" size={40} color="#EF4444" />
            </View>
            <Text style={styles.modalTitle}>{errorModal.title}</Text>
            <Text style={styles.modalMessage}>{errorModal.message}</Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setErrorModal({ ...errorModal, visible: false })}
            >
              <Text style={styles.modalButtonText}>確定</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Success Modal */}
      <Modal visible={successModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalIconContainer, { backgroundColor: "#D1FAE5" }]}>
              <Ionicons name="checkmark-circle" size={40} color="#2CB67D" />
            </View>
            <Text style={styles.modalTitle}>歡迎加入 Premium！</Text>
            <Text style={styles.modalMessage}>您現在可以使用所有個性化健康分析功能</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroSection: {
    height: 280,
    marginBottom: 32,
  },
  heroBackground: {
    flex: 1,
  },
  heroBackgroundImage: {
    opacity: 0.08,
  },
  heroGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2CB67D",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
    gap: 6,
  },
  premiumBadgeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#001858",
    textAlign: "center",
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 16,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#001858",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  featureCheck: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  comparisonSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  comparisonTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#001858",
    marginBottom: 16,
    textAlign: "center",
  },
  comparisonTable: {
    flexDirection: "row",
    gap: 12,
  },
  comparisonColumn: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    overflow: "hidden",
  },
  premiumColumn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#2CB67D",
  },
  comparisonHeader: {
    backgroundColor: "#E5E7EB",
    paddingVertical: 12,
    alignItems: "center",
  },
  premiumHeader: {
    backgroundColor: "#2CB67D",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  comparisonHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },
  premiumHeaderText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  comparisonItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  comparisonItemText: {
    fontSize: 13,
    color: "#001858",
    flex: 1,
  },
  disabledText: {
    color: "#9CA3AF",
  },
  boldText: {
    fontWeight: "600",
  },
  pricingSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  pricingCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "#2CB67D",
  },
  pricingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#001858",
    marginBottom: 4,
  },
  pricingSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  price: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2CB67D",
  },
  pricePeriod: {
    fontSize: 16,
    color: "#6B7280",
    marginLeft: 4,
  },
  trustSection: {
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 8,
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  trustText: {
    fontSize: 12,
    color: "#6B7280",
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  ctaButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#2CB67D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaButtonDisabled: {
    opacity: 0.6,
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  ctaButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  restoreButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 12,
  },
  restoreButtonText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
  },
  legalButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  legalText: {
    color: "#9CA3AF",
    fontSize: 12,
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
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  modalMessage: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#2CB67D",
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
