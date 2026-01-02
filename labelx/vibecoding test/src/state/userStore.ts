import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserState } from "../types/user";
import { format, isSameDay, differenceInDays } from "date-fns";

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      userName: undefined,
      email: undefined,
      preferences: {
        healthGoals: [],
        customHealthGoals: [],
        allergens: [],
        customAllergens: [],
        diseases: [],
        customDiseases: [],
        notificationsEnabled: true,
        allergenAlertsEnabled: false,
        dailyReminderEnabled: true,
        weeklyReportEnabled: true,
        achievementNotificationsEnabled: true,
        language: "zh-TW",
      },
      stats: {
        totalScans: 0,
        averageScore: 0,
        healthyPercentage: 0,
        scanStreak: 0,
        dailyScans: 0,
        weeklyScores: [],
        lastScanDate: "",
        freeScansUsed: 0,
      },
      achievements: [],
      hasCompletedOnboarding: false,
      onboardingData: null,
      setLoggedIn: (status, userName, email) =>
        set({ isLoggedIn: status, userName, email }),
      updatePreferences: (preferences) =>
        set((state) => {
          const newPrefs = { ...state.preferences, ...preferences };
          return { preferences: newPrefs };
        }),
      updateStats: (stats) =>
        set((state) => ({
          stats: { ...state.stats, ...stats },
        })),
      updateDailyStats: () =>
        set((state) => {
          const today = new Date();
          const lastScanDate = state.stats.lastScanDate
            ? new Date(state.stats.lastScanDate)
            : null;

          let newDailyScans = 1;
          let newStreak = state.stats.scanStreak;

          if (lastScanDate) {
            if (isSameDay(today, lastScanDate)) {
              // Same day - increment daily scans
              newDailyScans = state.stats.dailyScans + 1;
            } else {
              // Different day
              const daysDiff = differenceInDays(today, lastScanDate);
              if (daysDiff === 1) {
                // Consecutive day - increment streak
                newStreak = state.stats.scanStreak + 1;
              } else if (daysDiff > 1) {
                // Streak broken - reset to 1
                newStreak = 1;
              }
              newDailyScans = 1;
            }
          } else {
            // First scan ever
            newStreak = 1;
          }

          const newStats = {
            ...state.stats,
            dailyScans: newDailyScans,
            scanStreak: newStreak,
            lastScanDate: format(today, "yyyy-MM-dd"),
          };

          return { stats: newStats };
        }),
      addAchievement: (achievementId) =>
        set((state) => {
          const existingIndex = state.achievements.findIndex(
            (a) => a.id === achievementId
          );
          if (existingIndex >= 0) {
            const updated = [...state.achievements];
            updated[existingIndex] = { ...updated[existingIndex], unlocked: true };
            return { achievements: updated };
          }
          return state;
        }),
      updateWeeklyScores: (score) =>
        set((state) => {
          const today = format(new Date(), "yyyy-MM-dd");
          const existingScores = [...state.stats.weeklyScores];

          // Check if we already have a score for today
          const todayIndex = existingScores.findIndex((s) => s.date === today);

          if (todayIndex >= 0) {
            // Update today's score (average with existing)
            const existingScore = existingScores[todayIndex].score;
            existingScores[todayIndex] = {
              date: today,
              score: Math.round((existingScore + score) / 2),
            };
          } else {
            // Add new score for today
            existingScores.push({ date: today, score });
          }

          // Keep only last 7 days
          const sorted = existingScores.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          const last7Days = sorted.slice(0, 7);

          return {
            stats: {
              ...state.stats,
              weeklyScores: last7Days,
            },
          };
        }),
      setAchievements: (achievements) => set({ achievements }),
      addCustomAllergen: (allergen) =>
        set((state) => {
          const newAllergens = [...(state.preferences.customAllergens || []), allergen];
          const newPrefs = {
            ...state.preferences,
            customAllergens: newAllergens,
          };
          return { preferences: newPrefs };
        }),
      removeCustomAllergen: (allergen) =>
        set((state) => {
          const newAllergens = (state.preferences.customAllergens || []).filter((a) => a !== allergen);
          const newPrefs = {
            ...state.preferences,
            customAllergens: newAllergens,
          };
          return { preferences: newPrefs };
        }),
      toggleDisease: (disease) =>
        set((state) => {
          const currentDiseases = state.preferences.diseases || [];
          const newDiseases = currentDiseases.includes(disease)
            ? currentDiseases.filter((d) => d !== disease)
            : [...currentDiseases, disease];

          const newPrefs = { ...state.preferences, diseases: newDiseases };
          return { preferences: newPrefs };
        }),
      addCustomDisease: (disease) =>
        set((state) => {
          const newDiseases = [...(state.preferences.customDiseases || []), disease];
          const newPrefs = {
            ...state.preferences,
            customDiseases: newDiseases,
          };
          return { preferences: newPrefs };
        }),
      removeCustomDisease: (disease) =>
        set((state) => {
          const newDiseases = (state.preferences.customDiseases || []).filter((d) => d !== disease);
          const newPrefs = {
            ...state.preferences,
            customDiseases: newDiseases,
          };
          return { preferences: newPrefs };
        }),
      addCustomHealthGoal: (goal) =>
        set((state) => {
          const newGoals = [...(state.preferences.customHealthGoals || []), goal];
          const newPrefs = {
            ...state.preferences,
            customHealthGoals: newGoals,
          };
          return { preferences: newPrefs };
        }),
      removeCustomHealthGoal: (goal) =>
        set((state) => {
          const newGoals = (state.preferences.customHealthGoals || []).filter((g) => g !== goal);
          const newPrefs = {
            ...state.preferences,
            customHealthGoals: newGoals,
          };
          return { preferences: newPrefs };
        }),
      // Complete onboarding and save all data
      completeOnboarding: (data, preferences) =>
        set((state) => {
          const newPrefs = { ...state.preferences, ...preferences };
          return {
            hasCompletedOnboarding: true,
            onboardingData: data,
            preferences: newPrefs,
          };
        }),
      // Reset onboarding (for testing/debugging)
      resetOnboarding: () =>
        set({
          hasCompletedOnboarding: false,
          onboardingData: null,
        }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
