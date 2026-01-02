import { FoodAnalysisResult } from "../types/food";
import {
  startOfDay,
  endOfDay,
  subDays,
  subMonths,
  format,
  isWithinInterval,
  isSameDay,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth
} from "date-fns";

export interface DayTrendData {
  date: string;
  score: number | null;
  scanCount: number;
  dayLabel: string;
}

export type TimeRange = "day" | "week" | "month";

export function calculateDailyTrend(scanHistory: FoodAnalysisResult[]): DayTrendData[] {
  const today = new Date();
  const dailyData: DayTrendData[] = [];

  // Create data for Monday to Friday (5 days)
  const dayNames = ["週一", "週二", "週三", "週四", "週五"];

  for (let i = 0; i < 5; i++) {
    // Calculate which day this represents
    // If today is Monday (1), we want to show Mon-Fri
    // If today is Friday (5), we want to show Mon-Fri
    const currentDayOfWeek = today.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday

    // Calculate the offset to get to Monday of current week
    const daysFromMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    const mondayDate = subDays(today, daysFromMonday);

    // Get the specific day (Monday + i)
    const targetDate = subDays(mondayDate, -i);
    const dateStart = startOfDay(targetDate);
    const dateEnd = endOfDay(targetDate);

    // Find scans for this day
    const dayScans = scanHistory.filter((scan) => {
      const scanDate = new Date(scan.timestamp);
      return isWithinInterval(scanDate, { start: dateStart, end: dateEnd });
    });

    // Calculate average score for the day
    let avgScore: number | null = null;
    if (dayScans.length > 0) {
      const totalScore = dayScans.reduce((sum, scan) => sum + scan.healthScore, 0);
      avgScore = Math.round(totalScore / dayScans.length);
    }

    dailyData.push({
      date: format(targetDate, "yyyy-MM-dd"),
      score: avgScore,
      scanCount: dayScans.length,
      dayLabel: dayNames[i],
    });
  }

  return dailyData;
}

export function calculateWeeklyTrend(scanHistory: FoodAnalysisResult[]): DayTrendData[] {
  const today = new Date();
  const weekData: DayTrendData[] = [];

  // Create data for last 10 weeks
  for (let i = 9; i >= 0; i--) {
    // Calculate the start and end of each week (Monday to Sunday)
    const weekEndDate = subDays(today, i * 7);
    const currentDayOfWeek = weekEndDate.getDay();
    const daysFromMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    const weekStartDate = subDays(weekEndDate, daysFromMonday);

    const weekStart = startOfDay(weekStartDate);
    const weekEnd = endOfDay(subDays(weekStartDate, -6)); // Sunday

    // Find scans for this week
    const weekScans = scanHistory.filter((scan) => {
      const scanDate = new Date(scan.timestamp);
      return isWithinInterval(scanDate, { start: weekStart, end: weekEnd });
    });

    // Calculate average score for the week
    let avgScore: number | null = null;
    if (weekScans.length > 0) {
      const totalScore = weekScans.reduce((sum, scan) => sum + scan.healthScore, 0);
      avgScore = Math.round(totalScore / weekScans.length);
    }

    const weekLabel = i === 0 ? "本週" : `第${10 - i}週`;

    weekData.push({
      date: format(weekStartDate, "yyyy-MM-dd"),
      score: avgScore,
      scanCount: weekScans.length,
      dayLabel: weekLabel,
    });
  }

  return weekData;
}

export function calculateDailyStats(scanHistory: FoodAnalysisResult[]): number {
  const today = new Date();
  
  const todayScans = scanHistory.filter((scan) => {
    return isSameDay(new Date(scan.timestamp), today);
  });

  return todayScans.length;
}

export function calculateWeeklyAverage(scanHistory: FoodAnalysisResult[]): number {
  const weekData = calculateWeeklyTrend(scanHistory);

  const scoresWithData = weekData.filter((day) => day.score !== null);

  if (scoresWithData.length === 0) return 0;

  const totalScore = scoresWithData.reduce((sum, day) => sum + (day.score || 0), 0);
  return Math.round(totalScore / scoresWithData.length);
}

export function calculateWeeklyScans(scanHistory: FoodAnalysisResult[]): number {
  const today = new Date();
  const weekStart = startOfDay(subDays(today, 6));
  const weekEnd = endOfDay(today);

  const weekScans = scanHistory.filter((scan) => {
    const scanDate = new Date(scan.timestamp);
    return isWithinInterval(scanDate, { start: weekStart, end: weekEnd });
  });

  return weekScans.length;
}

export function calculateWeeklyScanDays(scanHistory: FoodAnalysisResult[]): number {
  const weekData = calculateWeeklyTrend(scanHistory);

  // Count days with at least one scan
  const daysWithScans = weekData.filter((day) => day.scanCount > 0);

  return daysWithScans.length;
}

export function calculateMonthlyTrend(scanHistory: FoodAnalysisResult[]): DayTrendData[] {
  const today = new Date();
  const monthData: DayTrendData[] = [];

  // Create data for last 12 months
  for (let i = 11; i >= 0; i--) {
    const targetMonth = subMonths(today, i);
    const monthStart = startOfMonth(targetMonth);
    const monthEnd = endOfMonth(targetMonth);

    // Find scans for this month
    const monthScans = scanHistory.filter((scan) => {
      const scanDate = new Date(scan.timestamp);
      return isWithinInterval(scanDate, { start: startOfDay(monthStart), end: endOfDay(monthEnd) });
    });

    // Calculate average score for the month
    let avgScore: number | null = null;
    if (monthScans.length > 0) {
      const totalScore = monthScans.reduce((sum, scan) => sum + scan.healthScore, 0);
      avgScore = Math.round(totalScore / monthScans.length);
    }

    const monthLabel = i === 0 ? "本月" : `${format(targetMonth, "M")}月`;

    monthData.push({
      date: format(monthStart, "yyyy-MM-dd"),
      score: avgScore,
      scanCount: monthScans.length,
      dayLabel: monthLabel,
    });
  }

  return monthData;
}
