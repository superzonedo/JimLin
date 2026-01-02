/**
 * 添加物檢測邏輯
 * 檢測掃描結果中的食品添加物並計算扣分
 */

import { IngredientAnalysis } from "../types/food";
import { AdditiveInfo, findAdditiveByName } from "./additiveDatabase";

export interface DetectedAdditive {
  originalIngredient: IngredientAnalysis;
  matchedAdditive: AdditiveInfo;
  detectionConfidence: "high" | "medium" | "low";
}

export interface AdditiveDeductionResult {
  totalDeduction: number;
  breakdown: Array<{
    name: string;
    englishName: string;
    eNumber?: string;
    riskLevel: "high" | "medium" | "low";
    points: number;
    description: string;
    category: string;
  }>;
}

/**
 * 檢測成分中的添加物
 * @param ingredients 所有成分（安全 + 警告）
 * @returns 檢測到的添加物列表
 */
export function detectAdditives(ingredients: IngredientAnalysis[]): DetectedAdditive[] {
  const detectedAdditives: DetectedAdditive[] = [];
  
  for (const ingredient of ingredients) {
    const matchedAdditive = findAdditiveByName(ingredient.name);
    
    if (matchedAdditive) {
      // 根據匹配情況評估信心度
      const confidence = evaluateConfidence(ingredient.name, matchedAdditive);
      
      detectedAdditives.push({
        originalIngredient: ingredient,
        matchedAdditive,
        detectionConfidence: confidence,
      });
    }
  }
  
  return detectedAdditives;
}

/**
 * 評估檢測信心度
 * 基於名稱匹配的精確度
 */
function evaluateConfidence(
  ingredientName: string,
  additive: AdditiveInfo
): "high" | "medium" | "low" {
  const lowerName = ingredientName.toLowerCase();
  
  // 完全匹配添加物的中文名或英文名 → 高信心度
  if (
    lowerName === additive.name.toLowerCase() ||
    lowerName === additive.englishName.toLowerCase() ||
    (additive.eNumber && lowerName.includes(additive.eNumber.toLowerCase()))
  ) {
    return "high";
  }
  
  // 包含主要關鍵字 → 中等信心度
  const primaryKeywords = additive.keywords.slice(0, 3); // 取前3個關鍵字
  for (const keyword of primaryKeywords) {
    if (lowerName.includes(keyword.toLowerCase())) {
      return "medium";
    }
  }
  
  // 其他匹配 → 低信心度
  return "low";
}

/**
 * 計算添加物扣分
 * @param detectedAdditives 檢測到的添加物
 * @returns 扣分結果（總扣分 + 明細）
 */
export function calculateAdditiveDeduction(
  detectedAdditives: DetectedAdditive[]
): AdditiveDeductionResult {
  const breakdown: AdditiveDeductionResult["breakdown"] = [];
  let totalDeduction = 0;
  
  // 用於去重：同一種添加物只計算一次
  const processedAdditives = new Set<string>();
  
  for (const detected of detectedAdditives) {
    const additive = detected.matchedAdditive;
    const additiveKey = additive.name.toLowerCase();
    
    // 避免重複計算
    if (processedAdditives.has(additiveKey)) {
      continue;
    }
    
    processedAdditives.add(additiveKey);
    
    // 累加扣分
    totalDeduction += additive.deductionPoints;
    
    // 記錄明細
    breakdown.push({
      name: additive.name,
      englishName: additive.englishName,
      eNumber: additive.eNumber,
      riskLevel: additive.riskLevel,
      points: additive.deductionPoints,
      description: additive.description,
      category: additive.category,
    });
  }
  
  // 按風險等級和扣分排序（高風險優先、扣分多的優先）
  breakdown.sort((a, b) => {
    const riskOrder = { high: 0, medium: 1, low: 2 };
    if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    }
    return b.points - a.points;
  });
  
  // 最高扣分上限為 100 分（用戶需求：真的很不健康可以扣到 0 分）
  totalDeduction = Math.min(totalDeduction, 100);
  
  return {
    totalDeduction,
    breakdown,
  };
}

/**
 * 獲取添加物統計資訊
 * 用於顯示摘要資訊
 */
export function getAdditiveStats(detectedAdditives: DetectedAdditive[]): {
  totalCount: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
} {
  const processedAdditives = new Set<string>();
  let highRiskCount = 0;
  let mediumRiskCount = 0;
  let lowRiskCount = 0;
  
  for (const detected of detectedAdditives) {
    const additive = detected.matchedAdditive;
    const additiveKey = additive.name.toLowerCase();
    
    if (processedAdditives.has(additiveKey)) {
      continue;
    }
    
    processedAdditives.add(additiveKey);
    
    switch (additive.riskLevel) {
      case "high":
        highRiskCount++;
        break;
      case "medium":
        mediumRiskCount++;
        break;
      case "low":
        lowRiskCount++;
        break;
    }
  }
  
  return {
    totalCount: processedAdditives.size,
    highRiskCount,
    mediumRiskCount,
    lowRiskCount,
  };
}

/**
 * 生成添加物風險摘要文字
 */
export function generateAdditiveSummary(detectedAdditives: DetectedAdditive[]): string {
  const stats = getAdditiveStats(detectedAdditives);
  
  if (stats.totalCount === 0) {
    return "未檢測到有害添加物";
  }
  
  const parts: string[] = [];
  
  if (stats.highRiskCount > 0) {
    parts.push(`${stats.highRiskCount} 種高風險添加物`);
  }
  
  if (stats.mediumRiskCount > 0) {
    parts.push(`${stats.mediumRiskCount} 種中風險添加物`);
  }
  
  if (stats.lowRiskCount > 0) {
    parts.push(`${stats.lowRiskCount} 種低風險添加物`);
  }
  
  return `檢測到 ${parts.join("、")}`;
}
