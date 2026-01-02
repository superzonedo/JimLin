import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Achievement } from "../types/user";

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: "small" | "medium";
}

export default function AchievementBadge({ 
  achievement, 
  size = "small" 
}: AchievementBadgeProps) {
  const badgeSize = size === "small" ? 60 : 80;
  const iconSize = size === "small" ? 28 : 36;
  const showProgress = size === "small" && !achievement.unlocked;

  return (
    <View style={[styles.container, { width: badgeSize + 20 }]}>
      <View style={[styles.badgeContainer, { width: badgeSize, height: badgeSize }]}>
        {achievement.unlocked ? (
          <LinearGradient
            colors={["#2CB67D", "#249C6A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.badge, { width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2 }]}
          >
            <Ionicons 
              name={achievement.icon as keyof typeof Ionicons.glyphMap} 
              size={iconSize} 
              color="white" 
            />
          </LinearGradient>
        ) : (
          <View 
            style={[
              styles.lockedBadge, 
              { width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2 }
            ]}
          >
            <Ionicons 
              name={achievement.icon as keyof typeof Ionicons.glyphMap} 
              size={iconSize} 
              color="#D1D5DB" 
            />
            <View style={styles.lockOverlay}>
              <Ionicons name="lock-closed" size={size === "small" ? 16 : 20} color="#9CA3AF" />
            </View>
          </View>
        )}
      </View>
      
      <Text 
        style={[
          styles.title, 
          size === "medium" && styles.titleMedium,
          !achievement.unlocked && styles.titleLocked
        ]} 
        numberOfLines={2}
      >
        {achievement.title}
      </Text>
      
      {showProgress && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min(achievement.progress, 100)}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{Math.round(achievement.progress)}%</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginHorizontal: 8,
  },
  badgeContainer: {
    marginBottom: 8,
  },
  badge: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2CB67D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  lockedBadge: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    position: "relative",
  },
  lockOverlay: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 11,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    marginBottom: 4,
  },
  titleMedium: {
    fontSize: 13,
  },
  titleLocked: {
    color: "#9CA3AF",
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2CB67D",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 9,
    color: "#9CA3AF",
    fontWeight: "600",
  },
});
