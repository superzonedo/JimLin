import React, { useState, useMemo, useRef, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Image, StyleSheet, Modal, Alert, ActivityIndicator, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp } from "@react-navigation/native";
import { useFoodScanStore } from "../state/foodScanStore";
import { useUserStore } from "../state/userStore";
import { IngredientAnalysis } from "../types/food";
import { detectHealthAlerts } from "../utils/smartHealthAlert";
import { shareResult, extractProductName } from "../utils/shareUtils";
import { findAdditiveByName } from "../utils/additiveDatabase";
import SmartAlertBanner from "../components/SmartAlertBanner";
import ShareCardView from "../components/ShareCardView";
import { CircularProgressIndicator } from "../components/CircularProgressIndicator";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useLanguage } from "../i18n/LanguageContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

import { ScanStackParamList, RootTabParamList } from "../types/navigation";
import { DiseaseType } from "../types/user";

type ResultScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ScanStackParamList>,
  BottomTabNavigationProp<RootTabParamList>
>;

type NavigationProp = ResultScreenNavigationProp;

// Get disease display names from translations
const getDiseaseDisplayNames = (t: any): Record<DiseaseType | string, string> => ({
  "kidney-disease": t.result.diseaseKeywords.kidneyDisease,
  "liver-disease": t.result.diseaseKeywords.liverDisease,
  "skin-disease": t.result.diseaseKeywords.skinDisease,
  "diabetes": t.result.diseaseKeywords.diabetes,
  "hypertension": t.result.diseaseKeywords.hypertension,
  "high-cholesterol": t.result.diseaseKeywords.highCholesterol,
  "stomach-sensitivity": t.result.diseaseKeywords.stomachSensitivity,
  "metabolic-disease": t.result.diseaseKeywords.metabolicDisease,
});

// Colors for highlighted health conditions - keyed by disease ID for language independence
const getHealthConditionColors = (diseaseNames: Record<DiseaseType | string, string>): Record<string, string> => ({
  [diseaseNames["skin-disease"]]: "#F97316", // orange-500 - Acne
  [diseaseNames["liver-disease"]]: "#EF4444", // red-500 - Fatty Liver
  [diseaseNames["metabolic-disease"]]: "#A855F7", // purple-500 - Metabolic Issues
  [diseaseNames["kidney-disease"]]: "#EC4899", // pink-500 - Kidney Issues
  [diseaseNames["diabetes"]]: "#F59E0B", // amber-500 - Blood Sugar Issues
  [diseaseNames["hypertension"]]: "#DC2626", // red-600 - Blood Pressure Issues
  [diseaseNames["high-cholesterol"]]: "#EA580C", // orange-600 - Cholesterol Issues
  [diseaseNames["stomach-sensitivity"]]: "#D97706", // amber-600 - Digestive Sensitivity
});

// Get user's health conditions as display names
const getUserHealthConditions = (preferences: any, diseaseNames: Record<DiseaseType | string, string>): string[] => {
  const conditions: string[] = [];

  // Map system diseases to display names
  if (preferences.diseases?.length > 0) {
    preferences.diseases.forEach((disease: DiseaseType) => {
      const displayName = diseaseNames[disease];
      if (displayName) {
        conditions.push(displayName);
      }
    });
  }

  // Add custom diseases directly
  if (preferences.customDiseases?.length > 0) {
    conditions.push(...preferences.customDiseases);
  }

  return conditions;
};

interface InterpretationSegment {
  text: string;
  isHighlighted: boolean;
  color?: string;
}

