export type HealthGoal = 
  | "low-sodium" 
  | "high-fiber" 
  | "low-sugar" 
  | "low-fat" 
  | "high-protein" 
  | "weight-control" 
  | "gut-health";

export type AllergenType = 
  | "peanuts" 
  | "nuts" 
  | "dairy" 
  | "eggs" 
  | "seafood" 
  | "soy" 
  | "wheat" 
  | "sesame" 
  | "sulfites" 
  | "preservatives" 
  | "artificial-colors" 
  | "artificial-flavors" 
  | "msg"
  | "gluten";

export type DiseaseType = 
  | "kidney-disease" 
  | "liver-disease" 
  | "skin-disease" 
  | "diabetes" 
  | "hypertension" 
  | "high-cholesterol" 
  | "stomach-sensitivity" 
  | "metabolic-disease";

export interface OnboardingData {
  careAboutFoodSafety: boolean;
  dietAwareness: string;
  careAboutAdditives: boolean;
  understandLabels: boolean;
  worryAboutCancer: boolean;
  familyMembers: string[];
  gender: string;
  ageGroup: string;
}

export interface UserPreferences {
  healthGoals: HealthGoal[];
  customHealthGoals: string[];
  allergens: AllergenType[];
  customAllergens: string[];
  diseases: DiseaseType[];
  customDiseases: string[];
  notificationsEnabled: boolean;
  allergenAlertsEnabled: boolean;
  dailyReminderEnabled: boolean;
  weeklyReportEnabled: boolean;
  achievementNotificationsEnabled: boolean;
  language: "zh-TW" | "zh-CN" | "en";
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  requirement: string;
}

export interface WeeklyScore {
  date: string;
  score: number;
}

export interface UserStats {
  totalScans: number;
  averageScore: number;
  healthyPercentage: number;
  scanStreak: number;
  dailyScans: number;
  weeklyScores: WeeklyScore[];
  lastScanDate: string;
  freeScansUsed: number; // Track free scans used (non-premium users)
}

export interface UserState {
  isLoggedIn: boolean;
  userName?: string;
  email?: string;
  preferences: UserPreferences;
  stats: UserStats;
  achievements: Achievement[];
  hasCompletedOnboarding: boolean;
  onboardingData: OnboardingData | null;
  setLoggedIn: (status: boolean, userName?: string, email?: string) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  updateStats: (stats: Partial<UserStats>) => void;
  updateDailyStats: () => void;
  addAchievement: (achievementId: string) => void;
  updateWeeklyScores: (score: number) => void;
  setAchievements: (achievements: Achievement[]) => void;
  addCustomAllergen: (allergen: string) => void;
  removeCustomAllergen: (allergen: string) => void;
  toggleDisease: (disease: DiseaseType) => void;
  addCustomDisease: (disease: string) => void;
  removeCustomDisease: (disease: string) => void;
  addCustomHealthGoal: (goal: string) => void;
  removeCustomHealthGoal: (goal: string) => void;
  completeOnboarding: (data: OnboardingData, preferences: Partial<UserPreferences>) => void;
  resetOnboarding: () => void;
}
