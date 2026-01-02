import HealthComplianceBadge from "@/components/result/HealthComplianceBadge";
import PersonalizedHealthAlert from "@/components/result/PersonalizedHealthAlert";
import { Colors } from "@/constants/theme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFoodScanStore } from "@/state/foodScanStore";
import { useUserStore } from "@/state/userStore";
import { FoodAnalysisResult } from "@/types/food";
// import { translateIngredientName } from "@/utils/ingredientTranslation"; // 不再需要，後端直接返回對應語言
import { useSafeBack } from "@/utils/navigation";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const safeBack = useSafeBack();
  const { t, language } = useLanguage();
  const currentResult = useFoodScanStore((s) => s.currentResult);
  const updateScanPurchaseStatus = useFoodScanStore((s) => s.updateScanPurchaseStatus);
  const [isSaved, setIsSaved] = useState(currentResult?.isPurchased ?? false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  
  // 當 currentResult 的 isPurchased 狀態改變時，同步更新 isSaved
  React.useEffect(() => {
    if (currentResult) {
      setIsSaved(currentResult.isPurchased ?? false);
    }
  }, [currentResult?.isPurchased]);
  
  // 計算圖片高度：螢幕高度的 1/4（約25%）
  const imageHeight = screenHeight * 0.25;

  if (!currentResult) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <Text style={{ color: theme.secondaryText }}>{t('result.noResult')}</Text>
        <Pressable
          onPress={() => safeBack('/(tabs)/scan')}
          className="mt-6 bg-[#2CB67D] px-8 py-4 rounded-full"
        >
          <Text className="text-white font-semibold">{t('result.backToScan')}</Text>
        </Pressable>
      </View>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 71) return "#10B981";
    if (score >= 31) return "#F59E0B";
    return "#EF4444";
  };

  const getRiskLevelText = (level?: string) => {
    switch (level) {
      case "low":
        return t('result.riskLevel.good');
      case "medium":
        return t('result.riskLevel.medium');
      case "high":
        return t('result.riskLevel.high');
      default:
        return t('result.riskLevel.good');
    }
  };

  // 根據健康分數計算風險等級（優先於後端返回的 riskLevel，確保分數和等級一致）
  const calculateRiskLevelFromScore = (score: number): 'low' | 'medium' | 'high' => {
    if (score >= 71) return 'low';    // 71-100 分：良好安全等級
    if (score >= 31) return 'medium'; // 31-70 分：中等安全等級
    return 'high';                    // 0-30 分：較高風險
  };

  // Mock template data
  const templateResult: FoodAnalysisResult = {
    ...currentResult,
    // 優先使用根據分數計算的風險等級，確保分數和等級一致
    riskLevel: calculateRiskLevelFromScore(currentResult.healthScore),
    ingredients: {
      safe: currentResult.ingredients.safe.length > 0 
        ? currentResult.ingredients.safe 
        : [
            { name: "蒟蒻精粉", description: "主要成分，提供膳食纖維", riskLevel: "safe" },
            { name: "海藻粉", description: "天然成分，富含礦物質", riskLevel: "safe" },
            { name: "水酸化鈣", description: "食品添加劑，用於凝固", riskLevel: "safe" },
          ],
      warning: currentResult.ingredients.warning.length > 0
        ? currentResult.ingredients.warning
        : [],
    },
    nutritionBenefits: currentResult.nutritionBenefits && currentResult.nutritionBenefits.length > 0
      ? currentResult.nutritionBenefits
      : [],
  };

  const hasWarningIngredients = templateResult.ingredients.warning.length > 0;

  // 生成根據成分的評語
  const generateComment = () => {
    const safeCount = templateResult.ingredients.safe.length;
    const warningCount = templateResult.ingredients.warning.length;
    const score = templateResult.healthScore;
    
    if (score >= 80) {
      return t('result.comment.excellent');
    } else if (score >= 60) {
      return t('result.comment.acceptable');
    } else if (warningCount > 0) {
      return t('result.comment.warning');
    } else {
      return t('result.comment.complex');
    }
  };

  // 從 userStore 獲取用戶偏好設定
  const userPreferences = useUserStore((s) => s.preferences);
  const hasHealthSettings = userPreferences && (
    (userPreferences.diseases && userPreferences.diseases.length > 0) ||
    (userPreferences.customDiseases && userPreferences.customDiseases.length > 0) ||
    (userPreferences.healthGoals && userPreferences.healthGoals.length > 0) ||
    (userPreferences.customHealthGoals && userPreferences.customHealthGoals.length > 0) ||
    (userPreferences.allergens && userPreferences.allergens.length > 0) ||
    (userPreferences.customAllergens && userPreferences.customAllergens.length > 0)
  );
  const backendData = (currentResult as any)?.backendData;

  // 檢查是否符合健康設定
  const healthCheckResult = useMemo(() => {
    if (!hasHealthSettings || !backendData) {
      return null;
    }

    const score = templateResult.healthScore;
    const hasHighRisk = templateResult.ingredients.warning.some(
      (ing) => ing.riskLevel === 'warning' || ing.riskLevel === 'high'
    );
    
    const hasWarningAdditives = backendData?.additives?.some(
      (a: any) => a.riskLevel === 'High'
    ) || false;

    // 基本符合條件：健康分數 >= 70 且沒有高風險成分
    const matches = score >= 70 && !hasHighRisk && !hasWarningAdditives;

    return {
      matches,
    };
  }, [templateResult, backendData, hasHealthSettings]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{ 
            paddingTop: insets.top,
            backgroundColor: theme.headerBackground,
            borderBottomWidth: 1,
            borderBottomColor: theme.headerBorder,
          }}
        >
          <View className="flex-row items-center justify-between px-6 py-4">
            <Pressable onPress={() => safeBack('/(tabs)/scan')}>
              <Ionicons name="arrow-back" size={24} color={theme.iconColor} />
            </Pressable>
            <Text style={{ fontSize: 18, fontWeight: '600', color: theme.primaryText }}>{t('result.title')}</Text>
            <Pressable onPress={() => console.log("Share")}>
              <Ionicons name="share-outline" size={24} color={theme.iconColor} />
            </Pressable>
          </View>
        </View>

        {/* Product Image */}
        <Animated.View entering={FadeIn.duration(400)}>
          <Image
            source={{ uri: templateResult.imageUri }}
            style={{ width: '100%', height: imageHeight }}
            resizeMode="cover"
          />
        </Animated.View>

        {/* Product Name */}
        {(templateResult.productName || templateResult.summary) && (
          <Animated.View
            entering={FadeInDown.delay(100).duration(400)}
            style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: '600',
                color: theme.primaryText,
                textAlign: 'center',
              }}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {templateResult.productName || templateResult.summary}
            </Text>
          </Animated.View>
        )}
          
        {/* Score Section */}
        <Animated.View 
          entering={FadeInDown.delay(200).duration(400)}
          className="items-center py-8 px-6"
        >
            <View
              style={[
                styles.scoreCircle,
                { borderColor: getScoreColor(templateResult.healthScore) },
              ]}
            className="w-40 h-40 rounded-full items-center justify-center border-8"
            >
            <Text className="text-6xl font-bold" style={{ color: getScoreColor(templateResult.healthScore) }}>
                {templateResult.healthScore}
              </Text>
            </View>
            
            <Text style={{ fontSize: 20, fontWeight: '600', color: theme.primaryText, marginTop: 24 }}>
              {getRiskLevelText(templateResult.riskLevel)}
            </Text>
            
          <Text style={{ fontSize: 16, color: theme.secondaryText, textAlign: 'center', marginTop: 12, paddingHorizontal: 24, lineHeight: 24 }}>
            {generateComment()}
                </Text>
        </Animated.View>

        {/* Health Compliance Badge - 符合時顯示 */}
        {healthCheckResult && healthCheckResult.matches && (
          <HealthComplianceBadge />
        )}

        {/* Personalized Health Alert - 只在不符合時顯示 */}
        {healthCheckResult && !healthCheckResult.matches && backendData && (
          <PersonalizedHealthAlert 
            backendData={backendData}
            userPreferences={userPreferences}
          />
        )}

        {/* Ingredient Analysis - Collapsible */}
        <Animated.View 
          entering={FadeInDown.delay(400).duration(400)}
          className="mx-6 mt-6"
        >
          <IngredientAnalysisCollapsible result={templateResult} />
        </Animated.View>

        {/* Nutrition Benefits - 只在有健康益處且分數不低時顯示 */}
        {templateResult.nutritionBenefits && 
         templateResult.nutritionBenefits.length > 0 && 
         templateResult.healthScore >= 60 && (
          <Animated.View 
            entering={FadeInDown.delay(500).duration(400)}
            style={[
              styles.card,
              {
                backgroundColor: theme.cardBackground,
                marginHorizontal: 24,
                marginTop: 24,
                borderRadius: 24,
                padding: 24,
              }
            ]}
          >
            <View className="flex-row items-center mb-4">
              <Ionicons name="heart" size={20} color={theme.primary} />
              <Text style={{ fontSize: 20, fontWeight: '600', color: theme.primaryText, marginLeft: 8 }}>{t('result.healthBenefits')}</Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
            {templateResult.nutritionBenefits.map((benefit, index) => (
                <View 
                  key={index} 
                  style={{
                    backgroundColor: colorScheme === 'dark' ? '#064E3B' : '#D1FAE5',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 9999,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="checkmark" size={14} color={theme.success} />
                  <Text style={{ 
                    fontSize: 14, 
                    fontWeight: '500', 
                    color: colorScheme === 'dark' ? '#6EE7B7' : '#047857',
                    marginLeft: 6,
                  }}>{benefit.name}</Text>
              </View>
            ))}
            </View>
          </Animated.View>
        )}

        {/* Save Analysis Button */}
        <Animated.View entering={FadeInDown.delay(600).duration(400)} className="mx-6 mt-6">
          {!isSaved ? (
            <Pressable
              className="bg-[#3B82F6] rounded-2xl overflow-hidden"
              style={styles.saveButton}
              onPress={() => {
                if (currentResult?.id) {
                  updateScanPurchaseStatus(currentResult.id, true);
                  setIsSaved(true);
                  console.log("Save to health analysis");
                }
              }}
            >
              <View className="px-5 py-4">
                <View className="flex-row items-center justify-center mb-2">
                  <Ionicons name="analytics" size={20} color="#FFFFFF" />
                  <Text className="text-white font-bold text-base ml-2.5">{t('result.includeInAnalysis')}</Text>
                </View>
                <Text className="text-white/90 text-xs text-center leading-5 px-2">
                  {t('result.includeInAnalysisDesc')}
                </Text>
              </View>
            </Pressable>
          ) : (
            <Pressable
              style={{
                backgroundColor: colorScheme === 'dark' ? '#1E3A5F' : '#DBEAFE',
                borderWidth: 2,
                borderColor: colorScheme === 'dark' ? '#3B82F6' : '#93C5FD',
                borderRadius: 16,
                overflow: 'hidden',
              }}
              onPress={() => {
                if (currentResult?.id) {
                  updateScanPurchaseStatus(currentResult.id, false);
                  setIsSaved(false);
                  console.log("Remove from health analysis");
                }
              }}
            >
              <View className="px-5 py-4">
                <View className="flex-row items-center justify-center mb-2">
                  <Ionicons name="checkmark-circle" size={20} color={theme.info} />
                  <Text style={{ 
                    color: colorScheme === 'dark' ? '#93C5FD' : '#1E40AF',
                    fontWeight: '700',
                    fontSize: 16,
                    marginLeft: 10,
                  }}>{t('result.includedInAnalysis')}</Text>
                </View>
                <Text style={{
                  color: colorScheme === 'dark' ? '#60A5FA' : '#2563EB',
                  fontSize: 12,
                  textAlign: 'center',
                  lineHeight: 20,
                  paddingHorizontal: 8,
                }}>
                  此紀錄已出現在歷史紀錄中
                </Text>
              </View>
            </Pressable>
          )}
        </Animated.View>

        {/* Action Buttons - Bottom */}
        <Animated.View 
          entering={FadeInDown.delay(700).duration(400)}
          className="flex-row items-center mx-6 mt-6 mb-6"
        >
          <Pressable
            className="flex-1 bg-[#2CB67D] py-3 rounded-full items-center mr-2"
            onPress={() => router.push("/(tabs)/scan")}
          >
            <View className="flex-row items-center">
              <Ionicons name="qr-code-outline" size={18} color="#FFFFFF" />
              <Text className="text-white font-semibold ml-2">{t('result.continueScan')}</Text>
            </View>
          </Pressable>
          <Pressable
            style={{
              flex: 1,
              backgroundColor: theme.cardBackground,
              borderWidth: 1,
              borderColor: theme.cardBorder,
              paddingVertical: 12,
              borderRadius: 9999,
              alignItems: 'center',
              marginLeft: 8,
            }}
            onPress={() => {
              console.log("Share result");
            }}
          >
            <View className="flex-row items-center">
              <Ionicons name="share-outline" size={18} color={theme.secondaryText} />
              <Text style={{ color: theme.secondaryText, fontWeight: '600', marginLeft: 8 }}>{t('result.shareReport')}</Text>
            </View>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function IngredientAnalysisCollapsible({ result }: { result: FoodAnalysisResult }) {
  const { t, language } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  
  return (
    <View style={[styles.card, { backgroundColor: theme.cardBackground, borderRadius: 24, overflow: 'hidden' }]}>
      <Pressable
        onPress={() => setExpanded(!expanded)}
        className="flex-row items-center justify-between p-6"
      >
        <View className="flex-row items-center flex-1">
          <Ionicons name="list" size={20} color={theme.primaryText} />
          <Text style={{ fontSize: 20, fontWeight: '600', color: theme.primaryText, marginLeft: 12 }}>{t('result.ingredientAnalysis')}</Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={theme.gray400}
        />
      </Pressable>
      
      {expanded && (
        <View className="px-6 pb-6">
          {/* All Ingredients List - 完整成分列表 */}
              {((result as any).backendData?.allIngredients && (result as any).backendData.allIngredients.length > 0) ? (() => {
                // 處理所有成分，計算風險等級和描述
                const processedIngredients = (result as any).backendData.allIngredients.map((ingredient: any) => {
                  let riskLevel = 'safe';
                  let description = ingredient.description || '';
                  
                  if (ingredient.category === 'additive') {
                    const additive = (result as any).backendData?.additives?.find((a: any) => a.name === ingredient.name);
                    if (additive) {
                      // High → high, Medium → moderate, Low → low
                      riskLevel = additive.riskLevel === 'High' ? 'high' : additive.riskLevel === 'Medium' ? 'moderate' : 'low';
                      if (!description && additive.description) {
                        description = additive.description;
                      } else if (!description && additive.potentialHarm) {
                        description = additive.potentialHarm;
                      }
                    }
                  } else if (ingredient.category === 'concerning') {
                    const concerning = (result as any).backendData?.concerningIngredients?.find((c: any) => c.name === ingredient.name);
                    if (concerning) {
                      // High → high, Medium → moderate, Low → low
                      riskLevel = concerning.riskLevel === 'High' ? 'high' : concerning.riskLevel === 'Medium' ? 'moderate' : 'low';
                      if (!description && concerning.description) {
                        description = concerning.description;
                      } else if (!description && concerning.concerns) {
                        description = concerning.concerns;
                      }
                    }
                  } else if (ingredient.category === 'beneficial') {
                    const beneficial = (result as any).backendData?.beneficialIngredients?.find((b: any) => b.name === ingredient.name);
                    if (beneficial) {
                      riskLevel = 'safe';
                      if (!description && beneficial.description) {
                        description = beneficial.description;
                      } else if (!description && beneficial.benefits) {
                        description = beneficial.benefits;
                      }
                    }
                  } else if (ingredient.category === 'neutral') {
                    const concerning = (result as any).backendData?.concerningIngredients?.find((c: any) => c.name === ingredient.name);
                    if (concerning) {
                      // 如果在 concerningIngredients 中找到，使用其風險等級
                      riskLevel = concerning.riskLevel === 'High' ? 'high' : concerning.riskLevel === 'Medium' ? 'moderate' : 'low';
                      if (!description && concerning.description) {
                        description = concerning.description;
                      } else if (!description && concerning.concerns) {
                        description = concerning.concerns;
                      }
                    } else {
                      // 真正的中性成分
                      riskLevel = 'neutral';
                    }
                  }
                  
                  return {
                    name: ingredient.name,
                    description: description || '',
                    riskLevel: riskLevel,
                  };
                });
                
                // 按風險等級分組（不健康成分放在最前面）
                const groupedIngredients = {
                  high: processedIngredients.filter((ing: any) => ing.riskLevel === 'high'),
                  moderate: processedIngredients.filter((ing: any) => ing.riskLevel === 'moderate'),
                  low: processedIngredients.filter((ing: any) => ing.riskLevel === 'low'),
                  neutral: processedIngredients.filter((ing: any) => ing.riskLevel === 'neutral'),
                  safe: processedIngredients.filter((ing: any) => ing.riskLevel === 'safe'),
                };
                
                // 定義分類順序和標題（不健康成分放在最前面）
                const categories = [
                  { key: 'high', icon: 'warning', color: '#DC2626' }, // 高風險 - 紅色
                  { key: 'moderate', icon: 'alert-circle', color: '#EA580C' }, // 需關注 - 橘色
                  { key: 'low', icon: 'information-circle', color: '#D97706' }, // 低風險 - 黃色
                  { key: 'neutral', icon: 'remove-circle', color: '#6B7280' }, // 中性 - 灰色
                  { key: 'safe', icon: 'checkmark-circle', color: theme.success || '#10B981' }, // 安全 - 綠色
                ];
                
                return (
                  <View className="mb-6">
                    <View className="flex-row items-center mb-4">
                      <Ionicons name="list" size={20} color={theme.primaryText} />
                      <Text style={{ fontSize: 16, fontWeight: '600', color: theme.primaryText, marginLeft: 8 }}>
                        {t('result.fullIngredientList')} ({(result as any).backendData.allIngredients.length})
                      </Text>
                    </View>
                    
                    {categories.map((category) => {
                      const ingredients = groupedIngredients[category.key as keyof typeof groupedIngredients];
                      if (ingredients.length === 0) return null;
                      
                      return (
                        <View key={category.key} className="mb-6">
                          <View className="flex-row items-center mb-3">
                            <Ionicons name={category.icon as any} size={18} color={category.color} />
                            <Text style={{ fontSize: 15, fontWeight: '600', color: theme.primaryText, marginLeft: 8 }}>
                              {t(`result.ingredientCategory.${category.key}`)} ({ingredients.length})
                            </Text>
                          </View>
                          {ingredients.map((ingredient: any, index: number) => (
                            <IngredientItem 
                              key={`${category.key}-${index}`} 
                              ingredient={ingredient} 
                            />
                          ))}
                        </View>
                      );
                    })}
                  </View>
                );
              })() : (
            // 如果沒有完整成分列表，顯示分類的成分
            <>
              {/* Safe Ingredients */}
              {result.ingredients.safe.length > 0 && (
                <View className="mb-6">
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="checkmark-circle" size={20} color={theme.success} />
                    <Text style={{ 
                      fontSize: 16, 
                      fontWeight: '600', 
                      color: colorScheme === 'dark' ? '#6EE7B7' : '#059669',
                      marginLeft: 8,
                    }}>
                      {t('result.safeIngredients')} ({result.ingredients.safe.length})
                    </Text>
                  </View>
                  {result.ingredients.safe.map((ingredient, index) => (
                    <IngredientItem key={index} ingredient={ingredient} />
                  ))}
                </View>
              )}

              {/* Warning Ingredients */}
              {result.ingredients.warning.length > 0 && (
                <View>
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="warning" size={20} color={theme.warning} />
                    <Text style={{ 
                      fontSize: 16, 
                      fontWeight: '600', 
                      color: colorScheme === 'dark' ? '#FCD34D' : '#D97706',
                      marginLeft: 8,
                    }}>
                      {t('result.warningIngredients')} ({result.ingredients.warning.length})
                    </Text>
                  </View>
                  {result.ingredients.warning.map((ingredient, index) => (
                    <IngredientItem 
                      key={index} 
                      ingredient={ingredient} // 直接使用後端返回的數據
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
}

function IngredientItem({ ingredient }: { ingredient: { name: string; description?: string; riskLevel?: string } }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = React.useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  
  const getBadgeColor = (level?: string) => {
    if (colorScheme === 'dark') {
      switch (level) {
        case "high":
          return { bg: "#7F1D1D", text: "#FCA5A5" }; // 高風險 - 深紅色背景，淺紅色文字
        case "moderate":
          return { bg: "#9A3412", text: "#FDBA74" }; // 需關注 - 深橘色背景，淺橘色文字
        case "low":
          return { bg: "#78350F", text: "#FCD34D" }; // 低風險 - 深黃色背景，淺黃色文字
        case "neutral":
          return { bg: "#374151", text: "#D1D5DB" }; // 中性 - 深灰色背景，淺灰色文字
        case "safe":
          return { bg: "#064E3B", text: "#6EE7B7" }; // 安全 - 深綠色背景，淺綠色文字
        default:
          return { bg: theme.gray100, text: theme.gray500 };
      }
    } else {
      switch (level) {
        case "high":
          return { bg: "#FEE2E2", text: "#DC2626", fontWeight: '600' as const }; // 高風險 - 紅色（醒目警示）
        case "moderate":
          return { bg: "#FED7AA", text: "#C2410C", fontWeight: '600' as const }; // 需關注 - 橘色（警示色）
        case "low":
          return { bg: "#FEF3C7", text: "#D97706", fontWeight: '600' as const }; // 低風險 - 黃色（提醒色）
        case "neutral":
          return { bg: "#F3F4F6", text: "#4B5563", fontWeight: '500' as const }; // 中性 - 灰色（中性色）
        case "safe":
          return { bg: "#D1FAE5", text: "#065F46", fontWeight: '600' as const }; // 安全 - 綠色（安全色）
        default:
          return { bg: theme.gray100, text: theme.gray700 };
      }
    }
  };

  const getBadgeText = (level?: string) => {
    switch (level) {
      case "high":
        return t('result.badge.high');
      case "moderate":
        return t('result.badge.moderate');
      case "low":
        return t('result.badge.low');
      case "neutral":
        return t('result.badge.neutral');
      case "safe":
        return t('result.badge.safe');
      default:
        return t('result.badge.safe');
    }
  };

  const badgeColors = getBadgeColor(ingredient.riskLevel);
  
  return (
    <Pressable
      onPress={() => setExpanded(!expanded)}
      style={{
        marginBottom: 12,
        backgroundColor: theme.gray50,
        borderRadius: 16,
        padding: 16,
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text style={{ fontSize: 16, fontWeight: '500', color: theme.primaryText }}>
            {ingredient.name}
          </Text>
        </View>
        <View className="flex-row items-center">
          <View style={{
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 9999,
            backgroundColor: badgeColors.bg,
          }}>
            <Text style={{ 
              fontSize: 12, 
              fontWeight: badgeColors.fontWeight || '500', 
              color: badgeColors.text 
            }}>
              {getBadgeText(ingredient.riskLevel)}
            </Text>
          </View>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={theme.gray400}
            style={{ marginLeft: 8 }}
          />
        </View>
      </View>
      {expanded && (
        <View className="mt-3">
          {ingredient.description ? (
            <Text style={{ fontSize: 14, color: theme.secondaryText, lineHeight: 20 }}>
          {ingredient.description}
        </Text>
          ) : (
            <Text style={{ fontSize: 14, color: theme.gray400, fontStyle: 'italic', lineHeight: 20 }}>
              {t('result.noDescription')}
            </Text>
          )}
        </View>
      )}
    </Pressable>
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
  scoreCircle: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  gradientCard: {
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButton: {
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
});
