import { DiseaseType } from "../types/user";
import { useUserStore } from "../state/userStore";
import { SupportedLanguage } from "../i18n/translations";

export interface DiseaseMapping {
  chineseName: string;
  avoidIngredients: string[];
  riskDescription: Record<SupportedLanguage, string>;
}

export const DISEASE_INGREDIENT_MAP: Record<DiseaseType, DiseaseMapping> = {
  "kidney-disease": {
    chineseName: "Kidney Disease",
    avoidIngredients: [
      "磷酸", "phosphate", "磷", "高鈉", "sodium", "鈉", "鉀", "potassium",
      "蛋白質", "protein", "加工肉", "processed meat"
    ],
    riskDescription: {
      "zh-TW": "腎臟病患者應避免高磷、高鈉、高鉀食品,減少腎臟負擔",
      "zh-CN": "肾脏病患者应避免高磷、高钠、高钾食品,减少肾脏负担",
      "en": "Kidney disease patients should avoid high phosphorus, high sodium, and high potassium foods to reduce kidney burden"
    },
  },
  "liver-disease": {
    chineseName: "Liver Disease",
    avoidIngredients: [
      "人工色素", "artificial color", "色素", "防腐劑", "preservative",
      "酒精", "alcohol", "苯甲酸", "benzoate", "山梨酸", "sorbate",
      "亞硝酸", "nitrite", "硝酸", "nitrate"
    ],
    riskDescription: {
      "zh-TW": "肝臟病患者應避免人工添加劑和防腐劑,減少肝臟代謝負擔",
      "zh-CN": "肝脏病患者应避免人工添加剂和防腐剂,减少肝脏代谢负担",
      "en": "Liver disease patients should avoid artificial additives and preservatives to reduce liver metabolism burden"
    },
  },
  "skin-disease": {
    chineseName: "Skin Disease",
    avoidIngredients: [
      "人工色素", "artificial color", "tartrazine", "黃色4號", "黃色5號",
      "紅色", "red dye", "人工香料", "artificial flavor", "防腐劑", "preservative",
      "苯甲酸", "benzoate", "對羥基苯甲酸", "paraben"
    ],
    riskDescription: {
      "zh-TW": "人工色素和香料可能引發或加重皮膚過敏和發炎反應",
      "zh-CN": "人工色素和香料可能引发或加重皮肤过敏和发炎反应",
      "en": "Artificial colors and flavors may trigger or worsen skin allergies and inflammatory reactions"
    },
  },
  "diabetes": {
    chineseName: "Diabetes",
    avoidIngredients: [
      "糖", "sugar", "葡萄糖", "glucose", "果糖", "fructose",
      "高果糖玉米糖漿", "corn syrup", "蔗糖", "sucrose", "麥芽糖", "maltose",
      "蜂蜜", "honey", "糖漿", "syrup", "甜味劑", "sweetener", "阿斯巴甜", "aspartame"
    ],
    riskDescription: {
      "zh-TW": "糖尿病患者應控制糖分攝取,避免血糖快速上升",
      "zh-CN": "糖尿病患者应控制糖分摄取,避免血糖快速上升",
      "en": "Diabetics should control sugar intake to avoid rapid blood sugar spikes"
    },
  },
  "hypertension": {
    chineseName: "Hypertension",
    avoidIngredients: [
      "鈉", "sodium", "鹽", "salt", "氯化鈉", "sodium chloride",
      "味精", "msg", "麩酸鈉", "monosodium glutamate", "醬油", "soy sauce",
      "小蘇打", "baking soda", "碳酸氫鈉", "sodium bicarbonate"
    ],
    riskDescription: {
      "zh-TW": "高血壓患者必須嚴格控制鈉攝取,防止血壓升高",
      "zh-CN": "高血压患者必须严格控制钠摄取,防止血压升高",
      "en": "Hypertension patients must strictly control sodium intake to prevent blood pressure elevation"
    },
  },
  "high-cholesterol": {
    chineseName: "High Cholesterol",
    avoidIngredients: [
      "飽和脂肪", "saturated fat", "反式脂肪", "trans fat",
      "棕櫚油", "palm oil", "椰子油", "coconut oil", "氫化", "hydrogenated",
      "部分氫化", "partially hydrogenated", "豬油", "lard", "牛油", "butter"
    ],
    riskDescription: {
      "zh-TW": "高膽固醇患者應避免飽和脂肪和反式脂肪,保護心血管健康",
      "zh-CN": "高胆固醇患者应避免饱和脂肪和反式脂肪,保护心血管健康",
      "en": "High cholesterol patients should avoid saturated and trans fats to protect cardiovascular health"
    },
  },
  "stomach-sensitivity": {
    chineseName: "Stomach Sensitivity",
    avoidIngredients: [
      "辣椒", "chili", "辛辣", "spicy", "咖啡因", "caffeine",
      "酸味劑", "acidulant", "檸檬酸", "citric acid", "乳酸", "lactic acid",
      "碳酸", "carbonated", "人工甜味劑", "artificial sweetener", "山梨醇", "sorbitol"
    ],
    riskDescription: {
      "zh-TW": "腸胃敏感患者應避免刺激性添加劑和人工甜味劑",
      "zh-CN": "肠胃敏感患者应避免刺激性添加剂和人工甜味剂",
      "en": "Sensitive stomach patients should avoid irritating additives and artificial sweeteners"
    },
  },
  "metabolic-disease": {
    chineseName: "Metabolic Disease",
    avoidIngredients: [
      "高糖", "high sugar", "精製碳水化合物", "refined carbs", "白麵粉", "white flour",
      "玉米糖漿", "corn syrup", "人工甜味劑", "artificial sweetener",
      "反式脂肪", "trans fat", "氫化油", "hydrogenated oil"
    ],
    riskDescription: {
      "zh-TW": "代謝疾病患者應避免高糖和精製食品,維持代謝平衡",
      "zh-CN": "代谢疾病患者应避免高糖和精制食品,维持代谢平衡",
      "en": "Metabolic disease patients should avoid high sugar and refined foods to maintain metabolic balance"
    },
  },
};

