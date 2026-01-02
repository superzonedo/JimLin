import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSafeBack } from "@/utils/navigation";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { useFoodScanStore } from "@/state/foodScanStore";
import { useRouter } from "expo-router";
import { FoodAnalysisResult } from "@/types/food";

// Gemini API 配置
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent";

// 個人化健康設定介面（變數方式，類似後端）
interface UserPreferences {
  diseases: string[];       // 疾病列表
  healthGoals: string[];    // 健康目標列表
  allergens: string[];      // 過敏原列表
}

// Schema 生成函數（簡化版，用於前端）
function generateResponseSchema(language: "zh-TW" | "zh-CN" | "en" = "en") {
  const productNameDescriptions = {
    "zh-TW": "從圖片/包裝識別的完整繁體中文產品名稱（若無中文則譯名+原文）。必須使用繁體中文，不要使用簡體中文或英文。",
    "zh-CN": "从图片/包装识别的完整简体中文产品名称（若无中文则译名+原文）。必须使用简体中文，不要使用繁体中文或英文。",
    "en": "Complete product name in English identified from the image/packaging (if no English, use translation + original). MUST be in English only.",
  };

  return {
    type: "object",
    properties: {
      productName: {
        type: "string",
        description: productNameDescriptions[language] || productNameDescriptions["en"],
      },
      productEmoji: { type: "string" },
      productType: { type: "string", description: "general | child | traditional | beverage | snack | dairy | cereal | processed_meat 等，用於情境規則。" },
      markets: { type: "array", description: "標示語言推測的市場/地區（如 AU/NZ, US, EU, CN）。", items: { type: "string" } },
      summary: { type: "string" },
      healthScore: { type: "number", description: "健康分數 (1-100)，根據核心評分演算法計算" },
      scoreExplanation: {
        type: "object",
        description: "評分詳細說明，解釋為什麼得到這個分數",
        properties: {
          breakdown: {
            type: "array",
            description: "扣分明細，列出每個扣分項目",
            items: {
              type: "object",
              properties: {
                item: { type: "string", description: "扣分項目名稱" },
                points: { type: "number", description: "扣除的分數（負數）" },
                reason: { type: "string", description: "扣分原因說明" },
              },
              required: ["item", "points", "reason"],
            },
          },
          calculation: { type: "string", description: "分數計算公式，如：100 - 10(紅綠燈) - 15(添加劑) = 75" },
          mainFactors: { type: "array", description: "影響分數的主要因素（1-3個）", items: { type: "string" } },
          improvementSuggestions: { type: "array", description: "如何改進此產品健康分數的建議（2-3個）", items: { type: "string" } },
        },
        required: ["breakdown", "calculation", "mainFactors", "improvementSuggestions"],
      },
      verdictHeadline: { type: "string", description: "一句話總結，用於快速理解產品健康狀況" },
      quickTags: { type: "array", description: "快速標籤陣列，用於UI快速顯示關鍵資訊", items: { type: "string" } },
      healthProsCons: {
        type: "object",
        description: "產品優缺點分析",
        properties: {
          pros: { type: "array", description: "產品優點（1-2個）", items: { type: "string" } },
          cons: { type: "array", description: "產品缺點（1-3個）", items: { type: "string" } },
        },
        required: ["pros", "cons"],
      },
      dataQuality: { type: "string", enum: ["high", "medium", "low"] },
      missingFields: { type: "array", items: { type: "string" } },
      assumptions: { type: "array", items: { type: "string" } },
      confidence: { type: "number", description: "0-1 對整體判斷的信心。" },
      additives: {
        type: "array",
        description: "食品添加物（E 編碼或法規定義之添加物）。",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            category: { type: "string" },
            source: { type: "string", enum: ["natural", "synthetic"], description: "來源：natural=天然、synthetic=人工合成" },
            riskLevel: { type: "string", enum: ["High", "Medium", "Low"], description: "風險等級：天然來源=Low，人工合成根據危害程度判定" },
            description: { type: "string" },
            potentialHarm: { type: "string" },
            carcinogenicity: { type: "string", enum: ["Group 1", "2A", "2B", "None", "Unknown"] },
            regulatoryNote: { type: "string" },
            positionWeight: { type: "number" },
            contextUse: { type: "string", enum: ["traditional", "industrial", "unknown"] },
          },
          required: ["name", "category", "source", "riskLevel", "description", "potentialHarm", "carcinogenicity", "positionWeight"],
        },
      },
      beneficialIngredients: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            benefits: { type: "string" },
            positionWeight: { type: "number" },
          },
          required: ["name", "description", "benefits"],
        },
      },
      concerningIngredients: {
        type: "array",
        description: "非添加劑但具營養/健康疑慮者",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            riskLevel: { type: "string", enum: ["High", "Medium", "Low"] },
            description: { type: "string" },
            concerns: { type: "string" },
            positionWeight: { type: "number" },
          },
          required: ["name", "riskLevel", "description", "concerns"],
        },
      },
      allIngredients: {
        type: "array",
        description: "完整的成分列表（按標籤上的順序，從多到少）",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "成分名稱" },
            position: { type: "number", description: "在成分表中的位置（從1開始）" },
            category: { type: "string", description: "成分類別：additive（添加劑）、beneficial（有益）、concerning（需關注）、neutral（中性/一般成分）" },
            isAdditive: { type: "boolean", description: "是否為添加劑" },
            description: { type: "string", description: "成分說明（可選）" },
          },
          required: ["name", "position", "category"],
        },
      },
      nutritionPer100: {
        type: "object",
        description: "每100g/100mL 估算，缺資料則填 null。",
        properties: {
          energyKcal: { type: "number" },
          sugarG: { type: "number" },
          sodiumMg: { type: "number" },
          satFatG: { type: "number" },
          transFatG: { type: "number" },
          fiberG: { type: "number" },
          proteinG: { type: "number" },
        },
      },
      novaClass: { type: "number", description: "1~4 的 NOVA 加工程度估計（僅供參考，不影響分數）。" },
      trafficLights: {
        type: "object",
        description: "紅綠燈：'red'|'amber'|'green'",
        properties: {
          sugar: { type: "string" },
          sodium: { type: "string" },
          satFat: { type: "string" },
          fiber: { type: "string" },
        },
      },
      childSpecificWarnings: { type: "array", items: { type: "string" } },
      recommendation: { type: "string" },
      // 個人化健康分析字段（如有設定疾病時返回）
      personalizedRiskAssessment: {
        type: "object",
        description: "針對用戶健康狀況的個人化風險評估",
        properties: {
          overall: { type: "string", enum: ["safe", "caution", "warning"], description: "整體安全評估" },
          reasoning: { type: "string", description: "評估理由說明" },
        },
      },
      diseaseSpecificWarnings: {
        type: "array",
        description: "針對每種疾病的具體警告",
        items: {
          type: "object",
          properties: {
            disease: { type: "string", description: "疾病名稱" },
            riskLevel: { type: "string", enum: ["low", "moderate", "high"], description: "風險等級" },
            warning: { type: "string", description: "具體警告或建議" },
            ingredientsOfConcern: { type: "array", items: { type: "string" }, description: "需注意的成分" },
          },
          required: ["disease", "riskLevel", "warning"],
        },
      },
      personalizedRecommendation: { type: "string", description: "針對用戶的個人化建議" },
      // Prompt 改進建議（簡化版 - 針對所有食品的通用建議）
      promptImprovementSuggestions: {
        type: "object",
        description: "對評分系統的整體改進建議（簡潔版）",
        properties: {
          isScoreReasonable: {
            type: "boolean",
            description: "本次評分是否合理",
          },
          briefAssessment: {
            type: "string",
            description: "一句話評估本次評分的合理性（20字以內）",
          },
          topSuggestion: {
            type: "string",
            description: "最重要的一條改進建議，適用於所有食品類型（30字以內）",
          },
        },
        required: ["isScoreReasonable", "briefAssessment", "topSuggestion"],
      },
    },
    required: [
      "productName", "productEmoji", "summary", "healthScore", "scoreExplanation", "verdictHeadline", "quickTags", "healthProsCons",
      "additives", "beneficialIngredients", "concerningIngredients", "allIngredients",
      "dataQuality", "assumptions", "confidence",
      "nutritionPer100", "trafficLights", "novaClass", "promptImprovementSuggestions",
    ],
  };
}

