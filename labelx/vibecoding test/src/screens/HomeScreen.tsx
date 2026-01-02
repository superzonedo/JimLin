import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { CompositeNavigationProp } from "@react-navigation/native";
import { useFoodScanStore } from "../state/foodScanStore";
import { useUserStore } from "../state/userStore";
import { useSubscriptionStore } from "../state/subscriptionStore";
import { HomeStackParamList, RootTabParamList } from "../types/navigation";
import { calculateWeeklyTrend, calculateDailyStats, calculateWeeklyAverage, calculateWeeklyScans, calculateWeeklyScanDays, calculateDailyTrend, calculateMonthlyTrend, TimeRange } from "../utils/analytics";
import { calculateHighRiskIngredients } from "../utils/alertWall";
import { calculateAchievements } from "../utils/achievements";
import StatsCard from "../components/StatsCard";
import WeeklyTrendChart from "../components/WeeklyTrendChart";
import AchievementRow from "../components/AchievementRow";
import AlertWall from "../components/AlertWall";
import { useLanguage } from "../i18n";

type HomeScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList>,
  BottomTabNavigationProp<RootTabParamList>
>;

type NavigationProp = HomeScreenNavigationProp;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const scanHistory = useFoodScanStore((s) => s.scanHistory);
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const userStats = useUserStore((s) => s.stats);
  const achievements = useUserStore((s) => s.achievements);
  const setAchievements = useUserStore((s) => s.setAchievements);
  const { t } = useLanguage();

  const [weeklyScans, setWeeklyScans] = useState(0);
  const [weeklyAvg, setWeeklyAvg] = useState(0);
  const [weeklyScanDays, setWeeklyScanDays] = useState(0);
  const [trendData, setTrendData] = useState<ReturnType<typeof calculateWeeklyTrend>>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const [highRiskIngredients, setHighRiskIngredients] = useState<ReturnType<typeof calculateHighRiskIngredients>>([]);

  // Calculate analytics on mount and when scan history changes
  useEffect(() => {
    // All scans are now automatically saved (isPurchased: true)
    const weekScans = calculateWeeklyScans(scanHistory);
    const weekAvg = calculateWeeklyAverage(scanHistory);
    const weekScanDays = calculateWeeklyScanDays(scanHistory);
    const riskIngredients = calculateHighRiskIngredients(scanHistory, 30);
    const updatedAchievements = calculateAchievements(userStats, scanHistory);

    setWeeklyScans(weekScans);
    setWeeklyAvg(weekAvg);
    setWeeklyScanDays(weekScanDays);
    setHighRiskIngredients(riskIngredients);
    setAchievements(updatedAchievements);
  }, [scanHistory, userStats]);

  // Calculate trend data based on selected time range
  useEffect(() => {
    // All scans are now automatically saved (isPurchased: true)
    let trend;
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
    setTrendData(trend);
  }, [scanHistory, timeRange]);

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);
  };

  // Show demo data if no scan history
  const hasData = scanHistory.length > 0;

  return (
    <View className="flex-1" style={{ backgroundColor: "#FFFFFF" }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingTop: insets.top }} className="px-6 pt-4 pb-8 bg-[#FFFFFF]">
          <View className="items-center mb-2">
            <Text className="text-3xl font-bold text-[#001858]">LabelX</Text>
            <Text className="text-xs text-gray-500 uppercase tracking-wide">{t.home.labelInspection}</Text>
          </View>
          <Text className="text-base text-gray-600 mt-1 text-center">{t.home.analyzeNow}</Text>
        </View>

        {/* Premium Badge Banner - Show for premium users */}
        {isPremium && (
          <View className="px-6 mb-4">
            <View
              style={[
                styles.card,
                {
                  borderRadius: 20,
                  padding: 16,
                  backgroundColor: "#D1FAE5",
                },
              ]}
            >
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={24} color="#2CB67D" />
                <View className="ml-3 flex-1">
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#065F46" }}>{t.home.premiumMember}</Text>
                  <Text style={{ fontSize: 12, color: "#064E3B" }}>{t.home.unlimitedScans} • {t.home.advancedAnalysis}</Text>
                </View>
                <View style={{ backgroundColor: "#2CB67D", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 }}>
                  <Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "bold" }}>{t.common.pro}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Quick Stats Grid */}
        <View className="px-6 py-4">
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <StatsCard
                title={t.home.weeklyScans}
                value={hasData ? weeklyScans : 0}
                icon="calendar-outline"
                color="orange"
              />
              <StatsCard
                title={t.home.weeklyAvg}
                value={hasData ? weeklyAvg : 55}
                icon="trending-up"
                color="gray"
                subtitle={t.home.healthScore}
              />
            </View>
            <View style={styles.statsRow}>
              <StatsCard
                title={t.home.weeklyScanDays}
                value={hasData ? weeklyScanDays : 1}
                icon="flame"
                color="orange"
              />
              <StatsCard
                title={t.home.healthGoalScore}
                value={hasData ? weeklyAvg : 55}
                icon="fitness-outline"
                color="green"
                subtitle={t.home.thisWeekAvg}
              />
            </View>
          </View>
        </View>

        {/* Weekly Trend Chart */}
        <View className="px-6 mb-6">
          <WeeklyTrendChart
            data={trendData.length > 0 ? trendData : [
              { date: "2025-10-07", score: null, scanCount: 0, dayLabel: "Mon" },
              { date: "2025-10-08", score: null, scanCount: 0, dayLabel: "Tue" },
              { date: "2025-10-09", score: null, scanCount: 0, dayLabel: "Wed" },
              { date: "2025-10-10", score: null, scanCount: 0, dayLabel: "Thu" },
              { date: "2025-10-11", score: null, scanCount: 0, dayLabel: "Fri" },
              { date: "2025-10-12", score: null, scanCount: 0, dayLabel: "Sat" },
              { date: "2025-10-13", score: 55, scanCount: 1, dayLabel: "Sun" },
            ]}
            onTimeRangeChange={handleTimeRangeChange}
          />
        </View>

        {/* Achievement Row */}
        {achievements.length > 0 && (
          <View className="mb-6">
            <View className="px-6 mb-2">
              <Text className="text-xl font-bold text-[#001858]">{t.home.achievementBadges}</Text>
            </View>
            <AchievementRow achievements={achievements} />
          </View>
        )}

        {/* Alert Wall */}
        <View className="px-6 mb-6">
          <AlertWall ingredients={highRiskIngredients.length > 0 ? highRiskIngredients : [
            { name: "Analysis Failed", count: 2, riskScore: 50 },
            { name: "Sweetener", count: 1, riskScore: 70 },
            { name: "Flavoring", count: 1, riskScore: 60 },
          ]} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    gap: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  ctaButton: {
    shadowColor: "#2CB67D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
