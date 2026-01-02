import * as FileSystem from "expo-file-system";
import { getOpenAIClient } from "./openai";
import { FoodAnalysisResult, IngredientAnalysis, NutritionInfo } from "../types/food";
import { detectAdditives, calculateAdditiveDeduction } from "../utils/additiveDetection";
import { detectTextWithVision, looksLikeIngredientList } from "./google-vision";
import { OCRResult, OCRMethod } from "../types/vision";
import { useUserStore } from "../state/userStore";
import { SupportedLanguage } from "../i18n/translations";

interface AnalysisResponse {
  productName?: string;
  healthScore: number;
  riskLevel: "low" | "medium" | "high";
  summary: string;
  recommendation: string;
  safeIngredients: Array<{
    name: string;
    description: string;
    riskScore: number;
    benefits?: string;
  }>;
  warningIngredients: Array<{
    name: string;
    description: string;
    riskScore: number;
    concern?: string;
    eNumber?: string;
  }>;
  nutritionBenefits: Array<{
    name: string;
    riskLevel: "safe" | "moderate" | "warning";
  }>;
  nutritionData?: {
    sugar: number;
    sodium: number;
    fat: number;
    fiber: number;
    protein: number;
    calories?: number;
  };
  topIngredients?: Array<{
    position: number;
    name: string;
    percentage?: string;
    riskLevel: "safe" | "moderate" | "warning";
    importance: string;
  }>;
  specialLabels?: string[];
  allergensWarning?: string[];
}

/**
 * Get language instruction based on user's language preference
 */
const getLanguageInstruction = (language: SupportedLanguage): string => {
  switch (language) {
    case "zh-TW":
      return "**重要: 你必須使用繁體中文回應。所有成分名稱、描述和分析都必須使用繁體中文。不要使用其他語言。**";
    case "zh-CN":
      return "**重要: 你必须使用简体中文回应。所有成分名称、描述和分析都必须使用简体中文。不要使用其他语言。**";
    case "en":
      return "**IMPORTANT: You MUST respond in ENGLISH ONLY. All ingredient names, descriptions, and benefits must be in English. Do NOT use any other language.**";
    default:
      return "**IMPORTANT: You MUST respond in ENGLISH ONLY. All ingredient names, descriptions, and benefits must be in English. Do NOT use any other language.**";
  }
};

/**
 * Analyze extracted text (from Vision OCR) using OpenAI
 * This is the preferred method for better accuracy
 */
