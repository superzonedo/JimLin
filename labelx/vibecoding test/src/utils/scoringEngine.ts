/**
 * 營養標籤掃雷 - RELAXED V3 健康評分系統
 *
 * 最終分數 = clamp(基礎分數(100) - 添加劑扣分 - 關注成分扣分 - 營養扣分 - NOVA扣分 + 健康加分, 0, 100)
 */

import { NutritionData, TrafficLights } from "../types/food";

export interface AdditiveInfo {
  name: string;
  riskLevel: "High" | "Medium" | "Low";
  carcinogenicity?: "Group 1" | "2A" | "2B" | "None" | "Unknown";
  positionWeight: number;
  contextUse?: "traditional" | "industrial" | "unknown";
}

export interface IngredientInfo {
  name: string;
  riskLevel: "High" | "Medium" | "Low";
  positionWeight: number;
}

export interface ScoringInput {
  productType: "child" | "traditional" | "general" | "beverage" | "snack" | "dairy" | "cereal" | "processed_meat";
  additives: AdditiveInfo[];
  concerningIngredients: IngredientInfo[];
  nutrition: NutritionData;
  novaClass: 1 | 2 | 3 | 4;
  trafficLights: TrafficLights;
  ingredients?: string[]; // for detecting whole grains, healthy oils, etc.
  dataQuality: "high" | "medium" | "low";
}

export interface ScoringBreakdown {
  baseScore: number;
  additiveDeduction: number;
  concerningIngredientsDeduction: number;
  nutritionDeduction: number;
  novaDeduction: number;
  healthBonuses: number;
  appliedFloor?: number;
  finalScore: number;
  details: {
    additiveDetails: Array<{ name: string; points: number; weight: number }>;
    nutritionDetails: Array<{ category: string; points: number }>;
    bonusDetails: Array<{ name: string; points: number }>;
  };
}

// ============= CONFIGURATION =============

const DEDUCTION_CAPS = {
  additives: 40,
  concerningIngredients: 30,
  nutrition: 24,
  nova: 10,
};

const BONUS_CAPS = {
  high: 28, // 高品質資料
  low: 14,  // 低品質資料
};

const ADDITIVE_WEIGHTS = {
  carcinogen: -40,
  high: -20,
  medium: -10,
  low: -4,
};

const ADDITIVE_CHILD_EXTRA = {
  carcinogen: -20,
  high: -15,
};

const CONCERNING_WEIGHTS = {
  high: -25,
  medium: -12,
  low: -2,
};

const CONCERNING_CHILD_EXTRA = {
  high: -15,
  medium: -8,
};

const TRAFFIC_LIGHT_SCORES = {
  red: -6,
  amber: -3,
  green: 0,
  tripleRedExtra: -6,
  transFatPenalty: -10,
  transFatChildExtra: -5,
};

const NOVA_SCORES = {
  n4: -8,
  n3: -4,
  n2: 0,
  n1: 0,
  childN4Extra: -2,
};

const BONUSES = {
  wholeGrain: 6,                    // 全穀≥50%
  fiberHigh: 5,                      // 纖維≥6g/100g
  proteinHigh: 3,                    // 蛋白≥10g/100g
  threeGreens: 4,                    // 糖/鈉/飽和脂肪皆綠
  noAddedSugar: 3,                   // 無添加糖或無甜味劑
  minimalIngredients: 3,              // 成分≤5
  healthyOilsMain: 4,                // EVOO/高油酸葵花/菜籽主要油脂
  omega3Source: 6,                   // 魚油/藻油/亞麻籽/奇亞籽或DHA/EPA強化
  mufaDominant: 2,                   // MUFA / (SFA + Trans) ≥ 2
  naturalAntioxidants: 1,            // E306/E392等天然抗氧化
  micronutrientFortifyMax: 3,        // 維生素/礦物質強化（1~3分）
  probiotics: 3,                     // 益生菌
  probioticsLowSugarExtra: 1,        // 活菌+低糖額外+1
  sugarHighFortifyCap: 1,            // 糖紅燈時維強化最多+1
};

const FLOORS = {
  noAdditives: 82,                   // 無添加劑保底82分
  fewLowAdditives: 65,               // 少量低/中風險添加劑保底65分
  exceptionLowerFloor: 60,           // 三紅或含氫化油時保底60分
};

// ============= HELPER FUNCTIONS =============

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function isChild(productType: string): boolean {
  return productType === "child";
}

function isTraditional(productType: string): boolean {
  return productType === "traditional";
}

