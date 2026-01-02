import { FoodAnalysisResult } from "@/types/food";
import { subDays, isAfter } from "date-fns";

export interface HighRiskIngredient {
  id: string;
  name: string;
  riskLevel: 'high' | 'medium' | 'low';
  count: number;
  lastDetected: string; // ISO Date
  description?: string;
  category?: string;
  riskScore?: number;
  eNumber?: string;
}

/**
 * 從掃描歷史中計算高風險成分
 * 只計算已納入分析的記錄（isPurchased === true）
 * @param scanHistory 掃描歷史記錄
 * @param days 計算最近多少天的記錄，默認30天
 */
export function calculateHighRiskIngredients(
  scanHistory: FoodAnalysisResult[],
  days: number = 30
): HighRiskIngredient[] {
  const cutoffDate = subDays(new Date(), days);
  
  // 只篩選已納入分析的記錄
  const purchasedScans = scanHistory.filter((scan) => 
    scan.isPurchased === true && 
    isAfter(new Date(scan.timestamp), cutoffDate)
  );

  // 使用 Map 來聚合相同成分
  const ingredientMap = new Map<string, HighRiskIngredient>();

  purchasedScans.forEach((scan) => {
    const backendData = (scan as any)?.backendData;
    const scanDate = scan.timestamp;

    // 從 backendData 中提取添加劑（High 和 Medium 風險）
    if (backendData?.additives) {
      backendData.additives.forEach((additive: any) => {
        if (additive.riskLevel === 'High' || additive.riskLevel === 'Medium') {
          const key = additive.eNumber || additive.name;
          const riskLevel = additive.riskLevel === 'High' ? 'high' : 'medium';
          
          if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key)!;
            existing.count += 1;
            // 更新風險分數為較高的值
            if (additive.riskScore && (!existing.riskScore || additive.riskScore > existing.riskScore)) {
              existing.riskScore = additive.riskScore;
            }
            // 更新最後檢測日期為較新的
            if (new Date(scanDate) > new Date(existing.lastDetected)) {
              existing.lastDetected = scanDate;
            }
          } else {
            ingredientMap.set(key, {
              id: key,
              name: additive.name,
              riskLevel: riskLevel,
              count: 1,
              lastDetected: scanDate,
              description: additive.description || additive.potentialHarm,
              category: additive.category,
              riskScore: additive.riskScore || (riskLevel === 'high' ? 75 : 55),
              eNumber: additive.eNumber,
            });
          }
        }
      });
    }

    // 從 backendData 中提取需關注成分
    if (backendData?.concerningIngredients) {
      backendData.concerningIngredients.forEach((ingredient: any) => {
        const key = ingredient.name;
        const riskLevel = ingredient.riskLevel === 'High' ? 'high' : 
                         ingredient.riskLevel === 'Medium' ? 'medium' : 'low';
        
        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key)!;
          existing.count += 1;
          // 更新風險分數為較高的值
          if (ingredient.riskScore && (!existing.riskScore || ingredient.riskScore > existing.riskScore)) {
            existing.riskScore = ingredient.riskScore;
          }
          // 更新最後檢測日期為較新的
          if (new Date(scanDate) > new Date(existing.lastDetected)) {
            existing.lastDetected = scanDate;
          }
        } else {
          ingredientMap.set(key, {
            id: key,
            name: ingredient.name,
            riskLevel: riskLevel,
            count: 1,
            lastDetected: scanDate,
            description: ingredient.description || ingredient.concerns,
            category: ingredient.category,
            riskScore: ingredient.riskScore || (riskLevel === 'high' ? 75 : riskLevel === 'medium' ? 55 : 30),
          });
        }
      });
    }
  });

  // 轉換為陣列並排序
  const ingredients = Array.from(ingredientMap.values());
  
  // 按出現次數（降序）和風險分數（降序）排序
  ingredients.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    const aScore = a.riskScore || (a.riskLevel === 'high' ? 75 : a.riskLevel === 'medium' ? 55 : 30);
    const bScore = b.riskScore || (b.riskLevel === 'high' ? 75 : b.riskLevel === 'medium' ? 55 : 30);
    return bScore - aScore;
  });

  return ingredients;
}