import { FoodAnalysisResult } from "@/types/food";
import { Achievement } from "@/types/user";
import { format, startOfDay, endOfDay, isWithinInterval, subDays, differenceInDays, getHours } from "date-fns";

/**
 * 計算連續掃描天數
 */
function calculateScanStreak(scanHistory: FoodAnalysisResult[]): number {
  if (scanHistory.length === 0) return 0;

  // 獲取所有已掃描的日期（去重，只保留日期部分）
  const scannedDates = new Set<string>();
  scanHistory.forEach(scan => {
    const dateStr = format(startOfDay(new Date(scan.timestamp)), 'yyyy-MM-dd');
    scannedDates.add(dateStr);
  });

  // 將日期轉換為數組並排序（最新的在前）
  const sortedDates = Array.from(scannedDates)
    .map(dateStr => startOfDay(new Date(dateStr)))
    .sort((a, b) => b.getTime() - a.getTime());

  if (sortedDates.length === 0) return 0;

  let streak = 0;
  const today = startOfDay(new Date());
  let expectedDate = today;

  for (const scanDate of sortedDates) {
    const daysDiff = differenceInDays(expectedDate, scanDate);

    if (daysDiff === 0) {
      // 匹配預期日期
      streak++;
      expectedDate = subDays(expectedDate, 1);
    } else if (daysDiff === 1 && streak === 0) {
      // 昨天有掃描，但今天沒有（從昨天開始計算）
      streak++;
      expectedDate = subDays(scanDate, 1);
    } else if (daysDiff > 0) {
      // 日期不連續，停止計算
      break;
    }
  }

  return streak;
}

/**
 * 檢查產品是否為無糖或低糖
 */
function isLowSugarProduct(backendData: any): boolean {
  if (!backendData?.nutritionPer100) return false;
  
  const sugar = backendData.nutritionPer100.sugar || 0;
  // 每100g含糖量低於5g視為低糖
  return sugar < 5;
}

/**
 * 檢查產品是否含有蔬菜成分
 */
function hasVegetableIngredients(backendData: any): boolean {
  if (!backendData?.allIngredients) return false;
  
  const vegetableKeywords = ['蔬菜', '菜', '葉', '蔥', '蒜', '薑', '蘿蔔', '白菜', '菠菜', '生菜', '芹菜', '番茄', '茄子', '青椒', '紅椒', '黃椒', '洋蔥', '蘑菇', '香菇', '金針菇', '豆芽', '豆苗', '韭菜', '香菜', '九層塔', 'basil', 'vegetable', 'spinach', 'lettuce', 'cabbage', 'tomato', 'onion', 'garlic', 'pepper', 'mushroom'];
  
  return backendData.allIngredients.some((ing: any) => 
    vegetableKeywords.some(keyword => 
      ing.name?.toLowerCase().includes(keyword.toLowerCase())
    )
  );
}

/**
 * 檢查產品是否含有水果成分
 */
function hasFruitIngredients(backendData: any): boolean {
  if (!backendData?.allIngredients) return false;
  
  const fruitKeywords = ['水果', '果', '蘋果', '香蕉', '橘子', '橙', '檸檬', '草莓', '藍莓', '葡萄', '西瓜', '鳳梨', '芒果', '奇異果', '火龍果', '櫻桃', '桃子', '梨', '李子', '梅', 'fruit', 'apple', 'banana', 'orange', 'lemon', 'strawberry', 'blueberry', 'grape', 'watermelon', 'pineapple', 'mango', 'kiwi'];
  
  return backendData.allIngredients.some((ing: any) => 
    fruitKeywords.some(keyword => 
      ing.name?.toLowerCase().includes(keyword.toLowerCase())
    )
  );
}

/**
 * 檢查產品是否為低脂
 */
function isLowFatProduct(backendData: any): boolean {
  if (!backendData?.nutritionPer100) return false;
  
  const fat = backendData.nutritionPer100.fat || 0;
  // 每100g脂肪含量低於3g視為低脂
  return fat < 3;
}

/**
 * 檢查是否在早上掃描（8點前）
 */
function isMorningScan(timestamp: string): boolean {
  const scanDate = new Date(timestamp);
  const hour = getHours(scanDate);
  return hour < 8;
}

/**
 * 計算一個月內每天都有掃描的天數
 */