const analyzeExtractedText = async (extractedText: string, language: SupportedLanguage = "zh-TW"): Promise<AnalysisResponse> => {
  const client = getOpenAIClient();

  const languageInstruction = getLanguageInstruction(language);

  const prompt = `You are a professional food ingredient analysis expert. Here is the extracted text from a food label using OCR:

【Extracted Label Text】
${extractedText}

${languageInstruction}

Please perform a **comprehensive food ingredient analysis**, covering all of the following aspects:

**Analysis Requirements**:
1. **Product Identification**:
   - Product name, brand, net weight
   - Country of origin/Manufacturer
   - Expiration date

2. **Ingredient List Analysis**:
   - Identify all ingredients (sorted by percentage from highest to lowest)
   - Special attention to top 5 ingredients (highest content)
   - Mark all additives and E-number codes

3. **Additive Risk Assessment**:
   - Identify all food additives with risk levels
   - Pay special attention to carcinogens: Sodium Nitrite (E250), Sodium Benzoate (E211), Artificial colors (E102/E110/E129)
   - High Risk: Trans fats, Hydrogenated oils, Artificial flavorings
   - Moderate Risk: Preservatives, Artificial sweeteners
   - Low Risk: Natural extracts, Natural flavors

4. **Detailed Nutritional Analysis**:
   - Extract all nutritional data per 100g/100ml
   - Key nutrients: Sugar, Sodium, Saturated fat, Fiber, Protein
   - Identify nutritional advantages (high fiber, high protein, low sugar, etc.)
   - Identify nutritional deficiencies (high sugar, high sodium, high saturated fat, etc.)

5. **Ingredient Source Analysis**:
   - Identify natural ingredients
   - Identify artificial/synthetic ingredients
   - Identify questionable or controversial ingredients
   - Detect potential allergens

6. **Special Labels and Claims**:
   - Whether labeled "Sugar-free" "Low-salt" "High-fiber" etc.
   - Whether organic certification or GMO labels present
   - Whether special dietary labels (vegetarian, gluten-free, etc.)

7. **Special Check for Child Products** (if applicable):
   - Whether contains carcinogens
   - Whether contains excessive sugar
   - Whether contains artificial flavors or colors
   - Whether safe for children

Common Food Additives Reference (English/E-numbers):
- Citric Acid (E330)
- Potassium Sorbate (E202)
- Sodium Benzoate (E211)
- Aspartame (E951)
- Allura Red/Red 40 (E129)
- Tartrazine/Yellow 5 (E102)
- Sodium Nitrite (E250)
- Sulfur Dioxide (E220)
- Monosodium Glutamate/MSG (E621)

**High-Risk Additives**:
- Nitrites (E249-E250)
- Artificial colors (E102, E110, E129 etc.)
- Benzoate preservatives (E210-E219)
- Phosphates (E338-E452)
- Artificial sweeteners (E950-E955)

Please return the analysis results in the following JSON format with **detailed results**:
{
  "productName": "Product name",
  "healthScore": Number between 0-100 (based on ingredient health level),
  "riskLevel": "low" or "medium" or "high",
  "summary": "Brief analysis summary including key findings",
  "recommendation": "Detailed health recommendations",
  "safeIngredients": [
    {
      "name": "Ingredient name",
      "description": "Detailed explanation of why it's safe and nutritional value",
      "riskScore": Number between 0-20,
      "benefits": "Health benefits (if any)"
    }
  ],
  "warningIngredients": [
    {
      "name": "Ingredient name",
      "description": "Detailed risk explanation and potential harms",
      "riskScore": Number between 50-100,
      "concern": "Main concern",
      "eNumber": "E-number (if any)"
    }
  ],
  "nutritionBenefits": [
    {"name": "Nutrition benefit", "riskLevel": "safe"}
  ],
  "nutritionData": {
    "sugar": "Sugar in grams",
    "sodium": "Sodium in mg",
    "fat": "Fat in grams",
    "fiber": "Dietary fiber in grams",
    "protein": "Protein in grams",
    "calories": "Calories in kcal (optional)"
  },
  "topIngredients": [
    {
      "position": 1,
      "name": "Ingredient name",
      "percentage": "Percentage (if available)",
      "riskLevel": "safe/moderate/warning",
      "importance": "Why this ingredient is important"
    }
  ],
  "specialLabels": ["Sugar-free", "Organic certified", "Vegetarian", "Gluten-free"],
  "allergensWarning": ["List of potential allergens"]
}

**Important Notes**:
- Must list all identifiable ingredients, including trace ingredients
- If label is unclear, mark as assumptions
- Ingredient order represents content quantity (highest to lowest)
- Especially mark and explain any suspicious or unknown ingredients
- Respond in the language specified above.

Return only valid JSON. No other text.`;

  const systemMessage = language === "en"
    ? "You are a professional food ingredient analysis expert, skilled at identifying food additives from ingredient text lists and assessing health risks."
    : language === "zh-CN"
    ? "你是一位专业的食品成分分析专家,擅长从成分文本列表中识别食品添加剂并评估健康风险。"
    : "你是一位專業的食品成分分析專家,擅長從成分文本列表中識別食品添加劑並評估健康風險。";

  const response = await client.chat.completions.create({
    model: "gpt-4o-2024-11-20",
    messages: [
      {
        role: "system",
        content: systemMessage
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 4096,
  });

  return parseAnalysisResponse(response.choices[0]?.message?.content || "", language);
};

/**
 * Analyze image directly using OpenAI vision (fallback method)
 * Used when Google Vision OCR fails
 */
const analyzeImageWithVision = async (base64Image: string, language: SupportedLanguage = "zh-TW"): Promise<AnalysisResponse> => {
  const client = getOpenAIClient();

  const languageInstruction = getLanguageInstruction(language);

  const prompt = `You are a professional food label OCR and ingredient analysis expert skilled at identifying food additives and nutritional components in various languages.

${languageInstruction}

Please perform a **comprehensive ingredient analysis** of this food label photo:

**Analysis Requirements**:
1. **Product Identification**:
   - Product name, brand, net weight
   - Country of origin/Manufacturer
   - Expiration date

2. **Complete Ingredient List Analysis**:
   - Identify all ingredients (sorted by content from highest to lowest)
   - Special attention to top 5 ingredients
   - Mark all additives and E-number codes

3. **Additive Risk Assessment**:
   - Identify all food additives with risk levels
   - Pay special attention to carcinogens: Sodium Nitrite (E250), Sodium Benzoate (E211), Artificial colors
   - High Risk: Trans fats, Hydrogenated oils, Artificial flavorings
   - Moderate Risk: Preservatives, Artificial sweeteners
   - Low Risk: Natural extracts, Natural flavors

4. **Detailed Nutritional Analysis**:
   - Extract all nutritional data per 100g/100ml
   - Key nutrients: Sugar, Sodium, Saturated fat, Fiber, Protein
   - Identify nutritional advantages and deficiencies

5. **Ingredient Source Analysis**:
   - Identify natural ingredients
   - Identify artificial/synthetic ingredients
   - Identify suspicious or controversial ingredients
   - Detect possible allergens

6. **Special Labels Check**:
   - Whether labeled "Sugar-free", "Low-salt", "High-fiber" etc.
   - Whether organic certification or GMO labels present
   - Whether special dietary labels (vegetarian, gluten-free, etc.)

Common Food Additives Reference:
- Citric Acid/E330, Sodium Benzoate/E211, Aspartame/E951
- Artificial colors: E102, E110, E129, Sodium Nitrite/E250
- Preservatives, sweeteners, emulsifiers, thickeners, etc.

Please return detailed analysis results in the following JSON format:
{
  "productName": "Product name",
  "healthScore": 0-100,
  "riskLevel": "low" or "medium" or "high",
  "summary": "Brief summary including key findings",
  "recommendation": "Detailed health recommendations",
  "safeIngredients": [
    {
      "name": "Ingredient name",
      "description": "Detailed explanation and nutritional value",
      "riskScore": 0-20,
      "benefits": "Health benefits"
    }
  ],
  "warningIngredients": [
    {
      "name": "Ingredient name",
      "description": "Detailed risk explanation",
      "riskScore": 50-100,
      "concern": "Main concern",
      "eNumber": "E-number"
    }
  ],
  "nutritionBenefits": [{"name": "Benefit", "riskLevel": "safe"}],
  "nutritionData": {
    "sugar": "grams",
    "sodium": "mg",
    "fat": "grams",
    "fiber": "grams",
    "protein": "grams",
    "calories": "kcal"
  },
  "topIngredients": [
    {
      "position": 1,
      "name": "Ingredient name",
      "percentage": "Percentage",
      "riskLevel": "safe/moderate/warning",
      "importance": "Why important"
    }
  ],
  "specialLabels": ["Sugar-free", "Organic certified", "Vegetarian"],
  "allergensWarning": ["Possible allergens"]
}

**Important**: Must list all identifiable ingredients, including trace ingredients. Return only valid JSON. No other text.`;

  const systemMessage = language === "en"
    ? "You are a professional food label OCR and ingredient analysis expert skilled at identifying food additives in various languages. RESPOND IN ENGLISH ONLY. All your responses must be in English, not in any other language."
    : language === "zh-CN"
    ? "你是一位专业的食品标签OCR和成分分析专家,擅长识别各种语言的食品添加剂。用简体中文回应。你的所有回应都必须使用简体中文,而不是其他语言。"
    : "你是一位專業的食品標籤OCR和成分分析專家,擅長識別各種語言的食品添加劑。用繁體中文回應。你的所有回應都必須使用繁體中文,而不是其他語言。";

  const response = await client.chat.completions.create({
    model: "gpt-4o-2024-11-20",
    messages: [
      {
        role: "system",
        content: systemMessage
      },
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
            },
          },
        ],
      },
    ],
    max_tokens: 4096,
  });

  return parseAnalysisResponse(response.choices[0]?.message?.content || "", language);
};

