/**
 * 評分系統整合層
 * 將 AI 分析結果轉換為評分引擎的輸入格式
 */

import { NutritionData, TrafficLights, FoodAnalysisResult } from "../types/food";
import { AdditiveInfo, IngredientInfo, ScoringInput, calculateHealthScore } from "./scoringEngine";
import { IngredientAnalysis } from "../types/food";

/**
 * 根據營養數據計算紅綠燈評級
 */
export function calculateTrafficLights(nutrition: NutritionData | undefined): TrafficLights {
  if (!nutrition) {
    return {
      sugar: "amber",
      sodium: "amber",
      satFat: "amber",
      fiber: "amber",
    };
  }

  // 糖評級 (固體 vs 飲料)
  const sugarLight =
    !nutrition.sugar
      ? "amber"
      : nutrition.sugar <= 5
        ? "green"
        : nutrition.sugar <= 22.5
          ? "amber"
          : "red";

  // 鈉評級
  const sodiumLight =
    !nutrition.sodium
      ? "amber"
      : nutrition.sodium <= 120
        ? "green"
        : nutrition.sodium <= 600
          ? "amber"
          : "red";

  // 飽和脂肪評級 (使用 fat 欄位)
  const satFatLight =
    !nutrition.fat
      ? "amber"
      : nutrition.fat <= 1.5
        ? "green"
        : nutrition.fat <= 5
          ? "amber"
          : "red";

  // 纖維評級
  const fiberLight =
    !nutrition.fiber
      ? "amber"
      : nutrition.fiber >= 6
        ? "green"
        : nutrition.fiber >= 3
          ? "amber"
          : "red";

  return {
    sugar: sugarLight,
    sodium: sodiumLight,
    satFat: satFatLight,
    fiber: fiberLight,
  };
}

/**
 * 檢測產品類型 (根據成分和營養數據)
 */
export function detectProductType(
  productName: string | undefined,
  ingredients: IngredientAnalysis[],
  nutrition: NutritionData | undefined
): "child" | "traditional" | "general" | "beverage" | "snack" | "dairy" | "cereal" | "processed_meat" {
  const name = (productName || "").toLowerCase();
  const ingredientNames = ingredients.map(i => i.name.toLowerCase()).join(" ");

  // 兒童產品
  if (
    name.includes("兒童") ||
    name.includes("幼兒") ||
    name.includes("嬰兒") ||
    name.includes("baby") ||
    name.includes("kids")
  ) {
    return "child";
  }

  // 傳統食品
  if (
    name.includes("醬") ||
    name.includes("味噌") ||
    name.includes("起司") ||
    name.includes("豆豉") ||
    ingredientNames.includes("醬") ||
    ingredientNames.includes("味噌")
  ) {
    return "traditional";
  }

  // 飲料
  if (
    name.includes("飲料") ||
    name.includes("果汁") ||
    name.includes("茶") ||
    name.includes("咖啡") ||
    name.includes("可樂") ||
    name.includes("milk") ||
    name.includes("juice") ||
    name.includes("drink")
  ) {
    return "beverage";
  }

  // 乳製品
  if (
    name.includes("乳") ||
    name.includes("酸奶") ||
    name.includes("優格") ||
    name.includes("起司") ||
    name.includes("cheese") ||
    name.includes("yogurt")
  ) {
    return "dairy";
  }

  // 穀物/麥片
  if (
    name.includes("麥片") ||
    name.includes("穀物") ||
    name.includes("cereal") ||
    name.includes("granola")
  ) {
    return "cereal";
  }

  // 加工肉
  if (
    name.includes("火腿") ||
    name.includes("培根") ||
    name.includes("香腸") ||
    name.includes("肉") ||
    ingredientNames.includes("亞硝酸")
  ) {
    return "processed_meat";
  }

  // 零食
  if (
    name.includes("餅") ||
    name.includes("糖") ||
    name.includes("巧克力") ||
    name.includes("薯片") ||
    name.includes("snack") ||
    name.includes("chip")
  ) {
    return "snack";
  }

  return "general";
}

/**
 * 偵測 NOVA 加工程度
 */
