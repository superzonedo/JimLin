import { findAdditiveByName } from '@/utils/additiveDatabase';
import { HighRiskIngredient } from '@/utils/alertWall';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AlertWallProps {
  ingredients: HighRiskIngredient[];
}

export default function AlertWall({ ingredients }: AlertWallProps) {
  const [selectedIngredient, setSelectedIngredient] = useState<HighRiskIngredient | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handlePress = (ingredient: HighRiskIngredient) => {
    setSelectedIngredient(ingredient);
    setShowDetailModal(true);
  };

  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedIngredient(null);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#9CA3AF';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'high': return '高風險';
      case 'medium': return '中風險';
      case 'low': return '低風險';
      default: return '未知';
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="warning" size={20} color="#EF4444" />
            <Text style={styles.title}>風險成分警示</Text>
          </View>
          <Text style={styles.subtitle}>曾經購買的高風險成分</Text>
        </View>

        <View style={styles.listContainer}>
          {ingredients.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.itemContainer, { borderColor: getRiskColor(item.riskLevel) + '40', backgroundColor: getRiskColor(item.riskLevel) + '10' }]}
              onPress={() => handlePress(item)}
            >
              <View style={styles.itemContent}>
                <View style={[styles.countBadge, { backgroundColor: getRiskColor(item.riskLevel) + '20' }]}>
                  <Text style={[styles.countText, { color: getRiskColor(item.riskLevel) }]}>{item.count}</Text>
                </View>
                <View>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={[styles.riskScore, { color: getRiskColor(item.riskLevel) }]}>
                    {getRiskLabel(item.riskLevel)} • {item.lastDetected}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={getRiskColor(item.riskLevel)} />
            </TouchableOpacity>
          ))}
          
          {ingredients.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="shield-checkmark" size={48} color="#10B981" />
              <Text style={styles.emptyText}>本週飲食非常健康！</Text>
            </View>
          )}
        </View>
      </View>

      {/* Detail Modal */}
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

// Detail View Component
interface IngredientDetailProps {
  ingredient: HighRiskIngredient;
  onClose: () => void;
}

function IngredientDetail({ ingredient, onClose }: IngredientDetailProps) {
  const additiveInfo = findAdditiveByName(ingredient.name);
  const riskScore = ingredient.riskScore || (ingredient.riskLevel === "high" ? 75 : ingredient.riskLevel === "medium" ? 55 : 30);

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
          colors={getRiskGradientColors(riskScore)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.riskBadgeCard}
        >
          <View style={styles.riskBadgeContent}>
            <Ionicons name="warning" size={24} color="white" />
            <View style={styles.riskBadgeText}>
              <Text style={styles.riskBadgeTitle}>
                {getRiskLevelText(riskScore)}
              </Text>
              <Text style={styles.riskBadgeSubtitle}>
                風險值：{riskScore} / 100
              </Text>
            </View>
            <View style={styles.riskBadgeRight}>
              <Text style={styles.riskBadgeCount}>{ingredient.count} 次</Text>
              <Text style={styles.riskBadgeCountLabel}>近30日</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Info Cards */}
        {additiveInfo && (
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Ionicons name="flask" size={20} color="#3B82F6" />
              <Text style={styles.infoCardLabel}>類別</Text>
              <Text style={styles.infoCardValue}>{additiveInfo.category}</Text>
            </View>
            
            {additiveInfo.englishName && (
              <View style={styles.infoCard}>
                <Ionicons name="language" size={20} color="#8B5CF6" />
                <Text style={styles.infoCardLabel}>英文名</Text>
                <Text style={styles.infoCardValue} numberOfLines={2}>
                  {additiveInfo.englishName}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Health Impact */}
        {(additiveInfo?.description || ingredient.description) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="heart-dislike" size={20} color="#EF4444" />
              <Text style={styles.sectionTitle}>健康影響</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.sectionText}>
                {additiveInfo?.description || ingredient.description || "暫無詳細說明。"}
              </Text>
            </View>
          </View>
        )}

        {/* Recommendations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="checkmark-circle" size={20} color="#2CB67D" />
            <Text style={styles.sectionTitle}>專業建議</Text>
          </View>
          <View style={styles.sectionContent}>
            {getRecommendations(riskScore, ingredient.riskLevel).map((rec, index) => (
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
            <Text style={styles.detailCloseButtonText}>我知道了</Text>
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
  if (riskScore >= 70) return "高風險成分";
  if (riskScore >= 50) return "中風險成分";
  return "低風險成分";
}

function getRecommendations(riskScore: number, riskLevel?: string): string[] {
  const recommendations = [
    "仔細閱讀產品成分表，選擇替代品",
    "購買時優先選擇天然、無添加產品",
    "注意每日總攝取量，避免過量",
  ];

  if (riskScore >= 70 || riskLevel === "high") {
    recommendations[0] = "建議盡量避免攝取此成分";
    recommendations.push("孕婦、兒童應特別注意避免");
  }

  return recommendations;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#001858',
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  listContainer: {
    gap: 12,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countBadge: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  countText: {
    fontWeight: '700',
    fontSize: 12,
  },
  itemName: {
    fontWeight: '700',
    color: '#1F2937',
    fontSize: 14,
  },
  riskScore: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    marginTop: 8,
    fontSize: 14,
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
    justifyContent: "space-between",
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
  riskBadgeRight: {
    alignItems: "flex-end",
    marginLeft: 12,
  },
  riskBadgeCount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 2,
  },
  riskBadgeCountLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
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
