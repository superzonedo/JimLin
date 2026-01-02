import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface ShareCardViewProps {
  productName: string;
  healthScore: number;
  riskLevel: string;
  summary: string;
  imageUri?: string;
}

export default function ShareCardView({
  productName,
  healthScore,
  riskLevel,
  summary,
  imageUri,
}: ShareCardViewProps) {
  const getScoreColor = (score: number) => {
    if (score >= 71) return "#10B981"; // Green
    if (score >= 31) return "#F59E0B"; // Yellow
    return "#EF4444"; // Red
  };

  const getGradientColors = (score: number): [string, string] => {
    if (score >= 71) return ["#10B981", "#059669"];
    if (score >= 31) return ["#F59E0B", "#D97706"];
    return ["#EF4444", "#DC2626"];
  };

  const getRiskLevelText = (level: string) => {
    switch (level) {
      case "low":
        return "良好安全等級";
      case "medium":
        return "中等安全等級";
      case "high":
        return "較高風險";
      default:
        return "未知";
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#F1EFE7", "#E8E6DE"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.appName}>LabelX</Text>
        <Text style={styles.headerSubtitle}>智能食品標籤分析</Text>
      </LinearGradient>

      {/* Product Image (if available) */}
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.productImage} resizeMode="cover" />
      )}

      {/* Product Name */}
      <View style={styles.productNameContainer}>
        <Text style={styles.productName} numberOfLines={2}>
          {productName}
        </Text>
      </View>

      {/* Score Circle */}
      <View style={styles.scoreSection}>
        <LinearGradient
          colors={getGradientColors(healthScore)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.scoreCircleGradient}
        >
          <View style={styles.scoreCircleInner}>
            <Text style={styles.scoreNumber}>{healthScore}</Text>
            <Text style={styles.scoreLabel}>健康分數</Text>
          </View>
        </LinearGradient>

        <View style={styles.riskLevelContainer}>
          <View style={[styles.riskBadge, { backgroundColor: getScoreColor(healthScore) + "20" }]}>
            <Ionicons
              name={
                healthScore >= 71
                  ? "checkmark-circle"
                  : healthScore >= 31
                  ? "alert-circle"
                  : "close-circle"
              }
              size={20}
              color={getScoreColor(healthScore)}
            />
            <Text style={[styles.riskText, { color: getScoreColor(healthScore) }]}>
              {getRiskLevelText(riskLevel)}
            </Text>
          </View>
        </View>
      </View>

      {/* AI Analysis */}
      <View style={styles.analysisSection}>
        <View style={styles.analysisHeader}>
          <Ionicons name="analytics" size={20} color="#2CB67D" />
          <Text style={styles.analysisTitle}>AI 分析摘要</Text>
        </View>
        <Text style={styles.analysisText} numberOfLines={5}>
          {summary}
        </Text>
      </View>

      {/* Footer with CTA */}
      <View style={styles.footer}>
        <View style={styles.footerDivider} />
        <View style={styles.footerContent}>
          <Ionicons name="scan-outline" size={18} color="#2CB67D" />
          <Text style={styles.footerText}>掃描你的食品，守護全家健康</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 375,
    backgroundColor: "#FFFFFF",
    borderRadius: 0,
    overflow: "hidden",
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#001858",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  productImage: {
    width: "100%",
    height: 220,
    backgroundColor: "#F3F4F6",
  },
  productNameContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  productName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#001858",
    textAlign: "center",
    lineHeight: 30,
  },
  scoreSection: {
    alignItems: "center",
    paddingVertical: 20,
    paddingBottom: 24,
  },
  scoreCircleGradient: {
    width: 150,
    height: 150,
    borderRadius: 75,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  scoreCircleInner: {
    width: "100%",
    height: "100%",
    borderRadius: 69,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNumber: {
    fontSize: 60,
    fontWeight: "bold",
    color: "#001858",
    lineHeight: 68,
  },
  scoreLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
    fontWeight: "500",
  },
  riskLevelContainer: {
    marginTop: 18,
  },
  riskBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  riskText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
  analysisSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 18,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  analysisHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  analysisTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#001858",
    marginLeft: 6,
  },
  analysisText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 21,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  footerDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 18,
  },
  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 13,
    color: "#2CB67D",
    marginLeft: 6,
    fontWeight: "500",
  },
});
