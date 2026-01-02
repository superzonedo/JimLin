import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFoodScanStore } from "@/state/foodScanStore";
import { useSafeBack } from "@/utils/navigation";
import Animated, { FadeInDown } from "react-native-reanimated";
import { t } from "@/utils/i18n";

export default function PersonalizedAnalysisScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const safeBack = useSafeBack();
  const currentResult = useFoodScanStore((s) => s.currentResult);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    diseaseRisk: false,
    nutritionalAlignment: false,
    recommendedActions: false,
  });
  const [isSaved, setIsSaved] = useState(false);

  if (!currentResult) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-600">無分析數據</Text>
        <Pressable
          onPress={() => safeBack('/(tabs)/scan')}
          className="mt-6 bg-[#2CB67D] px-8 py-4 rounded-full"
        >
          <Text className="text-white font-semibold">返回掃描</Text>
        </Pressable>
      </View>
    );
  }

  const backendData = (currentResult as any)?.backendData;
  const healthScore = currentResult.healthScore;
  const nutrition = backendData?.nutritionPer100 || {};

  // 生成安全評估
  const safetyAssessment = useMemo(() => {
    const hasHighRisk = currentResult.ingredients.warning.some(
      (ing) => ing.riskLevel === 'warning' || ing.riskLevel === 'high'
    );
    const hasWarningAdditives = backendData?.additives?.some(
      (a: any) => a.riskLevel === 'High'
    ) || false;

    if (!hasHighRisk && !hasWarningAdditives && healthScore >= 70) {
      return {
        status: 'safe',
        title: t('personalizedAnalysis.safety.safe'),
        description: t('personalizedAnalysis.safety.safeDescription'),
        color: '#10B981',
        bgColor: '#D1FAE5',
      };
    } else if (healthScore >= 60) {
      return {
        status: 'moderate',
        title: t('personalizedAnalysis.safety.moderate'),
        description: t('personalizedAnalysis.safety.moderateDescription'),
        color: '#F59E0B',
        bgColor: '#FEF3C7',
      };
    } else {
      return {
        status: 'warning',
        title: t('personalizedAnalysis.safety.warning'),
        description: t('personalizedAnalysis.safety.warningDescription'),
        color: '#EF4444',
        bgColor: '#FEE2E2',
      };
    }
  }, [currentResult, backendData, healthScore]);

  // 生成個性化建議
  const personalizedRecommendations = useMemo(() => {
    const recommendations: string[] = [];

    // 根據營養數據生成建議
    const fiber = nutrition.fiberG || 0;
    const fat = nutrition.satFatG || 0;
    const sugar = nutrition.sugarG || 0;
    const sodium = nutrition.sodiumMg || 0;
    const calories = nutrition.energyKcal || 0;

    // 構建完整的中文建議
    if (fat < 3 && calories < 100) {
      recommendations.push(t('personalizedAnalysis.personalizedRecommendations.lowFatLowCalorie'));
      if (fiber >= 3) {
        recommendations.push(t('personalizedAnalysis.personalizedRecommendations.withFiber'));
      }
    } else if (fiber >= 3) {
      recommendations.push('此產品含有膳食纖維，有助於消化健康和體重管理。');
      if (calories < 100) {
        recommendations.push('熱量含量低，適合控制熱量攝取的人群。');
      }
    } else if (sugar < 5 && calories < 50) {
      recommendations.push(t('personalizedAnalysis.personalizedRecommendations.lowSugarLowCalorie'));
    } else {
      recommendations.push(t('personalizedAnalysis.personalizedRecommendations.default'));
    }

    return {
      description: recommendations.join(' '),
    };
  }, [nutrition]);

  // 生成疾病風險評估
  const diseaseRiskAssessment = useMemo(() => {
    const risks: Array<{ disease: string; level: string; description: string }> = [];

    // 檢查高血壓風險
    const sodium = nutrition.sodiumMg || 0;
    if (sodium > 600) {
      risks.push({
        disease: t('personalizedAlert.hypertension'),
        level: '高',
        description: t('personalizedAnalysis.diseaseRiskAssessment.hypertension.high'),
      });
    } else if (sodium > 300) {
      risks.push({
        disease: t('personalizedAlert.hypertension'),
        level: '中',
        description: t('personalizedAnalysis.diseaseRiskAssessment.hypertension.medium'),
      });
    }

    // 檢查糖尿病風險
    const sugar = nutrition.sugarG || 0;
    if (sugar > 15) {
      risks.push({
        disease: '糖尿病',
        level: '高',
        description: t('personalizedAnalysis.diseaseRiskAssessment.diabetes.high'),
      });
    } else if (sugar > 10) {
      risks.push({
        disease: '糖尿病',
        level: '中',
        description: t('personalizedAnalysis.diseaseRiskAssessment.diabetes.medium'),
      });
    }

    // 檢查其他風險
    const hasHighRiskAdditives = backendData?.additives?.some(
      (a: any) => a.riskLevel === 'High'
    ) || false;

    if (hasHighRiskAdditives) {
      risks.push({
        disease: '一般健康',
        level: '中',
        description: t('personalizedAnalysis.diseaseRiskAssessment.generalHealth.medium'),
      });
    }

    return risks;
  }, [nutrition, backendData]);

  // 生成營養對齊度
  const nutritionalAlignment = useMemo(() => {
    const alignments: Array<{ nutrient: string; status: string; description: string }> = [];

    const fiber = nutrition.fiberG || 0;
    const fat = nutrition.satFatG || 0;
    const sugar = nutrition.sugarG || 0;
    const sodium = nutrition.sodiumMg || 0;

    if (fiber >= 5) {
      alignments.push({
        nutrient: '膳食纖維',
        status: t('personalizedAnalysis.nutritionalAlignment.fiber.good'),
        description: t('personalizedAnalysis.nutritionalAlignment.fiber.goodDesc', { value: fiber.toString() }),
      });
    } else if (fiber >= 3) {
      alignments.push({
        nutrient: '膳食纖維',
        status: t('personalizedAnalysis.nutritionalAlignment.fiber.medium'),
        description: t('personalizedAnalysis.nutritionalAlignment.fiber.mediumDesc', { value: fiber.toString() }),
      });
    }

    if (fat <= 3) {
      alignments.push({
        nutrient: '脂肪',
        status: t('personalizedAnalysis.nutritionalAlignment.fat.good'),
        description: t('personalizedAnalysis.nutritionalAlignment.fat.goodDesc', { value: fat.toString() }),
      });
    } else if (fat <= 10) {
      alignments.push({
        nutrient: '脂肪',
        status: t('personalizedAnalysis.nutritionalAlignment.fat.medium'),
        description: t('personalizedAnalysis.nutritionalAlignment.fat.mediumDesc', { value: fat.toString() }),
      });
    }

    if (sugar <= 5) {
      alignments.push({
        nutrient: '糖分',
        status: t('personalizedAnalysis.nutritionalAlignment.sugar.good'),
        description: t('personalizedAnalysis.nutritionalAlignment.sugar.goodDesc', { value: sugar.toString() }),
      });
    } else if (sugar <= 10) {
      alignments.push({
        nutrient: '糖分',
        status: t('personalizedAnalysis.nutritionalAlignment.sugar.medium'),
        description: t('personalizedAnalysis.nutritionalAlignment.sugar.mediumDesc', { value: sugar.toString() }),
      });
    }

    if (sodium <= 300) {
      alignments.push({
        nutrient: '鈉',
        status: t('personalizedAnalysis.nutritionalAlignment.sodium.good'),
        description: t('personalizedAnalysis.nutritionalAlignment.sodium.goodDesc', { value: sodium.toString() }),
      });
    } else if (sodium <= 600) {
      alignments.push({
        nutrient: '鈉',
        status: t('personalizedAnalysis.nutritionalAlignment.sodium.medium'),
        description: t('personalizedAnalysis.nutritionalAlignment.sodium.mediumDesc', { value: sodium.toString() }),
      });
    }

    return alignments;
  }, [nutrition]);

  // 生成建議行動
  const recommendedActions = useMemo(() => {
    let actionsText = '';
    if (healthScore >= 80) {
      actionsText = t('personalizedAnalysis.recommendedActions.excellent');
    } else if (healthScore >= 60) {
      actionsText = t('personalizedAnalysis.recommendedActions.good');
    } else {
      actionsText = t('personalizedAnalysis.recommendedActions.poor');
    }
    // 將文字分割成陣列（以句號分割）
    return actionsText.split('。').filter(s => s.trim().length > 0).map(s => s.trim() + '。');
  }, [healthScore]);

  // 生成最適合對象
  const bestSuitedFor = useMemo(() => {
    const targets: string[] = [];
    const fiber = nutrition.fiberG || 0;
    const fat = nutrition.satFatG || 0;
    const sugar = nutrition.sugarG || 0;
    const calories = nutrition.energyKcal || 0;

    if (fat < 3 && calories < 100) {
      targets.push(t('personalizedAnalysis.bestSuitedFor.weightManagement'));
      targets.push(t('personalizedAnalysis.bestSuitedFor.heartHealth'));
      targets.push(t('personalizedAnalysis.bestSuitedFor.lowFatDiets'));
    }

    if (sugar < 5 && calories < 50) {
      targets.push(t('personalizedAnalysis.bestSuitedFor.diabetes'));
      targets.push(t('personalizedAnalysis.bestSuitedFor.lowCalorie'));
    }

    if (fiber >= 3) {
      targets.push(t('personalizedAnalysis.bestSuitedFor.digestiveHealth'));
    }

    if (targets.length === 0) {
      targets.push(t('personalizedAnalysis.bestSuitedFor.balancedNutrition'));
    }

    return {
      description: t('personalizedAnalysis.bestSuitedFor.description', { targets: targets.join('、') }),
    };
  }, [nutrition]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{ paddingTop: insets.top }}
          className="bg-white border-b border-gray-200"
        >
          <View className="flex-row items-center px-6 py-4">
            <Pressable onPress={() => safeBack('/result')}>
              <View className="flex-row items-center">
                <Ionicons name="arrow-back" size={20} color="#3B82F6" />
                <Text className="text-base text-[#3B82F6] ml-2">返回</Text>
              </View>
            </Pressable>
            <Text className="text-lg font-semibold text-[#001858] flex-1 text-center">
              {t('personalizedAnalysis.title')}
            </Text>
            <View style={{ width: 80 }} />
          </View>
        </View>

        {/* Main Title */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-[#001858] mb-2">
            健康對齊分析
          </Text>
          <Text className="text-sm text-gray-600">
            {t('personalizedAnalysis.subtitle')}
          </Text>
        </View>

        {/* Safety Assessment */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} className="px-6 mt-4">
          <View 
            className="rounded-2xl p-5 border-2"
            style={{ 
              backgroundColor: safetyAssessment.bgColor,
              borderColor: safetyAssessment.color,
            }}
          >
            <Text 
              className="text-lg font-bold mb-3"
              style={{ color: safetyAssessment.color }}
            >
              {safetyAssessment.title}
            </Text>
            <Text className="text-base text-[#001858] leading-6">
              {safetyAssessment.description}
            </Text>
          </View>
        </Animated.View>

        {/* Personalized Recommendations */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} className="px-6 mt-4">
          <View 
            className="rounded-2xl p-5 border-2"
            style={{ 
              backgroundColor: '#DBEAFE',
              borderColor: '#3B82F6',
            }}
          >
            <View className="flex-row items-center mb-3">
              <Ionicons name="heart" size={20} color="#3B82F6" />
              <Text className="text-lg font-bold text-[#3B82F6] ml-2">
                {t('personalizedAnalysis.personalizedRecommendations.title')}
              </Text>
            </View>
            <Text className="text-base text-[#1E40AF] leading-6">
              {personalizedRecommendations.description || t('personalizedAnalysis.personalizedRecommendations.default')}
            </Text>
          </View>
        </Animated.View>

        {/* Disease Risk Assessment - Collapsible */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} className="px-6 mt-4">
          <Pressable
            onPress={() => toggleSection('diseaseRisk')}
            className="flex-row items-center justify-between py-4"
          >
            <Text className="text-lg font-bold text-[#001858]">
              {t('personalizedAnalysis.diseaseRiskAssessment.title')}
            </Text>
            <Ionicons
              name={expandedSections.diseaseRisk ? "chevron-up" : "chevron-down"}
              size={20}
              color="#9CA3AF"
            />
          </Pressable>
          {expandedSections.diseaseRisk && (
            <View className="mt-2 pb-4">
              {diseaseRiskAssessment.length > 0 ? (
                diseaseRiskAssessment.map((risk, index) => (
                  <View key={index} className="bg-gray-50 rounded-xl p-4 mb-3">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-base font-semibold text-[#001858]">
                        {risk.disease}
                      </Text>
                      <View className={`px-3 py-1 rounded-full ${
                        risk.level === '高' ? 'bg-red-100' : 'bg-yellow-100'
                      }`}>
                        <Text className={`text-xs font-semibold ${
                          risk.level === '高' ? 'text-red-700' : 'text-yellow-700'
                        }`}>
                          {risk.level}風險
                        </Text>
                      </View>
                    </View>
                    <Text className="text-sm text-gray-600 leading-5">
                      {risk.description}
                    </Text>
                  </View>
                ))
              ) : (
                <View className="bg-green-50 rounded-xl p-4">
                  <Text className="text-sm text-green-700">
                    {t('personalizedAnalysis.diseaseRiskAssessment.noRisk')}
                  </Text>
                </View>
              )}
            </View>
          )}
        </Animated.View>

        {/* Nutritional Alignment - Collapsible */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} className="px-6 mt-2">
          <Pressable
            onPress={() => toggleSection('nutritionalAlignment')}
            className="flex-row items-center justify-between py-4"
          >
            <Text className="text-lg font-bold text-[#001858]">
              {t('personalizedAnalysis.nutritionalAlignment.title')}
            </Text>
            <Ionicons
              name={expandedSections.nutritionalAlignment ? "chevron-up" : "chevron-down"}
              size={20}
              color="#9CA3AF"
            />
          </Pressable>
          {expandedSections.nutritionalAlignment && (
            <View className="mt-2 pb-4">
              {nutritionalAlignment.length > 0 ? (
                nutritionalAlignment.map((alignment, index) => (
                  <View key={index} className="bg-gray-50 rounded-xl p-4 mb-3">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-base font-semibold text-[#001858]">
                        {alignment.nutrient}
                      </Text>
                      <View className={`px-3 py-1 rounded-full ${
                        alignment.status === '良好' ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        <Text className={`text-xs font-semibold ${
                          alignment.status === '良好' ? 'text-green-700' : 'text-yellow-700'
                        }`}>
                          {alignment.status}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-sm text-gray-600 leading-5">
                      {alignment.description}
                    </Text>
                  </View>
                ))
              ) : (
                <View className="bg-gray-50 rounded-xl p-4">
                  <Text className="text-sm text-gray-600">
                    {t('personalizedAnalysis.nutritionalAlignment.noData')}
                  </Text>
                </View>
              )}
            </View>
          )}
        </Animated.View>

        {/* Recommended Actions - Collapsible */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)} className="px-6 mt-2">
          <Pressable
            onPress={() => toggleSection('recommendedActions')}
            className="flex-row items-center justify-between py-4"
          >
            <Text className="text-lg font-bold text-[#001858]">
              {t('personalizedAnalysis.recommendedActions.title')}
            </Text>
            <Ionicons
              name={expandedSections.recommendedActions ? "chevron-up" : "chevron-down"}
              size={20}
              color="#9CA3AF"
            />
          </Pressable>
          {expandedSections.recommendedActions && (
            <View className="mt-2 pb-4">
              {recommendedActions.map((action, index) => (
                <View key={index} className="flex-row items-start mb-3">
                  <View className="w-2 h-2 bg-[#3B82F6] rounded-full mt-2 mr-3" />
                  <Text className="text-sm text-gray-600 leading-5 flex-1">
                    {action}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Best Suited For */}
        <Animated.View entering={FadeInDown.delay(600).duration(400)} className="px-6 mt-4">
          <View 
            className="rounded-2xl p-5 border-2"
            style={{ 
              backgroundColor: '#F3E8FF',
              borderColor: '#8B5CF6',
            }}
          >
            <Text className="text-lg font-bold text-[#8B5CF6] mb-3">
              {t('personalizedAnalysis.bestSuitedFor.title')}
            </Text>
            <Text className="text-base text-[#6B21A8] leading-6">
              {bestSuitedFor.description || t('personalizedAnalysis.bestSuitedFor.description', { targets: t('personalizedAnalysis.bestSuitedFor.balancedNutrition') })}
            </Text>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.delay(700).duration(400)} className="px-6 mt-6 mb-6">
          <Pressable
            onPress={() => safeBack('/result')}
            className="bg-gray-200 rounded-2xl py-4 mb-3"
          >
            <Text className="text-center text-base font-semibold text-gray-700">
              {t('personalizedAnalysis.buttons.backToResults')}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleSave}
            className="bg-[#2CB67D] rounded-2xl py-4"
          >
            <View className="flex-row items-center justify-center">
              {isSaved ? (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text className="text-center text-base font-semibold text-white ml-2">
                    {t('personalizedAnalysis.buttons.saved')}
                  </Text>
                </>
              ) : (
                <Text className="text-center text-base font-semibold text-white">
                  {t('personalizedAnalysis.buttons.saveAnalysis')}
                </Text>
              )}
            </View>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
