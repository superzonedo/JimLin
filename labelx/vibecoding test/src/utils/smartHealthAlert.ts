import { FoodAnalysisResult } from "../types/food";
import { UserPreferences } from "../types/user";
import { getIngredientsToAvoid, checkIngredientMatch } from "./diseaseMapping";
import { analyzeHealthGoals, HealthGoalAlert, getHealthGoalSeverity } from "./healthGoalAnalysis";
import { useUserStore } from "../state/userStore";
import { SupportedLanguage } from "../i18n/translations";

export interface DiseaseAlert {
  ingredientName: string;
  disease: string;
  reason: string;
  riskScore: number;
}

export interface AllergenAlert {
  ingredientName: string;
  allergen: string;
  isCustom: boolean;
  riskScore: number;
}

export interface SmartHealthAlert {
  hasAlerts: boolean;
  diseaseAlerts: DiseaseAlert[];
  allergenAlerts: AllergenAlert[];
  healthGoalAlerts: HealthGoalAlert[];
  severity: "safe" | "caution" | "warning" | "danger";
  overallMessage: string;
}

/**
 * Detect health alerts in scan results
 * @param scanResult Scan result
 * @param userPreferences User preferences
 * @returns Smart health alerts
 */
export function detectHealthAlerts(
  scanResult: FoodAnalysisResult,
  userPreferences: UserPreferences
): SmartHealthAlert {
  // Get current language from user store
  const language = useUserStore.getState().preferences.language || "zh-TW";

  const diseaseAlerts: DiseaseAlert[] = [];
  const allergenAlerts: AllergenAlert[] = [];

  // 1. Check disease-related ingredients
  if (userPreferences.diseases && userPreferences.diseases.length > 0) {
    const avoidIngredients = getIngredientsToAvoid(userPreferences.diseases);

    // Check all ingredients (safe + warning)
    const allIngredients = [
      ...scanResult.ingredients.safe,
      ...scanResult.ingredients.warning,
    ];

    allIngredients.forEach((ingredient) => {
      const match = checkIngredientMatch(ingredient.name, avoidIngredients);
      if (match) {
        diseaseAlerts.push({
          ingredientName: ingredient.name,
          disease: match.disease,
          reason: match.reason,
          riskScore: ingredient.riskScore,
        });
      }
    });
  }

  // 1.5 Check custom disease-related ingredients
  if (userPreferences.customDiseases && userPreferences.customDiseases.length > 0) {
    const allIngredients = [
      ...scanResult.ingredients.safe,
      ...scanResult.ingredients.warning,
    ];

    allIngredients.forEach((ingredient) => {
      const lowerName = ingredient.name.toLowerCase();

      userPreferences.customDiseases.forEach((customDisease) => {
        // Simple keyword matching
        if (lowerName.includes(customDisease.toLowerCase())) {
          diseaseAlerts.push({
            ingredientName: ingredient.name,
            disease: customDisease,
            reason: `May be related to ${customDisease}`,
            riskScore: ingredient.riskScore,
          });
        }
      });
    });
  }

  // 2. Check allergens
  if ((userPreferences.allergens && userPreferences.allergens.length > 0) || (userPreferences.customAllergens && userPreferences.customAllergens.length > 0)) {
    const allIngredients = [
      ...scanResult.ingredients.safe,
      ...scanResult.ingredients.warning,
    ];

    allIngredients.forEach((ingredient) => {
      const lowerName = ingredient.name.toLowerCase();

      // Check standard allergens
      if (userPreferences.allergens) {
        userPreferences.allergens.forEach((allergen) => {
          const allergenKeywords = getAllergenKeywords(allergen);
          if (allergenKeywords.some((keyword) => lowerName.includes(keyword))) {
            allergenAlerts.push({
              ingredientName: ingredient.name,
              allergen: getAllergenDisplayName(allergen, language),
              isCustom: false,
              riskScore: ingredient.riskScore,
            });
          }
        });
      }

      // Check custom allergens
      if (userPreferences.customAllergens) {
        userPreferences.customAllergens.forEach((customAllergen) => {
          if (lowerName.includes(customAllergen.toLowerCase())) {
            allergenAlerts.push({
              ingredientName: ingredient.name,
              allergen: customAllergen,
              isCustom: true,
              riskScore: ingredient.riskScore,
            });
          }
        });
      }
    });
  }

  // 3. Analyze health goals
  const healthGoalAlerts = analyzeHealthGoals(
    scanResult.nutritionData,
    userPreferences.healthGoals
  );

  // 4. Calculate overall severity
  const severity = calculateOverallSeverity(diseaseAlerts, allergenAlerts, healthGoalAlerts);

  // 5. Generate overall message
  const overallMessage = generateOverallMessage(diseaseAlerts, allergenAlerts, healthGoalAlerts, language);

  return {
    hasAlerts: diseaseAlerts.length > 0 || allergenAlerts.length > 0 || healthGoalAlerts.some(a => a.status !== "good"),
    diseaseAlerts,
    allergenAlerts,
    healthGoalAlerts,
    severity,
    overallMessage,
  };
}