function hasHydrogenatedOil(additives: AdditiveInfo[]): boolean {
  const keywords = ["氫化", "部分氫化", "hydrogenated", "partially hydrogenated"];
  return additives.some(a =>
    keywords.some(kw => a.name.toLowerCase().includes(kw.toLowerCase()))
  );
}

function hasTransFat(nutrition: NutritionData): boolean {
  // NutritionData 沒有 transFatG 欄位，需要從成分檢測
  return false; // 由於欄位不存在，預設返回 false
}

function isAllThreeRedLights(lights: TrafficLights): boolean {
  return lights.sugar === "red" && lights.sodium === "red" && lights.satFat === "red";
}

// ============= SCORING FUNCTIONS =============

export function calculateAdditiveDeduction(
  additives: AdditiveInfo[],
  productType: string,
  details: ScoringBreakdown["details"]["additiveDetails"]
): number {
  let totalDeduction = 0;
  const isChildProduct = isChild(productType);
  const isTraditionalProduct = isTraditional(productType);

  for (const additive of additives) {
    let points = 0;

    // 決定扣分基數
    if (additive.carcinogenicity && additive.carcinogenicity.startsWith("Group")) {
      points = ADDITIVE_WEIGHTS.carcinogen;
      // 致癌物：兒童產品額外扣分
      if (isChildProduct) {
        points -= ADDITIVE_CHILD_EXTRA.carcinogen;
      }
    } else if (additive.riskLevel === "High") {
      points = ADDITIVE_WEIGHTS.high;
      // 高風險：兒童產品額外扣分
      if (isChildProduct) {
        points -= ADDITIVE_CHILD_EXTRA.high;
      }
    } else if (additive.riskLevel === "Medium") {
      points = ADDITIVE_WEIGHTS.medium;
      // 傳統食品豁免：中等風險降為低風險（致癌物除外）
      if (isTraditionalProduct && !additive.carcinogenicity) {
        points = ADDITIVE_WEIGHTS.low;
      }
    } else {
      points = ADDITIVE_WEIGHTS.low;
    }

    // 應用位置權重
    const weightedPoints = points * additive.positionWeight;
    totalDeduction += weightedPoints;

    details.push({
      name: additive.name,
      points: Math.round(weightedPoints * 10) / 10,
      weight: additive.positionWeight,
    });
  }

  // 應用扣分上限
  return Math.min(Math.abs(totalDeduction), DEDUCTION_CAPS.additives);
}

export function calculateConcerningIngredientsDeduction(
  concerningIngredients: IngredientInfo[],
  productType: string,
  details: ScoringBreakdown["details"]["additiveDetails"]
): number {
  let totalDeduction = 0;
  const isChildProduct = isChild(productType);
  const isTraditionalProduct = isTraditional(productType);

  for (const ingredient of concerningIngredients) {
    let points = 0;

    if (ingredient.riskLevel === "High") {
      points = CONCERNING_WEIGHTS.high;
      if (isChildProduct) {
        points -= CONCERNING_CHILD_EXTRA.high;
      }
    } else if (ingredient.riskLevel === "Medium") {
      points = CONCERNING_WEIGHTS.medium;
      // 傳統食品中等風險→0
      if (isTraditionalProduct) {
        points = 0;
      } else if (isChildProduct) {
        points -= CONCERNING_CHILD_EXTRA.medium;
      }
    } else {
      points = CONCERNING_WEIGHTS.low;
    }

    const weightedPoints = points * ingredient.positionWeight;
    totalDeduction += weightedPoints;

    details.push({
      name: ingredient.name,
      points: Math.round(weightedPoints * 10) / 10,
      weight: ingredient.positionWeight,
    });
  }

  return Math.min(Math.abs(totalDeduction), DEDUCTION_CAPS.concerningIngredients);
}

