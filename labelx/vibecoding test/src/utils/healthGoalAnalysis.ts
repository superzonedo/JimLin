import { HealthGoal } from "../types/user";
import { NutritionData } from "../types/food";
import { useUserStore } from "../state/userStore";
import { SupportedLanguage } from "../i18n/translations";

export interface HealthGoalAlert {
  goal: string;
  goalName: string;
  status: "good" | "warning" | "danger";
  message: string;
  value?: number;
  threshold?: number;
  unit?: string;
}

interface HealthGoalConfig {
  name: Record<SupportedLanguage, string>;
  check: (nutrition: NutritionData, language: SupportedLanguage) => HealthGoalAlert;
}

const HEALTH_GOAL_CONFIG: Record<string, HealthGoalConfig> = {
  "low-sodium": {
    name: {
      "zh-TW": "低鈉飲食",
      "zh-CN": "低钠饮食",
      "en": "Low Sodium Diet"
    },
    check: (nutrition: NutritionData, language: SupportedLanguage): HealthGoalAlert => {
      const sodium = nutrition.sodium;
      const goalName = HEALTH_GOAL_CONFIG["low-sodium"].name[language];

      if (sodium > 1200) {
        const messages = {
          "zh-TW": `此產品含有 ${sodium}mg 鈉,屬於高鹽產品 ⚠️ 建議避免`,
          "zh-CN": `此产品含有 ${sodium}mg 钠,属于高盐产品 ⚠️ 建议避免`,
          "en": `This product contains ${sodium}mg sodium, a high-salt product ⚠️ Recommend avoiding`
        };
        return {
          goal: "low-sodium",
          goalName,
          status: "danger",
          message: messages[language],
          value: sodium,
          threshold: 600,
          unit: "mg",
        };
      } else if (sodium > 600) {
        const messages = {
          "zh-TW": `此產品含有 ${sodium}mg 鈉,接近高鹽標準 ⚠️ 適量攝取`,
          "zh-CN": `此产品含有 ${sodium}mg 钠,接近高盐标准 ⚠️ 适量摄取`,
          "en": `This product contains ${sodium}mg sodium, approaching high-salt standard ⚠️ Use in moderation`
        };
        return {
          goal: "low-sodium",
          goalName,
          status: "warning",
          message: messages[language],
          value: sodium,
          threshold: 600,
          unit: "mg",
        };
      } else {
        const messages = {
          "zh-TW": `此產品含有 ${sodium}mg 鈉,符合低鈉標準 ✓`,
          "zh-CN": `此产品含有 ${sodium}mg 钠,符合低钠标准 ✓`,
          "en": `This product contains ${sodium}mg sodium, meets low-sodium standard ✓`
        };
        return {
          goal: "low-sodium",
          goalName,
          status: "good",
          message: messages[language],
          value: sodium,
          threshold: 600,
          unit: "mg",
        };
      }
    },
  },
  "low-sugar": {
    name: {
      "zh-TW": "低糖飲食",
      "zh-CN": "低糖饮食",
      "en": "Low Sugar Diet"
    },
    check: (nutrition: NutritionData, language: SupportedLanguage): HealthGoalAlert => {
      const sugar = nutrition.sugar;
      const goalName = HEALTH_GOAL_CONFIG["low-sugar"].name[language];

      if (sugar > 20) {
        const messages = {
          "zh-TW": `此產品含有 ${sugar}g 糖,屬於高糖產品 ⚠️ 建議避免`,
          "zh-CN": `此产品含有 ${sugar}g 糖,属于高糖产品 ⚠️ 建议避免`,
          "en": `This product contains ${sugar}g sugar, a high-sugar product ⚠️ Recommend avoiding`
        };
        return {
          goal: "low-sugar",
          goalName,
          status: "danger",
          message: messages[language],
          value: sugar,
          threshold: 10,
          unit: "g",
        };
      } else if (sugar > 10) {
        const messages = {
          "zh-TW": `此產品含有 ${sugar}g 糖,糖分偏高 ⚠️ 適量攝取`,
          "zh-CN": `此产品含有 ${sugar}g 糖,糖分偏高 ⚠️ 适量摄取`,
          "en": `This product contains ${sugar}g sugar, sugar is relatively high ⚠️ Use in moderation`
        };
        return {
          goal: "low-sugar",
          goalName,
          status: "warning",
          message: messages[language],
          value: sugar,
          threshold: 10,
          unit: "g",
        };
      } else {
        const messages = {
          "zh-TW": `此產品含有 ${sugar}g 糖,符合低糖標準 ✓`,
          "zh-CN": `此产品含有 ${sugar}g 糖,符合低糖标准 ✓`,
          "en": `This product contains ${sugar}g sugar, meets low-sugar standard ✓`
        };
        return {
          goal: "low-sugar",
          goalName,
          status: "good",
          message: messages[language],
          value: sugar,
          threshold: 10,
          unit: "g",
        };
      }
    },
  },
  "high-fiber": {
    name: {
      "zh-TW": "高纖飲食",
      "zh-CN": "高纤饮食",
      "en": "High Fiber Diet"
    },
    check: (nutrition: NutritionData, language: SupportedLanguage): HealthGoalAlert => {
      const fiber = nutrition.fiber;
      const goalName = HEALTH_GOAL_CONFIG["high-fiber"].name[language];

      if (fiber >= 5) {
        const messages = {
          "zh-TW": `此產品含有 ${fiber}g 膳食纖維,符合高纖標準 ✓`,
          "zh-CN": `此产品含有 ${fiber}g 膳食纤维,符合高纤标准 ✓`,
          "en": `This product contains ${fiber}g dietary fiber, meets high-fiber standard ✓`
        };
        return {
          goal: "high-fiber",
          goalName,
          status: "good",
          message: messages[language],
          value: fiber,
          threshold: 5,
          unit: "g",
        };
      } else if (fiber >= 3) {
        const messages = {
          "zh-TW": `此產品含有 ${fiber}g 膳食纖維,纖維含量中等`,
          "zh-CN": `此产品含有 ${fiber}g 膳食纤维,纤维含量中等`,
          "en": `This product contains ${fiber}g dietary fiber, moderate fiber content`
        };
        return {
          goal: "high-fiber",
          goalName,
          status: "warning",
          message: messages[language],
          value: fiber,
          threshold: 5,
          unit: "g",
        };
      } else {
        const messages = {
          "zh-TW": `此產品含有 ${fiber}g 膳食纖維,纖維含量偏低 ⚠️`,
          "zh-CN": `此产品含有 ${fiber}g 膳食纤维,纤维含量偏低 ⚠️`,
          "en": `This product contains ${fiber}g dietary fiber, fiber content is low ⚠️`
        };
        return {
          goal: "high-fiber",
          goalName,
          status: "danger",
          message: messages[language],
          value: fiber,
          threshold: 5,
          unit: "g",
        };
      }
    },
  },
  "low-fat": {
    name: {
      "zh-TW": "低脂飲食",
      "zh-CN": "低脂饮食",
      "en": "Low Fat Diet"
    },
    check: (nutrition: NutritionData, language: SupportedLanguage): HealthGoalAlert => {
      const fat = nutrition.fat;
      const goalName = HEALTH_GOAL_CONFIG["low-fat"].name[language];

      if (fat > 20) {
        const messages = {
          "zh-TW": `此產品含有 ${fat}g 脂肪,屬於高脂產品 ⚠️ 建議避免`,
          "zh-CN": `此产品含有 ${fat}g 脂肪,属于高脂产品 ⚠️ 建议避免`,
          "en": `This product contains ${fat}g fat, a high-fat product ⚠️ Recommend avoiding`
        };
        return {
          goal: "low-fat",
          goalName,
          status: "danger",
          message: messages[language],
          value: fat,
          threshold: 10,
          unit: "g",
        };
      } else if (fat > 10) {
        const messages = {
          "zh-TW": `此產品含有 ${fat}g 脂肪,脂肪含量偏高 ⚠️`,
          "zh-CN": `此产品含有 ${fat}g 脂肪,脂肪含量偏高 ⚠️`,
          "en": `This product contains ${fat}g fat, fat content is relatively high ⚠️`
        };
        return {
          goal: "low-fat",
          goalName,
          status: "warning",
          message: messages[language],
          value: fat,
          threshold: 10,
          unit: "g",
        };
      } else {
        const messages = {
          "zh-TW": `此產品含有 ${fat}g 脂肪,符合低脂標準 ✓`,
          "zh-CN": `此产品含有 ${fat}g 脂肪,符合低脂标准 ✓`,
          "en": `This product contains ${fat}g fat, meets low-fat standard ✓`
        };
        return {
          goal: "low-fat",
          goalName,
          status: "good",
          message: messages[language],
          value: fat,
          threshold: 10,
          unit: "g",
        };
      }
    },
  },
  "high-protein": {
    name: {
      "zh-TW": "高蛋白飲食",
      "zh-CN": "高蛋白饮食",
      "en": "High Protein Diet"
    },
    check: (nutrition: NutritionData, language: SupportedLanguage): HealthGoalAlert => {
      const protein = nutrition.protein;
      const goalName = HEALTH_GOAL_CONFIG["high-protein"].name[language];

      if (protein >= 15) {
        const messages = {
          "zh-TW": `此產品含有 ${protein}g 蛋白質,符合高蛋白標準 ✓`,
          "zh-CN": `此产品含有 ${protein}g 蛋白质,符合高蛋白标准 ✓`,
          "en": `This product contains ${protein}g protein, meets high-protein standard ✓`
        };
        return {
          goal: "high-protein",
          goalName,
          status: "good",
          message: messages[language],
          value: protein,
          threshold: 15,
          unit: "g",
        };
      } else if (protein >= 10) {
        const messages = {
          "zh-TW": `此產品含有 ${protein}g 蛋白質,蛋白質含量中等`,
          "zh-CN": `此产品含有 ${protein}g 蛋白质,蛋白质含量中等`,
          "en": `This product contains ${protein}g protein, moderate protein content`
        };
        return {
          goal: "high-protein",
          goalName,
          status: "warning",
          message: messages[language],
          value: protein,
          threshold: 15,
          unit: "g",
        };
      } else {
        const messages = {
          "zh-TW": `此產品含有 ${protein}g 蛋白質,蛋白質含量偏低 ⚠️`,
          "zh-CN": `此产品含有 ${protein}g 蛋白质,蛋白质含量偏低 ⚠️`,
          "en": `This product contains ${protein}g protein, protein content is low ⚠️`
        };
        return {
          goal: "high-protein",
          goalName,
          status: "danger",
          message: messages[language],
          value: protein,
          threshold: 15,
          unit: "g",
        };
      }
    },
  },
  "weight-control": {
    name: {
      "zh-TW": "體重控制",
      "zh-CN": "体重控制",
      "en": "Weight Control"
    },
    check: (nutrition: NutritionData, language: SupportedLanguage): HealthGoalAlert => {
      const calories = nutrition.calories || 0;
      const fat = nutrition.fat;
      const sugar = nutrition.sugar;
      const goalName = HEALTH_GOAL_CONFIG["weight-control"].name[language];

      // Comprehensive assessment: calories, fat, sugar
      const isHighCalorie = calories > 250;
      const isHighFat = fat > 15;
      const isHighSugar = sugar > 15;

      const issues: string[] = [];

      if (language === "en") {
        if (isHighCalorie) issues.push(`${calories}kcal calories`);
        if (isHighFat) issues.push(`${fat}g fat`);
        if (isHighSugar) issues.push(`${sugar}g sugar`);
      } else if (language === "zh-CN") {
        if (isHighCalorie) issues.push(`${calories}千卡热量`);
        if (isHighFat) issues.push(`${fat}g脂肪`);
        if (isHighSugar) issues.push(`${sugar}g糖`);
      } else {
        if (isHighCalorie) issues.push(`${calories}千卡熱量`);
        if (isHighFat) issues.push(`${fat}g脂肪`);
        if (isHighSugar) issues.push(`${sugar}g糖`);
      }

      if (issues.length >= 2) {
        const messages = {
          "zh-TW": `此產品不適合體重控制: ${issues.join("、")} 過高 ⚠️`,
          "zh-CN": `此产品不适合体重控制: ${issues.join("、")} 过高 ⚠️`,
          "en": `This product is not suitable for weight control: ${issues.join(", ")} too high ⚠️`
        };
        return {
          goal: "weight-control",
          goalName,
          status: "danger",
          message: messages[language],
          value: calories,
          unit: "kcal",
        };
      } else if (issues.length === 1) {
        const messages = {
          "zh-TW": `此產品 ${issues[0]} 偏高,體重控制時需注意份量 ⚠️`,
          "zh-CN": `此产品 ${issues[0]} 偏高,体重控制时需注意份量 ⚠️`,
          "en": `This product ${issues[0]} is high, watch portion size for weight control ⚠️`
        };
        return {
          goal: "weight-control",
          goalName,
          status: "warning",
          message: messages[language],
          value: calories,
          unit: "kcal",
        };
      } else {
        const messages = {
          "zh-TW": "此產品熱量、脂肪和糖分適中,適合體重控制 ✓",
          "zh-CN": "此产品热量、脂肪和糖分适中,适合体重控制 ✓",
          "en": "This product has moderate calories, fat, and sugar, suitable for weight control ✓"
        };
        return {
          goal: "weight-control",
          goalName,
          status: "good",
          message: messages[language],
          value: calories,
          unit: "kcal",
        };
      }
    },
  },
  "gut-health": {
    name: {
      "zh-TW": "腸道健康",
      "zh-CN": "肠道健康",
      "en": "Gut Health"
    },
    check: (nutrition: NutritionData, language: SupportedLanguage): HealthGoalAlert => {
      const fiber = nutrition.fiber;
      const goalName = HEALTH_GOAL_CONFIG["gut-health"].name[language];

      // Ideal case: high fiber and no harmful preservatives (needs ingredient check)
      if (fiber >= 5) {
        const messages = {
          "zh-TW": `此產品含有 ${fiber}g 膳食纖維,有助於腸道健康 ✓`,
          "zh-CN": `此产品含有 ${fiber}g 膳食纤维,有助于肠道健康 ✓`,
          "en": `This product contains ${fiber}g dietary fiber, promotes gut health ✓`
        };
        return {
          goal: "gut-health",
          goalName,
          status: "good",
          message: messages[language],
          value: fiber,
          threshold: 5,
          unit: "g",
        };
      } else if (fiber >= 3) {
        const messages = {
          "zh-TW": `此產品含有 ${fiber}g 膳食纖維,纖維含量中等`,
          "zh-CN": `此产品含有 ${fiber}g 膳食纤维,纤维含量中等`,
          "en": `This product contains ${fiber}g dietary fiber, moderate fiber content`
        };
        return {
          goal: "gut-health",
          goalName,
          status: "warning",
          message: messages[language],
          value: fiber,
          threshold: 5,
          unit: "g",
        };
      } else {
        const messages = {
          "zh-TW": `此產品膳食纖維較低 (${fiber}g),對腸道健康幫助有限 ⚠️`,
          "zh-CN": `此产品膳食纤维较低 (${fiber}g),对肠道健康帮助有限 ⚠️`,
          "en": `This product has low dietary fiber (${fiber}g), not beneficial for gut health ⚠️`
        };
        return {
          goal: "gut-health",
          goalName,
          status: "danger",
          message: messages[language],
          value: fiber,
          threshold: 5,
          unit: "g",
        };
      }
    },
  },
};

/**
 * Analyze nutrition data based on user's health goals
 * @param nutritionData Nutrition data
 * @param healthGoals User's health goals
 * @returns List of health goal alerts
 */
export function analyzeHealthGoals(
  nutritionData: NutritionData | undefined,
  healthGoals: HealthGoal[]
): HealthGoalAlert[] {
  if (!nutritionData || !healthGoals || healthGoals.length === 0) {
    return [];
  }

  const language = useUserStore.getState().preferences.language || "zh-TW";
  const alerts: HealthGoalAlert[] = [];

  healthGoals.forEach((goal) => {
    const config = HEALTH_GOAL_CONFIG[goal];
    if (config) {
      const alert = config.check(nutritionData, language);
      alerts.push(alert);
    }
  });

  return alerts;
}

/**
 * Get health goal severity level
 */
export function getHealthGoalSeverity(alerts: HealthGoalAlert[]): "safe" | "caution" | "warning" | "danger" {
  if (alerts.length === 0) return "safe";

  const hasDanger = alerts.some((a) => a.status === "danger");
  const hasWarning = alerts.some((a) => a.status === "warning");

  if (hasDanger) return "danger";
  if (hasWarning) return "warning";
  return "safe";
}