// Generate AI interpretation with highlighted keywords
const generateAIInterpretationWithHighlights = (
  score: number,
  riskLevel: string,
  summary: string,
  hasAdditives: boolean,
  additiveCount: number,
  preferences: any,
  currentResult: any,
  t: any,
  diseaseNames: Record<DiseaseType | string, string>
): InterpretationSegment[] => {
  const userConditions = getUserHealthConditions(preferences, diseaseNames);
  const hasHealthConditions = userConditions.length > 0;

  // Extract detected additives with high risk
  const highRiskAdditives = currentResult?.additiveAnalysis?.detectedAdditives?.filter(
    (additive: any) => additive.riskLevel === "high"
  ) || [];

  // Get first high risk additive name for specific mention
  const firstHighRisk = highRiskAdditives[0]?.name || "";

  let baseText: string;

  if (score >= 71) {
    // High score - safe to eat
    if (hasHealthConditions) {
      const condition = userConditions[0];
      baseText = `Ingredients are safe. No significant burden for "${condition}". Safe to consume.`;
    } else {
      baseText = `Natural and healthy ingredients. Suitable for daily consumption.`;
    }
  } else if (score >= 31) {
    // Medium score - caution
    if (hasHealthConditions) {
      const condition = userConditions[0];
      if (highRiskAdditives.length > 0) {
        baseText = `Contains ${firstHighRisk} and other ingredients that may aggravate "${condition}". Consume in moderation.`;
      } else {
        baseText = `Contains processed ingredients with slight impact on "${condition}". Occasional consumption is acceptable.`;
      }
    } else {
      if (highRiskAdditives.length > 0) {
        baseText = `Contains ${firstHighRisk} and other additives. Consume in moderation.`;
      } else {
        baseText = `Contains processed ingredients. Occasional consumption recommended.`;
      }
    }
  } else {
    // Low score - avoid
    if (hasHealthConditions) {
      const condition = userConditions[0];
      if (highRiskAdditives.length > 0) {
        baseText = `Contains ${firstHighRisk}. Higher risk for "${condition}". Recommended to avoid.`;
      } else {
        baseText = `Ingredients are not suitable for "${condition}". Recommended to avoid.`;
      }
    } else {
      if (highRiskAdditives.length > 0) {
        baseText = `Contains ${firstHighRisk} and other high-risk ingredients. Not recommended for consumption.`;
      } else {
        baseText = `Ingredients carry higher risk. Consider finding alternatives.`;
      }
    }
  }

  // Parse text to find and highlight health condition keywords
  const healthConditionColors = getHealthConditionColors(diseaseNames);
  return parseTextWithHighlights(baseText, userConditions, healthConditionColors);
};

// Parse text and create segments with highlights
const parseTextWithHighlights = (text: string, userConditions: string[], healthConditionColors: Record<string, string>): InterpretationSegment[] => {
  const segments: InterpretationSegment[] = [];

  // All possible conditions to highlight (user's + defaults)
  const allConditions = [...new Set([...userConditions, ...Object.keys(healthConditionColors)])];

  // Create regex pattern for 「condition」 format
  const pattern = new RegExp(`「(${allConditions.join("|")})」`, "g");

  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      segments.push({
        text: text.substring(lastIndex, match.index),
        isHighlighted: false,
      });
    }

    // Add the highlighted condition
    const condition = match[1];
    const isUserCondition = userConditions.includes(condition);
    segments.push({
      text: `「${condition}」`,
      isHighlighted: true,
      color: isUserCondition
        ? (healthConditionColors[condition] || "#EF4444") // User's condition - use specific color or red
        : "#6B7280", // Not user's condition - gray
    });

    lastIndex = pattern.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      text: text.substring(lastIndex),
      isHighlighted: false,
    });
  }

  return segments.length > 0 ? segments : [{ text, isHighlighted: false }];
};

