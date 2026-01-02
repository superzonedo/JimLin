import { UserStats } from "../types/user";
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserPreferences {
  diseases: string[];
  healthGoals: string[];
  allergens: string[];
  customDiseases: string[];
  customHealthGoals: string[];
  customAllergens: string[];
}

type State = {
  isLoggedIn: boolean;
  userName: string;
  userEmail: string | null;
  stats: UserStats;
  preferences: UserPreferences;
  setLoggedIn: (loggedIn: boolean, userName?: string, userEmail?: string) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
};

const PREFERENCES_STORAGE_KEY = 'user-preferences';

// 從 AsyncStorage 載入 preferences
async function loadPreferences(): Promise<UserPreferences> {
  try {
    const saved = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('載入 preferences 失敗:', error);
  }
  return {
    diseases: [],
    healthGoals: [],
    allergens: [],
    customDiseases: [],
    customHealthGoals: [],
    customAllergens: [],
  };
}

// 保存 preferences 到 AsyncStorage
async function savePreferences(preferences: UserPreferences) {
  try {
    await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('保存 preferences 失敗:', error);
  }
}

// Mock data
let listeners: (() => void)[] = [];
let preferencesCache: UserPreferences = {
  diseases: [],
  healthGoals: [],
  allergens: [],
  customDiseases: [],
  customHealthGoals: [],
  customAllergens: [],
};

// 初始化時載入 preferences
loadPreferences().then(prefs => {
  preferencesCache = prefs;
  emitChange();
});

let state: State = {
  isLoggedIn: false,
  userName: "用戶",
  userEmail: null,
  stats: {
    scanStreak: 12,
    healthyPercentage: 85,
    totalScans: 0,
  },
  preferences: preferencesCache,
  setLoggedIn: (loggedIn: boolean, userName?: string, userEmail?: string) => {
    state.isLoggedIn = loggedIn;
    if (loggedIn) {
      if (userName) {
        state.userName = userName;
      }
      if (userEmail !== undefined) {
        state.userEmail = userEmail || null;
      }
    } else {
      // 登出時重置
      state.userName = "用戶";
      state.userEmail = null;
    }
    emitChange();
  },
  updatePreferences: (newPreferences: Partial<UserPreferences>) => {
    state.preferences = { ...state.preferences, ...newPreferences };
    preferencesCache = state.preferences;
    savePreferences(state.preferences);
    emitChange();
  },
};

function emitChange() {
  listeners.forEach(l => l());
}

// Simple hook implementation
import { useEffect, useState } from 'react';

const useUserStoreMock = <T>(selector: (state: State) => T): T => {
  const [storeState, setStoreState] = useState(state);

  useEffect(() => {
    // 初始化時載入 preferences
    loadPreferences().then(prefs => {
      if (JSON.stringify(prefs) !== JSON.stringify(state.preferences)) {
        state.preferences = prefs;
        preferencesCache = prefs;
        emitChange();
      }
    });

    const listener = () => setStoreState({ ...state });
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  return selector(storeState);
};

// Export as the original name
export { useUserStoreMock as useUserStore };

