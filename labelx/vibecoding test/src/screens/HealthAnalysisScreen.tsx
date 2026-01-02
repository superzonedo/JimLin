import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Dimensions,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useUserStore } from "../state/userStore";
import { useFoodScanStore } from "../state/foodScanStore";
import { analyzeHealthAlignment, HealthAnalysisResult } from "../api/health-analysis";
import { FoodAnalysisResult } from "../types/food";
import { useLanguage } from "../i18n/LanguageContext";
import { getOpenAIClient } from "../api/openai";
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<any>;

const HealthAnalysisScreen: React.FC = () => {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const preferences = useUserStore((s) => s.preferences);
  const { currentResult } = useFoodScanStore();

  const [analysis, setAnalysis] = useState<HealthAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    risks: false,
    nutrition: false,
    actions: false,
  });
  const [translating, setTranslating] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const fadeIn = useSharedValue(0);
  const slideDown = useSharedValue(0);

  const animatedFade = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
  }));

  const animatedSlide = useAnimatedStyle(() => ({
    transform: [{ translateY: slideDown.value }],
  }));

  useEffect(() => {
    loadHealthAnalysis();
  }, []);

  useEffect(() => {
    if (analysis) {
      fadeIn.value = withTiming(1, { duration: 300 });
      slideDown.value = withDelay(
        200,
        withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) })
      );
    }
  }, [analysis]);

  const loadHealthAnalysis = async () => {
    try {
      setLoading(true);
      if (!currentResult) {
        throw new Error("No scan result available");
      }
      const result = await analyzeHealthAlignment({
        foodAnalysis: currentResult,
        userPreferences: preferences,
      }, preferences.language || "zh-TW");
      setAnalysis(result);
    } catch (error) {
      console.error("Failed to load health analysis:", error);
      Alert.alert(t.healthAnalysis.analysisFailed, t.healthAnalysis.analysisFailedDesc);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const translateAnalysis = async () => {
    if (!analysis) return;

    try {
      setTranslating(true);
      const openai = getOpenAIClient();

      // 构建需要翻译的内容
      const contentToTranslate = {
        reasoning: analysis.riskAssessment.reasoning,
        personalizedAdvice: analysis.personalizedAdvice,
        diseaseRisks: analysis.diseaseRisks,
        alignedGoals: analysis.nutritionAlignment.alignedGoals,
        conflictingGoals: analysis.nutritionAlignment.conflictingGoals,
        actionItems: analysis.actionItems,
        bestForWhom: analysis.bestForWhom,
      };

      const response = await openai.chat.completions.create({
        model: "gpt-4o-2024-11-20",
        messages: [
          {
            role: "system",
            content: "你是一个专业的翻译助手。请将以下健康分析报告的内容从英文翻译成繁体中文(台湾)。保持原有的格式和结构,只翻译文字内容。确保医学和营养学术语的准确性。",
          },
          {
            role: "user",
            content: JSON.stringify(contentToTranslate, null, 2),
          },
        ],
        temperature: 0.3,
      });

      const translatedContent = JSON.parse(response.choices[0].message.content || "{}");

      // 更新分析结果
      setAnalysis({
        ...analysis,
        riskAssessment: {
          ...analysis.riskAssessment,
          reasoning: translatedContent.reasoning || analysis.riskAssessment.reasoning,
        },
        personalizedAdvice: translatedContent.personalizedAdvice || analysis.personalizedAdvice,
        diseaseRisks: translatedContent.diseaseRisks || analysis.diseaseRisks,
        nutritionAlignment: {
          ...analysis.nutritionAlignment,
          alignedGoals: translatedContent.alignedGoals || analysis.nutritionAlignment.alignedGoals,
          conflictingGoals: translatedContent.conflictingGoals || analysis.nutritionAlignment.conflictingGoals,
        },
        actionItems: translatedContent.actionItems || analysis.actionItems,
        bestForWhom: translatedContent.bestForWhom || analysis.bestForWhom,
      });

      Alert.alert("翻譯完成", "分析內容已翻譯為中文");
    } catch (error) {
      console.error("Translation failed:", error);
      Alert.alert("翻譯失敗", "無法翻譯內容,請稍後再試");
    } finally {
      setTranslating(false);
    }
  };

  const handleTranslatePress = () => {
    const timer = setTimeout(() => {
      translateAnalysis();
    }, 1000); // 长按1秒触发
    setLongPressTimer(timer);
  };

  const handleTranslateRelease = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const getRiskColor = (risk: string): string => {
    switch (risk) {
      case "low":
        return "#34C759"; // Green
      case "moderate":
        return "#FF9500"; // Orange
      case "high":
        return "#FF3B30"; // Red
      default:
        return "#8E8E93"; // Gray
    }
  };

  const getRiskLabel = (risk: string): string => {
    switch (risk) {
      case "low":
        return t.healthAnalysis.lowRisk;
      case "moderate":
        return t.healthAnalysis.moderateRisk;
      case "high":
        return t.healthAnalysis.highRisk;
      default:
        return "Unknown";
    }
  };

  const getOverallRiskColor = (risk: string): string => {
    switch (risk) {
      case "safe":
        return "#34C759"; // Green
      case "caution":
        return "#FF9500"; // Orange
      case "warning":
        return "#FF3B30"; // Red
      default:
        return "#8E8E93";
    }
  };

  const getOverallRiskLabel = (risk: string): string => {
    switch (risk) {
      case "safe":
        return t.healthAnalysis.safe;
      case "caution":
        return t.healthAnalysis.cautionRequired;
      case "warning":
        return t.healthAnalysis.warning;
      default:
        return "Unknown";
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#34C759" />
        <Text className="mt-3 text-gray-600">{t.healthAnalysis.analyzingAlignment}</Text>
      </View>
    );
  }

  if (!analysis) {
    return (
      <View className="flex-1 bg-white justify-center items-center px-4">
        <MaterialCommunityIcons name="alert-circle" size={48} color="#FF3B30" />
        <Text className="mt-3 text-lg font-semibold text-gray-900">
          {t.healthAnalysis.analysisFailed}
        </Text>
        <Text className="mt-2 text-center text-gray-600">
          {t.healthAnalysis.analysisFailedDesc}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 32,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View entering={FadeIn} className="px-4 mb-6">
        <Text className="text-3xl font-bold text-gray-900 mb-2">
          {t.healthAnalysis.title}
        </Text>
        <Text className="text-gray-600">
          {t.healthAnalysis.subtitle}
        </Text>
      </Animated.View>

      {/* Overall Risk Assessment */}
      <Animated.View entering={FadeInDown} className="px-4 mb-6">
        <View
          className="rounded-lg border-2 p-4"
          style={{
            borderColor: getOverallRiskColor(analysis.riskAssessment.overall),
            backgroundColor:
              analysis.riskAssessment.overall === "safe"
                ? "#F0FDF4"
                : analysis.riskAssessment.overall === "caution"
                  ? "#FFFBEB"
                  : "#FEF2F2",
          }}
        >
          <View className="flex-row items-center mb-3">
            {analysis.riskAssessment.overall === "safe" ? (
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color={getOverallRiskColor(analysis.riskAssessment.overall)}
              />
            ) : analysis.riskAssessment.overall === "caution" ? (
              <MaterialCommunityIcons
                name="alert-circle"
                size={24}
                color={getOverallRiskColor(analysis.riskAssessment.overall)}
              />
            ) : (
              <MaterialCommunityIcons
                name="alert-circle"
                size={24}
                color={getOverallRiskColor(analysis.riskAssessment.overall)}
              />
            )}
            <Text
              className="ml-3 text-lg font-semibold"
              style={{
                color: getOverallRiskColor(analysis.riskAssessment.overall),
              }}
            >
              {getOverallRiskLabel(analysis.riskAssessment.overall)}
            </Text>
          </View>
          <Text className="text-gray-700 leading-relaxed">
            {analysis.riskAssessment.reasoning}
          </Text>
        </View>
      </Animated.View>

      {/* Personalized Advice */}
      <Animated.View entering={FadeInDown} className="px-4 mb-6">
        <View className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <View className="flex-row items-start mb-2">
            <MaterialCommunityIcons name="heart" size={20} color="#3B82F6" style={{ marginTop: 2 }} />
            <Text className="ml-3 text-sm font-semibold text-blue-900 flex-1">
              {t.healthAnalysis.personalizedRecommendation}
            </Text>
          </View>
          <Text className="text-blue-800 leading-relaxed ml-8">
            {analysis.personalizedAdvice}
          </Text>
        </View>
      </Animated.View>

      {/* Disease Risks */}
      {analysis.diseaseRisks.length > 0 && (
        <Animated.View entering={FadeInDown} className="px-4 mb-6">
          <Pressable onPress={() => toggleSection("risks")}>
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-gray-900">
                {t.healthAnalysis.diseaseRiskAssessment}
              </Text>
              {expandedSections.risks ? (
                <MaterialCommunityIcons name="chevron-up" size={24} color="#666" />
              ) : (
                <MaterialCommunityIcons name="chevron-down" size={24} color="#666" />
              )}
            </View>
          </Pressable>

          {expandedSections.risks && (
            <View className="mt-4 gap-3">
              {analysis.diseaseRisks.map((risk, index) => (
                <View
                  key={index}
                  className="border-l-4 bg-gray-50 rounded-lg p-3"
                  style={{ borderLeftColor: getRiskColor(risk.risk) }}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="font-semibold text-gray-900">
                      {risk.disease}
                    </Text>
                    <Text
                      className="text-xs font-semibold px-2 py-1 rounded"
                      style={{
                        color: getRiskColor(risk.risk),
                        backgroundColor:
                          risk.risk === "low"
                            ? "#ECFDF5"
                            : risk.risk === "moderate"
                              ? "#FFFBEB"
                              : "#FEF2F2",
                      }}
                    >
                      {getRiskLabel(risk.risk)}
                    </Text>
                  </View>
                  <Text className="text-gray-700 text-sm leading-relaxed">
                    {risk.explanation}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      )}

      {/* Nutrition Alignment */}
      <Animated.View entering={FadeInDown} className="px-4 mb-6">
        <Pressable onPress={() => toggleSection("nutrition")}>
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-gray-900">
              {t.healthAnalysis.nutritionAlignment}
            </Text>
            {expandedSections.nutrition ? (
              <MaterialCommunityIcons name="chevron-up" size={24} color="#666" />
            ) : (
              <MaterialCommunityIcons name="chevron-down" size={24} color="#666" />
            )}
          </View>
        </Pressable>

        {expandedSections.nutrition && (
          <View className="mt-4 gap-3">
            {analysis.nutritionAlignment.alignedGoals.length > 0 && (
              <View>
                <Text className="text-sm font-semibold text-gray-600 mb-2">
                  {t.healthAnalysis.alignsWithGoals}
                </Text>
                <View className="gap-2">
                  {analysis.nutritionAlignment.alignedGoals.map((goal, idx) => (
                    <View
                      key={idx}
                      className="flex-row items-center bg-green-50 rounded-lg p-2"
                    >
                      <View className="w-2 h-2 rounded-full bg-green-500 mr-3" />
                      <Text className="text-green-700 text-sm flex-1">
                        {goal}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {analysis.nutritionAlignment.conflictingGoals.length > 0 && (
              <View className="mt-3">
                <Text className="text-sm font-semibold text-gray-600 mb-2">
                  {t.healthAnalysis.needsAttention}
                </Text>
                <View className="gap-2">
                  {analysis.nutritionAlignment.conflictingGoals.map(
                    (goal, idx) => (
                      <View
                        key={idx}
                        className="flex-row items-center bg-orange-50 rounded-lg p-2"
                      >
                        <View className="w-2 h-2 rounded-full bg-orange-500 mr-3" />
                        <Text className="text-orange-700 text-sm flex-1">
                          {goal}
                        </Text>
                      </View>
                    )
                  )}
                </View>
              </View>
            )}
          </View>
        )}
      </Animated.View>

      {/* Action Items */}
      {analysis.actionItems.length > 0 && (
        <Animated.View entering={FadeInDown} className="px-4 mb-6">
          <Pressable onPress={() => toggleSection("actions")}>
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-gray-900">
                {t.healthAnalysis.recommendedActions}
              </Text>
              {expandedSections.actions ? (
                <MaterialCommunityIcons name="chevron-up" size={24} color="#666" />
              ) : (
                <MaterialCommunityIcons name="chevron-down" size={24} color="#666" />
              )}
            </View>
          </Pressable>

          {expandedSections.actions && (
            <View className="mt-4 gap-2">
              {analysis.actionItems.map((item, index) => (
                <View key={index} className="flex-row items-start bg-blue-50 rounded-lg p-3">
                  <Text className="text-blue-600 font-bold mr-3">
                    {index + 1}.
                  </Text>
                  <Text className="text-blue-700 flex-1 text-sm leading-relaxed">
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      )}

      {/* Best For */}
      {analysis.bestForWhom && (
        <Animated.View entering={FadeInDown} className="px-4 mb-6">
          <View className="bg-purple-50 rounded-lg border border-purple-200 p-4">
            <Text className="text-sm font-semibold text-purple-900 mb-2">
              {t.healthAnalysis.bestFor}
            </Text>
            <Text className="text-purple-800 text-sm leading-relaxed">
              {analysis.bestForWhom}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Action Buttons */}
      <Animated.View entering={FadeInDown} className="px-4 gap-3">
        <Pressable
          onPress={() => navigation.goBack()}
          className="bg-gray-100 rounded-lg py-3 active:bg-gray-200"
        >
          <Text className="text-center text-gray-900 font-semibold">
            {t.healthAnalysis.backToResults}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            // Could implement sharing or saving analysis
            Alert.alert(t.common.success, t.healthAnalysis.analysisSaved);
          }}
          className="bg-green-500 rounded-lg py-3 active:bg-green-600"
        >
          <Text className="text-center text-white font-semibold">
            {t.healthAnalysis.saveAnalysis}
          </Text>
        </Pressable>

        {/* Translation Button */}
        <Pressable
          onPressIn={handleTranslatePress}
          onPressOut={handleTranslateRelease}
          className="bg-blue-600 rounded-lg py-3 active:bg-blue-700 flex-row items-center justify-center mt-4"
          disabled={translating}
        >
          {translating ? (
            <>
              <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text className="text-white font-semibold">{t.healthAnalysis.translating || "翻譯中..."}</Text>
            </>
          ) : (
            <>
              <MaterialCommunityIcons name="translate" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text className="text-white font-semibold">{t.healthAnalysis.translateToChineseHK || "翻譯英文至繁體中文"}</Text>
            </>
          )}
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
};

export default HealthAnalysisScreen;
