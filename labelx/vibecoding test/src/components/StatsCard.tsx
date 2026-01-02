import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StatsCardProps {
  title: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  subtitle?: string;
}

export default function StatsCard({ title, value, icon, color, subtitle }: StatsCardProps) {
  const bgColor = getBackgroundColor(color);
  const iconColor = getIconColor(color);

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={28} color={iconColor} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

function getBackgroundColor(color: string): string {
  switch (color) {
    case "orange":
      return "#F1EFE7"; // 米白灰色
    case "gray":
      return "#F1EFE7"; // 米白灰色
    case "green":
      return "#F1EFE7"; // 米白灰色
    case "yellow":
      return "#F1EFE7"; // 米白灰色
    default:
      return "#F1EFE7";
  }
}

function getIconColor(color: string): string {
  switch (color) {
    case "orange":
      return "#2CB67D"; // 深橄欖綠
    case "gray":
      return "#249C6A"; // 中橄欖綠
    case "green":
      return "#2CB67D"; // 深橄欖綠
    case "yellow":
      return "#8BD3DD"; // 金黃色
    default:
      return "#2CB67D";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 100,
    marginHorizontal: 6,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    marginBottom: 8,
  },
  value: {
    fontSize: 32,
    fontWeight: "700",
    color: "#001858",
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 11,
    fontWeight: "500",
    color: "#9CA3AF",
    marginTop: 2,
    textAlign: "center",
  },
});