export function detectNovaClass(
  ingredients: IngredientAnalysis[],
  ingredientCount: number,
  nutrition: NutritionData | undefined
): 1 | 2 | 3 | 4 {
  const ingredientNames = ingredients.map(i => i.name.toLowerCase()).join(" ");

  // NOVA 1：未加工或最少加工
  const unprocessedKeywords = [
    "水果",
    "蔬菜",
    "穀物",
    "豆類",
    "堅果",
    "肉類",
    "魚",
    "牛奶",
    "蛋",
  ];
  const isUnprocessed = unprocessedKeywords.some(kw => ingredientNames.includes(kw));
  if (isUnprocessed && ingredientCount <= 3) {
    return 1;
  }

  // NOVA 2：烹飪配料（油、鹽、糖、醋等）
  const cookingKeywords = [
    "油",
    "鹽",
    "糖",
    "醋",
    "蜂蜜",
    "香料",
    "herb",
    "spice",
    "oil",
    "salt",
  ];
  const isCookingIngredient = ingredients.length <= 5 && cookingKeywords.some(kw => ingredientNames.includes(kw));
  if (isCookingIngredient) {
    return 2;
  }

  // NOVA 3：加工食品
  const processedKeywords = [
    "罐頭",
    "冷凍",
    "乾燥",
    "殺菌",
    "鹽漬",
    "canned",
    "frozen",
    "dried",
    "pasteurized",
  ];
  const isProcessed = processedKeywords.some(kw => ingredientNames.includes(kw));
  if (isProcessed) {
    return 3;
  }

  // NOVA 4：超加工食品
  const ultraProcessedKeywords = [
    "添加劑",
    "人工",
    "色素",
    "香精",
    "防腐劑",
    "甜味劑",
    "乳化劑",
    "增稠劑",
    "emulsifier",
    "thickener",
    "artificial",
    "additive",
  ];
  const isUltraProcessed = ultraProcessedKeywords.some(kw => ingredientNames.includes(kw));
  if (isUltraProcessed || ingredientCount > 10) {
    return 4;
  }

  // 預設為加工食品
  return 3;
}

/**
 * 從成分檢測特定特性
 */
export function detectIngredientFeatures(ingredients: IngredientAnalysis[]): {
  hasWholeGrain: boolean;
  hasHealthyOils: boolean;
  hasOmega3: boolean;
  hasHighFiber: boolean;
  hasProbiotics: boolean;
  hasMicronutrients: boolean;
  hasAntioxidants: boolean;
  ingredientList: string[];
} {
  const ingredientNames = ingredients.map(i => i.name.toLowerCase());
  const fullText = ingredientNames.join(" ");

  return {
    hasWholeGrain: /全穀|whole\s*grain|brown\s*rice|oat/i.test(fullText),
    hasHealthyOils: /橄欖油|葵花油|菜籽油|olive|sunflower|canola/i.test(fullText),
    hasOmega3: /魚油|藻油|亞麻|奇亞|dha|epa|fish\s*oil|flax/i.test(fullText),
    hasHighFiber: /纖維|膳食纖維|insoluble\s*fiber/i.test(fullText),
    hasProbiotics: /益生菌|乳酸菌|lactobacillus|bifidobacterium/i.test(fullText),
    hasMicronutrients: /維生素|礦物質|維他命|vitamin|mineral/i.test(fullText),
    hasAntioxidants: /抗氧化|花青素|茶多酚|antioxidant|polyphenol/i.test(fullText),
    ingredientList: ingredientNames,
  };
}

/**
 * 轉換成分為評分引擎的添加劑信息
 */
