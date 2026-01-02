import { FoodAnalysisResult } from "../types/food";

// To make it work better with React updates (like clearing history), 
// we should probably use a real hook if we want the UI to update.
// But the user said "mock data", so maybe static is fine?
// Let's try to make it a bit better by using a simple React hook pattern if needed,
// but since I can't easily add zustand, I'll stick to this simple version.
// If the user clicks delete, it won't re-render automatically with this simple function.
// Let's improve it slightly to be a real hook.

import { useEffect, useState } from 'react';

// Mock Data
const MOCK_HISTORY: FoodAnalysisResult[] = [
  {
    id: "1",
    timestamp: new Date().toISOString(),
    imageUri: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D",
    healthScore: 85,
    summary: "這是一份非常健康的沙拉",
    recommendation: "非常棒的選擇！",
    ingredients: {
      safe: [{ name: "生菜" }, { name: "番茄" }],
      warning: []
    }
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    imageUri: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D",
    healthScore: 45,
    summary: "高熱量披薩",
    recommendation: "建議適量食用",
    ingredients: {
      safe: [{ name: "麵粉" }],
      warning: [{ name: "高鈉起司" }, { name: "加工肉品" }]
    }
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    imageUri: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Zm9vZHxlbnwwfHwwfHx8MA%3D%3D",
    healthScore: 92,
    summary: "酪梨吐司",
    recommendation: "富含健康油脂",
    ingredients: {
      safe: [{ name: "酪梨" }, { name: "全麥麵包" }],
      warning: []
    }
  }
];

type State = {
  scanHistory: FoodAnalysisResult[];
  currentResult: FoodAnalysisResult | null;
  isAnalyzing: boolean;
  setCurrentResult: (result: FoodAnalysisResult | null) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  addScanResult: (result: FoodAnalysisResult) => void;
  clearAllHistory: () => void;
  deleteScan: (id: string) => void;
  updateScanPurchaseStatus: (id: string, isPurchased: boolean) => void;
};

// Simple mock store implementation
let listeners: (() => void)[] = [];
let state: State = {
  scanHistory: MOCK_HISTORY,
  currentResult: null,
  isAnalyzing: false,
  setCurrentResult: (result) => {
    state.currentResult = result;
    emitChange();
  },
  setIsAnalyzing: (analyzing) => {
    state.isAnalyzing = analyzing;
    emitChange();
  },
  addScanResult: (result) => {
    state.scanHistory = [result, ...state.scanHistory];
    emitChange();
  },
  clearAllHistory: () => {
    state.scanHistory = [];
    emitChange();
  },
  deleteScan: (id: string) => {
    state.scanHistory = state.scanHistory.filter(item => item.id !== id);
    emitChange();
  },
  updateScanPurchaseStatus: (id: string, isPurchased: boolean) => {
    // 更新 scanHistory 中的記錄
    state.scanHistory = state.scanHistory.map(item => 
      item.id === id ? { ...item, isPurchased } : item
    );
    // 如果當前結果是這個記錄，也更新它
    if (state.currentResult?.id === id) {
      state.currentResult = { ...state.currentResult, isPurchased };
    }
    emitChange();
  }
};

function emitChange() {
  listeners.forEach(l => l());
}

const useFoodScanStoreMock = <T>(selector: (state: State) => T): T => {
  const [storeState, setStoreState] = useState(state);

  useEffect(() => {
    const listener = () => setStoreState({ ...state });
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  return selector(storeState);
};

// Export as the original name
export { useFoodScanStoreMock as useFoodScanStore };
