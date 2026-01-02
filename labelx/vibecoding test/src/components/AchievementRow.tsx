import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { Achievement } from "../types/user";
import AchievementBadge from "./AchievementBadge";
import { Ionicons } from "@expo/vector-icons";

interface AchievementRowProps {
  achievements: Achievement[];
  onViewAll?: () => void;
}

export default function AchievementRow({ achievements, onViewAll }: AchievementRowProps) {
  const displayAchievements = achievements.slice(0, 6);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {displayAchievements.map((achievement) => (
          <AchievementBadge 
            key={achievement.id} 
            achievement={achievement} 
            size="small" 
          />
        ))}
        
        {onViewAll && (
          <Pressable 
            style={styles.viewAllButton} 
            onPress={onViewAll}
          >
            <View style={styles.viewAllCircle}>
              <Ionicons name="ellipsis-horizontal" size={28} color="#2CB67D" />
            </View>
            <Text style={styles.viewAllText}>查看全部</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  viewAllButton: {
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    marginRight: 16,
    width: 70,
  },
  viewAllCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F0FDF4",
    borderWidth: 2,
    borderColor: "#2CB67D",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2CB67D",
    textAlign: "center",
  },
});