export function calculateNutritionDeduction(
  trafficLights: TrafficLights,
  nutrition: NutritionData,
  productType: string,
  details: ScoringBreakdown["details"]["nutritionDetails"]
): number {
  let totalDeduction = 0;
  const isChildProduct = isChild(productType);

  // 個別營養指標
  const scores: Record<string, number> = {
    sugar: TRAFFIC_LIGHT_SCORES[trafficLights.sugar],
    sodium: TRAFFIC_LIGHT_SCORES[trafficLights.sodium],
    satFat: TRAFFIC_LIGHT_SCORES[trafficLights.satFat],
  };

  for (const [key, points] of Object.entries(scores)) {
    totalDeduction += Math.abs(points);
    if (points !== 0) {
      details.push({
        category: key,
        points,
      });
    }
  }

  // 三紅燈額外扣分
  if (isAllThreeRedLights(trafficLights)) {
    const extraPenalty = TRAFFIC_LIGHT_SCORES.tripleRedExtra;
    totalDeduction += Math.abs(extraPenalty);
    details.push({
      category: "三紅燈額外扣分",
      points: extraPenalty,
    });
  }

  // 氫化油特殊處理
  if (hasHydrogenatedOil([]) || hasTransFat(nutrition)) { // 需要實際檢測
    let transFatPenalty = TRAFFIC_LIGHT_SCORES.transFatPenalty;
    if (isChildProduct) {
      transFatPenalty -= TRAFFIC_LIGHT_SCORES.transFatChildExtra;
    }
    totalDeduction += Math.abs(transFatPenalty);
    details.push({
      category: "反式脂肪/氫化油",
      points: transFatPenalty,
    });
  }

  return Math.min(totalDeduction, DEDUCTION_CAPS.nutrition);
}

export function calculateNovaDeduction(
  novaClass: 1 | 2 | 3 | 4,
  productType: string,
  details: ScoringBreakdown["details"]["nutritionDetails"]
): number {
  let totalDeduction = 0;
  const isChildProduct = isChild(productType);

  let points = 0;
  switch (novaClass) {
    case 4:
      points = NOVA_SCORES.n4;
      if (isChildProduct) {
        points -= NOVA_SCORES.childN4Extra;
      }
      break;
    case 3:
      points = NOVA_SCORES.n3;
      break;
    case 2:
    case 1:
      points = 0;
      break;
  }

  totalDeduction = Math.abs(points);
  if (points !== 0) {
    details.push({
      category: `NOVA ${novaClass}`,
      points,
    });
  }

  return Math.min(totalDeduction, DEDUCTION_CAPS.nova);
}

export function calculateHealthBonuses(
  input: ScoringInput,
  details: ScoringBreakdown["details"]["bonusDetails"]
): number {
  let totalBonus = 0;
  const capMultiplier = input.dataQuality === "high" ? 1 : 0.5;
  const maxBonus = BONUS_CAPS.high * capMultiplier;

  // 檢測全穀
  if (input.ingredients?.some(i => i.includes("全穀") || i.includes("whole grain"))) {
    if (input.ingredients?.filter(i => i.includes("全穀")).length! >= Math.ceil(input.ingredients?.length! * 0.5)) {
      totalBonus += BONUSES.wholeGrain;
      details.push({ name: "全穀≥50%", points: BONUSES.wholeGrain });
    }
  }

  // 高纖維
  if (input.nutrition.fiber && input.nutrition.fiber >= 6) {
    totalBonus += BONUSES.fiberHigh;
    details.push({ name: "高纖維(≥6g/100g)", points: BONUSES.fiberHigh });
  }

  // 高蛋白
  if (input.nutrition.protein && input.nutrition.protein >= 10) {
    totalBonus += BONUSES.proteinHigh;
    details.push({ name: "高蛋白(≥10g/100g)", points: BONUSES.proteinHigh });
  }

  // 三綠燈
  if (
    input.trafficLights.sugar === "green" &&
    input.trafficLights.sodium === "green" &&
    input.trafficLights.satFat === "green"
  ) {
    totalBonus += BONUSES.threeGreens;
    details.push({ name: "三綠燈(糖/鈉/飽和脂肪)", points: BONUSES.threeGreens });
  }

  // 無添加糖
  if (!input.additives.some(a => a.name.includes("甜味劑") || a.name.includes("sweetener"))) {
    if (!input.ingredients?.some(i => i.includes("糖"))) {
      totalBonus += BONUSES.noAddedSugar;
      details.push({ name: "無添加糖或無甜味劑", points: BONUSES.noAddedSugar });
    }
  }

  // 最少成分
  if (input.ingredients && input.ingredients.length <= 5) {
    totalBonus += BONUSES.minimalIngredients;
    details.push({ name: "成分≤5", points: BONUSES.minimalIngredients });
  }

  // 益生菌
  if (input.ingredients?.some(i => i.includes("益生菌") || i.includes("probiotics") || i.includes("乳酸菌"))) {
    totalBonus += BONUSES.probiotics;
    details.push({ name: "益生菌", points: BONUSES.probiotics });

    // 益生菌+低糖
    if (input.nutrition.sugar && input.nutrition.sugar <= 5) {
      totalBonus += BONUSES.probioticsLowSugarExtra;
      details.push({ name: "益生菌+低糖額外", points: BONUSES.probioticsLowSugarExtra });
    }
  }

  // 防洗分機制：糖紅燈時維生素強化最多+1分
  let micronutrientBonus = BONUSES.micronutrientFortifyMax;
  if (input.trafficLights.sugar === "red") {
    micronutrientBonus = BONUSES.sugarHighFortifyCap;
  }

  if (input.ingredients?.some(i => i.includes("維生素") || i.includes("礦物質") || i.includes("vitamin"))) {
    totalBonus += micronutrientBonus;
    details.push({ name: "維生素/礦物質強化", points: micronutrientBonus });
  }

  // 應用上限
  return Math.min(totalBonus, maxBonus);
}

