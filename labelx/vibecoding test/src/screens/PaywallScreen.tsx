import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useSubscriptionStore } from "../state/subscriptionStore";
import { purchasePackage } from "../lib/revenuecatClient";
import type { PurchasesPackage } from "react-native-purchases";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

interface PaywallScreenProps {
  onClose?: () => void;
  source?: "scan_limit" | "feature_lock" | "profile" | "onboarding";
}

export default function PaywallScreen({ onClose, source }: PaywallScreenProps) {
  const navigation = useNavigation();
  const { offerings, isLoading, fetchOfferings: fetchOfferingsAction, handlePurchaseSuccess } = useSubscriptionStore();

  const [selectedPlan, setSelectedPlan] = useState<string>("$rc_annual");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, title: "", message: "" });
  const [successModal, setSuccessModal] = useState(false);

  useEffect(() => {
    if (!offerings) {
      fetchOfferingsAction();
    }
  }, []);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigation.goBack();
    }
  };

  const handlePurchase = async () => {
    if (!offerings?.current) {
      setErrorModal({
        visible: true,
        title: "錯誤",
        message: "無法載入訂閱方案，請稍後再試",
      });
      return;
    }

    const selectedPackage = offerings.current.availablePackages.find(
      (pkg: any) => pkg.identifier === selectedPlan
    );

    if (!selectedPackage) {
      setErrorModal({
        visible: true,
        title: "錯誤",
        message: "所選方案不可用",
      });
      return;
    }

    setIsPurchasing(true);

    try {
      const result = await purchasePackage(selectedPackage);

      if (result.ok) {
        handlePurchaseSuccess(result.data);
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
        if (result.reason !== "not_configured") {
          const errorMessages: Record<string, string> = {
            web_not_supported: "網頁版不支援購買功能，請使用手機應用程式",
            not_configured: "RevenueCat 尚未配置",
            sdk_error: "購買過程中發生錯誤",
          };

          setErrorModal({
            visible: true,
            title: "購買失敗",
            message: errorMessages[result.reason] || "購買過程中發生錯誤",
          });
        }
      }
    } catch (error: any) {
      setErrorModal({
        visible: true,
        title: "錯誤",
        message: error.message || "購買過程中發生錯誤",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const getPackageDetails = (packageId: string) => {
    if (!offerings?.current) return null;

    return offerings.current.availablePackages.find(
      (pkg: any) => pkg.identifier === packageId
    );
  };

  const formatPrice = (pkg: PurchasesPackage | null | undefined) => {
    if (!pkg) return { price: "...", monthly: "...", savings: "0" };

    const price = pkg.product.priceString;
    const totalPrice = pkg.product.price;

    let months = 1;
    if (pkg.identifier.includes("annual")) months = 12;

    const monthlyPrice = (totalPrice / months).toFixed(0);
    const savings = pkg.identifier.includes("annual") ? "60" : "0";

    return {
      price,
      totalPrice: totalPrice.toFixed(0),
      monthly: monthlyPrice,
      savings,
    };
  };

  const annualPkg = getPackageDetails("$rc_annual");
  const monthlyPkg = getPackageDetails("$rc_monthly");

  const annualPrices = formatPrice(annualPkg);
  const monthlyPrices = formatPrice(monthlyPkg);

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header with close button */}
        <SafeAreaView edges={["top"]}>
          <View className="px-6 pt-4 pb-2">
            <Pressable onPress={handleClose} className="self-end">
              <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                <Ionicons name="close" size={24} color="#666" />
              </View>
            </Pressable>
          </View>
        </SafeAreaView>

        {/* Hero Section */}
        <Animated.View entering={FadeInUp.delay(100)} className="px-6 mt-4">
          <View className="items-center">
            <LinearGradient
              colors={["#2CB67D", "#1A9A5E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-24 h-24 rounded-3xl items-center justify-center mb-6"
            >
              <MaterialCommunityIcons name="crown" size={48} color="#FFF" />
            </LinearGradient>

            <Text className="text-3xl font-bold text-gray-900 text-center mb-3">
              解鎖完整功能
            </Text>
            <Text className="text-base text-gray-600 text-center leading-relaxed">
              繼續使用 AI 智能掃描，獲得專業的健康分析報告
            </Text>
          </View>
        </Animated.View>

        {/* Features Grid */}
        <Animated.View entering={FadeInDown.delay(200)} className="px-6 mt-8">
          <View className="bg-gray-50 rounded-3xl p-6">
            <Feature
              icon="scan"
              iconLib="ionicons"
              title="無限次掃描"
              description="隨時掃描食品標籤，不受次數限制"
              delay={0}
            />
            <Feature
              icon="flask"
              iconLib="ionicons"
              title="專業成分分析"
              description="AI 深度分析食品成分與添加物"
              delay={100}
            />
            <Feature
              icon="medical"
              iconLib="ionicons"
              title="個性化健康建議"
              description="根據您的過敏原和疾病提供建議"
              delay={200}
            />
            <Feature
              icon="trending-up"
              iconLib="ionicons"
              title="健康趨勢追蹤"
              description="記錄並追蹤您的飲食健康趨勢"
              delay={300}
              isLast
            />
          </View>
        </Animated.View>

        {/* Pricing Plans */}
        <Animated.View entering={FadeIn.delay(400)} className="px-6 mt-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            選擇訂閱方案
          </Text>

          {isLoading ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color="#2CB67D" />
              <Text className="text-gray-600 mt-4">載入中...</Text>
            </View>
          ) : (
            <View className="space-y-3">
              {/* Annual Plan */}
              <Pressable
                onPress={() => setSelectedPlan("$rc_annual")}
                className={`rounded-2xl border-2 overflow-hidden ${
                  selectedPlan === "$rc_annual" ? "border-[#2CB67D]" : "border-gray-200"
                }`}
              >
                {/* Best Value Badge */}
                <LinearGradient
                  colors={["#FFA726", "#FF6F00"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-2 px-4"
                >
                  <Text className="text-white text-xs font-bold text-center tracking-wider">
                    最超值 · 省下 {annualPrices.savings}%
                  </Text>
                </LinearGradient>

                <View className="p-5 bg-white">
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-xl font-bold text-gray-900 mb-1">
                        年度訂閱
                      </Text>
                      <Text className="text-sm text-gray-600">
                        每月只需 NT${annualPrices.monthly}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-2xl font-bold text-gray-900">
                        {annualPrices.price}
                      </Text>
                      <Text className="text-xs text-gray-500">每年</Text>
                    </View>
                  </View>

                  {selectedPlan === "$rc_annual" && (
                    <View className="mt-3 pt-3 border-t border-gray-100 flex-row items-center">
                      <Ionicons name="checkmark-circle" size={20} color="#2CB67D" />
                      <Text className="text-sm text-[#2CB67D] ml-2 font-medium">
                        已選擇此方案
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>

              {/* Monthly Plan */}
              <Pressable
                onPress={() => setSelectedPlan("$rc_monthly")}
                className={`rounded-2xl border-2 p-5 ${
                  selectedPlan === "$rc_monthly" ? "border-[#2CB67D] bg-green-50" : "border-gray-200 bg-white"
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-900 mb-1">
                      月度訂閱
                    </Text>
                    <Text className="text-sm text-gray-600">
                      靈活訂閱，隨時取消
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-2xl font-bold text-gray-900">
                      {monthlyPrices.price}
                    </Text>
                    <Text className="text-xs text-gray-500">每月</Text>
                  </View>
                </View>

                {selectedPlan === "$rc_monthly" && (
                  <View className="mt-3 pt-3 border-t border-gray-100 flex-row items-center">
                    <Ionicons name="checkmark-circle" size={20} color="#2CB67D" />
                    <Text className="text-sm text-[#2CB67D] ml-2 font-medium">
                      已選擇此方案
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>
          )}
        </Animated.View>

        {/* CTA Button */}
        <Animated.View entering={FadeInUp.delay(500)} className="px-6 mt-8">
          <Pressable
            onPress={handlePurchase}
            disabled={isPurchasing || isLoading}
            className="rounded-2xl overflow-hidden"
          >
            <LinearGradient
              colors={["#2CB67D", "#1A9A5E"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className={`py-5 items-center ${(isPurchasing || isLoading) ? "opacity-50" : ""}`}
            >
              {isPurchasing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View className="flex-row items-center">
                  <Text className="text-white text-lg font-bold mr-2">
                    立即開始訂閱
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFF" />
                </View>
              )}
            </LinearGradient>
          </Pressable>

          {/* Footer Info */}
          <View className="mt-6 items-center">
            <View className="flex-row items-center mb-2">
              <Ionicons name="shield-checkmark" size={16} color="#2CB67D" />
              <Text className="text-xs text-gray-600 ml-1">
                安全加密付款
              </Text>
            </View>
            <Text className="text-xs text-gray-500 text-center leading-relaxed">
              訂閱將自動續訂，您可以隨時在設定中取消
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={successModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <Animated.View entering={FadeIn} className="bg-white rounded-3xl p-8 items-center w-full max-w-sm">
            <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-4">
              <Ionicons name="checkmark" size={48} color="#2CB67D" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              訂閱成功！
            </Text>
            <Text className="text-base text-gray-600 text-center">
              您現在可以無限次使用所有功能
            </Text>
          </Animated.View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        visible={errorModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setErrorModal({ ...errorModal, visible: false })}
      >
        <Pressable
          className="flex-1 bg-black/50 items-center justify-center px-6"
          onPress={() => setErrorModal({ ...errorModal, visible: false })}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Animated.View entering={FadeIn} className="bg-white rounded-3xl p-8 items-center w-full max-w-sm">
              <View className="w-20 h-20 rounded-full bg-red-100 items-center justify-center mb-4">
                <Ionicons name="close" size={48} color="#EF4444" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">
                {errorModal.title}
              </Text>
              <Text className="text-base text-gray-600 text-center mb-6">
                {errorModal.message}
              </Text>
              <Pressable
                onPress={() => setErrorModal({ ...errorModal, visible: false })}
                className="bg-gray-900 px-8 py-4 rounded-full w-full"
              >
                <Text className="text-white font-semibold text-center">
                  確定
                </Text>
              </Pressable>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

interface FeatureProps {
  icon: string;
  iconLib: "ionicons" | "material";
  title: string;
  description: string;
  delay: number;
  isLast?: boolean;
}

function Feature({ icon, iconLib, title, description, delay, isLast }: FeatureProps) {
  return (
    <Animated.View
      entering={SlideInRight.delay(delay)}
      className={`flex-row items-start ${!isLast ? "mb-5" : ""}`}
    >
      <View className="w-12 h-12 rounded-2xl bg-[#2CB67D]/10 items-center justify-center mr-4">
        {iconLib === "ionicons" ? (
          <Ionicons name={icon as any} size={24} color="#2CB67D" />
        ) : (
          <MaterialCommunityIcons name={icon as any} size={24} color="#2CB67D" />
        )}
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900 mb-1">
          {title}
        </Text>
        <Text className="text-sm text-gray-600 leading-relaxed">
          {description}
        </Text>
      </View>
    </Animated.View>
  );
}
