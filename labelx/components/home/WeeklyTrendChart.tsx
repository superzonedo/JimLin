import { DayTrendData, TimeRange } from '@/utils/analytics';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { G, Line, Rect, Text as SvgText } from 'react-native-svg';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface WeeklyTrendChartProps {
  data?: DayTrendData[];
  defaultTimeRange?: TimeRange;
  timeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
}

const CHART_HEIGHT = 180;
const PADDING_HORIZONTAL = 20;
const PADDING_VERTICAL = 20;

const DEFAULT_CHART_DATA: DayTrendData[] = [
  { dayLabel: "週一", score: 75, date: "" },
  { dayLabel: "週二", score: 82, date: "" },
  { dayLabel: "週三", score: 68, date: "" },
  { dayLabel: "週四", score: 90, date: "" },
  { dayLabel: "週五", score: 88, date: "" },
  { dayLabel: "週六", score: 72, date: "" },
  { dayLabel: "週日", score: 85, date: "" },
];

export default function WeeklyTrendChart({ 
  data, 
  defaultTimeRange = "month",
  timeRange,
  onTimeRangeChange 
}: WeeklyTrendChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>(timeRange || defaultTimeRange);
  const { width: screenWidth } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  // 48 (home screen padding) + 32 (card padding) = 80
  const chartWidth = screenWidth - 80 - (PADDING_HORIZONTAL * 2);

  // Sync internal state with prop
  useEffect(() => {
    if (timeRange !== undefined) {
      setSelectedRange(timeRange);
    }
  }, [timeRange]);

  const handleRangeChange = (range: TimeRange) => {
    setSelectedRange(range);
    onTimeRangeChange?.(range);
  };

  const displayData = useMemo(() => {
    if (!data || data.length < 2) return DEFAULT_CHART_DATA;
    return data;
  }, [data]);

  const processedData = useMemo(() => {
    const maxScore = 100;
    const minScore = 0;
    const barWidth = chartWidth / displayData.length * 0.6; // 60% of available space per bar
    const barSpacing = chartWidth / displayData.length * 0.4; // 40% for spacing

    return displayData.map((item, index) => {
      const score = item.score; // 保持 null 值，不要轉換為 0
      const barHeight = score !== null && score !== undefined 
        ? ((score - minScore) / (maxScore - minScore)) * CHART_HEIGHT 
        : 0;
      const x = index * (barWidth + barSpacing) + barSpacing / 2;
      const y = CHART_HEIGHT - barHeight; // Invert Y axis because SVG 0 is at top
      
      return { 
        ...item, 
        x, 
        y, 
        barWidth, 
        barHeight, 
        originalScore: score, // 保持原始值（可能是 null）
        centerX: x + barWidth / 2
      };
    });
  }, [displayData, chartWidth]);

  const getBarColor = (score: number): string => {
    if (score >= 80) return "#22C55E"; // 綠色
    if (score >= 60) return "#FBBF24"; // 黃色
    if (score >= 40) return "#F97316"; // 橘色
    return "#EF4444"; // 紅色
  };

  const getTitle = () => {
    switch (selectedRange) {
      case "day":
        return "本日健康趨勢";
      case "week":
        return "本週健康趨勢";
      case "month":
        return "本月健康趨勢";
      default:
        return "本月健康趨勢";
    }
  };

  const getSubtitle = () => {
    switch (selectedRange) {
      case "day":
        return "今日";
      case "week":
        return "最近7天";
      case "month":
        return "最近30天";
      default:
        return "最近30天";
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.primaryText }]}>{getTitle()}</Text>
        <View style={[styles.tabContainer, { backgroundColor: colorScheme === 'dark' ? theme.gray100 : "#F3F4F6" }]}>
          <Pressable
            style={[styles.tab, selectedRange === "week" && [styles.tabActive, { backgroundColor: theme.cardBackground }]]}
            onPress={() => handleRangeChange("week")}
          >
            <Text style={[styles.tabText, { color: theme.secondaryText }, selectedRange === "week" && [styles.tabTextActive, { color: theme.primaryText }]]}>週</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, selectedRange === "month" && [styles.tabActive, { backgroundColor: theme.cardBackground }]]}
            onPress={() => handleRangeChange("month")}
          >
            <Text style={[styles.tabText, { color: theme.secondaryText }, selectedRange === "month" && [styles.tabTextActive, { color: theme.primaryText }]]}>月</Text>
          </Pressable>
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        <Svg
          width={chartWidth + PADDING_HORIZONTAL * 2}
          height={CHART_HEIGHT + PADDING_VERTICAL * 2}
        >
          <G transform={`translate(${PADDING_HORIZONTAL}, ${PADDING_VERTICAL})`}>
            {/* Grid Lines */}
            {[0, 25, 50, 75, 100].map((val) => {
              const y = CHART_HEIGHT - (val / 100) * CHART_HEIGHT;
              return (
                <Line
                  key={val}
                  x1="0"
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke={colorScheme === 'dark' ? theme.cardBorder : "#F3F4F6"}
                  strokeWidth="1"
                />
              );
            })}

            {/* Bar Chart */}
            {processedData.map((bar, index) => (
              <React.Fragment key={index}>
                {/* Bar - 只顯示有分數的日期 */}
                {bar.originalScore !== null && bar.originalScore !== undefined && (
                  <>
                    <Rect
                      x={bar.x}
                      y={bar.y}
                      width={bar.barWidth}
                      height={bar.barHeight}
                      fill={getBarColor(bar.originalScore)}
                      rx="4"
                      ry="4"
                    />
                    
                    {/* Score Label on top of bar */}
                    {bar.barHeight > 20 && (
                      <SvgText
                        x={bar.centerX}
                        y={bar.y - 5}
                        fontSize="11"
                        fontWeight="600"
                        fill={theme.primaryText}
                        textAnchor="middle"
                      >
                        {bar.originalScore}
                      </SvgText>
                    )}
                  </>
                )}
                
                {/* Day Labels - 總是顯示 */}
                <SvgText
                  x={bar.centerX}
                  y={CHART_HEIGHT + 20}
                  fontSize="11"
                  fill={bar.originalScore === null || bar.originalScore === undefined ? theme.secondaryText : theme.secondaryText}
                  fontWeight="500"
                  textAnchor="middle"
                >
                  {bar.dayLabel}
                </SvgText>
              </React.Fragment>
            ))}
          </G>
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
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
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 3,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
  },
  tabTextActive: {
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});