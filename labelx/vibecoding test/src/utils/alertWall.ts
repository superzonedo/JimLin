import { FoodAnalysisResult, IngredientAnalysis } from "../types/food";
import { subDays, isAfter } from "date-fns";

export interface HighRiskIngredient {
  name: string;
  eNumber?: string;
  count: number;
  riskScore: number;
}

export function calculateHighRiskIngredients(
  scanHistory: FoodAnalysisResult[],
  days: number = 7
): HighRiskIngredient[] {
  const cutoffDate = subDays(new Date(), days);
  
  // Filter scans from last N days
  const recentScans = scanHistory.filter((scan) => 
    isAfter(new Date(scan.timestamp), cutoffDate)
  );

  // Extract all warning-level ingredients
  const ingredientMap = new Map<string, HighRiskIngredient>();

  recentScans.forEach((scan) => {
    if (scan.ingredients.warning) {
      scan.ingredients.warning.forEach((ingredient: IngredientAnalysis) => {
        const key = ingredient.eNumber || ingredient.name;
        
        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key)!;
          existing.count += 1;
          existing.riskScore = Math.max(existing.riskScore, ingredient.riskScore);
        } else {
          ingredientMap.set(key, {
            name: ingredient.name,
            eNumber: ingredient.eNumber,
            count: 1,
            riskScore: ingredient.riskScore,
          });
        }
      });
    }
  });

  // Convert to array and sort
  const ingredients = Array.from(ingredientMap.values());
  
  // Sort by count (descending), then by riskScore (descending)
  ingredients.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return b.riskScore - a.riskScore;
  });

  // Return top 5
  return ingredients.slice(0, 5);
}
