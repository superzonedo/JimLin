export interface Ingredient {
  name: string;
  description?: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'safe' | 'moderate' | 'warning';
}

export interface FoodAnalysisResult {
  id: string;
  timestamp: string;
  imageUri: string;
  healthScore: number;
  summary: string;
  recommendation: string;
  productName?: string; // 產品名稱
  riskLevel?: 'low' | 'medium' | 'high';
  ingredients: {
    safe: Ingredient[];
    warning: Ingredient[];
  };
  nutritionBenefits?: Array<{ name: string }>;
  isPurchased?: boolean;
}