/**
 * Get allergen keyword list
 */
function getAllergenKeywords(allergen: string): string[] {
  const keywordMap: Record<string, string[]> = {
    "peanuts": ["peanut", "groundnut", "花生"],
    "nuts": ["nut", "almond", "杏仁", "cashew", "腰果", "walnut", "核桃", "堅果"],
    "dairy": ["milk", "dairy", "cream", "cheese", "奶", "乳清", "whey", "牛奶", "乳"],
    "eggs": ["egg", "卵", "蛋"],
    "seafood": ["seafood", "fish", "魚", "shrimp", "蝦", "crab", "蟹", "shellfish", "貝", "海鮮"],
    "soy": ["soy", "黃豆", "豆", "大豆"],
    "wheat": ["wheat", "flour", "麵粉", "gluten", "麵筋", "小麥"],
    "sesame": ["sesame", "芝麻"],
    "sulfites": ["sulfite", "二氧化硫", "sulfur dioxide", "亞硫酸"],
    "preservatives": ["preservative", "苯甲酸", "benzoate", "山梨酸", "sorbate", "防腐劑"],
    "artificial-colors": ["artificial color", "色素", "tartrazine", "黃色", "紅色", "人工色素"],
    "artificial-flavors": ["artificial flavor", "香精", "人工香料"],
    "msg": ["msg", "麩酸鈉", "monosodium glutamate", "glutamate", "味精"],
    "gluten": ["gluten", "麵筋", "麩質"],
  };

  return keywordMap[allergen] || [allergen];
}

/**
 * Get allergen display name based on language
 */
function getAllergenDisplayName(allergen: string, language: SupportedLanguage = "zh-TW"): string {
  const nameMap: Record<string, Record<SupportedLanguage, string>> = {
    "peanuts": {
      "zh-TW": "花生",
      "zh-CN": "花生",
      "en": "Peanuts"
    },
    "nuts": {
      "zh-TW": "堅果",
      "zh-CN": "坚果",
      "en": "Tree Nuts"
    },
    "dairy": {
      "zh-TW": "牛奶",
      "zh-CN": "牛奶",
      "en": "Dairy"
    },
    "eggs": {
      "zh-TW": "蛋類",
      "zh-CN": "蛋类",
      "en": "Eggs"
    },
    "seafood": {
      "zh-TW": "海鮮",
      "zh-CN": "海鲜",
      "en": "Seafood"
    },
    "soy": {
      "zh-TW": "大豆",
      "zh-CN": "大豆",
      "en": "Soy"
    },
    "wheat": {
      "zh-TW": "小麥",
      "zh-CN": "小麦",
      "en": "Wheat"
    },
    "sesame": {
      "zh-TW": "芝麻",
      "zh-CN": "芝麻",
      "en": "Sesame"
    },
    "sulfites": {
      "zh-TW": "亞硫酸鹽",
      "zh-CN": "亚硫酸盐",
      "en": "Sulfites"
    },
    "preservatives": {
      "zh-TW": "防腐劑",
      "zh-CN": "防腐剂",
      "en": "Preservatives"
    },
    "artificial-colors": {
      "zh-TW": "人工色素",
      "zh-CN": "人工色素",
      "en": "Artificial Colors"
    },
    "artificial-flavors": {
      "zh-TW": "人工香料",
      "zh-CN": "人工香料",
      "en": "Artificial Flavors"
    },
    "msg": {
      "zh-TW": "味精",
      "zh-CN": "味精",
      "en": "MSG"
    },
    "gluten": {
      "zh-TW": "麩質",
      "zh-CN": "麸质",
      "en": "Gluten"
    },
  };

  return nameMap[allergen]?.[language] || allergen;
}

