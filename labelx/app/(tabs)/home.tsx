import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState, useMemo } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, { SlideInDown, SlideOutDown, FadeIn, FadeOut } from "react-native-reanimated";
import { useLanguage } from "@/contexts/LanguageContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

import AchievementRow from "@/components/home/AchievementRow";
import AlertWall from "@/components/home/AlertWall";
import AlertWallSummary from "@/components/home/AlertWallSummary";
import StatsCard from "@/components/home/StatsCard";
import WeeklyTrendChart from "@/components/home/WeeklyTrendChart";
import { Achievement } from "@/types/user";
import { HighRiskIngredient, calculateHighRiskIngredients } from "@/utils/alertWall";
import { DayTrendData, TimeRange, calculateDailyTrend, calculateWeeklyTrend, calculateMonthlyTrend, calculateWeeklyAverage } from "@/utils/analytics";
import { calculateAchievements } from "@/utils/achievements";
import { subDays, addDays, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { useFoodScanStore } from "@/state/foodScanStore";


// Mock Data
const MOCK_USER_STATS = {
  scanStreak: 12,
  healthyPercentage: 85,
};

// Mock trend data fallback
const MOCK_WEEKLY_TREND: DayTrendData[] = [
  { dayLabel: "週一", score: 75, date: "2023-10-23" },
  { dayLabel: "週二", score: 82, date: "2023-10-24" },
  { dayLabel: "週三", score: 60, date: "2023-10-25" },
  { dayLabel: "週四", score: 90, date: "2023-10-26" },
  { dayLabel: "週五", score: 88, date: "2023-10-27" },
  { dayLabel: "週六", score: 45, date: "2023-10-28" },
  { dayLabel: "週日", score: 95, date: "2023-10-29" },
];

// MOCK_ACHIEVEMENTS 已移除，現在使用 calculateAchievements 動態計算

const MOCK_RISK_INGREDIENTS: HighRiskIngredient[] = [
  { 
    id: "1", 
    name: "阿斯巴甜", 
    count: 3, 
    riskLevel: "high",
    riskScore: 75,
    lastDetected: "2023-10-28",
    description: "人工甜味劑，可能影響代謝。",
    category: "甜味劑",
    eNumber: "E951"
  },
  { 
    id: "2", 
    name: "人工色素", 
    count: 2, 
    riskLevel: "medium",
    riskScore: 55,
    lastDetected: "2023-10-27",
    description: "可能引起過敏反應。",
    category: "色素",
    eNumber: "E102"
  },
  { 
    id: "3", 
    name: "反式脂肪", 
    count: 1, 
    riskLevel: "high",
    riskScore: 80,
    lastDetected: "2023-10-25",
    description: "增加心血管疾病風險。",
    category: "脂肪"
  },
];

// Calculate cumulative risk score
function calculateCumulativeRisk(ingredients: HighRiskIngredient[]): number {
  if (ingredients.length === 0) return 0;
  
  let totalOccurrences = 0;
  let weightedRiskSum = 0;

  ingredients.forEach((ingredient) => {
    totalOccurrences += ingredient.count;
    const riskScore = ingredient.riskScore || (ingredient.riskLevel === "high" ? 75 : ingredient.riskLevel === "medium" ? 55 : 30);
    weightedRiskSum += riskScore * ingredient.count;
  });

  const avgRisk = totalOccurrences > 0 ? weightedRiskSum / totalOccurrences : 0;
  const frequencyMultiplier = Math.min(1 + (totalOccurrences / 20), 1.5);
  return Math.min(Math.round(avgRisk * frequencyMultiplier), 100);
}

export default function HomeScreen() {
  const { t, language } = useLanguage();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const scanHistory = useFoodScanStore((state) => state.scanHistory);
  
  // Mock State
  const [isPremium] = useState(true); // Default to Premium as requested
  const [todayScans] = useState(8);
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const [trendData, setTrendData] = useState<DayTrendData[]>(MOCK_WEEKLY_TREND);
  const [showAlertWallModal, setShowAlertWallModal] = useState(false);

  // 計算高風險成分列表（最近30天，只計算已納入分析的記錄）
  const highRiskIngredients = useMemo(() => {
    return calculateHighRiskIngredients(scanHistory, 30);
  }, [scanHistory]);

  // 計算累積風險值
  const cumulativeRisk = useMemo(() => {
    return calculateCumulativeRisk(highRiskIngredients);
  }, [highRiskIngredients]);

  // 計算成就
  const achievements = useMemo(() => {
    return calculateAchievements(scanHistory);
  }, [scanHistory]);

  // 計算本週平均分數
  const weeklyAvg = useMemo(() => {
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const daysFromMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    const mondayDate = subDays(today, daysFromMonday);
    const weekStart = startOfDay(mondayDate);
    const weekEnd = endOfDay(addDays(mondayDate, 6)); // 週日（週一 + 6天）
    
    // 調試：檢查本週的記錄
    const thisWeekAllScans = scanHistory.filter((scan) => {
      const scanDate = new Date(scan.timestamp);
      return isWithinInterval(scanDate, { start: weekStart, end: weekEnd });
    });
    
    const thisWeekPurchasedScans = scanHistory.filter((scan) => {
      const scanDate = new Date(scan.timestamp);
      const isInWeek = isWithinInterval(scanDate, { start: weekStart, end: weekEnd });
      return isInWeek && 
             scan.healthScore !== undefined && 
             scan.isPurchased === true;
    });
    
    const avg = calculateWeeklyAverage(scanHistory);
    
    console.log('計算本週平均分數:', {
      scanHistoryLength: scanHistory.length,
      thisWeekAllScans: thisWeekAllScans.length,
      thisWeekPurchasedScans: thisWeekPurchasedScans.length,
      weeklyAvg: avg,
      weekRange: {
        start: weekStart.toISOString(),
        end: weekEnd.toISOString(),
      },
      thisWeekScansDetails: thisWeekAllScans.map(scan => ({
        id: scan.id,
        healthScore: scan.healthScore,
        isPurchased: scan.isPurchased,
        timestamp: scan.timestamp,
      })),
    });
    
    return avg;
  }, [scanHistory]);

  // Calculate trend data based on selected time range
  useEffect(() => {
    let trend: DayTrendData[];
    if (scanHistory.length > 0) {
      switch (timeRange) {
        case "day":
          trend = calculateDailyTrend(scanHistory);
          break;
        case "week":
          trend = calculateWeeklyTrend(scanHistory);
          break;
        case "month":
          trend = calculateMonthlyTrend(scanHistory);
          break;
        default:
          trend = calculateWeeklyTrend(scanHistory);
      }
    } else {
      // Use mock data if no scan history
      trend = timeRange === "month" 
        ? [
            { dayLabel: "10/1", score: 75, date: "2023-10-01" },
            { dayLabel: "10/8", score: 82, date: "2023-10-08" },
            { dayLabel: "10/15", score: 60, date: "2023-10-15" },
            { dayLabel: "10/22", score: 90, date: "2023-10-22" },
          ]
        : MOCK_WEEKLY_TREND;
    }
    setTrendData(trend);
  }, [scanHistory, timeRange]);

  return (
    <View key={`home-${language}`} style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: theme.background }]}>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerTitle, { color: theme.primaryText }]}>Label Dog</Text>
            <Text style={[styles.headerSubtitle, { color: theme.secondaryText }]}>Label Inspection</Text>
          </View>
          <Text style={[styles.headerDescription, { color: theme.secondaryText }]}>立即分析，守護健康</Text>
        </View>

        {/* Premium Badge Banner - Show for premium users */}
        {isPremium && (
          <View style={styles.bannerContainer}>
            <View style={[styles.premiumBanner, { backgroundColor: colorScheme === 'dark' ? '#064E3B' : '#D1FAE5' }]}>
              <View style={styles.bannerContent}>
                <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
                <View style={styles.bannerTextContainer}>
                  <Text style={[styles.bannerTitle, { color: colorScheme === 'dark' ? '#6EE7B7' : '#065F46' }]}>{t('home.premiumMember')}</Text>
                  <Text style={[styles.bannerSubtitle, { color: colorScheme === 'dark' ? '#A7F3D0' : '#064E3B' }]}>{t('home.premiumSubtitle')}</Text>
                </View>
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Quick Stats Grid */}
        <View style={styles.sectionContainer}>
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <StatsCard
                title={t('home.weeklyAverage')}
                value={weeklyAvg}
                icon="trending-up"
                color="gray"
                subtitle={t('home.healthScore')}
                useScoreColor={true}
                onPress={() => router.push("/(tabs)/history?filter=week")}
                showExpandIcon={true}
              />
              <StatsCard
                title={t('home.cumulativeRisk')}
                value={cumulativeRisk}
                icon="fitness-outline"
                color="green"
                subtitle={t('home.riskScore')}
                useRiskColor={true}
                onPress={() => setShowAlertWallModal(true)}
                showExpandIcon={true}
              />
            </View>
          </View>
        </View>

        {/* Weekly Trend Chart */}
        <View style={styles.sectionContainer}>
          <WeeklyTrendChart 
            data={trendData}
            defaultTimeRange={timeRange}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        </View>

        {/* Achievement Row */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>健康飲食成就徽章</Text>
          </View>
          <AchievementRow 
            achievements={achievements} 
            onViewAll={() => console.log("View all achievements")}
          />
        </View>

        {/* Alert Wall Modal */}
        <Modal
          visible={showAlertWallModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAlertWallModal(false)}
        >
          <View style={modalStyles.overlay}>
            <Pressable 
              style={modalStyles.backdrop}
              onPress={() => setShowAlertWallModal(false)}
            />
            <Animated.View 
              entering={SlideInDown.duration(300).springify()}
              exiting={SlideOutDown.duration(200)}
              style={[modalStyles.modalContainer, { paddingBottom: insets.bottom, backgroundColor: theme.cardBackground }]}
            >
              {/* Handle Bar */}
              <Pressable 
                onPress={() => setShowAlertWallModal(false)}
                style={modalStyles.handleBarContainer}
              >
                <View style={modalStyles.handleBar} />
              </Pressable>

              {/* Header */}
              <View style={[modalStyles.header, { borderBottomColor: theme.cardBorder }]}>
                <View style={modalStyles.headerLeft}>
                  <Ionicons name="analytics" size={24} color={theme.warning} />
                  <Text style={[modalStyles.headerTitle, { color: theme.primaryText }]}>累積影響分析</Text>
                </View>
                <Pressable 
                  onPress={() => setShowAlertWallModal(false)}
                  style={[modalStyles.closeButton, { backgroundColor: theme.gray100 }]}
                >
                  <Ionicons name="close" size={24} color={theme.secondaryText} />
                </Pressable>
              </View>

              {/* Content */}
              <ScrollView 
                style={modalStyles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={modalStyles.contentContainer}
                nestedScrollEnabled={true}
              >
                <AlertWallSummary ingredients={highRiskIngredients} />
                <View style={modalStyles.alertWallWrapper}>
                  <AlertWall ingredients={highRiskIngredients} />
                </View>
              </ScrollView>
            </Animated.View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  headerTitleContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 4,
  },
  headerDescription: {
    fontSize: 16,
    marginTop: 4,
    textAlign: "center",
  },
  bannerContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  premiumBanner: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  bannerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  bannerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  proBadge: {
    backgroundColor: "#2CB67D",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  proBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  sectionContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statsGrid: {
    gap: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
});

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.9,
    height: SCREEN_HEIGHT * 0.85,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  handleBarContainer: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
    width: "100%",
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  alertWallWrapper: {
    marginTop: 16,
  },
});