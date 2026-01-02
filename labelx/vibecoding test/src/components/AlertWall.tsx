import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { HighRiskIngredient } from "../utils/alertWall";
import { findAdditiveByName } from "../utils/additiveDatabase";
import AlertWallSummary from "./AlertWallSummary";

interface AlertWallProps {
  ingredients: HighRiskIngredient[];
}

export default function AlertWall({ ingredients }: AlertWallProps) {
  const [selectedIngredient, setSelectedIngredient] = useState<HighRiskIngredient | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleIngredientPress = (ingredient: HighRiskIngredient) => {
    console.log("Ingredient pressed:", ingredient.name);
    setSelectedIngredient(ingredient);
    // Use setTimeout to ensure state is set before modal opens
    setTimeout(() => {
      setShowDetailModal(true);
    }, 50);
  };

  console.log("AlertWall render - showDetailModal:", showDetailModal, "selectedIngredient:", selectedIngredient?.name);

  if (ingredients.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#2CB67D", "#249C6A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.successCard}
        >
          <View style={styles.successIconContainer}>
            <Ionicons name="shield-checkmark" size={32} color="white" />
          </View>
          <Text style={styles.successTitle}>Food Alert Wall</Text>
          <Text style={styles.successSubtitle}>Last 30 Days Scans</Text>
          <View style={styles.successDivider} />
          <Ionicons name="checkmark-circle-outline" size={56} color="rgba(255,255,255,0.9)" style={{ marginBottom: 12 }} />
          <Text style={styles.successText}>All recent products are low-risk!</Text>
          <Text style={styles.successSubtext}>Keep up your healthy eating habits ✨</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        {/* Header with Gradient Background */}
        <LinearGradient
          colors={["#FEF3C7", "#FDE68A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerIcon}>
              <Ionicons name="warning" size={24} color="#F59E0B" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Food Alert Wall</Text>
              <Text style={styles.headerSubtitle}>High-Risk Ingredients This Month</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Summary Analysis */}
        <View style={styles.summaryContainer}>
          <AlertWallSummary ingredients={ingredients} />
        </View>

        {/* Ingredient Cards */}
        <View style={styles.ingredientList}>
          {ingredients.slice(0, 5).map((ingredient, index) => (
            <TouchableOpacity
              key={`${ingredient.name}-${index}`}
              style={styles.ingredientCard}
              onPress={() => handleIngredientPress(ingredient)}
              activeOpacity={0.7}
            >
              {/* Rank Badge */}
              <LinearGradient
                colors={getRankGradient(index)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.rankBadge}
              >
                <Text style={styles.rankText}>{index + 1}</Text>
              </LinearGradient>
              
              {/* Content */}
              <View style={styles.ingredientContent}>
                <View style={styles.ingredientTop}>
                  <Text style={styles.ingredientName} numberOfLines={1}>
                    {ingredient.name}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                </View>
                
                {ingredient.eNumber && (
                  <View style={styles.eNumberBadge}>
                    <Text style={styles.eNumberText}>{ingredient.eNumber}</Text>
                  </View>
                )}
                
                  <View style={styles.ingredientStats}>
                  <View style={styles.statItem}>
                    <View style={styles.statIcon}>
                      <Ionicons name="scan" size={14} color="#6B7280" />
                    </View>
                    <Text style={styles.statText}>{ingredient.count} times</Text>
                  </View>

                  <View style={styles.statDivider} />

                  <View style={styles.statItem}>
                    <View style={[
                      styles.riskDot,
                      { backgroundColor: getRiskColor(ingredient.riskScore) }
                    ]} />
                    <Text style={styles.statText}>Risk {ingredient.riskScore}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer Tip */}
        <View style={styles.footerTip}>
          <Ionicons name="bulb" size={16} color="#F59E0B" />
          <Text style={styles.footerText}>Tap any ingredient to view detailed health impact and recommendations</Text>
        </View>
      </View>

      {/* Detail Modal - Outside ScrollView */}
      <Modal
        visible={showDetailModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowDetailModal(false)}
        >
          <Pressable 
            style={styles.modalContent} 
            onPress={(e) => e.stopPropagation()}
          >
            {selectedIngredient && (
              <IngredientDetail
                ingredient={selectedIngredient}
                onClose={() => setShowDetailModal(false)}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

// Helper function to get rank gradient colors
function getRankGradient(index: number): [string, string] {
  const gradients: [string, string][] = [
    ["#FCA5A5", "#EF4444"], // 1st - Red
    ["#FDBA74", "#F97316"], // 2nd - Orange
    ["#FCD34D", "#F59E0B"], // 3rd - Yellow
    ["#A3E635", "#84CC16"], // 4th - Lime
    ["#86EFAC", "#22C55E"], // 5th - Green
  ];
  return gradients[index] || gradients[4];
}

// Helper function to get risk color
function getRiskColor(riskScore: number): string {
  if (riskScore >= 70) return "#EF4444"; // Red
  if (riskScore >= 50) return "#F59E0B"; // Orange
  return "#6B7280"; // Gray
}

// Detail View Component
interface IngredientDetailProps {
  ingredient: HighRiskIngredient;
  onClose: () => void;
}

function IngredientDetail({ ingredient, onClose }: IngredientDetailProps) {
  const additiveInfo = findAdditiveByName(ingredient.name);
  console.log("Rendering IngredientDetail for:", ingredient.name, "AdditiveInfo:", !!additiveInfo);

  return (
    <View style={styles.detailContainer}>
      <ScrollView 
        style={styles.detailScrollView}
        contentContainerStyle={styles.detailScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.detailHeader}>
          <View style={styles.detailHeaderLeft}>
            <Text style={styles.detailTitle}>{ingredient.name}</Text>
            {ingredient.eNumber && (
              <View style={styles.detailENumberBadge}>
                <Text style={styles.detailENumberText}>{ingredient.eNumber}</Text>
              </View>
            )}
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </Pressable>
        </View>

        {/* Risk Badge */}
        <LinearGradient
          colors={getRiskGradientColors(ingredient.riskScore)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.riskBadgeCard}
        >
          <View style={styles.riskBadgeContent}>
            <Ionicons name="warning" size={24} color="white" />
            <View style={styles.riskBadgeText}>
              <Text style={styles.riskBadgeTitle}>
                {getRiskLevelText(ingredient.riskScore)}
              </Text>
              <Text style={styles.riskBadgeSubtitle}>
                風險值：{ingredient.riskScore} / 100
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Info Cards */}
        {additiveInfo && (
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Ionicons name="flask" size={20} color="#3B82F6" />
              <Text style={styles.infoCardLabel}>Category</Text>
              <Text style={styles.infoCardValue}>{additiveInfo.category}</Text>
            </View>
            
            <View style={styles.infoCard}>
              <Ionicons name="language" size={20} color="#8B5CF6" />
              <Text style={styles.infoCardLabel}>English Name</Text>
              <Text style={styles.infoCardValue} numberOfLines={2}>
                {additiveInfo.englishName}
              </Text>
            </View>
          </View>
        )}

        {/* Scan Stats */}
        <View style={styles.statsCard}>
          <Ionicons name="analytics" size={20} color="#F59E0B" />
          <View style={styles.statsCardContent}>
            <Text style={styles.statsCardTitle}>Scan Statistics</Text>
            <Text style={styles.statsCardValue}>
              Appeared <Text style={styles.statsCardHighlight}>{ingredient.count}</Text> times in last 30 days
            </Text>
          </View>
        </View>

        {/* Health Impact */}
        {additiveInfo?.description && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="heart-dislike" size={20} color="#EF4444" />
              <Text style={styles.sectionTitle}>Health Impact</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>{additiveInfo.description}</Text>
            </View>
          </View>
        )}

        {/* Recommendations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="checkmark-circle" size={20} color="#2CB67D" />
            <Text style={styles.sectionTitle}>Professional Recommendations</Text>
          </View>
          <View style={styles.sectionContent}>
            {getRecommendations(ingredient.riskScore, additiveInfo?.riskLevel).map((rec, index) => (
              <View key={index} style={styles.recommendationItem}>
                <View style={styles.recommendationDot} />
                <Text style={styles.recommendationText}>{rec}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Close Button */}
        <Pressable style={styles.detailCloseButton} onPress={onClose}>
          <LinearGradient
            colors={["#3B82F6", "#2563EB"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.detailCloseButtonGradient}
          >
            <Text style={styles.detailCloseButtonText}>Got it</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function getRiskGradientColors(riskScore: number): [string, string] {
  if (riskScore >= 70) return ["#EF4444", "#DC2626"];
  if (riskScore >= 50) return ["#F59E0B", "#D97706"];
  return ["#6B7280", "#4B5563"];
}

function getRiskLevelText(riskScore: number): string {
  if (riskScore >= 70) return "High Risk Ingredient";
  if (riskScore >= 50) return "Moderate Risk Ingredient";
  return "Low Risk Ingredient";
}

function getRecommendations(riskScore: number, riskLevel?: string): string[] {
  const recommendations = [
    "Carefully read the product ingredient list and choose alternatives",
    "When purchasing, prioritize natural and additive-free products",
    "Monitor your daily intake to avoid excessive consumption",
  ];

  if (riskScore >= 70 || riskLevel === "high") {
    recommendations[0] = "Strongly recommend avoiding this ingredient";
    recommendations.push("Pregnant women and children should be especially careful");
  }

  return recommendations;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  // Success State
  successCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#2CB67D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  successIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  successSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: 20,
  },
  successDivider: {
    width: 40,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    marginBottom: 24,
  },
  successText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 6,
  },
  successSubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.85)",
  },
  // Header
  headerGradient: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#78350F",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#92400E",
  },
  // Summary Container
  summaryContainer: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  // Ingredient List
  ingredientList: {
    backgroundColor: "white",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  ingredientCard: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  rankBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  rankText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  ingredientContent: {
    flex: 1,
  },
  ingredientTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  ingredientName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
  },
  eNumberBadge: {
    backgroundColor: "white",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  eNumberText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#EF4444",
  },
  ingredientStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statIcon: {
    marginRight: 4,
  },
  statText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 10,
  },
  riskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  // Footer
  footerTip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  footerText: {
    fontSize: 12,
    color: "#92400E",
    marginLeft: 6,
    flex: 1,
    lineHeight: 18,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "90%",
  },
  detailScrollView: {
    width: "100%",
  },
  detailScrollContent: {
    paddingBottom: 20,
  },
  // Detail View
  detailContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    minHeight: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  detailHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
    lineHeight: 28,
    flexWrap: "wrap",
  },
  detailENumberBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  detailENumberText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  // Risk Badge
  riskBadgeCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  riskBadgeContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  riskBadgeText: {
    marginLeft: 12,
    flex: 1,
  },
  riskBadgeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 2,
  },
  riskBadgeSubtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
  },
  // Info Grid
  infoGrid: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  infoCardLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 4,
  },
  infoCardValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
  },
  // Stats Card
  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  statsCardContent: {
    marginLeft: 12,
    flex: 1,
  },
  statsCardTitle: {
    fontSize: 12,
    color: "#92400E",
    marginBottom: 2,
  },
  statsCardValue: {
    fontSize: 14,
    color: "#78350F",
  },
  statsCardHighlight: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#F59E0B",
  },
  // Section
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginLeft: 8,
  },
  sectionContent: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: "#E5E7EB",
  },
  sectionText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 22,
  },
  // Recommendations
  recommendationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  recommendationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2CB67D",
    marginTop: 7,
    marginRight: 10,
  },
  recommendationText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
    flex: 1,
  },
  // Close Button
  detailCloseButton: {
    marginTop: 4,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  detailCloseButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  detailCloseButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
