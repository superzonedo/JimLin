import { FoodAnalysisResult } from "@/types/food";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useSafeBack } from "@/utils/navigation";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function UITest1Screen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const safeBack = useSafeBack();
  const [isPurchased, setIsPurchased] = useState(false);

  // 模擬掃描結果數據
  const mockResult: FoodAnalysisResult = {
    id: "uitest1-mock-001",
    timestamp: new Date().toISOString(),
    imageUri: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
    healthScore: 85,
    summary: "該食品主要成分為蒟蒻，無高風險添加劑，適合大多數人群食用。產品採用天然原料製成，營養價值高。",
    recommendation: "建議適量攝取，注意均衡飲食，搭配新鮮蔬果。此產品低熱量、高纖維，適合減重期間食用。",
    riskLevel: "low",
    ingredients: {
      safe: [
        { 
          name: "蒟蒻精粉", 
          description: "主要成分，提供膳食纖維，有助於腸道健康。蒟蒻是一種低熱量、高纖維的天然食材，適合減重和健康飲食。", 
          riskLevel: "safe" 
        },
        { 
          name: "海藻粉", 
          description: "天然成分，富含礦物質如碘、鈣、鐵等。海藻含有豐富的維生素和抗氧化物質，對健康有益。", 
          riskLevel: "safe" 
        },
        { 
          name: "水酸化鈣", 
          description: "食品添加劑，用於凝固和穩定產品質地。在適量使用下是安全的，符合食品安全標準。", 
          riskLevel: "safe" 
        },
        { 
          name: "天然香料", 
          description: "從植物中提取的天然香料，不含人工合成成分，安全無害。", 
          riskLevel: "safe" 
        },
      ],
      warning: [],
    },
    nutritionBenefits: [
      { name: "低熱量" },
      { name: "高纖維" },
      { name: "無添加糖" },
      { name: "富含礦物質" },
    ],
    isPurchased: false,
  };

  const getScoreColor = (score: number) => {
    if (score >= 71) return "#10B981";
    if (score >= 31) return "#F59E0B";
    return "#EF4444";
  };

  const getRiskLevelText = (level?: string) => {
    switch (level) {
      case "low":
        return "良好安全等級";
      case "medium":
        return "中等安全等級";
      case "high":
        return "較高風險";
      default:
        return "良好安全等級";
    }
  };

  const hasWarningIngredients = mockResult.ingredients.warning.length > 0;

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
          <View className="flex-row items-center justify-between px-6 py-4">
            <Pressable onPress={() => safeBack('/(tabs)/scan')}>
              <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </Pressable>
            <Text className="text-lg font-semibold text-[#001858]">掃描結果 (UI測試)</Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        {/* Premium Upgrade Prompt */}
        <Animated.View entering={FadeInDown.duration(400)} className="mx-6 mt-6">
          <Pressable
            onPress={() => {
              console.log("Navigate to premium");
            }}
            style={styles.premiumPrompt}
          >
            <LinearGradient
              colors={["#2CB67D", "#26A56A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 }}
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center mr-2">
                  <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-xs mb-0.5">
                    解鎖個性化健康分析
                  </Text>
                  <Text className="text-white/90 text-xs">
                    根據您的健康設定，為您量身打造過敏原與疾病風險警示
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Image and Score Card */}
        <Animated.View 
          entering={FadeIn.duration(400)}
          className="bg-white mx-6 mt-6 rounded-3xl overflow-hidden"
          style={styles.card}
        >
          <Image
            source={{ uri: mockResult.imageUri }}
            className="w-full h-48"
            resizeMode="cover"
          />
          
          {/* Score Circle */}
          <View className="items-center py-8">
            <View
              style={[
                styles.scoreCircle,
                { borderColor: getScoreColor(mockResult.healthScore) },
              ]}
              className="w-32 h-32 rounded-full items-center justify-center border-8"
            >
              <Text className="text-5xl font-bold text-[#001858]">
                {mockResult.healthScore}
              </Text>
            </View>
            
            <Text className="text-xl font-semibold text-[#001858] mt-6">
              {getRiskLevelText(mockResult.riskLevel)}
            </Text>
            
            <Text className="text-base text-gray-600 text-center mt-2 px-6">
              {mockResult.summary}
            </Text>

            {/* Confirm Purchase Button */}
            {!isPurchased && (
              <Pressable
                className="bg-[#3B82F6] py-3 rounded-xl items-center mx-2 mt-6 px-4"
                style={styles.confirmButton}
                onPress={() => setIsPurchased(true)}
              >
                <View className="flex-row items-center">
                  <Ionicons name="bookmark" size={18} color="#FFFFFF" />
                  <Text className="text-white font-semibold text-base ml-2">納入健康分析</Text>
                </View>
                <Text className="text-white text-xs mt-1 opacity-90">
                  點擊後此產品將納入您的健康數據分析
                </Text>
              </Pressable>
            )}

            {/* Purchase Confirmed Badge */}
            {isPurchased && (
              <View className="w-full bg-green-50 py-3 rounded-2xl items-center mx-2 mt-6 border-2 border-green-200">
                <View className="flex-row items-center">
                  <Text className="text-green-700 font-bold text-base">已納入健康分析</Text>
                  <Text className="text-green-700 text-xl ml-2">✅</Text>
                </View>
                <Text className="text-green-600 text-xs mt-1">
                  此產品已納入您的健康數據分析
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View className="flex-row items-center mt-4 w-full px-2">
              <Pressable
                className="flex-1 bg-[#2CB67D] py-3 rounded-full items-center mx-2"
                onPress={() => router.push("/(tabs)/scan")}
              >
                <Text className="text-white font-semibold">繼續掃描</Text>
              </Pressable>
              <Pressable
                className="flex-1 bg-gray-600 py-3 rounded-full items-center mx-2"
                onPress={() => {
                  console.log("Share result");
                }}
              >
                <Text className="text-white font-semibold">分享報告</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>

        {/* No Harmful Additives Card - Only show if no warning ingredients */}
        {!hasWarningIngredients && (
          <Animated.View 
            entering={FadeInDown.delay(300).duration(400)}
            className="mx-6 mt-6"
          >
            <View className="bg-green-50 rounded-3xl p-6 border border-green-200">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={28} color="#10B981" />
                <Text className="text-lg font-semibold text-green-700 ml-3">
                  未檢測到有害添加物 ✓
                </Text>
              </View>
              <Text className="text-sm text-green-600 mt-2">
                此產品不含常見的高風險食品添加劑
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Ingredient Analysis */}
        <Animated.View 
          entering={FadeInDown.delay(400).duration(400)}
          className="bg-white mx-6 mt-6 rounded-3xl p-6"
          style={styles.card}
        >
          <Text className="text-xl font-semibold text-[#001858] mb-4">成分分析</Text>

          {/* Safe Ingredients */}
          {mockResult.ingredients.safe.length > 0 && (
            <View className="mb-6">
              <View className="flex-row items-center mb-3">
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text className="text-base font-semibold text-green-600 ml-2">
                  完全成分 ({mockResult.ingredients.safe.length})
                </Text>
              </View>
              {mockResult.ingredients.safe.map((ingredient, index) => (
                <IngredientItem key={index} ingredient={ingredient} />
              ))}
            </View>
          )}

          {/* Warning Ingredients */}
          {mockResult.ingredients.warning.length > 0 && (
            <View>
              <View className="flex-row items-center mb-3">
                <Ionicons name="warning" size={20} color="#F59E0B" />
                <Text className="text-base font-semibold text-orange-600 ml-2">
                  需注意成分 ({mockResult.ingredients.warning.length})
                </Text>
              </View>
              {mockResult.ingredients.warning.map((ingredient, index) => (
                <IngredientItem key={index} ingredient={ingredient} />
              ))}
            </View>
          )}
        </Animated.View>

        {/* Nutrition Benefits */}
        {mockResult.nutritionBenefits && mockResult.nutritionBenefits.length > 0 && (
          <Animated.View 
            entering={FadeInDown.delay(500).duration(400)}
            className="bg-white mx-6 mt-6 rounded-3xl p-6"
            style={styles.card}
          >
            <View className="flex-row items-center mb-4">
              <Ionicons name="heart" size={20} color="#2CB67D" />
              <Text className="text-xl font-semibold text-[#001858] ml-2">健康益處</Text>
            </View>
            {mockResult.nutritionBenefits.map((benefit, index) => (
              <View key={index} className="flex-row items-center py-3 border-b border-gray-100">
                <Ionicons name="checkmark-circle-outline" size={20} color="#2CB67D" />
                <Text className="text-base text-[#001858] ml-3">{benefit.name}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Recommendation */}
        <Animated.View 
          entering={FadeInDown.delay(600).duration(400)}
          className="bg-white mx-6 mt-6 mb-6 rounded-3xl p-6 border-l-4"
          style={[styles.card, { borderLeftColor: '#3B82F6', borderLeftWidth: 4 }]}
        >
          <View className="flex-row items-start">
            <View className="w-10 h-10 bg-blue-50 rounded-lg items-center justify-center mr-3">
              <Ionicons name="bulb" size={20} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-[#001858] mb-2">
                健康建議
              </Text>
              <Text className="text-base text-[#001858] leading-6">
                {mockResult.recommendation}
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function IngredientItem({ ingredient }: { ingredient: { name: string; description?: string; riskLevel?: string } }) {
  const [expanded, setExpanded] = React.useState(false);
  
  const getBadgeColor = (level?: string) => {
    switch (level) {
      case "safe":
        return "bg-green-100 text-green-700";
      case "moderate":
        return "bg-yellow-100 text-yellow-700";
      case "warning":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getBadgeText = (level?: string) => {
    switch (level) {
      case "safe":
        return "安全";
      case "moderate":
        return "健康";
      case "warning":
        return "注意";
      default:
        return "安全";
    }
  };

  return (
    <Pressable
      onPress={() => setExpanded(!expanded)}
      className="mb-3 bg-gray-50 rounded-2xl p-4"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-base font-medium text-[#001858]">
            {ingredient.name}
          </Text>
        </View>
        <View className="flex-row items-center">
          <View className={`px-3 py-1 rounded-full ${getBadgeColor(ingredient.riskLevel)}`}>
            <Text className="text-sm font-medium">
              {getBadgeText(ingredient.riskLevel)}
            </Text>
          </View>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#9CA3AF"
            style={{ marginLeft: 8 }}
          />
        </View>
      </View>
      {expanded && ingredient.description && (
        <Text className="text-sm text-gray-600 mt-3 leading-5">
          {ingredient.description}
        </Text>
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
  confirmButton: {
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  premiumPrompt: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#2CB67D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});



