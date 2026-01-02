import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScanState } from "../types/food";
import { useUserStore } from "./userStore";

export const useFoodScanStore = create<ScanState>()(
  persist(
    (set) => ({
      isAnalyzing: false,
      currentResult: null,
      scanHistory: [],
      favorites: [],
      addScanResult: async (result) => {
        // Set currentResult only, don't add to history yet
        // User must click save button to add to history
        const resultWithPurchaseStatus = { ...result, isPurchased: false };
        set({ currentResult: resultWithPurchaseStatus });
      },
      saveCurrentResult: () => {
        // Save current result to history when user clicks save button
        set((state) => {
          if (!state.currentResult) return state;

          const savedResult = { ...state.currentResult, isPurchased: true };

          // Check if already in history
          const existsInHistory = state.scanHistory.some(s => s.id === savedResult.id);
          if (existsInHistory) {
            // Update existing record
            return {
              scanHistory: state.scanHistory.map(s =>
                s.id === savedResult.id ? savedResult : s
              ),
              currentResult: savedResult,
            };
          }

          // Add new record to history
          return {
            scanHistory: [savedResult, ...state.scanHistory].slice(0, 50),
            currentResult: savedResult,
          };
        });

        // Update stats when user saves
        const scan = useFoodScanStore.getState().currentResult;
        if (scan) {
          const userStore = useUserStore.getState();
          const newTotalScans = userStore.stats.totalScans + 1;
          const newAverageScore = Math.round(
            ((userStore.stats.averageScore * userStore.stats.totalScans) + scan.healthScore) / newTotalScans
          );
          const get = useFoodScanStore.getState;
          const purchasedScans = get().scanHistory.filter((s) => s.isPurchased);
          const healthyScans = purchasedScans.filter((s) => s.riskLevel === 'low').length;
          const newHealthyPercentage = purchasedScans.length > 0
            ? Math.round((healthyScans / purchasedScans.length) * 100)
            : 0;

          userStore.updateStats({
            totalScans: newTotalScans,
            averageScore: newAverageScore,
            healthyPercentage: newHealthyPercentage,
          });

          // Update daily stats
          userStore.updateDailyStats();

          // Update weekly scores
          userStore.updateWeeklyScores(scan.healthScore);

          console.log('✅ Scan saved and stats updated:', scan.id);
        }
      },
      setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
      setCurrentResult: (result) => set({ currentResult: result }),
      toggleFavorite: (id) =>
        set((state) => {
          const isFavorited = state.favorites.includes(id);
          const newFavorites = isFavorited
            ? state.favorites.filter((fId) => fId !== id)
            : [...state.favorites, id];

          const updatedHistory = state.scanHistory.map((scan) =>
            scan.id === id ? { ...scan, isFavorite: !isFavorited } : scan
          );

          return {
            favorites: newFavorites,
            scanHistory: updatedHistory,
            currentResult:
              state.currentResult?.id === id
                ? { ...state.currentResult, isFavorite: !isFavorited }
                : state.currentResult,
          };
        }),
      confirmPurchase: async (id) => {
        const scan = useFoodScanStore.getState().scanHistory.find((s) => s.id === id);
        if (!scan) return;

        // Update local state immediately
        set((state) => ({
          scanHistory: state.scanHistory.map((scan) =>
            scan.id === id ? { ...scan, isPurchased: true } : scan
          ),
          currentResult:
            state.currentResult?.id === id
              ? { ...state.currentResult, isPurchased: true }
              : state.currentResult,
        }));

        // Update stats when user confirms purchase
        const userStore = useUserStore.getState();
        const newTotalScans = userStore.stats.totalScans + 1;
        const newAverageScore = Math.round(
          ((userStore.stats.averageScore * userStore.stats.totalScans) + scan.healthScore) / newTotalScans
        );
        const get = useFoodScanStore.getState;
        const purchasedScans = get().scanHistory.filter((s) => s.isPurchased);
        const healthyScans = purchasedScans.filter((s) => s.riskLevel === 'low').length;
        const newHealthyPercentage = purchasedScans.length > 0
          ? Math.round((healthyScans / purchasedScans.length) * 100)
          : 0;

        userStore.updateStats({
          totalScans: newTotalScans,
          averageScore: newAverageScore,
          healthyPercentage: newHealthyPercentage,
        });

        // Update daily stats
        userStore.updateDailyStats();

        // Update weekly scores
        userStore.updateWeeklyScores(scan.healthScore);

        console.log('✅ Purchase confirmed and stats updated for scan:', id);
      },
      deleteScan: async (id) => {
        // Update local state
        set((state) => ({
          scanHistory: state.scanHistory.filter((scan) => scan.id !== id),
          favorites: state.favorites.filter((fId) => fId !== id),
          currentResult: state.currentResult?.id === id ? null : state.currentResult,
        }));
      },
      deleteMultipleScans: async (ids) => {
        // Update local state
        set((state) => ({
          scanHistory: state.scanHistory.filter((scan) => !ids.includes(scan.id)),
          favorites: state.favorites.filter((fId) => !ids.includes(fId)),
          currentResult: ids.includes(state.currentResult?.id || "") ? null : state.currentResult,
        }));
      },
      clearAllHistory: async () => {
        // Clear local state
        set({
          scanHistory: [],
          favorites: [],
          currentResult: null,
        });
      },
    }),
    {
      name: "food-scan-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
