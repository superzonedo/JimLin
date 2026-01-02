import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { HighRiskIngredient } from "../utils/alertWall";
import { findAdditiveByName } from "../utils/additiveDatabase";

interface AlertWallSummaryProps {
  ingredients: HighRiskIngredient[];
}

export default function AlertWallSummary({ ingredients }: AlertWallSummaryProps) {
  if (ingredients.length === 0) {
    return null;
  }

  // 計算統計數據
  const stats = calculateStats(ingredients);
  const riskLevel = getRiskLevel(stats.cumulativeRiskScore);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#FEF3C7", "#FDE68A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.summaryCard}
      >
        {/* Title */}
        <View style={styles.titleRow}>
          <Ionicons name="analytics" size={24} color="#92400E" />
          <Text style={styles.title}>累積影響分析</Text>
        </View>

        {/* Main Risk Score Display */}
        <View style={styles.mainRiskContainer}>
          <View style={[styles.riskScoreCircle, { borderColor: riskLevel.color }]}>
            <Text style={[styles.riskScoreValue, { color: riskLevel.color }]}>
              {stats.cumulativeRiskScore}
            </Text>
            <Text style={styles.riskScoreMax}>/100</Text>
          </View>
          <View style={styles.riskInfoContainer}>
            <View style={[styles.riskLevelBadge, { backgroundColor: riskLevel.bgColor }]}>
              <Ionicons name={riskLevel.icon} size={16} color={riskLevel.color} />
              <Text style={[styles.riskLevelText, { color: riskLevel.color }]}>
                {riskLevel.label}
              </Text>
            </View>
            <Text style={styles.riskDescription}>{riskLevel.description}</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="repeat" size={18} color="#92400E" />
            <Text style={styles.statValue}>{stats.totalOccurrences} 次</Text>
            <Text style={styles.statLabel}>總出現</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="flask" size={18} color="#92400E" />
            <Text style={styles.statValue}>{ingredients.length} 種</Text>
            <Text style={styles.statLabel}>高風險成分</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

interface Stats {
  cumulativeRiskScore: number;
  totalOccurrences: number;
}

interface RiskLevel {
  label: string;
  color: string;
  bgColor: string;
  icon: any;
  description: string;
}

function getRiskLevel(score: number): RiskLevel {
  if (score >= 85) {
    return {
      label: "極高風險",
      color: "#DC2626", // 紅色
      bgColor: "#FEE2E2",
      icon: "alert-circle",
      description: "強烈建議立即調整飲食習慣",
    };
  } else if (score >= 70) {
    return {
      label: "高度警戒",
      color: "#F97316", // 橘色
      bgColor: "#FFEDD5",
      icon: "warning",
      description: "建議減少攝取這些成分",
    };
  } else if (score >= 55) {
    return {
      label: "需要注意",
      color: "#F59E0B", // 黃色
      bgColor: "#FEF3C7",
      icon: "alert",
      description: "注意控制攝取頻率",
    };
  } else {
    return {
      label: "低度風險",
      color: "#10B981", // 綠色
      bgColor: "#D1FAE5",
      icon: "checkmark-circle",
      description: "維持良好的飲食習慣",
    };
  }
}

function calculateStats(ingredients: HighRiskIngredient[]): Stats {
  let totalOccurrences = 0;
  let weightedRiskSum = 0;

  ingredients.forEach((ingredient) => {
    totalOccurrences += ingredient.count;
    // Weight risk by occurrence frequency
    weightedRiskSum += ingredient.riskScore * ingredient.count;
  });

  // Calculate cumulative risk score (0-100)
  // Normalize by dividing by total occurrences and scaling
  const avgRisk = totalOccurrences > 0 ? weightedRiskSum / totalOccurrences : 0;

  // Apply a multiplier based on frequency to emphasize repeated exposure
  const frequencyMultiplier = Math.min(1 + (totalOccurrences / 20), 1.5);

  const cumulativeRiskScore = Math.min(Math.round(avgRisk * frequencyMultiplier), 100);

  return {
    cumulativeRiskScore,
    totalOccurrences,
  };
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  summaryCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#78350F",
    marginLeft: 8,
  },
  mainRiskContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 16,
    padding: 16,
  },
  riskScoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  riskScoreValue: {
    fontSize: 32,
    fontWeight: "bold",
  },
  riskScoreMax: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: -4,
  },
  riskInfoContainer: {
    flex: 1,
  },
  riskLevelBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  riskLevelText: {
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 6,
  },
  riskDescription: {
    fontSize: 13,
    color: "#78350F",
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 12,
    padding: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#78350F",
    marginLeft: 6,
    marginRight: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#92400E",
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(146, 64, 14, 0.3)",
    marginHorizontal: 12,
  },
});
