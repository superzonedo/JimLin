export interface IngredientAnalysis {
  name: string;
  riskLevel: "safe" | "moderate" | "warning";
  riskScore: number;
  description: string;
  category: "safe" | "warning";
  eNumber?: string;
  source?: string;
  fdaApproved?: boolean;
  euApproved?: boolean;
  allergens?: string[];
}

export interface NutritionInfo {
  name: string;
  riskLevel: "safe" | "moderate" | "warning";
}

export interface NutritionData {
  sugar: number; // grams
  sodium: number; // milligrams
  fat: number; // grams
  fiber: number; // grams
  protein: number; // grams
  calories?: number; // kcal
}

export interface TrafficLights {
  sugar: "red" | "amber" | "green";
  sodium: "red" | "amber" | "green";
  satFat: "red" | "amber" | "green";
  fiber: "red" | "amber" | "green";
}

export interface ScoringBreakdownDetail {
  additiveDetails: Array<{ name: string; points: number; weight: number }>;
  nutritionDetails: Array<{ category: string; points: number }>;
  bonusDetails: Array<{ name: string; points: number }>;
}

export interface ScoreBreakdown {
  baseScore: number;
  additiveDeduction: number;
  concerningIngredientsDeduction: number;
  nutritionDeduction: number;
  novaDeduction: number;
  healthBonuses: number;
  appliedFloor?: number;
  finalScore: number;
  details: ScoringBreakdownDetail;
}

export interface AdditiveAnalysis {
  detectedAdditives: Array<{
    name: string;
    englishName: string;
    eNumber?: string;
    riskLevel: "high" | "medium" | "low";
    deductionPoints: number;
    description: string;
    category: string;
  }>;
  totalDeduction: number;
  originalScore: number;
  adjustedScore: number;
}

export interface FoodAnalysisResult {
  id: string;
  imageUri: string;
  timestamp: Date;
  productName?: string; // 產品品名
  productType?: "child" | "traditional" | "general" | "beverage" | "snack" | "dairy" | "cereal" | "processed_meat";
  healthScore: number;
  riskLevel: "low" | "medium" | "high";
  summary: string;
  recommendation: string;
  ingredients: {
    safe: IngredientAnalysis[];
    warning: IngredientAnalysis[];
  };
  nutritionBenefits: NutritionInfo[];
  nutritionData?: NutritionData;
  trafficLights?: TrafficLights;
  novaClass?: 1 | 2 | 3 | 4;
  scoreBreakdown?: ScoreBreakdown;
  additiveAnalysis?: AdditiveAnalysis;
  isFavorite?: boolean;
  isPurchased?: boolean;
}

export interface ScanState {
  isAnalyzing: boolean;
  currentResult: FoodAnalysisResult | null;
  scanHistory: FoodAnalysisResult[];
  favorites: string[];
  addScanResult: (result: FoodAnalysisResult) => Promise<void>;
  saveCurrentResult: () => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setCurrentResult: (result: FoodAnalysisResult | null) => void;
  toggleFavorite: (id: string) => void;
  confirmPurchase: (id: string) => Promise<void>;
  deleteScan: (id: string) => Promise<void>;
  deleteMultipleScans: (ids: string[]) => Promise<void>;
  clearAllHistory: () => Promise<void>;
}