export function determineFloor(input: ScoringInput, deductions: any): number {
  const hasAdditives = input.additives.length > 0;
  const hasHydOil = hasHydrogenatedOil(input.additives);
  const hasTripleRed = isAllThreeRedLights(input.trafficLights);

  // 例外情況：三紅或含氫化油，保底降至60分
  if (hasTripleRed || hasHydOil) {
    return FLOORS.exceptionLowerFloor;
  }

  // 無添加劑：保底82分
  if (!hasAdditives) {
    return FLOORS.noAdditives;
  }

  // 少量低/中風險添加劑（≤2且位置≤0.8）保底65分
  const lowRiskAdditives = input.additives.filter(
    a => a.riskLevel === "Low" || a.riskLevel === "Medium"
  );
  if (
    lowRiskAdditives.length <= 2 &&
    lowRiskAdditives.every(a => a.positionWeight <= 0.8)
  ) {
    return FLOORS.fewLowAdditives;
  }

  return 0; // 無保底
}

export function calculateHealthScore(input: ScoringInput): ScoringBreakdown {
  const breakdown: ScoringBreakdown = {
    baseScore: 100,
    additiveDeduction: 0,
    concerningIngredientsDeduction: 0,
    nutritionDeduction: 0,
    novaDeduction: 0,
    healthBonuses: 0,
    finalScore: 0,
    details: {
      additiveDetails: [],
      nutritionDetails: [],
      bonusDetails: [],
    },
  };

  // 計算各項扣分
  breakdown.additiveDeduction = calculateAdditiveDeduction(
    input.additives,
    input.productType,
    breakdown.details.additiveDetails
  );

  breakdown.concerningIngredientsDeduction = calculateConcerningIngredientsDeduction(
    input.concerningIngredients,
    input.productType,
    breakdown.details.additiveDetails
  );

  breakdown.nutritionDeduction = calculateNutritionDeduction(
    input.trafficLights,
    input.nutrition,
    input.productType,
    breakdown.details.nutritionDetails
  );

  breakdown.novaDeduction = calculateNovaDeduction(
    input.novaClass,
    input.productType,
    breakdown.details.nutritionDetails
  );

  // 計算健康加分
  breakdown.healthBonuses = calculateHealthBonuses(input, breakdown.details.bonusDetails);

  // 計算原始分數
  let rawScore =
    breakdown.baseScore -
    breakdown.additiveDeduction -
    breakdown.concerningIngredientsDeduction -
    breakdown.nutritionDeduction -
    breakdown.novaDeduction +
    breakdown.healthBonuses;

  // 應用保底規則
  const floor = determineFloor(input, breakdown);
  if (floor > 0) {
    breakdown.appliedFloor = floor;
    rawScore = Math.max(rawScore, floor);
  }

  // 最終分數在 0-100 之間
  breakdown.finalScore = clamp(rawScore, 0, 100);

  return breakdown;
}

// ============= EXPORT UTILITY FUNCTIONS =============

export function getScoringExplanation(score: number): {
  level: string;
  description: string;
  emoji: string;
} {
  if (score >= 80) {
    return {
      level: "優秀",
      description: "這是一款健康且安全的產品，可以放心食用",
      emoji: "🟢",
    };
  } else if (score >= 60) {
    return {
      level: "良好",
      description: "總體來說是不錯的選擇，但可考慮更健康的替代品",
      emoji: "🟡",
    };
  } else if (score >= 40) {
    return {
      level: "一般",
      description: "這個產品含有一些需要關注的成分，建議適量食用",
      emoji: "🟠",
    };
  } else {
    return {
      level: "需改善",
      description: "這個產品含有多種風險成分，建議避免或限制食用",
      emoji: "🔴",
    };
  }
}
