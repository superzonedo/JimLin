export interface Achievement {
  id: string;
  title: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  description?: string;
  dateUnlocked?: string;
}

export interface UserStats {
  scanStreak: number;
  healthyPercentage: number;
  totalScans: number;
}