/**
 * Get all ingredients to avoid based on user's diseases
 * @param diseases User's selected disease list
 * @returns Map<ingredient keyword, {disease name, reason}>
 */
export function getIngredientsToAvoid(
  diseases: DiseaseType[]
): Map<string, { disease: string; reason: string }> {
  const language = useUserStore.getState().preferences.language || "zh-TW";
  const ingredientsMap = new Map<string, { disease: string; reason: string }>();

  diseases.forEach((disease) => {
    const mapping = DISEASE_INGREDIENT_MAP[disease];
    // Skip if mapping doesn't exist (e.g., custom diseases or unknown disease types)
    if (!mapping) return;

    mapping.avoidIngredients.forEach((ingredient) => {
      // If already exists, keep the first disease's explanation
      if (!ingredientsMap.has(ingredient.toLowerCase())) {
        ingredientsMap.set(ingredient.toLowerCase(), {
          disease: mapping.chineseName,
          reason: mapping.riskDescription[language],
        });
      }
    });
  });

  return ingredientsMap;
}

/**
 * Check if ingredient contains keywords to avoid
 * @param ingredientName Ingredient name
 * @param avoidList List of ingredient keywords to avoid
 * @returns Matched keyword or null if no match
 */
export function checkIngredientMatch(
  ingredientName: string,
  avoidList: Map<string, { disease: string; reason: string }>
): { keyword: string; disease: string; reason: string } | null {
  const lowerName = ingredientName.toLowerCase();

  for (const [keyword, info] of avoidList.entries()) {
    if (lowerName.includes(keyword)) {
      return { keyword, ...info };
    }
  }

  return null;
}
