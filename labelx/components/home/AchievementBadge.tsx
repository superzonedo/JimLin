import { Achievement } from "@/types/user";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: "small" | "medium";
}

export default function AchievementBadge({ 
  achievement, 
  size = "small" 
}: AchievementBadgeProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const badgeSize = size === "small" ? 60 : 80;
  const iconSize = size === "small" ? 28 : 36;
  const showProgress = size === "small" && !achievement.unlocked && achievement.progress !== undefined;

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
              { 
                width: badgeSize, 
                height: badgeSize, 
                borderRadius: badgeSize / 2,
                backgroundColor: colorScheme === 'dark' ? theme.gray100 : "#F3F4F6"
              }
            ]}
          >
            <Ionicons 
              name={achievement.icon as keyof typeof Ionicons.glyphMap} 
              size={iconSize} 
              color={colorScheme === 'dark' ? theme.secondaryText : "#D1D5DB"} 
            />
            <View style={[styles.lockOverlay, { backgroundColor: colorScheme === 'dark' ? theme.cardBackground : "white" }]}>
              <Ionicons name="lock-closed" size={size === "small" ? 16 : 20} color={colorScheme === 'dark' ? theme.secondaryText : "#9CA3AF"} />
            </View>
          </View>
        )}
      </View>
      
      <Text 
        style={[
          styles.title, 
          { color: achievement.unlocked ? theme.primaryText : theme.secondaryText },
          size === "medium" && styles.titleMedium,
        ]} 
        numberOfLines={2}
      >
        {achievement.title}
      </Text>
      
      {showProgress && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colorScheme === 'dark' ? theme.gray100 : "#E5E7EB" }]}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min(achievement.progress || 0, 100)}%` }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: theme.secondaryText }]}>{Math.round(achievement.progress || 0)}%</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginHorizontal: 4,
  },
  badgeContainer: {
    marginBottom: 6,
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
    position: "relative",
  },
  lockOverlay: {
    position: "absolute",
    bottom: -4,
    right: -4,
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 2,
  },
  titleMedium: {
    fontSize: 13,
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 4,
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
    fontWeight: "600",
  },
});