/**
 * Parse OpenAI response and extract JSON analysis data
 * Handles markdown code blocks and error cases
 */
const parseAnalysisResponse = (aiContent: string, language: SupportedLanguage = "zh-TW"): AnalysisResponse => {
  console.log("[Parse] AI Response Length:", aiContent.length);
  console.log("[Parse] AI Response Preview:", aiContent.substring(0, 200));

  try {
    let jsonString = aiContent;

    // Remove markdown code block if present
    const codeBlockMatch = aiContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonString = codeBlockMatch[1];
    } else {
      // Try to find JSON object
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }
    }

    const analysisData: AnalysisResponse = JSON.parse(jsonString);

    // Log ingredient counts
    console.log("[Parse] Safe Ingredients:", analysisData.safeIngredients?.length || 0);
    console.log("[Parse] Warning Ingredients:", analysisData.warningIngredients?.length || 0);

    return analysisData;
  } catch (parseError) {
    console.error("[Parse] Failed to parse AI response:", parseError);
    console.error("[Parse] Raw content:", aiContent);

    // Return default analysis if parsing fails - with multilingual messages
    const errorMessages = {
      "zh-TW": {
        summary: "無法完全分析標籤內容",
        recommendation: "請確保照片清晰且包含完整的成分表。建議：1) 靠近標籤 2) 確保光線充足 3) 避免反光 4) 手持穩定",
        failedName: "分析失敗",
        failedDesc: "請重新拍攝更清晰的照片,確保成分表清楚可見"
      },
      "zh-CN": {
        summary: "无法完全分析标签内容",
        recommendation: "请确保照片清晰且包含完整的成分表。建议：1) 靠近标签 2) 确保光线充足 3) 避免反光 4) 手持稳定",
        failedName: "分析失败",
        failedDesc: "请重新拍摄更清晰的照片,确保成分表清楚可见"
      },
      "en": {
        summary: "Unable to fully analyze label content",
        recommendation: "Please ensure the photo is clear and contains the complete ingredient list. Tips: 1) Get close to the label 2) Ensure good lighting 3) Avoid glare 4) Hold steady",
        failedName: "Analysis Failed",
        failedDesc: "Please take a clearer photo ensuring the ingredient list is clearly visible"
      }
    };

    const msg = errorMessages[language] || errorMessages["en"];

    return {
      healthScore: 50,
      riskLevel: "medium",
      summary: msg.summary,
      recommendation: msg.recommendation,
      safeIngredients: [],
      warningIngredients: [
        {
          name: msg.failedName,
          description: msg.failedDesc,
          riskScore: 50,
        },
      ],
      nutritionBenefits: [],
    };
  }
};

