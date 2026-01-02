import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

interface StatsCardProps {
  title: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  subtitle?: string;
  valueColor?: string; // 可選的自定義數值顏色
  useScoreColor?: boolean; // 是否根據分數自動設置顏色（健康分數：分數越高越好）
  useRiskColor?: boolean; // 是否根據風險值自動設置顏色（風險值：分數越高越差）
  onPress?: () => void; // 點擊事件
  showExpandIcon?: boolean; // 是否顯示展開圖標
}

export default function StatsCard({ title, value, icon, color, subtitle, valueColor, useScoreColor, useRiskColor, onPress, showExpandIcon }: StatsCardProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const bgColor = getBackgroundColor(color, colorScheme, theme);
  const iconColor = getIconColor(color);
  
  // 根據分數或風險值計算顏色（如果啟用）
  let finalValueColor = "#001858";
  if (useRiskColor) {
    finalValueColor = getRiskColor(value);
  } else if (useScoreColor) {
    finalValueColor = getScoreColor(value);
  } else if (valueColor) {
    finalValueColor = valueColor;
  }

  const CardContent = (
    <>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={28} color={iconColor} />
      </View>
      <Text style={[styles.value, { color: finalValueColor }]}>{value}</Text>
      <Text style={[styles.title, { color: theme.secondaryText }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: theme.secondaryText }]}>{subtitle}</Text>}
      {showExpandIcon && onPress && (
        <View style={styles.triangleContainer}>
          <View style={styles.triangle} />
        </View>
      )}
    </>
  );

  if (onPress) {
    return (
      <Pressable 
        style={[styles.container, { backgroundColor: bgColor }]}
        onPress={onPress}
      >
        {CardContent}
      </Pressable>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {CardContent}
    </View>
  );
}

function getBackgroundColor(color: string, colorScheme: 'light' | 'dark', theme: any): string {
  // Light mode: off-white background
  // Dark mode: darker card background that contrasts with the dark background
  if (colorScheme === 'dark') {
    return theme.cardBackground; // #1F2937 - darker than background #151718
  }
  return "#F1EFE7";
}

function getIconColor(color: string): string {
  switch (color) {
    case "orange":
      return "#2CB67D"; // Dark Olive Green
    case "gray":
      return "#249C6A"; // Medium Olive Green
    case "green":
      return "#2CB67D"; // Dark Olive Green
    case "yellow":
      return "#8BD3DD"; // Golden Yellow
    default:
      return "#2CB67D";
  }
}

// 根據分數返回顏色（健康分數：分數越高越好）
// 80分以上：綠色，60-80：黃色，40-60：橘色，40分以下：紅色
function getScoreColor(score: number): string {
  if (score >= 80) {
    return "#10B981"; // 綠色
  } else if (score >= 60) {
    return "#F59E0B"; // 黃色
  } else if (score >= 40) {
    return "#F97316"; // 橘色
  } else {
    return "#EF4444"; // 紅色
  }
}

// 根據風險值返回顏色（風險值：分數越高越差）
// >= 85: 紅色（極高風險），>= 70: 橘色（高度警戒），>= 55: 黃色（需要注意），< 55: 綠色（低度風險）
function getRiskColor(riskScore: number): string {
  if (riskScore >= 85) {
    return "#DC2626"; // 紅色 - 極高風險
  } else if (riskScore >= 70) {
    return "#F97316"; // 橘色 - 高度警戒
  } else if (riskScore >= 55) {
    return "#F59E0B"; // 黃色 - 需要注意
  } else {
    return "#10B981"; // 綠色 - 低度風險
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
    position: "relative",
  },
  iconContainer: {
    marginBottom: 8,
  },
  value: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
    textAlign: "center",
  },
  triangleContainer: {
    position: "absolute",
    bottom: 14,
    right: 14,
    width: 0,
    height: 0,
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 8,
    borderLeftWidth: 8,
    borderTopColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#9CA3AF",
    borderLeftColor: "transparent",
  },
});