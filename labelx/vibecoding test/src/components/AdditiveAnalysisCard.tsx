import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AdditiveAnalysis } from "../types/food";
import Animated, { FadeInDown } from "react-native-reanimated";

interface Props {
  analysis: AdditiveAnalysis | undefined;
}

export default function AdditiveAnalysisCard({ analysis }: Props) {
  // 如果沒有檢測到添加物，顯示綠色通過標誌
  if (!analysis || analysis.detectedAdditives.length === 0) {
    return (
      <View className="bg-green-50 mx-6 mt-6 rounded-3xl p-6" style={{ backgroundColor: "#F0FDF4", borderLeftWidth: 4, borderLeftColor: "#34C759" }}>
        <View className="flex-row items-center">
          <Ionicons name="checkmark-circle" size={28} color="#34C759" />
          <Text className="text-lg font-semibold ml-3" style={{ color: "#001858" }}>
            未檢測到有害添加物 ✓
          </Text>
        </View>
        <Text className="text-sm mt-2" style={{ color: "#6B7280" }}>
          此產品不含常見的高風險食品添加劑
        </Text>
      </View>
    );
  }

  // 分類添加物
  const highRisk = analysis.detectedAdditives.filter((a) => a.riskLevel === "high");
  const mediumRisk = analysis.detectedAdditives.filter((a) => a.riskLevel === "medium");
  const lowRisk = analysis.detectedAdditives.filter((a) => a.riskLevel === "low");

  return (
    <View className="bg-white mx-6 mt-6 rounded-3xl p-6">
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <Ionicons name="warning" size={24} color="#FF9500" />
        <Text className="text-lg font-semibold text-[#001858] ml-2">
          食品添加物分析
        </Text>
      </View>

      {/* Summary */}
      <Text className="text-sm text-gray-600 mb-4">
        檢測到 {analysis.detectedAdditives.length} 種食品添加物
        {highRisk.length > 0 && `，包含 ${highRisk.length} 種高風險添加物`}
      </Text>

      {/* High Risk Additives */}
      {highRisk.length > 0 && (
        <AdditiveSection
          title="高風險添加物"
          count={highRisk.length}
          additives={highRisk}
          color="#FF3B30"
          bgColor="#FEF2F2"
        />
      )}

      {/* Medium Risk Additives */}
      {mediumRisk.length > 0 && (
        <AdditiveSection
          title="中風險添加物"
          count={mediumRisk.length}
          additives={mediumRisk}
          color="#FF9500"
          bgColor="#FEF7F0"
        />
      )}

      {/* Low Risk Additives */}
      {lowRisk.length > 0 && (
        <AdditiveSection
          title="低風險添加物"
          count={lowRisk.length}
          additives={lowRisk}
          color="#6B7280"
          bgColor="#F3F4F6"
        />
      )}
    </View>
  );
}

interface AdditiveSectionProps {
  title: string;
  count: number;
  additives: AdditiveAnalysis["detectedAdditives"];
  color: string;
  bgColor: string;
}

function AdditiveSection({ title, count, additives, color, bgColor }: AdditiveSectionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View className="mb-4">
      <Pressable
        onPress={() => setExpanded(!expanded)}
        className="flex-row items-center justify-between py-2"
      >
        <View className="flex-row items-center flex-1">
          <View
            style={{ backgroundColor: bgColor }}
            className="w-3 h-3 rounded-full mr-2"
          />
          <Text className="text-base font-semibold" style={{ color }}>
            {title} ({count})
          </Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#9CA3AF"
        />
      </Pressable>

      {expanded && (
        <Animated.View entering={FadeInDown.duration(300)}>
          {additives.map((additive, index) => (
            <AdditiveItem
              key={index}
              additive={additive}
              color={color}
              bgColor={bgColor}
            />
          ))}
        </Animated.View>
      )}
    </View>
  );
}

interface AdditiveItemProps {
  additive: AdditiveAnalysis["detectedAdditives"][0];
  color: string;
  bgColor: string;
}

function AdditiveItem({ additive, color, bgColor }: AdditiveItemProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Pressable
      onPress={() => setShowDetails(!showDetails)}
      className="ml-5 mb-3 bg-gray-50 rounded-2xl p-4"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-base font-medium text-[#001858] mb-1">
            {additive.name}
          </Text>
          {additive.eNumber && (
            <Text className="text-xs text-gray-500 mb-1">{additive.eNumber}</Text>
          )}
          <Text className="text-xs text-gray-500">{additive.category}</Text>
        </View>
        <View className="items-end">
          <Text style={{ color }} className="text-xs font-semibold">
            -{additive.deductionPoints}分
          </Text>
          <Ionicons
            name={showDetails ? "chevron-up" : "chevron-down"}
            size={16}
            color="#9CA3AF"
            style={{ marginTop: 4 }}
          />
        </View>
      </View>

      {showDetails && (
        <Animated.View entering={FadeInDown.duration(200)} className="mt-3">
          <View className="border-t border-gray-200 pt-3">
            <Text className="text-sm text-gray-600 leading-5">
              {additive.description}
            </Text>
          </View>
        </Animated.View>
      )}
    </Pressable>
  );
}
