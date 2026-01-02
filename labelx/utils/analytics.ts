import { format, subDays, addDays, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { FoodAnalysisResult } from "@/types/food";

export interface DayTrendData {
  dayLabel: string;
  score: number | null;
  date: string; // YYYY-MM-DD
  scanCount?: number;
}

export type TimeRange = "day" | "week" | "month";

/**
 * 計算本日健康趨勢（最近7小時）
 * 只計算已納入分析的掃描記錄（isPurchased === true）
 */
export function calculateDailyTrend(scanHistory: FoodAnalysisResult[]): DayTrendData[] {
  const today = new Date();
  const dayData: DayTrendData[] = [];

  // Create data for last 7 hours
  let lastScore: number | null = null;

  for (let i = 6; i >= 0; i--) {
    // 計算每個小時的時間範圍
    const targetHour = new Date(today);
    targetHour.setHours(today.getHours() - i, 0, 0, 0);
    const hourStart = new Date(targetHour);
    const hourEnd = new Date(targetHour);
    hourEnd.setHours(hourEnd.getHours() + 1);

    // Find scans for this hour - 只計算已納入分析的記錄
    const hourScans = scanHistory.filter((scan) => {
      const scanDate = new Date(scan.timestamp);
      const isInHour = scanDate >= hourStart && scanDate < hourEnd;
      const isAnalyzed = scan.healthScore !== undefined && scan.healthScore !== null;
      const isPurchased = scan.isPurchased === true;
      return isInHour && isAnalyzed && isPurchased;
    });

    // Calculate average score for the hour
    let avgScore: number | null = null;
    if (hourScans.length > 0) {
      const totalScore = hourScans.reduce((sum, scan) => sum + (scan.healthScore || 0), 0);
      avgScore = Math.round(totalScore / hourScans.length);
      lastScore = avgScore;
    } else if (lastScore !== null) {
      avgScore = lastScore;
    }

    // 顯示小時標籤（格式：HH:00）
    const hourLabel = format(targetHour, "HH:00");

    dayData.push({
      date: format(targetHour, "yyyy-MM-dd HH:00"),
      score: avgScore,
      scanCount: hourScans.length,
      dayLabel: hourLabel,
    });
  }

  return dayData;
}

/**
 * 計算本週健康趨勢（週一到週日）
 * 只計算已納入分析的掃描記錄（isPurchased === true）
 * 只顯示到今天為止的日期，未來的日期不顯示分數
 */
export function calculateWeeklyTrend(scanHistory: FoodAnalysisResult[]): DayTrendData[] {
  const today = new Date();
  const weekData: DayTrendData[] = [];

  // Create data for last 7 days (週一到週日)
  const dayNames = ["週一", "週二", "週三", "週四", "週五", "週六", "週日"];
  const todayStart = startOfDay(today);

  // 計算本週週一的日期
  const currentDayOfWeek = today.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  const daysFromMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
  const mondayDate = subDays(today, daysFromMonday);

  for (let i = 0; i < 7; i++) {
    // 計算每一天的日期（週一 + i）
    const targetDate = subDays(mondayDate, -i);
    const dateStart = startOfDay(targetDate);
    const dateEnd = endOfDay(targetDate);
    
    // 如果目標日期是未來（在今天之後），不顯示分數
    const isFuture = dateStart > todayStart;

    // Find scans for this day - 只計算已納入分析的記錄
    const dayScans = scanHistory.filter((scan) => {
      const scanDate = new Date(scan.timestamp);
      const isInDay = isWithinInterval(scanDate, { start: dateStart, end: dateEnd });
      const isAnalyzed = scan.healthScore !== undefined && scan.healthScore !== null;
      const isPurchased = scan.isPurchased === true;
      return isInDay && isAnalyzed && isPurchased;
    });

    // Calculate average score for the day
    let avgScore: number | null = null;
    if (!isFuture && dayScans.length > 0) {
      const totalScore = dayScans.reduce((sum, scan) => sum + (scan.healthScore || 0), 0);
      avgScore = Math.round(totalScore / dayScans.length);
    }
    // 如果是未來日期或沒有掃描，保持為 null（不顯示柱狀圖）

    weekData.push({
      date: format(targetDate, "yyyy-MM-dd"),
      score: avgScore,
      scanCount: dayScans.length,
      dayLabel: dayNames[i],
    });
  }

  return weekData;
}

/**
 * 計算本月健康趨勢（最近4週）
 * 只計算已納入分析的掃描記錄（isPurchased === true）
 * 本週會包含到今天為止的數據（即使還沒到週日）
 */
export function calculateMonthlyTrend(scanHistory: FoodAnalysisResult[]): DayTrendData[] {
  const today = new Date();
  const monthData: DayTrendData[] = [];
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  // 計算本週週一的日期
  const currentDayOfWeek = today.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  const daysFromMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
  const thisMonday = subDays(today, daysFromMonday);
  
  // 計算本週週日的日期（用於顯示標籤）
  const daysFromSunday = currentDayOfWeek === 0 ? 0 : 7 - currentDayOfWeek;
  const thisSunday = subDays(today, daysFromSunday);

  for (let i = 3; i >= 0; i--) {
    // 計算每一週的週一和週日日期
    const weekMonday = subDays(thisMonday, i * 7);
    const weekSunday = subDays(thisSunday, i * 7);
    const weekStart = startOfDay(weekMonday);
    
    // 如果是本週（i=0），結束日期是今天；否則結束日期是週日
    const weekEnd = i === 0 ? todayEnd : endOfDay(weekSunday);
    
    // 如果週一是在今天之後（未來的週），不顯示分數
    const isFuture = weekStart > todayStart;

    // Find scans for this week - 只計算已納入分析的記錄
    const weekScans = scanHistory.filter((scan) => {
      const scanDate = new Date(scan.timestamp);
      const isInWeek = isWithinInterval(scanDate, { start: weekStart, end: weekEnd });
      const isAnalyzed = scan.healthScore !== undefined && scan.healthScore !== null;
      const isPurchased = scan.isPurchased === true;
      return isInWeek && isAnalyzed && isPurchased;
    });

    // Calculate average score for the week
    let avgScore: number | null = null;
    if (!isFuture && weekScans.length > 0) {
      const totalScore = weekScans.reduce((sum, scan) => sum + (scan.healthScore || 0), 0);
      avgScore = Math.round(totalScore / weekScans.length);
    }
    // 如果是未來的週或沒有掃描，保持為 null（不顯示柱狀圖）

    // 顯示週日的日期（格式：M/d）
    // 如果是本週且還沒到週日，仍然顯示週日的日期（預期的週日日期）
    const weekLabel = format(weekSunday, "M/d");

    monthData.push({
      date: format(weekSunday, "yyyy-MM-dd"),
      score: avgScore,
      scanCount: weekScans.length,
      dayLabel: weekLabel,
    });
  }

  return monthData;
}

/**
 * 計算本週平均健康分數
 * 只計算本週（週一到週日）所有已納入分析的掃描記錄的平均分數
 */
export function calculateWeeklyAverage(scanHistory: FoodAnalysisResult[]): number {
  const today = new Date();
  
  // 計算本週週一的日期
  const currentDayOfWeek = today.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
  const daysFromMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
  const mondayDate = subDays(today, daysFromMonday);
  const weekStart = startOfDay(mondayDate);
  const weekEnd = endOfDay(addDays(mondayDate, 6)); // 週日（週一 + 6天）

  // 篩選本週的掃描記錄，只包含已納入分析的（isPurchased === true）
  const weekScans = scanHistory.filter((scan) => {
    const scanDate = new Date(scan.timestamp);
    const isInWeek = isWithinInterval(scanDate, { start: weekStart, end: weekEnd });
    // 只計算已納入分析的記錄（有 healthScore 且 isPurchased 明確為 true）
    const isAnalyzed = scan.healthScore !== undefined && scan.healthScore !== null;
    const isPurchased = scan.isPurchased === true; // 只有明確設置為 true 的才計算
    
    return isInWeek && isAnalyzed && isPurchased;
  });

  // 如果沒有本週的掃描記錄，返回 0
  if (weekScans.length === 0) {
    return 0;
  }

  // 計算平均分數
  const totalScore = weekScans.reduce((sum, scan) => sum + scan.healthScore, 0);
  const averageScore = Math.round(totalScore / weekScans.length);

  return averageScore;
}