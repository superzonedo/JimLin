import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { NutritionData } from "../types/food";

interface NutritionChartProps {
  nutritionData: NutritionData;
}

export default function NutritionChart({ nutritionData }: NutritionChartProps) {
  // Convert nutrition data with risk levels
  const nutritionItems = [
    {
      label: "糖分",
      value: nutritionData.sugar,
      unit: "g",
      icon: "🍬",
      maxValue: 30,
      color: nutritionData.sugar > 20 ? "#FB7185" : nutritionData.sugar > 10 ? "#FBBF24" : "#2CB67D",
    },
    {
      label: "鈉",
      value: nutritionData.sodium,
      unit: "mg",
      icon: "🧂",
      maxValue: 1000,
      color: nutritionData.sodium > 500 ? "#FB7185" : nutritionData.sodium > 200 ? "#FBBF24" : "#2CB67D",
    },
    {
      label: "脂肪",
      value: nutritionData.fat,
      unit: "g",
      icon: "🥑",
      maxValue: 30,
      color: nutritionData.fat > 20 ? "#FB7185" : nutritionData.fat > 10 ? "#FBBF24" : "#2CB67D",
    },
    {
      label: "纖維",
      value: nutritionData.fiber,
      unit: "g",
      icon: "🌾",
      maxValue: 15,
      color: nutritionData.fiber < 2 ? "#FB7185" : nutritionData.fiber < 5 ? "#FBBF24" : "#2CB67D",
    },
    {
      label: "蛋白質",
      value: nutritionData.protein,
      unit: "g",
      icon: "🥩",
      maxValue: 30,
      color: nutritionData.protein < 5 ? "#FB7185" : nutritionData.protein < 10 ? "#FBBF24" : "#2CB67D",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>營養成分</Text>

      {/* Horizontal Bar Chart */}
      <View style={styles.chartContainer}>
        {nutritionItems.map((item, index) => {
          const percentage = Math.min((item.value / item.maxValue) * 100, 100);
          return (
            <View key={index} style={styles.barRow}>
              <View style={styles.labelContainer}>
                <Text style={styles.icon}>{item.icon}</Text>
                <View style={styles.labelTextContainer}>
                  <Text style={styles.label}>{item.label}</Text>
                  <Text style={styles.value}>
                    {item.value.toFixed(1)} {item.unit}
                  </Text>
                </View>
              </View>
              <View style={styles.barContainer}>
                <View style={styles.barBackground}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${percentage}%`,
                        backgroundColor: item.color,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: "#2CB67D" }]} />
          <Text style={styles.legendText}>良好</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: "#FBBF24" }]} />
          <Text style={styles.legendText}>中等</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: "#FB7185" }]} />
          <Text style={styles.legendText}>需注意</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  chartContainer: {
    marginBottom: 16,
  },
  barRow: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    fontSize: 24,
    marginRight: 8,
  },
  labelTextContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  value: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
  },
  barContainer: {
    paddingLeft: 32,
  },
  barBackground: {
    height: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 6,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: "#6B7280",
  },
});