export default function ResultScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const currentResult = useFoodScanStore((s) => s.currentResult);
  const deleteScan = useFoodScanStore((s) => s.deleteScan);
  const saveCurrentResult = useFoodScanStore((s) => s.saveCurrentResult);
  const preferences = useUserStore((s) => s.preferences);
  const scanHistory = useFoodScanStore((s) => s.scanHistory);

  const updateDailyStats = useUserStore((s) => s.updateDailyStats);
  const updateWeeklyScores = useUserStore((s) => s.updateWeeklyScores);
  const updateStats = useUserStore((s) => s.updateStats);
  const userStats = useUserStore((s) => s.stats);

  // Check if current result is already saved
  const isSaved = currentResult?.isPurchased === true;

  // Get disease display names based on current language
  const diseaseNames = useMemo(() => getDiseaseDisplayNames(t), [t]);

  // Share states
  const shareViewRef = useRef<View>(null);
  const [showSharePreview, setShowSharePreview] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [productName, setProductName] = useState("");
  const [ingredientAnalysisExpanded, setIngredientAnalysisExpanded] = useState(false);

  // Animation values
  const scoreScale = useSharedValue(0);
  const scoreOpacity = useSharedValue(0);
  const primaryButtonScale = useSharedValue(1);
  const secondaryButtonScale = useSharedValue(1);

  // Haptic feedback and animation on mount
  useEffect(() => {
    if (currentResult) {
      // L1 Hero Animation: easeOutCubic with 1000ms duration
      scoreScale.value = withTiming(1, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      });
      scoreOpacity.value = withTiming(1, {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      });
      // Haptic feedback on result
      Haptics.notificationAsync(
        currentResult.healthScore >= 71
          ? Haptics.NotificationFeedbackType.Success
          : currentResult.healthScore >= 31
          ? Haptics.NotificationFeedbackType.Warning
          : Haptics.NotificationFeedbackType.Error
      );
    }
  }, [currentResult]);

  const scoreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
    opacity: scoreOpacity.value,
  }));

  const primaryButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: primaryButtonScale.value }],
  }));

  const secondaryButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: secondaryButtonScale.value }],
  }));

  // 計算智能健康警示 - 所有用戶現在都可以看到
  const smartAlert = useMemo(() => {
    if (!currentResult) return null;
    return detectHealthAlerts(currentResult, preferences);
  }, [currentResult, preferences]);

  // 檢查用戶是否有任何健康設定
  const hasHealthSettings =
    (preferences.diseases?.length || 0) > 0 ||
    (preferences.customDiseases?.length || 0) > 0 ||
    (preferences.allergens?.length || 0) > 0 ||
    (preferences.customAllergens?.length || 0) > 0 ||
    (preferences.healthGoals?.length || 0) > 0;

  // Get product name - prioritize AI-detected name, fallback to extraction
  const displayProductName = useMemo(() => {
    if (!currentResult) return "";
    // First try to use AI-detected product name
    if (currentResult.productName) {
      return currentResult.productName;
    }
    // Fallback to extracting from summary
    const extracted = extractProductName(currentResult.summary, t);
    // If extracted name looks like a summary (contains common summary keywords), use default
    if (extracted.includes("添加") || extracted.includes("成分") || extracted.includes("含") || extracted.includes("...") || extracted.includes("種")) {
      return extractProductName(currentResult.summary, t);
    }
    return extracted || extractProductName(currentResult.summary, t);
  }, [currentResult]);

  // Generate AI interpretation with highlights
  const aiInterpretationSegments = useMemo(() => {
    if (!currentResult) return [];
    const additiveCount = currentResult.additiveAnalysis?.detectedAdditives?.length || 0;
    return generateAIInterpretationWithHighlights(
      currentResult.healthScore,
      currentResult.riskLevel,
      currentResult.summary,
      !!currentResult.additiveAnalysis,
      additiveCount,
      preferences,
      currentResult,
      t,
      diseaseNames
    );
  }, [currentResult, preferences, t, diseaseNames]);

  // Handle share button press
  const handleSharePress = () => {
    if (!currentResult) return;
    const name = currentResult.productName || extractProductName(currentResult.summary, t);
    setProductName(name);
    setShowSharePreview(true);
  };

  // Handle actual share action
  const handleShare = async () => {
    if (!shareViewRef.current || !currentResult) return;

    setIsSharing(true);

    try {
      const success = await shareResult(shareViewRef.current, productName, t);

      if (success) {
        setShowSharePreview(false);
      } else {
        Alert.alert(t.result.shareFailed2, t.result.shareFailed);
      }
    } catch (error) {
      Alert.alert(t.result.shareFailed2, t.result.errorOccurred);
    } finally {
      setIsSharing(false);
    }
  };

  if (!currentResult) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-600 text-lg">{t.result.noResult}</Text>
        <Pressable
          onPress={() => {
            // Navigate to ScanTab which will open Camera screen
            navigation.navigate("ScanTab");
          }}
          className="mt-6 bg-emerald-500 px-8 py-4 rounded-full"
        >
          <Text className="text-white font-semibold text-base">{t.result.returnToScan}</Text>
        </Pressable>
      </View>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 71) return "#34C759";
    if (score >= 31) return "#FF9500";
    return "#FF3B30";
  };

  const getScoreGradient = (score: number): [string, string] => {
    if (score >= 71) return ["#34C759", "#34C759"];
    if (score >= 31) return ["#FF9500", "#FF9500"];
    return ["#FF3B30", "#FF3B30"];
  };

  const getScoreLabel = (score: number) => {
    if (score >= 71) return t.result.healthyPick;
    if (score >= 31) return t.result.moderateIntake;
    return t.result.suggestAvoid;
  };

  const getRiskLevelText = (level: string) => {
    switch (level) {
      case "low": return t.result.safetyLevelGood;
      case "medium": return t.result.safetyLevelMedium;
      case "high": return t.result.safetyLevelHigh;
      default: return t.result.safetyLevelUnknown;
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section - Score Focus */}
        <Animated.View entering={FadeIn.duration(500)}>
          <LinearGradient
            colors={["#FFFFFF", "#F8FAFC"]}
            style={[styles.heroSection, { paddingTop: insets.top }]}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
              <Pressable
                onPress={() => navigation.goBack()}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="arrow-back" size={22} color="#374151" />
              </Pressable>
              <Pressable
                onPress={handleSharePress}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="share-outline" size={22} color="#374151" />
              </Pressable>
            </View>

            {/* Product Image Thumbnail */}
            <View className="items-center mt-2">
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: currentResult.imageUri }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* Product Name - Above Score */}
            <Animated.View entering={FadeInDown.delay(200).duration(400)} className="items-center mt-4 px-6">
              <Text className="text-lg font-medium text-gray-900 text-center" numberOfLines={2}>
                {displayProductName}
              </Text>
            </Animated.View>

            {/* Score Hero - L1 */}
            <Animated.View style={[styles.scoreHeroContainer, scoreAnimatedStyle]} className="items-center mt-8">
              <CircularProgressIndicator score={currentResult.healthScore} size={200} strokeWidth={10} />

              {/* Score Label - L1 */}
              <View className="mt-4 px-5 py-2 rounded-full">
                <Text
                  className="text-base text-center"
                  style={{ color: getScoreColor(currentResult.healthScore), opacity: 0.7 }}
                >
                  {getScoreLabel(currentResult.healthScore)}
                </Text>
              </View>
            </Animated.View>

            {/* Save Button - Below Score */}
            <Animated.View entering={FadeInDown.delay(1100).duration(300)} className="items-center mt-6 mb-4 px-6">
              {isSaved ? (
                <View className="flex-row items-center bg-green-50 px-6 py-3 rounded-2xl border border-green-200">
                  <Ionicons name="checkmark-circle" size={22} color="#22C55E" />
                  <Text className="text-green-600 font-semibold text-base ml-2">{t.result.savedToRecord}</Text>
                </View>
              ) : (
                <Pressable
                  onPress={() => {
                    saveCurrentResult();
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }}
                  className="flex-row items-center bg-blue-500 px-8 py-3.5 rounded-2xl"
                  style={styles.saveButton}
                >
                  <Ionicons name="bookmark-outline" size={22} color="white" />
                  <Text className="text-white font-bold text-base ml-2">{t.result.saveAnalysisRecord}</Text>
                </Pressable>
              )}
              {!isSaved && (
                <Text className="text-gray-400 text-xs mt-2 text-center">
                  {t.result.saveHint}
                </Text>
              )}
            </Animated.View>

          </LinearGradient>
        </Animated.View>

        {/* Personal Health Alert Banner - L3 */}
        {smartAlert && (
          <Animated.View entering={FadeInDown.delay(1350).duration(200)} className="mt-6">
            <SmartAlertBanner alert={smartAlert} hasHealthSettings={hasHealthSettings} />
          </Animated.View>
        )}

        {/* All scans are now automatically saved - no need for manual confirmation */}

        {/* Ingredient Analysis Section - L4 */}
        <Animated.View entering={FadeInDown.delay(1600).duration(250)} className="mx-4 mt-8">
          <Pressable
            onPress={() => setIngredientAnalysisExpanded(!ingredientAnalysisExpanded)}
            style={styles.sectionCard}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Ionicons name="list-circle" size={20} color="#6E8F7A" />
                <Text className="text-base font-medium text-gray-900 ml-2">{t.result.ingredientAnalysis}</Text>
              </View>
              <Ionicons
                name={ingredientAnalysisExpanded ? "chevron-up" : "chevron-down"}
                size={18}
                color="#6B7280"
              />
            </View>
          </Pressable>

          {/* Expanded Content */}
          {ingredientAnalysisExpanded && (
            <View style={styles.sectionCard} className="mt-0">
              {/* Warning Ingredients */}
              {currentResult.ingredients.warning.length > 0 && (
                <View className="mb-4">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="warning" size={14} color="#FF9500" />
                    <Text className="text-sm font-medium ml-1.5" style={{ color: "#FF9500" }}>
                      {t.result.warningIngredients} ({currentResult.ingredients.warning.length})
                    </Text>
                  </View>
                  {currentResult.ingredients.warning.map((ingredient, index) => (
                    <IngredientItem key={`warning-${index}`} ingredient={ingredient} defaultExpanded={true} t={t} />
                  ))}
                </View>
              )}

              {/* Safe Ingredients */}
              {currentResult.ingredients.safe.length > 0 && (
                <View>
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="checkmark" size={14} color="#34C759" />
                    <Text className="text-sm font-medium ml-1.5" style={{ color: "#34C759" }}>
                      {t.result.safeIngredients} ({currentResult.ingredients.safe.length})
                    </Text>
                  </View>
                  {currentResult.ingredients.safe.slice(0, 5).map((ingredient, index) => (
                    <IngredientItem key={`safe-${index}`} ingredient={ingredient} defaultExpanded={true} t={t} />
                  ))}
                  {currentResult.ingredients.safe.length > 5 && (
                    <Text className="text-gray-400 text-xs text-center mt-2">
                      {t.result.moreHealthyIngredientsCount.replace("{count}", String(currentResult.ingredients.safe.length - 5))}
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}
        </Animated.View>

        {/* Health Benefits - L4 */}
        {currentResult.nutritionBenefits.length > 0 && (
          <Animated.View entering={FadeInDown.delay(1600).duration(250)} className="mx-4 mt-8">
            <View style={styles.sectionCard}>
              <View className="flex-row items-center mb-3">
                <Ionicons name="heart" size={20} color="#34C759" />
                <Text className="text-base font-medium text-gray-900 ml-2">{t.result.healthBenefits}</Text>
              </View>
              <View className="flex-row flex-wrap">
                {currentResult.nutritionBenefits.map((benefit, index) => (
                  <View
                    key={index}
                    className="px-3 py-1.5 rounded-full mr-2 mb-2 flex-row items-center"
                    style={{ backgroundColor: "#F0FDF4", borderWidth: 1, borderColor: "#D1E7DC" }}
                  >
                    <Ionicons name="checkmark" size={12} color="#34C759" />
                    <Text className="text-xs ml-1" style={{ color: "#34C759" }}>{benefit.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Health Recommendation - L4 */}
        <Animated.View entering={FadeInDown.delay(1600).duration(250)} className="mx-4 mt-8">
          <View style={[styles.sectionCard, styles.recommendationCard]}>
            <View className="flex-row items-start">
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#FEF7F0", alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="bulb" size={20} color="#FF9500" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-base font-medium text-gray-900 mb-1">{t.result.healthAdvice}</Text>
                <Text className="text-sm text-gray-600 leading-5">{currentResult.recommendation}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* AI Health Analysis Button - Always shown */}
        <Animated.View entering={FadeInDown.delay(1800).duration(250)} className="mx-4 mt-6 mb-6">
          <Pressable
            onPress={() => navigation.navigate("HealthAnalysis")}
            className="flex-row items-center justify-center py-3 rounded-xl"
            style={{ backgroundColor: "#2CB67D" }}
          >
            <Ionicons name="sparkles" size={18} color="white" />
            <Text className="text-white font-medium text-base ml-2">{t.result.personalizedHealthAnalysis}</Text>
          </Pressable>
        </Animated.View>

        {/* Bottom Action Buttons - L5 */}
        <Animated.View
          entering={FadeInUp.delay(1950).duration(200)}
          className="flex-row items-center justify-center mt-10 mb-8 px-4 space-x-3"
        >
          <Animated.View style={primaryButtonAnimatedStyle} className="flex-1">
            <Pressable
              onPress={() => {
                // Navigate to ScanTab which will open Camera screen
                navigation.navigate("ScanTab");
              }}
              onPressIn={() => {
                primaryButtonScale.value = withTiming(0.98, { duration: 100 });
              }}
              onPressOut={() => {
                primaryButtonScale.value = withTiming(1, { duration: 100 });
              }}
              className="flex-row items-center justify-center py-3 rounded-xl"
              style={{ backgroundColor: "#2CB67D" }}
            >
              <Ionicons name="scan-outline" size={18} color="white" />
              <Text className="text-white font-medium text-base ml-2">{t.result.continueScan}</Text>
            </Pressable>
          </Animated.View>
          <Animated.View style={secondaryButtonAnimatedStyle} className="flex-1">
            <Pressable
              onPress={handleSharePress}
              onPressIn={() => {
                secondaryButtonScale.value = withTiming(0.98, { duration: 100 });
              }}
              onPressOut={() => {
                secondaryButtonScale.value = withTiming(1, { duration: 100 });
              }}
              className="flex-row items-center justify-center py-3 rounded-xl border border-gray-300"
            >
              <Ionicons name="share-social-outline" size={18} color="#6B7280" />
              <Text className="font-medium text-base ml-2" style={{ color: "#6B7280" }}>{t.result.shareReport}</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </ScrollView>

      {/* Share Preview Modal */}
      <Modal
        visible={showSharePreview}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSharePreview(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.result.sharePreview}</Text>
              <Pressable onPress={() => setShowSharePreview(false)}>
                <Ionicons name="close" size={28} color="#1F2937" />
              </Pressable>
            </View>

            <ScrollView style={styles.previewScroll} showsVerticalScrollIndicator={false}>
              <View ref={shareViewRef} collapsable={false}>
                <ShareCardView
                  productName={productName}
                  healthScore={currentResult.healthScore}
                  riskLevel={currentResult.riskLevel}
                  summary={currentResult.summary}
                  imageUri={currentResult.imageUri}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                style={[styles.shareButton, isSharing && styles.shareButtonDisabled]}
                onPress={handleShare}
                disabled={isSharing}
              >
                {isSharing ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="share-social" size={20} color="white" />
                    <Text style={styles.shareButtonText}>{t.result.shareTo}</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function IngredientItem({ ingredient, defaultExpanded = false, t }: { ingredient: IngredientAnalysis; defaultExpanded?: boolean; t: any }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const matchedAdditive = findAdditiveByName(ingredient.name);

  const getRiskColor = (level: string) => {
    switch (level) {
      case "safe": return { bg: "#ECFDF5", text: "#059669" };
      case "moderate": return { bg: "#FEF3C7", text: "#D97706" };
      case "warning": return { bg: "#FEE2E2", text: "#DC2626" };
      default: return { bg: "#F3F4F6", text: "#6B7280" };
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case "safe": return t.result.riskLevels.safe;
      case "moderate": return t.result.riskLevels.moderate;
      case "warning": return t.result.riskLevels.warning;
      default: return "";
    }
  };

  const colors = getRiskColor(ingredient.riskLevel);

  return (
    <Pressable
      onPress={() => {
        setExpanded(!expanded);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      className="bg-gray-50 rounded-xl p-3.5 mb-2"
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-gray-900 font-medium flex-1" numberOfLines={1}>
          {ingredient.name}
        </Text>
        <View className="flex-row items-center">
          <View
            className="px-2.5 py-1 rounded-full mr-2"
            style={{ backgroundColor: colors.bg }}
          >
            <Text className="text-xs font-medium" style={{ color: colors.text }}>
              {getRiskLabel(ingredient.riskLevel)}
            </Text>
          </View>
          {matchedAdditive && (
            <View className="bg-gray-200 px-2 py-1 rounded-full mr-2">
              <Text className="text-xs text-gray-600">{t.result.additive}</Text>
            </View>
          )}
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color="#9CA3AF"
          />
        </View>
      </View>
      {expanded && (
        <Text className="text-gray-500 text-sm mt-2 leading-5">
          {ingredient.description}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  imageContainer: {
    width: 280,
    height: 200,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  scoreHeroContainer: {
    alignItems: "center",
  },
  actionButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  aiCard: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  aiCardGradient: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  confirmButton: {
    borderRadius: 14,
    overflow: "hidden",
  },
  confirmGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
  },
  confirmedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ECFDF5",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  recommendationCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  previewScroll: {
    maxHeight: 500,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  shareButton: {
    backgroundColor: "#10B981",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 14,
  },
  shareButtonDisabled: {
    opacity: 0.6,
  },
  shareButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  saveButton: {
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
