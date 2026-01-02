import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SmartHealthAlert } from "../utils/smartHealthAlert";
import { useLanguage } from "../i18n/LanguageContext";

interface SmartAlertBannerProps {
  alert: SmartHealthAlert;
  hasHealthSettings: boolean;
}

export default function SmartAlertBanner({ alert, hasHealthSettings }: SmartAlertBannerProps) {
  const { t } = useLanguage();
  // 預設只展開摘要，不展開詳細內容
  const [isExpanded, setIsExpanded] = useState(false);

  // 如果沒有設定，不顯示
  if (!hasHealthSettings) {
    return null;
  }

  // 沒有警示且有設定 - 顯示成功訊息
  if (!alert.hasAlerts) {
    return (
      <Animated.View entering={FadeInDown.duration(400)} style={styles.successContainer}>
        <View style={styles.successHeader}>
          <Ionicons name="shield-checkmark" size={32} color="#34C759" />
          <View style={styles.successTextContainer}>
            <Text style={styles.successTitle}>✓ {t.smartAlert.matchesHealthSettings}</Text>
            <Text style={styles.successSubtitle}>{t.smartAlert.allHealthItemsChecked}</Text>
          </View>
        </View>
      </Animated.View>
    );
  }

  // 有警示 - 顯示詳細警告
  const getSeverityColor = () => {
    switch (alert.severity) {
      case "danger":
        return { bg: "#FEF2F2", accent: "#FF3B30", icon: "#FF3B30", iconName: "close-circle" };
      case "warning":
        return { bg: "#FEF7F0", accent: "#FF9500", icon: "#FF9500", iconName: "warning" };
      case "caution":
        return { bg: "#FEF7F0", accent: "#FF9500", icon: "#FF9500", iconName: "alert-circle" };
      default:
        return { bg: "#F0FDF4", accent: "#34C759", icon: "#34C759", iconName: "checkmark-circle" };
    }
  };

  const colors = getSeverityColor();

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      style={[styles.alertContainer, { backgroundColor: colors.bg, borderLeftColor: colors.accent }]}
    >
      {/* Summary Header - Always Visible, Click to Expand */}
      <Pressable
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.alertHeaderButton}
      >
        <Ionicons name={colors.iconName as any} size={24} color={colors.icon} />
        <View style={styles.alertTextContainer}>
          <Text style={[styles.alertTitle, { color: colors.icon }]}>{t.smartAlert.personalizedHealthAlert}</Text>
          <Text style={styles.alertMessage} numberOfLines={1}>{alert.overallMessage}</Text>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.icon}
        />
      </Pressable>

      {/* Expanded Details - Only Show When Expanded */}
      {isExpanded && (
        <View>
          {/* Disease Alerts */}
          {alert.diseaseAlerts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.smartAlert.diseaseRelatedRisk} ({alert.diseaseAlerts.length})</Text>
              {alert.diseaseAlerts.map((diseaseAlert, index) => (
                <View key={index} style={styles.alertItem}>
                  <View style={styles.alertItemHeader}>
                    <Text style={styles.ingredientName}>{diseaseAlert.ingredientName}</Text>
                    <View style={[styles.badge, { backgroundColor: "#FEF2F2" }]}>
                      <Text style={[styles.badgeText, { color: "#FF3B30" }]}>
                        {diseaseAlert.disease}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.alertItemReason}>{diseaseAlert.reason}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Allergen Alerts */}
          {alert.allergenAlerts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.smartAlert.detectedAllergens} ({alert.allergenAlerts.length})</Text>
              {alert.allergenAlerts.map((allergenAlert, index) => (
                <View key={index} style={styles.alertItem}>
                  <View style={styles.alertItemHeader}>
                    <Text style={styles.ingredientName}>{allergenAlert.ingredientName}</Text>
                    <View style={[styles.badge, { backgroundColor: "#FEF2F2" }]}>
                      <Text style={[styles.badgeText, { color: "#FF3B30" }]}>
                        {allergenAlert.allergen}
                        {allergenAlert.isCustom && ` (${t.smartAlert.custom})`}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Health Goal Alerts */}
          {alert.healthGoalAlerts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.smartAlert.healthGoalCheck} ({alert.healthGoalAlerts.length})</Text>
              {alert.healthGoalAlerts.map((goalAlert, index) => {
                const statusColor =
                  goalAlert.status === "danger"
                    ? "#FF3B30"
                    : goalAlert.status === "warning"
                    ? "#FF9500"
                    : "#34C759";
                const statusBg =
                  goalAlert.status === "danger"
                    ? "#FEF2F2"
                    : goalAlert.status === "warning"
                    ? "#FEF7F0"
                    : "#F0FDF4";

                return (
                  <View key={index} style={styles.goalItem}>
                    <View style={styles.goalHeader}>
                      <Text style={styles.goalName}>{goalAlert.goalName}</Text>
                      <View style={[styles.badge, { backgroundColor: statusBg }]}>
                        <Text style={[styles.badgeText, { color: statusColor }]}>
                          {goalAlert.status === "danger"
                            ? t.smartAlert.notMet
                            : goalAlert.status === "warning"
                            ? t.smartAlert.needsAttention
                            : t.smartAlert.met}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.goalMessage}>{goalAlert.message}</Text>
                    {goalAlert.value !== undefined && goalAlert.threshold !== undefined && (
                      <View style={styles.valueRow}>
                        <Text style={styles.valueText}>
                          {t.smartAlert.actual}: {goalAlert.value}
                          {goalAlert.unit}
                        </Text>
                        <Text style={styles.thresholdText}>
                          {t.smartAlert.recommended}: {goalAlert.status === "danger" || goalAlert.status === "warning" ? "<" : "≥"}{" "}
                          {goalAlert.threshold}
                          {goalAlert.unit}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  successContainer: {
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#34C759",
  },
  successHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  successTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#001858",
    marginBottom: 4,
  },
  successSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  alertContainer: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  alertHeaderButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  alertTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: 13,
    color: "#001858",
    lineHeight: 18,
  },
  section: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#001858",
    marginBottom: 6,
  },
  alertItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
  },
  alertItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  ingredientName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#001858",
    flex: 1,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  alertItemReason: {
    fontSize: 11,
    color: "#6B7280",
    lineHeight: 15,
  },
  goalItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  goalName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#001858",
    flex: 1,
  },
  goalMessage: {
    fontSize: 11,
    color: "#001858",
    lineHeight: 15,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  valueText: {
    fontSize: 10,
    color: "#6B7280",
  },
  thresholdText: {
    fontSize: 10,
    color: "#34C759",
    fontWeight: "600",
  },
});