export function convertToAdditives(
  ingredients: IngredientAnalysis[]
): {
  additives: AdditiveInfo[];
  concerningIngredients: IngredientInfo[];
} {
  const additives: AdditiveInfo[] = [];
  const concerningIngredients: IngredientInfo[] = [];

  // 高風險添加劑關鍵字
  const highRiskKeywords = [
    "氫化",
    "反式脂肪",
    "亞硝酸",
    "色素",
    "人工香精",
    "阿斯巴甜",
    "hyperlink",
  ];

  // 致癌物關鍵字
  const carcinogenKeywords = [
    "亞硝酸鈉",
    "E250",
    "苯甲酸鈉",
    "E211",
    "阿斯巴甜",
    "E951",
  ];

  // 中等風險關鍵字
  const mediumRiskKeywords = [
    "防腐劑",
    "甜味劑",
    "香精",
    "乳化劑",
    "增稠劑",
  ];

  for (const ingredient of ingredients) {
    if (ingredient.riskLevel === "warning") {
      const name = ingredient.name.toLowerCase();

      // 檢查是否為致癌物
      const isCarcinogen = carcinogenKeywords.some(kw => name.includes(kw.toLowerCase()));

      // 檢查風險等級
      let riskLevel: "High" | "Medium" | "Low" = "Low";
      if (isCarcinogen || highRiskKeywords.some(kw => name.includes(kw.toLowerCase()))) {
        riskLevel = "High";
      } else if (mediumRiskKeywords.some(kw => name.includes(kw.toLowerCase()))) {
        riskLevel = "Medium";
      }

      // 計算位置權重 (根據風險分數)
      const positionWeight = Math.min(1.0, Math.max(0.4, ingredient.riskScore / 100));

      if (highRiskKeywords.some(kw => name.includes(kw.toLowerCase())) ||
          mediumRiskKeywords.some(kw => name.includes(kw.toLowerCase())) ||
          isCarcinogen) {
        additives.push({
          name: ingredient.name,
          riskLevel,
          carcinogenicity: isCarcinogen ? ("Group 1" as const) : undefined,
          positionWeight,
          contextUse: "industrial",
        });
      }

      // 檢查是否為關注成分
      const concerningKeywords = [
        "高果糖",
        "氫化油",
        "精製糖",
        "高鈉",
        "高糖",
        "high\s*fructose",
        "hydrogenated",
      ];

      if (concerningKeywords.some(kw => name.includes(kw.toLowerCase()))) {
        concerningIngredients.push({
          name: ingredient.name,
          riskLevel: riskLevel === "High" ? "High" : "Medium",
          positionWeight,
        });
      }
    }
  }

  return { additives, concerningIngredients };
}

/**
 * 主整合函式：將食品分析結果應用新的評分系統
 */
export function applyNewScoringSystem(analysisResult: Partial<FoodAnalysisResult>): Partial<FoodAnalysisResult> {
  const ingredients = [
    ...(analysisResult.ingredients?.safe || []),
    ...(analysisResult.ingredients?.warning || []),
  ];

  // 1. 計算紅綠燈
  const trafficLights = calculateTrafficLights(analysisResult.nutritionData);

  // 2. 檢測產品類型
  const productType = detectProductType(
    analysisResult.productName,
    ingredients,
    analysisResult.nutritionData
  );

  // 3. 檢測 NOVA 等級
  const novaClass = detectNovaClass(
    ingredients,
    ingredients.length,
    analysisResult.nutritionData
  );

  // 4. 轉換成分
  const { additives, concerningIngredients } = convertToAdditives(ingredients);

  // 5. 檢測特殊特徵
  const features = detectIngredientFeatures(ingredients);

  // 6. 準備評分輸入
  const scoringInput: ScoringInput = {
    productType,
    additives,
    concerningIngredients,
    nutrition: analysisResult.nutritionData || {
      sugar: 0,
      sodium: 0,
      fat: 0,
      fiber: 0,
      protein: 0,
    },
    novaClass,
    trafficLights,
    ingredients: features.ingredientList,
    dataQuality: "medium", // 可根據 OCR 信心度調整
  };

  // 7. 計算新分數
  const scoreBreakdown = calculateHealthScore(scoringInput);

  // 8. 返回更新後的結果
  return {
    ...analysisResult,
    productType,
    trafficLights,
    novaClass,
    scoreBreakdown,
    healthScore: scoreBreakdown.finalScore,
    riskLevel:
      scoreBreakdown.finalScore >= 80
        ? ("low" as const)
        : scoreBreakdown.finalScore >= 60
          ? ("medium" as const)
          : ("high" as const),
  };
}