/**
 * Calculate overall severity
 */
function calculateOverallSeverity(
  diseaseAlerts: DiseaseAlert[],
  allergenAlerts: AllergenAlert[],
  healthGoalAlerts: HealthGoalAlert[]
): "safe" | "caution" | "warning" | "danger" {
  // Allergen alert = danger
  if (allergenAlerts.length > 0) {
    return "danger";
  }

  // Disease alert = warning or danger (based on quantity)
  if (diseaseAlerts.length >= 3) {
    return "danger";
  } else if (diseaseAlerts.length >= 1) {
    return "warning";
  }

  // Health goal alert
  const goalSeverity = getHealthGoalSeverity(healthGoalAlerts);
  if (goalSeverity === "danger") return "warning"; // Lower one level
  if (goalSeverity === "warning") return "caution";

  return "safe";
}

/**
 * Generate overall message based on language
 */
function generateOverallMessage(
  diseaseAlerts: DiseaseAlert[],
  allergenAlerts: AllergenAlert[],
  healthGoalAlerts: HealthGoalAlert[],
  language: SupportedLanguage = "zh-TW"
): string {
  const messages: string[] = [];

  if (allergenAlerts.length > 0) {
    const msg = language === "en"
      ? `⚠️ Detected ${allergenAlerts.length} allergen(s)`
      : language === "zh-CN"
      ? `⚠️ 检测到 ${allergenAlerts.length} 种过敏原`
      : `⚠️ 檢測到 ${allergenAlerts.length} 種過敏原`;
    messages.push(msg);
  }

  if (diseaseAlerts.length > 0) {
    const msg = language === "en"
      ? `⚠️ Found ${diseaseAlerts.length} disease-related risk ingredient(s)`
      : language === "zh-CN"
      ? `⚠️ 发现 ${diseaseAlerts.length} 项疾病相关风险成分`
      : `⚠️ 發現 ${diseaseAlerts.length} 項疾病相關風險成分`;
    messages.push(msg);
  }

  const dangerGoals = healthGoalAlerts.filter((a) => a.status === "danger").length;
  const warningGoals = healthGoalAlerts.filter((a) => a.status === "warning").length;

  if (dangerGoals > 0) {
    const msg = language === "en"
      ? `❌ ${dangerGoals} health goal(s) not met`
      : language === "zh-CN"
      ? `❌ ${dangerGoals} 项健康目标不符合`
      : `❌ ${dangerGoals} 項健康目標不符合`;
    messages.push(msg);
  } else if (warningGoals > 0) {
    const msg = language === "en"
      ? `⚠️ ${warningGoals} health goal(s) need attention`
      : language === "zh-CN"
      ? `⚠️ ${warningGoals} 项健康目标需要注意`
      : `⚠️ ${warningGoals} 項健康目標需要注意`;
    messages.push(msg);
  }

  if (messages.length === 0) {
    return language === "en"
      ? "✅ No health concerns detected"
      : language === "zh-CN"
      ? "✅ 未檢測到健康問題"
      : "✅ 未檢測到健康問題";
  }

  return messages.join(" • ");
}

/**
 * Detect health alerts in scan results
 */
