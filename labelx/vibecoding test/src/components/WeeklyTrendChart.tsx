import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions, Pressable } from "react-native";
import { DayTrendData, TimeRange } from "../utils/analytics";
import Svg, { Line, Circle, Polyline, Text as SvgText } from "react-native-svg";

interface WeeklyTrendChartProps {
  data: DayTrendData[];
  onTimeRangeChange?: (range: TimeRange) => void;
}

const CHART_WIDTH = Dimensions.get("window").width - 48;
const CHART_HEIGHT = 180;
const PADDING = 40;
const GRAPH_WIDTH = CHART_WIDTH - PADDING * 2;
const GRAPH_HEIGHT = CHART_HEIGHT - PADDING * 2;

export default function WeeklyTrendChart({ data, onTimeRangeChange }: WeeklyTrendChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>("week");

  const handleRangeChange = (range: TimeRange) => {
    setSelectedRange(range);
    onTimeRangeChange?.(range);
  };
  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No data available</Text>
        </View>
      </View>
    );
  }

  // Calculate points for the line chart
  const maxScore = 100;
  const minScore = 0;
  const scoreRange = maxScore - minScore;
  
  const dataWithScores = data.filter((d) => d.score !== null);
  
  const points = data.map((day, index) => {
    const x = PADDING + (index / (data.length - 1)) * GRAPH_WIDTH;
    const y = day.score !== null
      ? PADDING + GRAPH_HEIGHT - ((day.score - minScore) / scoreRange) * GRAPH_HEIGHT
      : null;
    return { x, y, ...day };
  });

  // Create polyline string for the line
  const linePoints = points
    .filter((p) => p.y !== null)
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  return (
    <View style={styles.container}>
      {/* Title and Time Range Selector */}
      <View style={styles.header}>
        <Text style={styles.title}>Health Score Trend</Text>
        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tab, selectedRange === "day" && styles.tabActive]}
            onPress={() => handleRangeChange("day")}
          >
            <Text style={[styles.tabText, selectedRange === "day" && styles.tabTextActive]}>Day</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, selectedRange === "week" && styles.tabActive]}
            onPress={() => handleRangeChange("week")}
          >
            <Text style={[styles.tabText, selectedRange === "week" && styles.tabTextActive]}>Week</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, selectedRange === "month" && styles.tabActive]}
            onPress={() => handleRangeChange("month")}
          >
            <Text style={[styles.tabText, selectedRange === "month" && styles.tabTextActive]}>Month</Text>
          </Pressable>
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((score) => {
            const y = PADDING + GRAPH_HEIGHT - ((score - minScore) / scoreRange) * GRAPH_HEIGHT;
            return (
              <React.Fragment key={score}>
                <Line
                  x1={PADDING}
                  y1={y}
                  x2={PADDING + GRAPH_WIDTH}
                  y2={y}
                  stroke="#F3F4F6"
                  strokeWidth="1"
                />
                <SvgText
                  x={PADDING - 8}
                  y={y + 4}
                  fontSize="10"
                  fill="#9CA3AF"
                  textAnchor="end"
                >
                  {score}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* Line chart */}
          {dataWithScores.length > 1 && (
            <Polyline
              points={linePoints}
              fill="none"
              stroke="#2CB67D"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data points */}
          {points.map((point, index) => {
            if (point.y === null) {
              // Empty dot for days with no data
              const y = PADDING + GRAPH_HEIGHT / 2;
              return (
                <Circle
                  key={index}
                  cx={point.x}
                  cy={y}
                  r="4"
                  fill="#E5E7EB"
                  stroke="#D1D5DB"
                  strokeWidth="1"
                />
              );
            }
            
            return (
              <React.Fragment key={index}>
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r="6"
                  fill="white"
                  stroke="#2CB67D"
                  strokeWidth="2"
                />
              </React.Fragment>
            );
          })}

          {/* X-axis labels */}
          {points.map((point, index) => (
            <SvgText
              key={`label-${index}`}
              x={point.x}
              y={CHART_HEIGHT - 10}
              fontSize="11"
              fill="#6B7280"
              textAnchor="middle"
            >
              {point.dayLabel}
            </SvgText>
          ))}
        </Svg>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#2CB67D" }]} />
          <Text style={styles.legendText}>Has Data</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#E5E7EB" }]} />
          <Text style={styles.legendText}>No Scan</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#1F2937",
  },
  chartContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  emptyState: {
    height: CHART_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  legendItem: {
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