export const analyzeFoodLabel = async (imageUri: string, language?: SupportedLanguage): Promise<FoodAnalysisResult> => {
  // Get language from parameter or user store
  const userLanguage = language || useUserStore.getState().preferences.language || "zh-TW";

  const overallStartTime = Date.now();
  let ocrMethod: OCRMethod = "google-vision";
  let ocrResult: OCRResult | null = null;

  try {
    // Read the image file and convert to base64
    const base64Image = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log("=== Starting Food Label Analysis ===");
    console.log("Image size:", base64Image.length, "characters");

    // ===== STAGE 1: OCR TEXT EXTRACTION =====
    // Try Google Cloud Vision API first for better Chinese character recognition
    const ocrStartTime = Date.now();
    
    try {
      console.log("[OCR] Attempting Google Cloud Vision API...");
      ocrResult = await detectTextWithVision(base64Image);
      ocrMethod = "google-vision";
      
      const ocrTime = Date.now() - ocrStartTime;
      console.log(`[OCR] Google Vision succeeded in ${ocrTime}ms`);
      console.log(`[OCR] Detected languages:`, ocrResult.detectedLanguages);
      console.log(`[OCR] Word count:`, ocrResult.wordCount);
      console.log(`[OCR] Confidence:`, ocrResult.confidence);
      console.log(`[OCR] Text preview:`, ocrResult.fullText.substring(0, 150) + "...");

      // Validate that text contains ingredient-related content
      if (!looksLikeIngredientList(ocrResult.fullText)) {
        console.warn("[OCR] Warning: Text may not contain ingredient information");
      }

      // Check if we have sufficient text
      if (ocrResult.fullText.length < 10) {
        const insufficientTextMsg = userLanguage === "en"
          ? "Insufficient text extracted, please ensure photo contains complete ingredient list"
          : userLanguage === "zh-CN"
          ? "提取的文字过少,请确保照片包含完整的成分表"
          : "提取的文字過少,請確保照片包含完整的成分表";
        throw new Error(insufficientTextMsg);
      }

      // Warn user if confidence is low
      if (ocrResult.confidence === "low") {
        console.warn("[OCR] Low confidence detection - results may be inaccurate");
      }

    } catch (visionError: any) {
      // Fallback to OpenAI vision if Google Vision fails
      console.warn("[OCR] Google Vision failed:", visionError.message);
      console.log("[OCR] Falling back to OpenAI vision analysis...");
      ocrMethod = "openai-vision";
      ocrResult = null; // Will use direct image analysis below
    }

    // ===== STAGE 2: INGREDIENT ANALYSIS =====
    const analysisStartTime = Date.now();
    let analysisData: AnalysisResponse;

    if (ocrResult && ocrMethod === "google-vision") {
      // Use extracted text for analysis
      console.log("[Analysis] Analyzing extracted text with OpenAI...");
      analysisData = await analyzeExtractedText(ocrResult.fullText, userLanguage);
    } else {
      // Fallback: Use OpenAI vision to analyze image directly
      console.log("[Analysis] Using OpenAI vision to analyze image directly...");
      analysisData = await analyzeImageWithVision(base64Image, userLanguage);
      ocrMethod = "openai-vision";
    }

    const analysisTime = Date.now() - analysisStartTime;
    const totalTime = Date.now() - overallStartTime;

    console.log(`[Analysis] Completed in ${analysisTime}ms`);
    console.log(`[Total] Processing took ${totalTime}ms`);
    console.log(`[Method] OCR: ${ocrMethod}`);
    console.log("=== Analysis Complete ===");

    // Convert to FoodAnalysisResult format
    const safeIngredients: IngredientAnalysis[] = analysisData.safeIngredients.map((ing) => ({
      name: ing.name,
      riskLevel: "safe" as const,
      riskScore: ing.riskScore,
      description: ing.description,
      category: "safe" as const,
    }));

    const warningIngredients: IngredientAnalysis[] = analysisData.warningIngredients.map((ing) => ({
      name: ing.name,
      riskLevel: ing.riskScore > 70 ? ("warning" as const) : ("moderate" as const),
      riskScore: ing.riskScore,
      description: ing.description,
      category: "warning" as const,
    }));

    const nutritionBenefits: NutritionInfo[] = analysisData.nutritionBenefits.map((benefit) => ({
      name: benefit.name,
      riskLevel: benefit.riskLevel,
    }));

    // 添加物檢測和扣分邏輯
    const allIngredients = [...safeIngredients, ...warningIngredients];
    const detectedAdditives = detectAdditives(allIngredients);
    const deductionResult = calculateAdditiveDeduction(detectedAdditives);
    
    // 計算調整後的健康分數
    const originalScore = analysisData.healthScore;
    const adjustedScore = Math.max(0, originalScore - deductionResult.totalDeduction);
    
    // 根據調整後的分數重新評估風險等級
    let adjustedRiskLevel: "low" | "medium" | "high";
    if (adjustedScore >= 71) {
      adjustedRiskLevel = "low";
    } else if (adjustedScore >= 31) {
      adjustedRiskLevel = "medium";
    } else {
      adjustedRiskLevel = "high";
    }
    
    // 如果分數有明顯變化（超過10分），更新摘要
    let adjustedSummary = analysisData.summary;
    if (deductionResult.totalDeduction > 10) {
      const deductionText = userLanguage === "en"
        ? ` (score adjusted -${deductionResult.totalDeduction} due to additives)`
        : userLanguage === "zh-CN"
        ? `（因添加物调整评分 -${deductionResult.totalDeduction}分）`
        : `（因添加物調整評分 -${deductionResult.totalDeduction}分）`;
      adjustedSummary += deductionText;
    }

    const result: FoodAnalysisResult = {
      id: Date.now().toString(),
      imageUri,
      timestamp: new Date(),
      productName: analysisData.productName || undefined,
      healthScore: adjustedScore,
      riskLevel: adjustedRiskLevel,
      summary: adjustedSummary,
      recommendation: analysisData.recommendation,
      ingredients: {
        safe: safeIngredients,
        warning: warningIngredients,
      },
      nutritionBenefits,
      nutritionData: analysisData.nutritionData || undefined,
      additiveAnalysis: deductionResult.totalDeduction > 0 ? {
        detectedAdditives: deductionResult.breakdown.map(item => ({
          name: item.name,
          englishName: item.englishName,
          eNumber: item.eNumber,
          riskLevel: item.riskLevel,
          deductionPoints: item.points,
          description: item.description,
          category: item.category,
        })),
        totalDeduction: deductionResult.totalDeduction,
        originalScore,
        adjustedScore,
      } : undefined,
    };

    return result;
  } catch (error) {
    console.error("Food analysis error:", error);
    const errorMsg = userLanguage === "en"
      ? "Analysis failed, please try again"
      : userLanguage === "zh-CN"
      ? "分析失败,请重试"
      : "分析失敗,請重試";
    throw new Error(errorMsg);
  }
};