function calculateDailyScansThisMonth(scanHistory: FoodAnalysisResult[]): number {
  const today = new Date();
  const monthStart = startOfDay(new Date(today.getFullYear(), today.getMonth(), 1));
  const todayStart = startOfDay(today);

  // 獲取本月所有已掃描的日期（去重）
  const scannedDates = new Set<string>();
  
  scanHistory.forEach(scan => {
    const scanDate = startOfDay(new Date(scan.timestamp));
    if (isWithinInterval(scanDate, { start: monthStart, end: todayStart })) {
      scannedDates.add(format(scanDate, 'yyyy-MM-dd'));
    }
  });

  return scannedDates.size;
}

/**
 * 計算所有成就的狀態
 */
export function calculateAchievements(scanHistory: FoodAnalysisResult[]): Achievement[] {
  const purchasedScans = scanHistory.filter(scan => scan.isPurchased === true);
  const totalScans = scanHistory.length;
  const scanStreak = calculateScanStreak(scanHistory);

  // 統計各種類型的產品數量
  let lowSugarCount = 0;
  let vegetableCount = 0;
  let fruitCount = 0;
  let lowFatCount = 0;
  let morningScanCount = 0;

  purchasedScans.forEach(scan => {
    const backendData = (scan as any)?.backendData;
    if (backendData) {
      if (isLowSugarProduct(backendData)) lowSugarCount++;
      if (hasVegetableIngredients(backendData)) vegetableCount++;
      if (hasFruitIngredients(backendData)) fruitCount++;
      if (isLowFatProduct(backendData)) lowFatCount++;
    }
    
    if (isMorningScan(scan.timestamp)) morningScanCount++;
  });

  const dailyScansThisMonth = calculateDailyScansThisMonth(scanHistory);
  const daysInMonth = new Date().getDate(); // 本月已過天數

  const achievements: Achievement[] = [
    {
      id: "1",
      title: "健康達人",
      icon: "trophy",
      description: "累積掃描10次產品",
      unlocked: totalScans >= 10,
      progress: Math.min(Math.round((totalScans / 10) * 100), 100),
      dateUnlocked: totalScans >= 10 ? scanHistory[0]?.timestamp : undefined,
    },
    {
      id: "2",
      title: "連續七天",
      icon: "flame",
      description: "連續7天都有掃描",
      unlocked: scanStreak >= 7,
      progress: Math.min(Math.round((scanStreak / 7) * 100), 100),
      dateUnlocked: scanStreak >= 7 ? scanHistory[0]?.timestamp : undefined,
    },
    {
      id: "3",
      title: "無糖戰士",
      icon: "water",
      description: "掃描10個無糖或低糖產品",
      unlocked: lowSugarCount >= 10,
      progress: Math.min(Math.round((lowSugarCount / 10) * 100), 100),
    },
    {
      id: "4",
      title: "蔬菜大師",
      icon: "leaf",
      description: "掃描10個含有蔬菜的產品",
      unlocked: vegetableCount >= 10,
      progress: Math.min(Math.round((vegetableCount / 10) * 100), 100),
    },
    {
      id: "5",
      title: "水果愛好者",
      icon: "nutrition",
      description: "掃描10個含有水果的產品",
      unlocked: fruitCount >= 10,
      progress: Math.min(Math.round((fruitCount / 10) * 100), 100),
    },
    {
      id: "6",
      title: "低脂飲食",
      icon: "restaurant",
      description: "掃描10個低脂產品",
      unlocked: lowFatCount >= 10,
      progress: Math.min(Math.round((lowFatCount / 10) * 100), 100),
    },
    {
      id: "7",
      title: "全勤獎",
      icon: "calendar",
      description: "本月每天都有掃描",
      unlocked: dailyScansThisMonth >= daysInMonth && daysInMonth > 0,
      progress: daysInMonth > 0 ? Math.min(Math.round((dailyScansThisMonth / daysInMonth) * 100), 100) : 0,
    },
    {
      id: "8",
      title: "早起鳥兒",
      icon: "sunny",
      description: "早上8點前掃描10次",
      unlocked: morningScanCount >= 10,
      progress: Math.min(Math.round((morningScanCount / 10) * 100), 100),
    },
  ];

  return achievements;
}