// Prompt 生成函數（包含個人化健康設定 - 變數方式）
function generateAnalysisPrompt(language: "zh-TW" | "zh-CN" | "en" = "en", userPreferences: UserPreferences | null = null) {
  // 生成個人化健康設定說明
  const getPersonalizedHealthSection = () => {
    if (!userPreferences) return "";
    
    const { diseases, healthGoals, allergens } = userPreferences;
    const hasAnyPreference = diseases.length > 0 || healthGoals.length > 0 || allergens.length > 0;
    
    if (!hasAnyPreference) return "";
    
    if (language === "en") {
      return `
**【PERSONALIZED HEALTH SETTINGS - IMPORTANT】**
${diseases.length > 0 ? `User's health conditions: ${diseases.join(", ")}` : "No specific health conditions"}
${healthGoals.length > 0 ? `User's health goals: ${healthGoals.join(", ")}` : "No specific health goals"}
${allergens.length > 0 ? `User's allergens/foods to avoid: ${allergens.join(", ")}` : "No known allergens"}

**MUST include in analysis:**
1. **personalizedRiskAssessment** (object): Personalized risk assessment
   - overall: "safe" | "caution" | "warning" - Overall safety for this user
   - reasoning: Detailed explanation of why this food is safe/risky for the user's conditions, goals, and allergens
2. **diseaseSpecificWarnings** (array): Specific warnings for each disease/health goal/allergen
   - disease: Disease/goal/allergen name
   - riskLevel: "low" | "moderate" | "high"
   - warning: Specific warning or advice
   - ingredientsOfConcern: Array of ingredient names that are problematic
3. **personalizedRecommendation** (string): Personalized recommendation for this user

**Analysis requirements based on user settings:**
${diseases.length > 0 ? `
For user's health conditions (${diseases.join(", ")}), pay special attention to:
- Ingredients that may worsen these conditions
- Nutritional values that conflict with disease management
- Provide specific intake recommendations or avoidance advice
` : ""}
${healthGoals.length > 0 ? `
For user's health goals (${healthGoals.join(", ")}), analyze:
- Whether this product aligns with the goals
- Which ingredients support or conflict with the goals
- Provide alternatives if not suitable
` : ""}
${allergens.length > 0 ? `
For user's allergens (${allergens.join(", ")}), MUST:
- Check if product contains these allergens
- Mark as HIGH RISK if allergen is present
- Clearly warn about allergen presence in summary
` : ""}
`;
    } else if (language === "zh-CN") {
      return `
**【个人化健康设定 - 重要】**
${diseases.length > 0 ? `用户健康状况：${diseases.join("、")}` : "无特定健康状况"}
${healthGoals.length > 0 ? `用户健康目标：${healthGoals.join("、")}` : "无特定健康目标"}
${allergens.length > 0 ? `用户过敏原/避免食物：${allergens.join("、")}` : "无已知过敏原"}

**分析中必须包含：**
1. **personalizedRiskAssessment** (对象): 个人化风险评估
   - overall: "safe" | "caution" | "warning" - 对此用户的整体安全性
   - reasoning: 详细说明为什么此食品对用户的健康状况、目标和过敏原是安全/有风险的
2. **diseaseSpecificWarnings** (数组): 针对每种疾病/健康目标/过敏原的具体警告
   - disease: 疾病/目标/过敏原名称
   - riskLevel: "low" | "moderate" | "high"
   - warning: 具体警告或建议
   - ingredientsOfConcern: 有问题的成分名称数组
3. **personalizedRecommendation** (字符串): 针对此用户的个人化建议

**根据用户设定的分析要求：**
${diseases.length > 0 ? `
针对用户的健康状况（${diseases.join("、")}），特别注意：
- 可能加重这些状况的成分
- 与疾病管理冲突的营养数值
- 提供具体的摄入建议或避免建议
` : ""}
${healthGoals.length > 0 ? `
针对用户的健康目标（${healthGoals.join("、")}），分析：
- 此产品是否符合目标
- 哪些成分支持或冲突目标
- 如不适合，提供替代建议
` : ""}
${allergens.length > 0 ? `
针对用户的过敏原（${allergens.join("、")}），必须：
- 检查产品是否含有这些过敏原
- 如含有过敏原，标记为高风险
- 在摘要中明确警告过敏原存在
` : ""}
`;
    } else {
      return `
**【個人化健康設定 - 重要】**
${diseases.length > 0 ? `用戶健康狀況：${diseases.join("、")}` : "無特定健康狀況"}
${healthGoals.length > 0 ? `用戶健康目標：${healthGoals.join("、")}` : "無特定健康目標"}
${allergens.length > 0 ? `用戶過敏原/避免食物：${allergens.join("、")}` : "無已知過敏原"}

**分析中必須包含：**
1. **personalizedRiskAssessment** (物件): 個人化風險評估
   - overall: "safe" | "caution" | "warning" - 對此用戶的整體安全性
   - reasoning: 詳細說明為什麼此食品對用戶的健康狀況、目標和過敏原是安全/有風險的
2. **diseaseSpecificWarnings** (陣列): 針對每種疾病/健康目標/過敏原的具體警告
   - disease: 疾病/目標/過敏原名稱
   - riskLevel: "low" | "moderate" | "high"
   - warning: 具體警告或建議
   - ingredientsOfConcern: 有問題的成分名稱陣列
3. **personalizedRecommendation** (字串): 針對此用戶的個人化建議

**根據用戶設定的分析要求：**
${diseases.length > 0 ? `
針對用戶的健康狀況（${diseases.join("、")}），特別注意：
- 可能加重這些狀況的成分
- 與疾病管理衝突的營養數值
- 提供具體的攝入建議或避免建議
` : ""}
${healthGoals.length > 0 ? `
針對用戶的健康目標（${healthGoals.join("、")}），分析：
- 此產品是否符合目標
- 哪些成分支持或衝突目標
- 如不適合，提供替代建議
` : ""}
${allergens.length > 0 ? `
針對用戶的過敏原（${allergens.join("、")}），必須：
- 檢查產品是否含有這些過敏原
- 如含有過敏原，標記為高風險
- 在摘要中明確警告過敏原存在
` : ""}
`;
    }
  };
  const languageInstructions = {
    "zh-TW": `
**極其重要：你必須使用繁體中文回應。以下所有字段都必須使用繁體中文：**

1. **產品名稱**：\`productName\` 字段必須使用繁體中文，從圖片/包裝識別的完整產品名稱
2. **成分名稱**：所有 \`allIngredients\`、\`additives\`、\`concerningIngredients\`、\`beneficialIngredients\` 中的 \`name\` 字段必須使用繁體中文
3. **描述和說明**：所有 \`description\`、\`concerns\`、\`potentialHarm\`、\`benefits\` 字段必須使用繁體中文
4. **摘要**：\`summary\` 字段必須使用繁體中文
5. **建議**：\`recommendation\` 字段必須使用繁體中文

**請確保 JSON 格式中的所有文字內容都是繁體中文，不要使用簡體中文、英文或其他語言。**
`,
    "zh-CN": `
**极其重要：你必须使用简体中文回应。以下所有字段都必须使用简体中文：**

1. **产品名称**：\`productName\` 字段必须使用简体中文，从图片/包装识别的完整产品名称
2. **成分名称**：所有 \`allIngredients\`、\`additives\`、\`concerningIngredients\`、\`beneficialIngredients\` 中的 \`name\` 字段必须使用简体中文
3. **描述和说明**：所有 \`description\`、\`concerns\`、\`potentialHarm\`、\`benefits\` 字段必须使用简体中文
4. **摘要**：\`summary\` 字段必须使用简体中文
5. **建议**：\`recommendation\` 字段必须使用简体中文

**请确保 JSON 格式中的所有文字内容都是简体中文，不要使用繁体中文、英文或其他语言。**
`,
    "en": `
**CRITICAL: You MUST respond in ENGLISH ONLY. All following fields MUST be in English:**

1. **Product Name**: The \`productName\` field MUST be in English, the complete product name identified from the image/packaging
2. **Ingredient Names**: All \`name\` fields in \`allIngredients\`, \`additives\`, \`concerningIngredients\`, \`beneficialIngredients\` MUST be in English
3. **Descriptions**: All \`description\`, \`concerns\`, \`potentialHarm\`, \`benefits\` fields MUST be in English
4. **Summary**: The \`summary\` field MUST be in English
5. **Recommendation**: The \`recommendation\` field MUST be in English

**Ensure ALL text content in the JSON format is in English. Do NOT use Chinese, Japanese, or any other language.**
`,
  };

  const languageName = {
    "zh-TW": "繁體中文",
    "zh-CN": "简体中文",
    "en": "English",
  }[language] || "English";

  return `你是「食品安全與營養學專家（最高級證照持有者）」，請分析圖片中的食品標籤，輸出JSON格式。

${languageInstructions[language] || languageInstructions["en"]}

**核心評分演算法 (HealthScore - 總分 100)：**
請嚴格執行以下扣分邏輯得出 \`healthScore\`：
- **基礎分**：100分
- **營養紅綠燈（僅在有明確數據時扣分）**：
  * 只有當照片中明確顯示營養成分表的「數值」（如鈉 800mg、糖 25g）時，才進行紅綠燈扣分
  * 如果照片中「沒有」顯示營養成分表的數值，則「不扣分」，並在 scoreExplanation 中說明「無法確認過量」
  * 每出現一個「紅燈」扣 10分（糖、鈉、飽和脂肪、纖維四個指標）
- **添加劑風險（區分天然與人工，致癌物重扣）**：
  * **🔴 一級致癌 High Risk**：每個扣 **25分**
    - 亞硝酸鈉/鉀(E250/E249) - IARC Group 1 關聯
    - 苯甲酸鈉(E211) - 可生成苯(Group 1)
    - 反式脂肪/氫化油/部分氫化植物油 - 零容忍
  * **🟠 二級致癌 High Risk**：每個扣 **15分**
    - 阿斯巴甜(E951) - IARC 2B
    - 焦糖色素 E150c/E150d - 含4-MEI
    - 二氧化鈦(E171) - 歐盟已禁
    - 人工色素(E102/E110/E124/E129/E133) - 兒童食品一律 High
  * **人工合成 Medium Risk**：每個扣 8分
    - 其他人工防腐劑、人工甜味劑(糖精/甜蜜素)、人工乳化劑
  * **天然來源 Low Risk**：不扣分
    - 天然防腐劑(維生素E/C)、天然色素(β-胡蘿蔔素/葉綠素)、天然乳化劑(大豆卵磷脂)、天然甜味劑(甜菊糖苷)
- **需關注成分風險**：
  * High Risk 需關注成分：每個扣 8分
  * Medium Risk 需關注成分：每個扣 4分
  * Low Risk 需關注成分：不扣分
  * **重要**：如果照片中沒有顯示成分的「含量數值」，則該成分的風險等級標為 Low（因無法判斷是否過量），並在 concerns 中說明「含有此成分，但無法確認是否過量」
- **不考慮成分數量**：成分多不扣分，只看是否有「影響健康的成分」
- **最低分**：1分
- **計算方式**：healthScore = max(1, 100 - 營養紅綠燈扣分 - 添加劑扣分 - 需關注成分扣分）
- **扣分權重**：一級致癌(-25) > 二級致癌(-15) > Medium(-8) > Low(0)
- **核心原則**：致癌物優先識別並加重扣分，天然來源不扣分

**評分說明 (scoreExplanation) - 必須詳細填寫：**
- **breakdown** (陣列): 列出每個扣分項目，格式：
  * item: 扣分項目名稱（如「High Risk 添加劑」「Medium Risk 添加劑 x2」）
  * 如果某項目無法評估（如照片中沒有營養數據），則 points 為 0，reason 說明「照片中無營養成分表數值，無法確認是否過量」
  * points: 扣除的分數（負數，如 -10）
  * reason: 具體原因說明（${languageName}），如「鈉含量 800mg/100g 超過 600mg 閾值」
- **calculation** (字串): 分數計算公式，如：「100 - 10(高鈉紅燈) - 10(低纖紅燈) - 5(防腐劑) = 75分」
- **mainFactors** (陣列): 影響分數的主要因素（1-3個，${languageName}），如：
  * 「高鈉含量是主要扣分因素」
  * 「含有多種人工添加劑」
- **improvementSuggestions** (陣列): 如何改進此產品健康分數的建議（2-3個，${languageName}），如：
  * 「減少鈉含量至 400mg/100g 以下可提升 10 分」
  * 「使用天然防腐劑替代人工防腐劑」
  * 「增加膳食纖維含量至 6g/100g 以上」

**輸出 JSON 結構優化（必須精準生成以下欄位以利 UI 呈現）：**
- **healthScore**: 數字 (1-100)，根據上述評分演算法計算
- **scoreExplanation**: 物件，包含 breakdown、calculation、mainFactors、improvementSuggestions
- **verdictHeadline**: 一句話總結（${languageName}），例如：「高鈉零食含多種添加劑，高血壓患者請避開」或「天然全穀物，成分簡單營養豐富」
- **quickTags**: 陣列（${languageName}），例如：["高鈉", "含致癌色素", "添加劑多", "含過敏原"] 或 ["成分簡單", "高纖維", "無添加糖"]
- **healthProsCons**: 
  - pros: 該產品的 1-2 個優點（${languageName}），若無則填 "無明顯優點"
  - cons: 該產品的 1-3 個核心缺點（${languageName}），如：含人工甜味劑、飽和脂肪過高、鈉含量過高

**產品識別：**
- productName: ${language === "en" ? "Product name in English" : "產品名稱"}（${languageName}）
- productEmoji: 代表產品的emoji
- productType: 判斷產品類型 (child/傳統/一般等)
- markets: 根據標示語言推測市場

**資料品質評估：**
- dataQuality: 根據圖片清晰度、資訊完整性判斷 (high/medium/low)
- missingFields: 缺失的關鍵資訊（${languageName}）
- assumptions: 基於不完整資料的假設（${languageName}）
- confidence: 整體判斷信心 (0-1)

**成分排序權重 (positionWeight)：**
- 成分表前1-3名: 1.0
- 4-6名: 0.7  
- 7名以後: 0.4
- 有百分比標示: max(0.4, min(1.0, 百分比/15))
- 無資訊: 0.7

**添加劑 (additives) - 區分天然與人工來源：**
- **添加劑判定（嚴格區分來源）**：
  * 嚴格識別「E 編碼」與常見化學名稱
  * **必須判斷來源**：每個添加劑必須標註 source: "natural" 或 "synthetic"
  * 天然來源添加劑 → riskLevel: Low（不扣分）
  * 人工合成添加劑 → 根據危害程度判定風險等級
  * 對於複合調味料中的添加劑，必須單獨識別並列出

- **人工合成添加劑風險等級（致癌物優先識別）**：
  * **🔴 一級致癌 High Risk（扣25分）**：
    - 亞硝酸鈉(E250)、亞硝酸鉀(E249) → carcinogenicity: "Group 1"
    - 苯甲酸鈉(E211) → carcinogenicity: "Group 1"（可生成苯）
    - 反式脂肪、氫化油、部分氫化植物油 → carcinogenicity: "Group 1"
  * **🟠 二級致癌 High Risk（扣15分）**：
    - 阿斯巴甜(E951) → carcinogenicity: "2B"
    - 焦糖色素 E150c/E150d → carcinogenicity: "2B"（含4-MEI）
    - 二氧化鈦(E171) → carcinogenicity: "2B"（歐盟已禁）
    - 人工色素 E102/E110/E124/E129/E133 → carcinogenicity: "2B"（兒童食品一律 High）
  * **Medium Risk（扣8分）**：
    - 其他人工防腐劑、人工甜味劑(糖精/甜蜜素)、人工乳化劑

- **天然來源添加劑（Low Risk，不扣分）**：
  * 天然防腐劑：維生素E/生育酚(E306-E309)、維生素C/抗壞血酸(E300)、迷迭香提取物
  * 天然色素：β-胡蘿蔔素(E160a)、葉綠素(E140)、薑黃素(E100)、焦糖色素(E150a天然)
  * 天然乳化劑：大豆卵磷脂(E322)、蛋黃卵磷脂
  * 天然甜味劑：甜菊糖苷(E960)、羅漢果糖苷
  * 天然香料、天然提取物、植物提取物
- contextUse: 判斷是否為傳統/發酵食品中的正常成分
- description: 說明添加劑的功能（如防腐、增色、調味等）和基本特性（${languageName}）
- potentialHarm: 必須按照以下結構詳細說明（${languageName}）：
  * **格式要求**：
    1. 開頭：簡短摘要（1句話，說明主要風險）
    2. 一般健康影響：
       - 主要風險：[具體說明此添加劑對一般人群的風險]
       - 影響機制：[簡要說明作用機制，例如：如何影響身體、代謝過程等]
       - 法規限制：[如果有法規限制或建議攝取量，請說明]
    3. 特定疾病風險（僅在相關時列出）：
       - 高血壓患者：如果含有鈉，說明鈉含量、對血壓的影響、建議攝取量或避免建議
       - 糖尿病患者：如果含有糖或甜味劑，說明對血糖的影響、建議攝取量或避免建議
       - 腎臟病患者：如果含有磷、鉀等，說明相關影響、建議攝取量或避免建議
       - 過敏體質：說明可能的過敏風險、症狀和避免建議
       - 其他相關疾病：根據添加劑特性說明相關健康風險、影響機制和建議
       - 格式：針對每種相關疾病提供2-3句話的具體說明，包含影響機制、影響程度和建議
  * **範例**：
    "此添加劑可能導致血壓上升。主要風險：含有鈉，過量攝取會增加心血管疾病風險。影響機制：鈉離子會增加體內水分滯留，導致血壓升高。法規限制：WHO建議每日鈉攝取量不超過2000mg。高血壓患者：此成分會直接影響血壓控制，建議每日鈉攝取量控制在1500mg以下，此產品每100g含鈉約800mg，高血壓患者應避免或嚴格控制攝取量。"

**需關注成分 (concerningIngredients)：**
- **必須包含以下成分類型**：
  * 高糖成分：糖、蔗糖、果糖、葡萄糖、高果糖玉米糖漿、精製糖等
  * 高鈉成分：鹽、食鹽、氯化鈉、鈉含量高的調味料等
  * 高飽和脂肪：棕櫚油、椰子油、氫化油、反式脂肪等
  * 精製碳水化合物：白麵粉、精製澱粉等
- **風險等級判斷（重要：需有明確含量數據才能判定 High/Medium）**：
  * 兒童食品: 致癌物/反式脂肪/人工香精任何含量都危險 → High
  * 一般食品（有明確含量數據時）: 反式脂肪/高果糖漿(>10%) → High, 精製糖(>15%)/高鈉(>600mg) → Medium
  * **一般食品（無含量數據時）**: 列出成分，但風險等級標為 Low，concerns 中說明「含有此成分，但照片中無含量數據，無法確認是否過量」
  * 傳統食品: 醬油/味噌/起司高鈉不扣分
- description: 說明成分的基本資訊、用途或特性（${languageName}）
- concerns: 必須按照以下結構詳細說明（${languageName}）：
  * **格式要求**：
    1. 風險等級說明：[說明為什麼是 High/Medium/Low 風險]
    2. 具體危害：
       - 對健康指標的影響：[例如：血糖、血壓、膽固醇等]
       - 影響程度：[輕微/中等/嚴重，並說明原因]
    3. 建議攝取量：[如果有建議，說明每日或每次建議攝取量，並與產品實際含量對比]
    4. 替代建議：[如果適用，提供更健康的替代選擇]
    5. 特定疾病風險（僅在相關時列出）：
       - 高血壓患者：說明鈉含量、對血壓的影響機制、建議攝取量或避免建議
       - 糖尿病患者：說明糖分含量、對血糖的影響機制、建議攝取量或避免建議
       - 腎臟病患者：說明磷、鉀、蛋白質含量、影響機制及建議攝取量或避免建議
       - 其他相關疾病：根據成分特性說明相關健康風險、影響機制和建議
       - 格式：針對每種相關疾病提供2-3句話的具體說明，包含影響機制、影響程度和建議
  * **範例**：
    "高風險：此成分為精製糖，過量攝取會導致血糖快速上升。具體危害：會導致血糖急劇波動，增加糖尿病風險，長期過量攝取可能導致肥胖和代謝症候群。影響程度：嚴重，特別是對糖尿病患者。建議攝取量：WHO建議每日添加糖攝取量不超過總熱量的10%（約50g），此產品每100g含糖約30g，建議控制攝取量。替代建議：選擇使用天然甜味劑（如甜菊糖）或無糖版本的產品。糖尿病患者：此成分會導致血糖快速上升，影響機制為精製糖會迅速被吸收進入血液，導致血糖急劇波動，對糖尿病患者有嚴重影響，建議完全避免或選擇無糖替代品。"

**完整成分列表 (allIngredients)：**
- 必須列出標籤上顯示的所有成分，按照標籤上的順序（從多到少）
- **成分拆解邏輯（重要）**：
  * 必須深度解析「複合調味料」括號內的成分，例如：「複合調味料（食鹽、味精、5'-次黃嘌呤核苷磷酸二鈉）」應拆解為：
    - 食鹽（單獨列出）
    - 味精（單獨列出）
    - 5'-次黃嘌呤核苷磷酸二鈉（單獨列出）
  * 對於任何包含括號的成分，必須檢查括號內是否有子成分，並將子成分單獨列出
  * 確保不遺漏任何實際存在的成分
- 每個成分包含：name（名稱，${languageName}）、position（位置序號，從1開始）、category（類別）、description（簡短說明，${languageName}）
- category 分類：
  * additive: 添加劑（已在 additives 中列出）
  * beneficial: 有益成分（已在 beneficialIngredients 中列出）
  * concerning: 需關注成分（已在 concerningIngredients 中列出）
    - **重要**：以下成分必須歸類為 concerning，而非 neutral：
      * 糖、蔗糖、果糖、葡萄糖、高果糖玉米糖漿等任何形式的糖
      * 鹽、食鹽、氯化鈉等任何形式的鈉
      * 棕櫚油、椰子油、氫化油、反式脂肪等飽和脂肪
      * 白麵粉、精製澱粉等精製碳水化合物
  * neutral: 一般/中性成分（如：水、全麥麵粉、天然香料、基礎調味料等，**不包含**高糖、高鈉、高飽和脂肪的成分）
- description 要求：
  * 為每個成分提供簡短的說明（1-2句話），說明其用途、特性或健康影響（${languageName}）
  * 添加劑：說明其功能（如防腐、增色、調味等）和簡短風險提示（例如：「可能影響血壓」或「過量攝取需注意」）
  * 有益成分：說明其健康益處
  * 需關注成分：說明需要注意的原因和簡短風險提示（例如：「高糖成分，過量攝取可能影響血糖」或「高鈉成分，過量攝取可能影響血壓」）
  * 一般成分：簡要說明其常見用途或特性
  * **重要**：對於有風險的成分（additive 或 concerning），description 必須包含：
    - 基本用途/特性（1句話）
    - 簡短風險提示（如果有風險，1句話說明主要風險，例如：「可能影響血壓」或「過量攝取需注意」）
  * 詳細的風險說明請放在對應的 \`additives.potentialHarm\` 或 \`concerningIngredients.concerns\` 字段中
- 確保不遺漏任何成分，包括基礎原料、調味料、香料等
- 如果成分表不完整或模糊，在 assumptions 中說明

**營養資訊 (nutritionPer100)：**
- 每100g/100mL的營養成分估算
- 缺資料則填null

**NOVA加工程度 (novaClass) - 僅供參考，不影響分數：**
- 1: 未加工/最少加工
- 2: 烹飪配料  
- 3: 加工食品
- 4: 超加工食品
- 注意：此欄位僅作為參考資訊顯示，不納入 healthScore 計算

**紅綠燈 (trafficLights)：**
- **重要**：只有當照片中明確顯示營養成分表的「數值」時，才填入紅綠燈狀態
- 如果照片中「沒有」顯示某項營養素的數值，該項填 null（不是灰色、不是推測）
- 糖: 固體>22.5g=紅, 飲料>11g=紅, 中間=黃, 低=綠，無數據=null
- 鈉: >600mg=紅, >120mg=黃, 否則綠，無數據=null
- 飽和脂肪: >5g=紅, >1.5g=黃，無數據=null
- 纖維: <3g=紅, <6g=黃, ≥6g=綠，無數據=null

**兒童特別警告 (childSpecificWarnings)：**
- 含咖啡因不建議兒童飲用（${languageName}）
- <1歲不宜食用蜂蜜（${languageName}）
- 含人工甜味劑對味覺培養的影響（${languageName}）

**原則：天然成分不扣分，兒童食品更嚴格，傳統食品考慮文化背景，成分排序影響權重**

**記住：所有文字內容都必須使用 ${languageName}。**

**最後提醒：**
- healthScore 必須根據上述評分演算法嚴格計算，確保客觀且具備跨產品的可比性
- **不考慮 NOVA 加工等級和成分數量**：評分純粹基於成分本身的「風險等級」（添加劑、需關注成分）和營養紅綠燈（如有數據）
- **如果照片中沒有營養成分表的數值**：不要假設或推測數值，直接說明「無法確認過量」，不扣營養紅綠燈分數
- 嬰兒配方、保健食品等特殊品類，只要沒有中高風險添加劑，應獲得較高分數
- verdictHeadline 必須是一句話總結，讓用戶在1秒內就能抓到重點
- quickTags 必須精準反映產品的關鍵健康特徵（優點和缺點）
- healthProsCons 必須客觀列出產品的優缺點，幫助用戶快速決策
- 所有個人化建議必須使用白話文，避免過多專業術語

**【Prompt 改進建議】(promptImprovementSuggestions) - 簡化版：**
請用一句話評估本次評分是否合理，並提供一條最重要的改進建議（適用於所有食品類型）。

- **isScoreReasonable** (布林值): 本次評分是否合理？true/false
- **briefAssessment** (字串): 一句話評估（20字以內），如「評分合理」或「對特殊食品偏嚴格」
- **topSuggestion** (字串): 最重要的一條改進建議（30字以內），例如：
  - 「添加劑應區分天然與人工來源」
  - 「成分數量扣分應設上限」
  - 「高風險添加劑的權重可再提高」

**注意：保持簡潔，避免過於複雜的分支邏輯，以免影響生成效率和成本。**

${getPersonalizedHealthSection()}

輸出純JSON，無額外文字。`;
}

export default function PromptTestScreen() {
  const insets = useSafeAreaInsets();
  const safeBack = useSafeBack();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const router = useRouter();
  const setCurrentResult = useFoodScanStore((s) => s.setCurrentResult);
  const addScanResult = useFoodScanStore((s) => s.addScanResult);

  // ⚠️ 注意：請不要在此硬編碼 API 金鑰，應從環境變數或安全存儲中讀取
  const [apiKey, setApiKey] = useState("");
  const [prompt, setPrompt] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [frontendResult, setFrontendResult] = useState<FoodAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<"zh-TW" | "zh-CN" | "en">("zh-TW");
  const [isIngredientsExpanded, setIsIngredientsExpanded] = useState(false); // 成分分析預設收合
  const [isScoreExplanationExpanded, setIsScoreExplanationExpanded] = useState(false); // 評分說明預設收合
  const [isPromptImprovementExpanded, setIsPromptImprovementExpanded] = useState(true); // Prompt 改進建議預設展開
  
  // 個人化健康設定（變數方式）
  const [diseases, setDiseases] = useState<string[]>(["高血壓"]); // 預設高血壓
  const [healthGoals, setHealthGoals] = useState<string[]>([]);
  const [allergens, setAllergens] = useState<string[]>([]);
  
  // 新增項目的輸入狀態
  const [newDisease, setNewDisease] = useState("");
  const [newHealthGoal, setNewHealthGoal] = useState("");
  const [newAllergen, setNewAllergen] = useState("");

  // 組合 userPreferences 物件
  const userPreferences: UserPreferences = useMemo(() => ({
    diseases,
    healthGoals,
    allergens,
  }), [diseases, healthGoals, allergens]);

  // 根據語言和用戶偏好生成預設 prompt
  const defaultPrompt = useMemo(() => generateAnalysisPrompt(language, userPreferences), [language, userPreferences]);

  // 初始化 prompt
  React.useEffect(() => {
    setPrompt(defaultPrompt);
  }, [defaultPrompt]);

  // 添加項目的函數
  const addDisease = () => {
    if (newDisease.trim() && !diseases.includes(newDisease.trim())) {
      setDiseases(prev => [...prev, newDisease.trim()]);
      setNewDisease("");
    }
  };
  
  const addHealthGoal = () => {
    if (newHealthGoal.trim() && !healthGoals.includes(newHealthGoal.trim())) {
      setHealthGoals(prev => [...prev, newHealthGoal.trim()]);
      setNewHealthGoal("");
    }
  };
  
  const addAllergen = () => {
    if (newAllergen.trim() && !allergens.includes(newAllergen.trim())) {
      setAllergens(prev => [...prev, newAllergen.trim()]);
      setNewAllergen("");
    }
  };
  
  // 移除項目的函數
  const removeDisease = (item: string) => {
    setDiseases(prev => prev.filter(d => d !== item));
  };
  
  const removeHealthGoal = (item: string) => {
    setHealthGoals(prev => prev.filter(g => g !== item));
  };
  
  const removeAllergen = (item: string) => {
    setAllergens(prev => prev.filter(a => a !== item));
  };

  // 將後端格式轉換為前端格式（與 scan.tsx 中的邏輯完全一致）
  const convertToFrontendFormat = (backendResult: any, imageUri: string): FoodAnalysisResult => {
    // 計算健康分數（基於風險分數）
    const calculateHealthScore = (riskScore: number, maxRiskLevel: string): number => {
      const baseScore = 100 - riskScore;
      if (maxRiskLevel === 'High') {
        return Math.max(0, baseScore - 20);
      } else if (maxRiskLevel === 'Medium') {
        return Math.max(0, baseScore - 10);
      }
      return Math.min(100, baseScore + 10);
    };

    // 映射風險等級
    const mapRiskLevel = (level: string): 'low' | 'medium' | 'high' => {
      if (level === 'Low' || level === 'low') return 'low';
      if (level === 'Medium' || level === 'medium') return 'medium';
      if (level === 'High' || level === 'high') return 'high';
      return 'medium';
    };

    // 映射成分風險等級
    const mapIngredientRisk = (level?: string): 'low' | 'medium' | 'high' | 'warning' => {
      if (level === 'Low' || level === 'low') return 'low';
      if (level === 'Medium' || level === 'medium') return 'medium';
      if (level === 'High' || level === 'high') return 'warning';
      return 'low';
    };

    // 生成建議
    const generateRecommendation = (result: any): string => {
      const riskLevel = result.maxRiskLevel || 'Medium';
      const hasHighRisk = result.additives?.some((a: any) => a.riskLevel === 'High') || false;
      
      if (riskLevel === 'High' || hasHighRisk) {
        return '此產品含有高風險成分，建議謹慎攝取或選擇替代品。';
      } else if (riskLevel === 'Medium') {
        return '建議適量攝取，注意均衡飲食，搭配新鮮蔬果。';
      } else {
        return '這是一個相對健康的食品選擇，可以適量攝取。';
      }
    };

    // 計算風險分數和等級（從後端數據中提取或計算）
    // 如果後端沒有返回 riskScore，從添加劑和成分中計算
    let riskScore = backendResult.riskScore || 0;
    let maxRiskLevel = backendResult.maxRiskLevel || 'Medium';
    
    // 如果沒有 riskScore，從添加劑和成分中計算
    if (!backendResult.riskScore) {
      const highRiskAdditives = backendResult.additives?.filter((a: any) => a.riskLevel === 'High').length || 0;
      const mediumRiskAdditives = backendResult.additives?.filter((a: any) => a.riskLevel === 'Medium').length || 0;
      const highRiskConcerning = backendResult.concerningIngredients?.filter((c: any) => c.riskLevel === 'High').length || 0;
      const mediumRiskConcerning = backendResult.concerningIngredients?.filter((c: any) => c.riskLevel === 'Medium').length || 0;
      
      riskScore = (highRiskAdditives * 30) + (mediumRiskAdditives * 15) + (highRiskConcerning * 25) + (mediumRiskConcerning * 12);
      
      if (highRiskAdditives > 0 || highRiskConcerning > 0) {
        maxRiskLevel = 'High';
      } else if (mediumRiskAdditives > 0 || mediumRiskConcerning > 0) {
        maxRiskLevel = 'Medium';
      } else {
        maxRiskLevel = 'Low';
      }
    }
    
    // 優先使用後端返回的 healthScore，否則計算
    const healthScore = backendResult.healthScore || calculateHealthScore(riskScore, maxRiskLevel);

    const frontendResult: any = {
      id: `test-${Date.now()}`,
      timestamp: new Date().toISOString(),
      imageUri: imageUri,
      healthScore: Math.round(healthScore),
      summary: backendResult.summary || '分析完成',
      productName: backendResult.productName || backendResult.summary || '未知產品',
      recommendation: backendResult.recommendation || generateRecommendation(backendResult),
      riskLevel: mapRiskLevel(maxRiskLevel),
      isPurchased: false,
      ingredients: {
        safe: [
          // 有益成分
          ...(backendResult.beneficialIngredients || []).map((ing: any) => ({
            name: ing.name,
            description: ing.description || ing.benefits || '',
            riskLevel: 'safe' as const,
          })),
          // 低風險添加劑也歸類為安全
          ...(backendResult.additives?.filter((a: any) => a.riskLevel === 'Low').map((a: any) => ({
            name: a.name,
            description: a.description || a.potentialHarm || '',
            riskLevel: 'safe' as const,
          })) || []),
          // 中性成分（從完整成分列表中提取）
          ...(backendResult.allIngredients?.filter((ing: any) => ing.category === 'neutral').map((ing: any) => ({
            name: ing.name,
            description: ing.description || '',
            riskLevel: 'safe' as const,
          })) || []),
        ],
        warning: [
          // 所有添加劑（High 和 Medium）
          ...(backendResult.additives?.filter((a: any) => a.riskLevel === 'High' || a.riskLevel === 'Medium').map((a: any) => ({
            name: a.name,
            description: a.description || a.potentialHarm || '',
            riskLevel: a.riskLevel === 'High' ? 'warning' as const : 'moderate' as const,
            category: a.category || '',
            carcinogenicity: a.carcinogenicity || '',
          })) || []),
          // 需關注成分
          ...(backendResult.concerningIngredients?.map((ing: any) => ({
            name: ing.name,
            description: ing.description || ing.concerns || '',
            riskLevel: mapIngredientRisk(ing.riskLevel),
          })) || []),
        ],
      },
      nutritionBenefits: (backendResult.beneficialIngredients || []).map((ing: any) => ({
        name: ing.name,
      })),
      // 保存後端返回的完整數據（用於後續查詢）
      backendData: backendResult,
    };

    return frontendResult;
  };

  // 查看實際 UI 效果
  const viewInActualUI = () => {
    if (!frontendResult) {
      Alert.alert("錯誤", "請先完成測試");
      return;
    }

    // 設置結果並導航到結果頁面
    setCurrentResult(frontendResult);
    addScanResult(frontendResult);
    router.push("/result");
  };

  // 獲取分數顏色
  const getScoreColor = (score: number): string => {
    if (score >= 71) return "#10B981"; // 綠色
    if (score >= 31) return "#F59E0B"; // 橘色
    return "#EF4444"; // 紅色
  };

  // 獲取風險等級顏色
  const getRiskLevelColor = (score: number): string => {
    if (score >= 71) return "#10B981";
    if (score >= 31) return "#F59E0B";
    return "#EF4444";
  };

  // 獲取風險等級標籤
  const getRiskLevelLabel = (score: number): string => {
    if (score >= 71) return "良好安全等級";
    if (score >= 31) return "適量食用";
    return "建議避免";
  };

  // 選擇圖片
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("需要權限", "需要相簿權限才能選擇圖片");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      
      if (asset.base64) {
        setImageBase64(asset.base64);
      }
    }
  };

  // 調用 Gemini API
  const callGeminiAPI = async () => {
    if (!apiKey.trim()) {
      Alert.alert("錯誤", "請輸入 Gemini API Key");
      return;
    }

    if (!imageBase64) {
      Alert.alert("錯誤", "請先選擇一張圖片");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const schema = generateResponseSchema(language);
      const mimeType = imageUri?.endsWith('.png') ? 'image/png' : 'image/jpeg';
      const currentPrompt = prompt || defaultPrompt;

      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: imageBase64,
                  mimeType: mimeType,
                },
              },
              {
                text: "請識別這張圖片",
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
        systemInstruction: {
          parts: [
            {
              text: currentPrompt,
            },
          ],
        },
      };

      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API 錯誤: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const resultText = data.candidates[0].content.parts[0].text;
        const parsedResult = JSON.parse(resultText);
        setResult(parsedResult);
        
        // 轉換為前端格式（與實際 UI 完全一樣）
        const convertedResult = convertToFrontendFormat(parsedResult, imageUri || '');
        setFrontendResult(convertedResult);
      } else {
        throw new Error("API 返回格式不正確");
      }
    } catch (err: any) {
      console.error("Gemini API 錯誤:", err);
      setError(err.message || "調用 API 時發生錯誤");
      Alert.alert("錯誤", err.message || "調用 API 時發生錯誤");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.headerBorder }]}>
        <Pressable onPress={() => safeBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.iconColor} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.primaryText }]}>Prompt 測試頁面</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* API Key 輸入 */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>Gemini API Key</Text>
          <TextInput
            style={[styles.input, { color: theme.primaryText, borderColor: theme.cardBorder }]}
            placeholder="輸入您的 Gemini API Key"
            placeholderTextColor={theme.secondaryText}
            value={apiKey}
            onChangeText={setApiKey}
            secureTextEntry
            autoCapitalize="none"
          />
          <Text style={[styles.hint, { color: theme.secondaryText }]}>
            提示：API Key 不會被保存，僅用於測試
          </Text>
        </View>

        {/* 語言選擇 */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>語言</Text>
          <View style={styles.languageButtons}>
            {(["zh-TW", "zh-CN", "en"] as const).map((lang) => (
              <Pressable
                key={lang}
                style={[
                  styles.languageButton,
                  {
                    backgroundColor: language === lang ? theme.primary : theme.gray100,
                  },
                ]}
                onPress={() => {
                  setLanguage(lang);
                }}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    { color: language === lang ? "#FFFFFF" : theme.primaryText },
                  ]}
                >
                  {lang === "zh-TW" ? "繁體中文" : lang === "zh-CN" ? "簡體中文" : "English"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* 個人化健康設定（變數方式） */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="heart" size={20} color="#EF4444" />
            <Text style={[styles.sectionTitle, { color: theme.primaryText, marginLeft: 8, marginBottom: 0 }]}>
              個人化健康設定
            </Text>
          </View>
          <Text style={[styles.hint, { marginTop: 4, marginBottom: 12 }]}>
            自由輸入您的健康狀況、目標和過敏原，AI 將針對您的情況提供專業建議
          </Text>
          
          {/* 疾病/健康狀況 */}
          <View style={styles.preferenceSection}>
            <Text style={[styles.preferenceLabel, { color: theme.primaryText }]}>
              🏥 疾病/健康狀況
            </Text>
            <View style={styles.preferenceInputRow}>
              <TextInput
                style={[styles.preferenceInput, { color: theme.primaryText, borderColor: theme.cardBorder, flex: 1 }]}
                placeholder="輸入疾病名稱（如：高血壓、糖尿病）"
                placeholderTextColor={theme.secondaryText}
                value={newDisease}
                onChangeText={setNewDisease}
                onSubmitEditing={addDisease}
              />
                <Pressable
                style={[styles.addButton, { backgroundColor: "#EF4444" }]}
                onPress={addDisease}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
            <View style={styles.tagContainer}>
              {diseases.map((item, index) => (
                <View key={`disease-${index}`} style={[styles.tag, { backgroundColor: "#FEE2E2", borderColor: "#EF4444" }]}>
                  <Text style={[styles.tagText, { color: "#EF4444" }]}>{item}</Text>
                  <Pressable onPress={() => removeDisease(item)} hitSlop={8}>
                    <Ionicons name="close-circle" size={18} color="#EF4444" />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>

          {/* 健康目標 */}
          <View style={styles.preferenceSection}>
            <Text style={[styles.preferenceLabel, { color: theme.primaryText }]}>
              🎯 健康目標
            </Text>
            <View style={styles.preferenceInputRow}>
              <TextInput
                style={[styles.preferenceInput, { color: theme.primaryText, borderColor: theme.cardBorder, flex: 1 }]}
                placeholder="輸入健康目標（如：減重、增肌、降血糖）"
                placeholderTextColor={theme.secondaryText}
                value={newHealthGoal}
                onChangeText={setNewHealthGoal}
                onSubmitEditing={addHealthGoal}
              />
              <Pressable
                style={[styles.addButton, { backgroundColor: "#10B981" }]}
                onPress={addHealthGoal}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
            <View style={styles.tagContainer}>
              {healthGoals.map((item, index) => (
                <View key={`goal-${index}`} style={[styles.tag, { backgroundColor: "#D1FAE5", borderColor: "#10B981" }]}>
                  <Text style={[styles.tagText, { color: "#10B981" }]}>{item}</Text>
                  <Pressable onPress={() => removeHealthGoal(item)} hitSlop={8}>
                    <Ionicons name="close-circle" size={18} color="#10B981" />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>

          {/* 過敏原 */}
          <View style={styles.preferenceSection}>
            <Text style={[styles.preferenceLabel, { color: theme.primaryText }]}>
              ⚠️ 過敏原/避免食物
                    </Text>
            <View style={styles.preferenceInputRow}>
              <TextInput
                style={[styles.preferenceInput, { color: theme.primaryText, borderColor: theme.cardBorder, flex: 1 }]}
                placeholder="輸入過敏原（如：花生、麩質、乳製品）"
                placeholderTextColor={theme.secondaryText}
                value={newAllergen}
                onChangeText={setNewAllergen}
                onSubmitEditing={addAllergen}
              />
              <Pressable
                style={[styles.addButton, { backgroundColor: "#F59E0B" }]}
                onPress={addAllergen}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </Pressable>
                  </View>
            <View style={styles.tagContainer}>
              {allergens.map((item, index) => (
                <View key={`allergen-${index}`} style={[styles.tag, { backgroundColor: "#FEF3C7", borderColor: "#F59E0B" }]}>
                  <Text style={[styles.tagText, { color: "#F59E0B" }]}>{item}</Text>
                  <Pressable onPress={() => removeAllergen(item)} hitSlop={8}>
                    <Ionicons name="close-circle" size={18} color="#F59E0B" />
                </Pressable>
          </View>
              ))}
            </View>
          </View>

          {/* 設定摘要 */}
          {(diseases.length > 0 || healthGoals.length > 0 || allergens.length > 0) && (
            <View style={styles.selectedDiseasesInfo}>
              <Text style={[styles.selectedDiseasesLabel, { color: theme.secondaryText }]}>
                📋 當前設定：
                {diseases.length > 0 && `\n🏥 疾病：${diseases.join("、")}`}
                {healthGoals.length > 0 && `\n🎯 目標：${healthGoals.join("、")}`}
                {allergens.length > 0 && `\n⚠️ 過敏原：${allergens.join("、")}`}
              </Text>
              <Text style={[styles.selectedDiseasesHint, { color: "#EF4444" }]}>
                ⚠️ AI 將特別關注這些設定的相關風險成分
              </Text>
            </View>
          )}
        </View>

        {/* Prompt 編輯 */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>Prompt（可編輯）</Text>
          <TextInput
            style={[
              styles.promptInput,
              { color: theme.primaryText, borderColor: theme.cardBorder },
            ]}
            placeholder="輸入您的 Prompt"
            placeholderTextColor={theme.secondaryText}
            value={prompt}
            onChangeText={setPrompt}
            multiline
            numberOfLines={20}
            textAlignVertical="top"
          />
          <Pressable
            style={[styles.resetButton, { backgroundColor: theme.gray200 }]}
            onPress={() => setPrompt(defaultPrompt)}
          >
            <Text style={[styles.resetButtonText, { color: theme.primaryText }]}>重置為預設 Prompt</Text>
          </Pressable>
        </View>

        {/* 圖片選擇 */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>測試圖片</Text>
          <Pressable
            style={[styles.imageButton, { backgroundColor: theme.primary }]}
            onPress={pickImage}
          >
            <Ionicons name="image-outline" size={24} color="#FFFFFF" />
            <Text style={styles.imageButtonText}>
              {imageUri ? "更換圖片" : "選擇圖片"}
            </Text>
          </Pressable>
          {imageUri && (
            <View style={styles.imagePreview}>
              <Text style={[styles.imagePreviewText, { color: theme.secondaryText }]}>
                已選擇圖片
              </Text>
            </View>
          )}
        </View>

        {/* 測試按鈕 */}
        <Pressable
          style={[
            styles.testButton,
            {
              backgroundColor: loading ? theme.gray400 : theme.primary,
              opacity: loading ? 0.6 : 1,
            },
          ]}
          onPress={callGeminiAPI}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="rocket-outline" size={20} color="#FFFFFF" />
              <Text style={styles.testButtonText}>開始測試</Text>
            </>
          )}
        </Pressable>

        {/* 錯誤顯示 */}
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: "#FEE2E2" }]}>
            <Ionicons name="alert-circle" size={20} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* 查看實際 UI 按鈕 */}
        {frontendResult && (
          <Pressable
            style={[styles.viewUIButton, { backgroundColor: theme.primary }]}
            onPress={viewInActualUI}
          >
            <Ionicons name="eye-outline" size={20} color="#FFFFFF" />
            <Text style={styles.viewUIButtonText}>查看實際 UI 效果</Text>
          </Pressable>
        )}

        {/* 視覺化結果預覽 */}
        {result && (
          <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>📊 視覺化結果預覽</Text>
            
            {/* 產品名稱 */}
            {result.productName && (
              <Text style={[styles.productName, { color: theme.primaryText }]}>
                {result.productEmoji || ''} {result.productName}
              </Text>
            )}
            
            {/* 健康分數圓圈 */}
            <View style={styles.scoreSection}>
              <View style={[styles.scoreCircle, { borderColor: getScoreColor(result.healthScore || 50) }]}>
                <Text style={[styles.scoreText, { color: getScoreColor(result.healthScore || 50) }]}>
                  {result.healthScore || '--'}
                </Text>
              </View>
              <Text style={[styles.riskLevelText, { color: getRiskLevelColor(result.healthScore || 50) }]}>
                {getRiskLevelLabel(result.healthScore || 50)}
              </Text>
            </View>

            {/* 評分說明 - 可展開 */}
            {result.scoreExplanation && (
              <View style={styles.scoreExplanationSection}>
                <Pressable 
                  style={styles.scoreExplanationHeader}
                  onPress={() => setIsScoreExplanationExpanded(!isScoreExplanationExpanded)}
                >
                  <View style={styles.scoreExplanationHeaderLeft}>
                    <Ionicons name="calculator" size={18} color="#3B82F6" />
                    <Text style={[styles.scoreExplanationTitle, { color: theme.primaryText }]}>
                      📊 評分說明
                    </Text>
                  </View>
                  <Ionicons 
                    name={isScoreExplanationExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={theme.secondaryText} 
                  />
                </Pressable>

                {isScoreExplanationExpanded && (
                  <View style={styles.scoreExplanationContent}>
                    {/* 計算公式 */}
                    {result.scoreExplanation.calculation && (
                      <View style={[styles.calculationBox, { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' }]}>
                        <Text style={styles.calculationLabel}>📐 計算公式</Text>
                        <Text style={styles.calculationText}>{result.scoreExplanation.calculation}</Text>
                            </View>
                          )}

                    {/* 扣分明細 */}
                    {result.scoreExplanation.breakdown?.length > 0 && (
                      <View style={styles.breakdownSection}>
                        <Text style={[styles.breakdownTitle, { color: theme.primaryText }]}>📋 扣分明細</Text>
                        {result.scoreExplanation.breakdown.map((item: any, index: number) => (
                          <View key={`breakdown-${index}`} style={[styles.breakdownItem, { backgroundColor: theme.gray50 }]}>
                            <View style={styles.breakdownItemHeader}>
                              <Text style={[styles.breakdownItemName, { color: theme.primaryText }]}>{item.item}</Text>
                              <Text style={[styles.breakdownItemPoints, { color: '#EF4444' }]}>{item.points} 分</Text>
                          </View>
                            <Text style={[styles.breakdownItemReason, { color: theme.secondaryText }]}>{item.reason}</Text>
                        </View>
                        ))}
                      </View>
                    )}

                    {/* 主要因素 */}
                    {result.scoreExplanation.mainFactors?.length > 0 && (
                      <View style={styles.mainFactorsSection}>
                        <Text style={[styles.mainFactorsTitle, { color: theme.primaryText }]}>🎯 主要影響因素</Text>
                        {result.scoreExplanation.mainFactors.map((factor: string, index: number) => (
                          <View key={`factor-${index}`} style={styles.mainFactorItem}>
                            <Text style={styles.mainFactorBullet}>•</Text>
                            <Text style={[styles.mainFactorText, { color: theme.secondaryText }]}>{factor}</Text>
                    </View>
                  ))}
                </View>
              )}

                    {/* 改進建議 */}
                    {result.scoreExplanation.improvementSuggestions?.length > 0 && (
                      <View style={[styles.improvementSection, { backgroundColor: '#D1FAE5', borderColor: '#10B981' }]}>
                        <Text style={styles.improvementTitle}>💡 如何改進此產品分數</Text>
                        {result.scoreExplanation.improvementSuggestions.map((suggestion: string, index: number) => (
                          <View key={`suggestion-${index}`} style={styles.improvementItem}>
                            <Text style={styles.improvementBullet}>{index + 1}.</Text>
                            <Text style={styles.improvementText}>{suggestion}</Text>
                    </View>
                  ))}
                          </View>
                    )}
                </View>
              )}
            </View>
            )}

            {/* 個人化健康風險評估 - 放在成分分析之前 */}
            {(diseases.length > 0 || healthGoals.length > 0 || allergens.length > 0) && (result.personalizedRiskAssessment || result.diseaseSpecificWarnings) && (
              <View style={styles.personalizedSection}>
                <View style={styles.personalizedHeader}>
                  <Ionicons name="heart" size={18} color="#EF4444" />
                  <Text style={[styles.personalizedTitle, { color: theme.primaryText }]}>
                    個人化健康風險評估
                  </Text>
                </View>

                {/* 整體風險評估 */}
                {result.personalizedRiskAssessment && (
                  <View style={[styles.riskAssessmentCard, {
                    backgroundColor: result.personalizedRiskAssessment.overall === 'warning' ? '#FEE2E2' :
                                    result.personalizedRiskAssessment.overall === 'caution' ? '#FEF3C7' : '#D1FAE5',
                    borderColor: result.personalizedRiskAssessment.overall === 'warning' ? '#EF4444' :
                                result.personalizedRiskAssessment.overall === 'caution' ? '#F59E0B' : '#10B981',
                  }]}>
                    <View style={styles.riskAssessmentHeader}>
                      <Ionicons
                        name={result.personalizedRiskAssessment.overall === 'warning' ? 'warning' :
                              result.personalizedRiskAssessment.overall === 'caution' ? 'alert-circle' : 'checkmark-circle'}
                        size={24}
                        color={result.personalizedRiskAssessment.overall === 'warning' ? '#EF4444' :
                               result.personalizedRiskAssessment.overall === 'caution' ? '#F59E0B' : '#10B981'}
                      />
                      <Text style={[styles.riskAssessmentOverall, {
                        color: result.personalizedRiskAssessment.overall === 'warning' ? '#EF4444' :
                               result.personalizedRiskAssessment.overall === 'caution' ? '#F59E0B' : '#10B981',
                      }]}>
                        {result.personalizedRiskAssessment.overall === 'warning' ? '⚠️ 建議避免' :
                         result.personalizedRiskAssessment.overall === 'caution' ? '⚡ 謹慎食用' : '✓ 相對安全'}
                      </Text>
                    </View>
                    {result.personalizedRiskAssessment.reasoning && (
                      <Text style={[styles.riskAssessmentReasoning, { color: theme.secondaryText }]}>
                        {result.personalizedRiskAssessment.reasoning}
                      </Text>
                    )}
                  </View>
                )}

                {/* 疾病特定警告 - 按風險等級排序 */}
                {result.diseaseSpecificWarnings
                  ?.slice()
                  .sort((a: any, b: any) => {
                    const riskOrder: Record<string, number> = { high: 0, moderate: 1, low: 2 };
                    return (riskOrder[a.riskLevel] ?? 2) - (riskOrder[b.riskLevel] ?? 2);
                  })
                  .map((warning: any, index: number) => (
                  <View key={`warning-${index}`} style={[styles.diseaseWarningCard, { backgroundColor: theme.gray50 }]}>
                    <View style={styles.diseaseWarningHeader}>
                      <View style={[styles.diseaseWarningBadge, {
                        backgroundColor: warning.riskLevel === 'high' ? '#FEE2E2' :
                                        warning.riskLevel === 'moderate' ? '#FEF3C7' : '#D1FAE5',
                      }]}>
                        <Text style={[styles.diseaseWarningBadgeText, {
                          color: warning.riskLevel === 'high' ? '#EF4444' :
                                 warning.riskLevel === 'moderate' ? '#F59E0B' : '#10B981',
                        }]}>
                          {warning.riskLevel === 'high' ? '高風險' :
                           warning.riskLevel === 'moderate' ? '中風險' : '低風險'}
                        </Text>
                      </View>
                      <Text style={[styles.diseaseWarningName, { color: theme.primaryText }]}>
                        {warning.disease}
                      </Text>
                    </View>
                    {warning.warning && (
                      <Text style={[styles.diseaseWarningText, { color: theme.secondaryText }]}>
                        {warning.warning}
                      </Text>
                    )}
                    {warning.ingredientsOfConcern?.length > 0 && (
                      <View style={styles.concernIngredients}>
                        <Text style={[styles.concernIngredientsLabel, { color: '#EF4444' }]}>
                          ⚠️ 需特別注意成分：
                        </Text>
                        <View style={styles.concernIngredientsList}>
                          {warning.ingredientsOfConcern.map((ing: string, i: number) => (
                            <View key={i} style={styles.concernIngredientTag}>
                              <Text style={styles.concernIngredientTagText}>{ing}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                ))}

                {/* 個人化建議 */}
                {result.personalizedRecommendation && (
                  <View style={[styles.personalizedRecommendation, { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' }]}>
                    <View style={styles.personalizedRecommendationHeader}>
                      <Ionicons name="bulb" size={18} color="#3B82F6" />
                      <Text style={styles.personalizedRecommendationTitle}>個人化建議</Text>
                    </View>
                    <Text style={styles.personalizedRecommendationText}>
                      {result.personalizedRecommendation}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* 成分分析 - 整體可收合 */}
            <View style={styles.ingredientSection}>
              <Pressable 
                style={styles.ingredientHeader}
                onPress={() => setIsIngredientsExpanded(!isIngredientsExpanded)}
              >
                <View style={styles.ingredientHeaderLeft}>
                  <Ionicons name="list" size={18} color={theme.primaryText} />
                  <Text style={[styles.ingredientTitle, { color: theme.primaryText }]}>
                    成分分析 ({(result.additives?.length || 0) + 
                      (result.concerningIngredients?.length || 0) + 
                      (result.beneficialIngredients?.length || 0) +
                      (result.allIngredients?.filter((ing: any) => ing.category === 'neutral').length || 0)})
                  </Text>
                </View>
                <Ionicons 
                  name={isIngredientsExpanded ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={theme.secondaryText} 
                />
              </Pressable>

              {isIngredientsExpanded && (
                <>
              {/* 需注意成分 */}
              {((result.additives?.filter((a: any) => a.riskLevel === 'High' || a.riskLevel === 'Medium').length || 0) +
                (result.concerningIngredients?.filter((c: any) => c.riskLevel === 'High' || c.riskLevel === 'Medium').length || 0)) > 0 && (
                <View style={styles.ingredientGroup}>
                  <View style={styles.ingredientGroupHeader}>
                    <View style={styles.ingredientGroupHeaderLeft}>
                      <Ionicons name="warning" size={16} color="#F59E0B" />
                      <Text style={styles.ingredientGroupTitle}>
                        ⚠️ 需注意成分 ({(result.additives?.filter((a: any) => a.riskLevel === 'High' || a.riskLevel === 'Medium').length || 0) +
                          (result.concerningIngredients?.filter((c: any) => c.riskLevel === 'High' || c.riskLevel === 'Medium').length || 0)})
                      </Text>
                    </View>
                  </View>
                  
                  {/* 高風險添加劑和需關注成分 - 合併並排序，High 排在前面 */}
                  {[
                    ...(result.additives?.filter((a: any) => a.riskLevel === 'High' || a.riskLevel === 'Medium').map((a: any) => ({ ...a, type: 'additive' })) || []),
                    ...(result.concerningIngredients?.filter((c: any) => c.riskLevel === 'High' || c.riskLevel === 'Medium').map((c: any) => ({ ...c, type: 'concerning' })) || [])
                  ]
                    .sort((a, b) => {
                      const riskOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
                      return (riskOrder[a.riskLevel] ?? 2) - (riskOrder[b.riskLevel] ?? 2);
                    })
                    .map((item: any, index: number) => (
                    <View key={`warning-item-${index}`} style={[styles.ingredientItem, { backgroundColor: theme.gray50 }]}>
                      <View style={styles.ingredientItemHeader}>
                        <Text style={[styles.ingredientName, { color: theme.primaryText }]}>{item.name}</Text>
                        <View style={styles.badgeContainer}>
                          {item.riskLevel === 'High' ? (
                            <View style={[styles.badge, { backgroundColor: '#FEE2E2' }]}>
                              <Text style={[styles.badgeText, { color: '#DC2626' }]}>注意</Text>
                            </View>
                          ) : (
                            <View style={[styles.badge, { backgroundColor: '#FEF3C7' }]}>
                              <Text style={[styles.badgeText, { color: '#D97706' }]}>適量</Text>
                            </View>
                          )}
                          {item.type === 'additive' && (
                            <>
                              <View style={[styles.badge, { backgroundColor: item.source === 'natural' ? '#D1FAE5' : '#E5E7EB' }]}>
                                <Text style={[styles.badgeText, { color: item.source === 'natural' ? '#059669' : '#4B5563' }]}>
                                  {item.source === 'natural' ? '天然' : '人工'}
                                </Text>
                              </View>
                              <View style={[styles.badge, { backgroundColor: '#E5E7EB' }]}>
                                <Text style={[styles.badgeText, { color: '#4B5563' }]}>添加物</Text>
                              </View>
                            </>
                          )}
                        </View>
                      </View>
                      {item.description && (
                        <Text style={[styles.ingredientDesc, { color: theme.secondaryText }]}>{item.description}</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* 安全成分（完全成分） */}
              {((result.beneficialIngredients?.length || 0) + 
                (result.additives?.filter((a: any) => a.riskLevel === 'Low').length || 0) +
                (result.allIngredients?.filter((ing: any) => ing.category === 'neutral' || ing.category === 'beneficial').length || 0)) > 0 && (
                <View style={styles.ingredientGroup}>
                  <View style={styles.ingredientGroupHeader}>
                    <View style={styles.ingredientGroupHeaderLeft}>
                      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                      <Text style={[styles.ingredientGroupTitle, { color: '#10B981' }]}>
                        ✓ 完全成分 ({(result.beneficialIngredients?.length || 0) + 
                          (result.additives?.filter((a: any) => a.riskLevel === 'Low').length || 0) +
                          (result.allIngredients?.filter((ing: any) => ing.category === 'neutral' || ing.category === 'beneficial').length || 0)})
                      </Text>
                    </View>
                  </View>
                  
                  {/* 有益成分 */}
                  {result.beneficialIngredients?.map((beneficial: any, index: number) => (
                    <View key={`beneficial-${index}`} style={[styles.ingredientItem, { backgroundColor: theme.gray50 }]}>
                      <View style={styles.ingredientItemHeader}>
                        <Text style={[styles.ingredientName, { color: theme.primaryText }]}>{beneficial.name}</Text>
                        <View style={styles.badgeContainer}>
                          <View style={[styles.badge, { backgroundColor: '#D1FAE5' }]}>
                            <Text style={[styles.badgeText, { color: '#065F46' }]}>安全</Text>
                          </View>
                        </View>
                      </View>
                      {beneficial.description && (
                        <Text style={[styles.ingredientDesc, { color: theme.secondaryText }]}>{beneficial.description}</Text>
                      )}
                    </View>
                  ))}
                  
                  {/* 低風險添加劑（天然來源） */}
                  {result.additives?.filter((a: any) => a.riskLevel === 'Low').map((additive: any, index: number) => (
                    <View key={`additive-low-${index}`} style={[styles.ingredientItem, { backgroundColor: theme.gray50 }]}>
                      <View style={styles.ingredientItemHeader}>
                        <Text style={[styles.ingredientName, { color: theme.primaryText }]}>{additive.name}</Text>
                        <View style={styles.badgeContainer}>
                          <View style={[styles.badge, { backgroundColor: '#D1FAE5' }]}>
                            <Text style={[styles.badgeText, { color: '#065F46' }]}>安全</Text>
                          </View>
                          <View style={[styles.badge, { backgroundColor: additive.source === 'natural' ? '#D1FAE5' : '#FEF3C7' }]}>
                            <Text style={[styles.badgeText, { color: additive.source === 'natural' ? '#059669' : '#D97706' }]}>
                              {additive.source === 'natural' ? '天然' : '人工'}
                            </Text>
                          </View>
                          <View style={[styles.badge, { backgroundColor: '#E5E7EB' }]}>
                            <Text style={[styles.badgeText, { color: '#4B5563' }]}>添加物</Text>
                          </View>
                        </View>
                      </View>
                      {additive.description && (
                        <Text style={[styles.ingredientDesc, { color: theme.secondaryText }]}>{additive.description}</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
                </>
              )}
            </View>
          </View>
        )}

        {/* Prompt 改進建議 - 元學習 */}
        {result?.promptImprovementSuggestions && (
          <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <Pressable 
              style={styles.promptImprovementHeader}
              onPress={() => setIsPromptImprovementExpanded(!isPromptImprovementExpanded)}
            >
              <View style={styles.promptImprovementHeaderLeft}>
                <Ionicons name="bulb" size={20} color="#8B5CF6" />
                <Text style={[styles.promptImprovementTitle, { color: theme.primaryText }]}>
                  🧠 Prompt 改進建議
                </Text>
              </View>
              <Ionicons 
                name={isPromptImprovementExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={theme.secondaryText} 
              />
            </Pressable>

            {isPromptImprovementExpanded && (
              <View style={styles.promptImprovementContent}>
                {/* 評分是否合理 + 簡短評估 */}
                <View style={[styles.briefAssessmentBox, { 
                  backgroundColor: result.promptImprovementSuggestions.isScoreReasonable ? '#D1FAE5' : '#FEE2E2',
                  borderColor: result.promptImprovementSuggestions.isScoreReasonable ? '#10B981' : '#EF4444'
                }]}>
                  <View style={styles.assessmentHeader}>
                    <Ionicons 
                      name={result.promptImprovementSuggestions.isScoreReasonable ? "checkmark-circle" : "alert-circle"} 
                      size={24} 
                      color={result.promptImprovementSuggestions.isScoreReasonable ? '#10B981' : '#EF4444'} 
                    />
                    <Text style={[styles.assessmentStatus, { 
                      color: result.promptImprovementSuggestions.isScoreReasonable ? '#065F46' : '#B91C1C' 
                    }]}>
                      {result.promptImprovementSuggestions.isScoreReasonable ? '評分合理' : '評分待優化'}
                    </Text>
                  </View>
                  {result.promptImprovementSuggestions.briefAssessment && (
                    <Text style={[styles.briefAssessmentText, { 
                      color: result.promptImprovementSuggestions.isScoreReasonable ? '#047857' : '#DC2626' 
                    }]}>
                      {result.promptImprovementSuggestions.briefAssessment}
                    </Text>
                  )}
                </View>

                {/* 最重要的改進建議 */}
                {result.promptImprovementSuggestions.topSuggestion && (
                  <View style={[styles.topSuggestionBox, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
                    <View style={styles.topSuggestionHeader}>
                      <Ionicons name="bulb" size={20} color="#D97706" />
                      <Text style={styles.topSuggestionLabel}>💡 最重要的改進建議</Text>
                    </View>
                    <Text style={styles.topSuggestionText}>
                      {result.promptImprovementSuggestions.topSuggestion}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* 原始 API 結果 JSON */}
        {result && (
          <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>🔧 原始 API 結果（JSON）</Text>
            <ScrollView
              style={[styles.resultContainer, { backgroundColor: theme.background }]}
              nestedScrollEnabled
            >
              <Text style={[styles.resultText, { color: theme.primaryText }]}>
                {JSON.stringify(result, null, 2)}
              </Text>
            </ScrollView>
          </View>
        )}

        {/* 轉換後的前端格式 */}
        {frontendResult && (
          <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.primaryText }]}>🔄 轉換後的前端格式（與實際 UI 一致）</Text>
            <ScrollView
              style={[styles.resultContainer, { backgroundColor: theme.background }]}
              nestedScrollEnabled
            >
              <Text style={[styles.resultText, { color: theme.primaryText }]}>
                {JSON.stringify(frontendResult, null, 2)}
              </Text>
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
  },
  languageButtons: {
    flexDirection: "row",
    gap: 8,
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  promptInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 200,
    marginBottom: 12,
  },
  resetButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  imageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  imageButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  imagePreview: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  imagePreviewText: {
    fontSize: 14,
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  testButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    flex: 1,
  },
  resultContainer: {
    maxHeight: 400,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  resultText: {
    fontSize: 12,
    fontFamily: "monospace",
  },
  viewUIButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  viewUIButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // 視覺化預覽樣式
  productName: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  scoreSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  scoreText: {
    fontSize: 40,
    fontWeight: "bold",
  },
  riskLevelText: {
    fontSize: 18,
    fontWeight: "600",
  },
  // 評分說明樣式
  scoreExplanationSection: {
    marginBottom: 16,
  },
  scoreExplanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  scoreExplanationHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  scoreExplanationTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  scoreExplanationContent: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  calculationBox: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  calculationLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: 6,
  },
  calculationText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E40AF",
    fontFamily: "monospace",
  },
  breakdownSection: {
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
  },
  breakdownItem: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  breakdownItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  breakdownItemName: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  breakdownItemPoints: {
    fontSize: 14,
    fontWeight: "700",
  },
  breakdownItemReason: {
    fontSize: 13,
    lineHeight: 18,
  },
  mainFactorsSection: {
    marginBottom: 16,
  },
  mainFactorsTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
  },
  mainFactorItem: {
    flexDirection: "row",
    marginBottom: 6,
  },
  mainFactorBullet: {
    fontSize: 14,
    marginRight: 8,
    color: "#3B82F6",
  },
  mainFactorText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  improvementSection: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  improvementTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#065F46",
    marginBottom: 10,
  },
  improvementItem: {
    flexDirection: "row",
    marginBottom: 6,
  },
  improvementBullet: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
    color: "#10B981",
  },
  improvementText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
    color: "#065F46",
  },
  // Prompt 改進建議樣式
  promptImprovementHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 12,
  },
  promptImprovementHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  promptImprovementTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 8,
  },
  promptImprovementContent: {
    paddingTop: 4,
  },
  // 簡化版 Prompt 改進建議樣式
  briefAssessmentBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  assessmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  assessmentStatus: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  briefAssessmentText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 32,
  },
  topSuggestionBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  topSuggestionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  topSuggestionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#D97706",
    marginLeft: 6,
  },
  topSuggestionText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#92400E",
    lineHeight: 22,
    marginLeft: 26,
  },
  ingredientSection: {
    marginTop: 8,
  },
  ingredientHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  ingredientHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  ingredientTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  ingredientGroup: {
    marginBottom: 16,
  },
  ingredientGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  ingredientGroupHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  ingredientGroupTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 6,
    color: "#F59E0B",
  },
  ingredientItem: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  ingredientItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  ingredientDesc: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  // 個人化設定樣式（變數方式）
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  preferenceSection: {
    marginBottom: 16,
  },
  preferenceLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  preferenceInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  preferenceInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  tagText: {
    fontSize: 14,
    fontWeight: "500",
  },
  selectedDiseasesInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  selectedDiseasesLabel: {
    fontSize: 13,
    marginBottom: 4,
    lineHeight: 20,
  },
  selectedDiseasesHint: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
  // 個人化健康分析樣式
  personalizedSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  personalizedHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  personalizedTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  riskAssessmentCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  riskAssessmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  riskAssessmentOverall: {
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
  },
  riskAssessmentReasoning: {
    fontSize: 14,
    lineHeight: 20,
  },
  diseaseWarningCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  diseaseWarningHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  diseaseWarningBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginRight: 8,
  },
  diseaseWarningBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  diseaseWarningName: {
    fontSize: 16,
    fontWeight: "600",
  },
  diseaseWarningText: {
    fontSize: 14,
    lineHeight: 20,
  },
  concernIngredients: {
    marginTop: 10,
  },
  concernIngredientsLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  concernIngredientsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  concernIngredientTag: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  concernIngredientTagText: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "500",
  },
  personalizedRecommendation: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  personalizedRecommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  personalizedRecommendationTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3B82F6",
    marginLeft: 6,
  },
  personalizedRecommendationText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#1E40AF",
  },
});

