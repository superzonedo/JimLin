import { Achievement, UserStats } from "../types/user";
import { FoodAnalysisResult } from "../types/food";

// Define all achievements
export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, "unlocked" | "progress">[] = [
  {
    id: "first_scan",
    title: "首次掃描",
    description: "完成第一次食品掃描",
    icon: "scan",
    requirement: "完成 1 次掃描",
  },
  {
    id: "healthy_beginner",
    title: "健康新手",
    description: "完成 5 次掃描，平均分數超過 70",
    icon: "leaf",
    requirement: "5 次掃描，平均分 > 70",
  },
  {
    id: "scan_master",
    title: "掃描達人",
    description: "累計完成 50 次食品掃描",
    icon: "trophy",
    requirement: "完成 50 次掃描",
  },
  {
    id: "streak_champion",
    title: "連續掃描",
    description: "連續 7 天每天至少掃描一次",
    icon: "flame",
    requirement: "連續 7 天掃描",
  },
  {
    id: "safety_guardian",
    title: "安全守護者",
    description: "成功避免 20 個高風險產品",
    icon: "shield-checkmark",
    requirement: "避免 20 個高風險產品",
  },
  {
    id: "health_explorer",
    title: "健康探索者",
    description: "完成 20 次食品掃描",
    icon: "compass",
    requirement: "完成 20 次掃描",
  },
  {
    id: "perfect_score",
    title: "完美評分",
    description: "獲得一次健康評分 90 分以上",
    icon: "star",
    requirement: "單次評分 ≥ 90",
  },
];

export function calculateAchievements(
  stats: UserStats,
  scanHistory: FoodAnalysisResult[]
): Achievement[] {
  const achievements: Achievement[] = [];

  // First Scan
  const firstScan: Achievement = {
    ...ACHIEVEMENT_DEFINITIONS[0],
    unlocked: stats.totalScans >= 1,
    progress: Math.min(stats.totalScans * 100, 100),
  };
  achievements.push(firstScan);

  // Healthy Beginner
  const healthyBeginner: Achievement = {
    ...ACHIEVEMENT_DEFINITIONS[1],
    unlocked: stats.totalScans >= 5 && stats.averageScore > 70,
    progress: Math.min(
      (stats.totalScans >= 5 && stats.averageScore > 70
        ? 100
        : (stats.totalScans / 5) * 50 + (stats.averageScore / 70) * 50),
      100
    ),
  };
  achievements.push(healthyBeginner);

  // Scan Master
  const scanMaster: Achievement = {
    ...ACHIEVEMENT_DEFINITIONS[2],
    unlocked: stats.totalScans >= 50,
    progress: Math.min((stats.totalScans / 50) * 100, 100),
  };
  achievements.push(scanMaster);

  // Streak Champion
  const streakChampion: Achievement = {
    ...ACHIEVEMENT_DEFINITIONS[3],
    unlocked: stats.scanStreak >= 7,
    progress: Math.min((stats.scanStreak / 7) * 100, 100),
  };
  achievements.push(streakChampion);

  // Safety Guardian - count high-risk products avoided
  const highRiskCount = scanHistory.filter((scan) => scan.riskLevel === "high").length;
  const lowMediumCount = scanHistory.filter(
    (scan) => scan.riskLevel === "low" || scan.riskLevel === "medium"
  ).length;
  const safetyGuardian: Achievement = {
    ...ACHIEVEMENT_DEFINITIONS[4],
    unlocked: lowMediumCount >= 20 && highRiskCount < lowMediumCount / 2,
    progress: Math.min((lowMediumCount / 20) * 100, 100),
  };
  achievements.push(safetyGuardian);

  // Health Explorer
  const healthExplorer: Achievement = {
    ...ACHIEVEMENT_DEFINITIONS[5],
    unlocked: stats.totalScans >= 20,
    progress: Math.min((stats.totalScans / 20) * 100, 100),
  };
  achievements.push(healthExplorer);

  // Perfect Score
  const hasPerfectScore = scanHistory.some((scan) => scan.healthScore >= 90);
  const maxScore = scanHistory.length > 0 ? Math.max(...scanHistory.map((s) => s.healthScore)) : 0;
  const perfectScore: Achievement = {
    ...ACHIEVEMENT_DEFINITIONS[6],
    unlocked: hasPerfectScore,
    progress: Math.min((maxScore / 90) * 100, 100),
  };
  achievements.push(perfectScore);

  return achievements;
}

export function checkNewAchievements(
  oldAchievements: Achievement[],
  newAchievements: Achievement[]
): string[] {
  const newlyUnlocked: string[] = [];

  newAchievements.forEach((newAch) => {
    const oldAch = oldAchievements.find((a) => a.id === newAch.id);
    if (newAch.unlocked && (!oldAch || !oldAch.unlocked)) {
      newlyUnlocked.push(newAch.id);
    }
  });

  return newlyUnlocked;
}
