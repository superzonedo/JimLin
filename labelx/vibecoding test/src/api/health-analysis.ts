import { getOpenAIClient } from "./openai";
import { FoodAnalysisResult } from "../types/food";
import { UserPreferences, DiseaseType } from "../types/user";

interface HealthAnalysisInput {
  foodAnalysis: FoodAnalysisResult;
  userPreferences: UserPreferences;
}

export interface HealthAnalysisResult {
  personalizedAdvice: string;
  riskAssessment: {
    overall: "safe" | "caution" | "warning";
    reasoning: string;
  };
  diseaseRisks: Array<{
    disease: string;
    risk: "low" | "moderate" | "high";
    explanation: string;
  }>;
  nutritionAlignment: {
    alignedGoals: string[];
    conflictingGoals: string[];
  };
  actionItems: string[];
  bestForWhom: string | null;
}

interface DiseaseMapping {
  id: DiseaseType;
  chinese: string;
  riskFactors: {
    highSugar?: boolean;
    highSodium?: boolean;
    highFat?: boolean;
    additives?: boolean;
    specific?: string[];
  };
}

const diseaseMappings: Record<DiseaseType, DiseaseMapping> = {
  "kidney-disease": {
    id: "kidney-disease",
    chinese: "Kidney Disease",
    riskFactors: {
      highSodium: true,
      additives: true,
      specific: ["Phosphates", "Artificial additives"],
    },
  },
  "liver-disease": {
    id: "liver-disease",
    chinese: "Fatty Liver",
    riskFactors: {
      highFat: true,
      highSugar: true,
      additives: true,
    },
  },
  "skin-disease": {
    id: "skin-disease",
    chinese: "Acne",
    riskFactors: {
      additives: true,
      specific: ["Artificial colors", "Preservatives"],
    },
  },
  diabetes: {
    id: "diabetes",
    chinese: "Blood Sugar Issues",
    riskFactors: {
      highSugar: true,
      specific: ["Artificial sweeteners", "Simple carbohydrates"],
    },
  },
  hypertension: {
    id: "hypertension",
    chinese: "Blood Pressure Issues",
    riskFactors: {
      highSodium: true,
      additives: true,
    },
  },
  "high-cholesterol": {
    id: "high-cholesterol",
    chinese: "Cholesterol Issues",
    riskFactors: {
      highFat: true,
      specific: ["Saturated fat", "Trans fat"],
    },
  },
  "stomach-sensitivity": {
    id: "stomach-sensitivity",
    chinese: "Stomach Sensitivity",
    riskFactors: {
      additives: true,
      specific: ["Artificial colors", "Preservatives", "High fiber"],
    },
  },
  "metabolic-disease": {
    id: "metabolic-disease",
    chinese: "Metabolic Issues",
    riskFactors: {
      highSugar: true,
      highFat: true,
      highSodium: true,
      additives: true,
    },
  },
};

const getHealthGoalDescriptions = (): Record<string, string> => ({
  "weight-loss": "Weight Loss",
  "muscle-building": "Muscle Building",
  "energy-boost": "Energy Boost",
  "general-wellness": "General Wellness",
  "digestive-health": "Digestive Health",
  "heart-health": "Heart Health",
  "blood-sugar-control": "Blood Sugar Control",
  "cholesterol-management": "Cholesterol Management",
});

const buildPrompt = (
  foodAnalysis: FoodAnalysisResult,
  userPreferences: UserPreferences,
  language: string = "zh-TW"
): string => {
  // Build disease information
  const diseases = [
    ...(userPreferences.diseases || []).map(
      (d) => diseaseMappings[d]?.chinese || d
    ),
    ...(userPreferences.customDiseases || []),
  ];

  // Build health goals information
  const healthGoals = [
    ...(userPreferences.healthGoals || []).map((g) => getHealthGoalDescriptions()[g as string] || g),
    ...(userPreferences.customHealthGoals || []),
  ];

  // Build allergens information
  const allergens = [
    ...(userPreferences.allergens || []),
    ...(userPreferences.customAllergens || []),
  ];

  // Language instruction based on user preference
  const languageInstruction = language === "en"
    ? "**IMPORTANT: You MUST respond in ENGLISH ONLY. All responses, advice, and analysis must be in English.**"
    : language === "zh-CN"
    ? "**重要: 你必须使用简体中文回应。所有回应、建议和分析都必须使用简体中文。**"
    : "**重要: 你必須使用繁體中文回應。所有回應、建議和分析都必須使用繁體中文。**";

  // Extract nutrition data
  const nutritionInfo = foodAnalysis.nutritionData
    ? `- ${language === "en" ? "Sugar" : language === "zh-CN" ? "糖" : "糖"}: ${foodAnalysis.nutritionData.sugar ?? (language === "en" ? "Unknown" : language === "zh-CN" ? "未知" : "未知")}g
- ${language === "en" ? "Sodium" : language === "zh-CN" ? "钠" : "鈉"}: ${foodAnalysis.nutritionData.sodium ?? (language === "en" ? "Unknown" : language === "zh-CN" ? "未知" : "未知")}mg
- ${language === "en" ? "Fat" : language === "zh-CN" ? "脂肪" : "脂肪"}: ${foodAnalysis.nutritionData.fat ?? (language === "en" ? "Unknown" : language === "zh-CN" ? "未知" : "未知")}g
- ${language === "en" ? "Fiber" : language === "zh-CN" ? "纤维" : "纖維"}: ${foodAnalysis.nutritionData.fiber ?? (language === "en" ? "Unknown" : language === "zh-CN" ? "未知" : "未知")}g
- ${language === "en" ? "Protein" : language === "zh-CN" ? "蛋白质" : "蛋白質"}: ${foodAnalysis.nutritionData.protein ?? (language === "en" ? "Unknown" : language === "zh-CN" ? "未知" : "未知")}g
- ${language === "en" ? "Calories" : language === "zh-CN" ? "卡路里" : "卡路里"}: ${foodAnalysis.nutritionData.calories ?? (language === "en" ? "Unknown" : language === "zh-CN" ? "未知" : "未知")}kcal`
    : (language === "en" ? "Nutrition data not provided" : language === "zh-CN" ? "未提供营养数据" : "未提供營養數據");

  // Extract warning ingredients
  const riskLevelText = language === "en" ? "Risk Level" : language === "zh-CN" ? "风险等级" : "風險等級";
  const warningIngredientsText = foodAnalysis.ingredients.warning
    .slice(0, 5) // Limit to top 5
    .map((ing) => `- ${ing.name}（${riskLevelText}: ${ing.riskLevel}）: ${ing.description}`)
    .join("\n");

  const promptTemplates = {
    "en": `You are a professional nutritionist and health advisor. Based on the following user health information and food analysis results, provide in-depth, personalized health recommendations.

${languageInstruction}

【User Health Information】
${diseases.length > 0 ? `Health Issues: ${diseases.join(", ")}` : "No specific health issues"}
${healthGoals.length > 0 ? `Health Goals: ${healthGoals.join(", ")}` : "No specific health goals"}
${allergens.length > 0 ? `Allergens/Foods to Avoid: ${allergens.join(", ")}` : "No known allergens"}

【Scanned Food Information】
Product Name: ${foodAnalysis.productName || "Not identified"}
Health Score: ${foodAnalysis.healthScore}/100 (${foodAnalysis.riskLevel})
Analysis Summary: ${foodAnalysis.summary}

【Nutritional Components】
${nutritionInfo}

【High-Risk Ingredients】
${warningIngredientsText || "No high-risk ingredients detected"}

【Additive Analysis】
${foodAnalysis.additiveAnalysis ? `Detected Additives: ${foodAnalysis.additiveAnalysis.detectedAdditives.map((a) => a.name).join(", ")}` : "No additives detected"}

Please provide detailed health analysis in the following JSON format:
{
  "personalizedAdvice": "Based on the user's specific health issues and goals, give a concise but powerful personalized recommendation (max 150 words)",
  "riskAssessment": {
    "overall": "safe" or "caution" or "warning" (overall risk assessment),
    "reasoning": "Brief explanation of why this assessment was given (max 100 words)"
  },
  "diseaseRisks": [
    {
      "disease": "Disease name",
      "risk": "low" or "moderate" or "high",
      "explanation": "Brief explanation of this food's impact on the disease (max 80 words)"
    }
  ],
  "nutritionAlignment": {
    "alignedGoals": ["Nutritional aspects aligned with user goals"],
    "conflictingGoals": ["Nutritional aspects conflicting with user goals"]
  },
  "actionItems": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "bestForWhom": "Describe what type of people this food is best for. If not suitable for the target user group, use null"
}

【Important Notes】
- ALL responses must be in English ONLY
- Focus on the user's actual health issues, not generic advice
- If the food poses a real risk to the user's health condition, clearly state it
- Avoid excessive warnings, provide balanced advice based on scientific evidence
- Return only JSON, no other explanatory text`,
    "zh-CN": `你是一位专业的营养师和健康顾问。根据以下用户健康信息和食品分析结果，提供深入的个性化健康建议。

${languageInstruction}

【用户健康信息】
${diseases.length > 0 ? `健康问题: ${diseases.join(", ")}` : "无特定健康问题"}
${healthGoals.length > 0 ? `健康目标: ${healthGoals.join(", ")}` : "无特定健康目标"}
${allergens.length > 0 ? `过敏原/避免食物: ${allergens.join(", ")}` : "无已知过敏原"}

【扫描食品信息】
产品名称: ${foodAnalysis.productName || "未识别"}
健康分数: ${foodAnalysis.healthScore}/100 (${foodAnalysis.riskLevel})
分析摘要: ${foodAnalysis.summary}

【营养成分】
${nutritionInfo}

【高风险成分】
${warningIngredientsText || "未检测到高风险成分"}

【添加物分析】
${foodAnalysis.additiveAnalysis ? `检测到的添加物: ${foodAnalysis.additiveAnalysis.detectedAdditives.map((a) => a.name).join(", ")}` : "未检测到添加物"}

请以以下JSON格式提供详细的健康分析:
{
  "personalizedAdvice": "根据用户的具体健康问题和目标，给出简洁但有力的个性化建议（最多150字）",
  "riskAssessment": {
    "overall": "safe" 或 "caution" 或 "warning" (整体风险评估),
    "reasoning": "简要说明为何给出此评估（最多100字）"
  },
  "diseaseRisks": [
    {
      "disease": "疾病名称",
      "risk": "low" 或 "moderate" 或 "high",
      "explanation": "简要说明此食品对该疾病的影响（最多80字）"
    }
  ],
  "nutritionAlignment": {
    "alignedGoals": ["符合用户目标的营养方面"],
    "conflictingGoals": ["与用户目标冲突的营养方面"]
  },
  "actionItems": ["建议1", "建议2", "建议3"],
  "bestForWhom": "描述此食品最适合什么类型的人。如果不适合目标用户群，使用null"
}

【重要说明】
- 所有回应都必须使用简体中文
- 专注于用户的实际健康问题，而不是一般性建议
- 如果食品对用户的健康状况有真实风险，请明确指出
- 避免过度警告，根据科学证据提供平衡的建议
- 只返回JSON，不要其他说明文字`,
    "zh-TW": `你是一位專業的營養師和健康顧問。根據以下用戶健康資訊和食品分析結果，提供深入的個人化健康建議。

${languageInstruction}

【用戶健康資訊】
${diseases.length > 0 ? `健康問題: ${diseases.join(", ")}` : "無特定健康問題"}
${healthGoals.length > 0 ? `健康目標: ${healthGoals.join(", ")}` : "無特定健康目標"}
${allergens.length > 0 ? `過敏原/避免食物: ${allergens.join(", ")}` : "無已知過敏原"}

【掃描食品資訊】
產品名稱: ${foodAnalysis.productName || "未識別"}
健康分數: ${foodAnalysis.healthScore}/100 (${foodAnalysis.riskLevel})
分析摘要: ${foodAnalysis.summary}

【營養成分】
${nutritionInfo}

【高風險成分】
${warningIngredientsText || "未檢測到高風險成分"}

【添加物分析】
${foodAnalysis.additiveAnalysis ? `檢測到的添加物: ${foodAnalysis.additiveAnalysis.detectedAdditives.map((a) => a.name).join(", ")}` : "未檢測到添加物"}

請以以下JSON格式提供詳細的健康分析:
{
  "personalizedAdvice": "根據用戶的具體健康問題和目標，給出簡潔但有力的個人化建議（最多150字）",
  "riskAssessment": {
    "overall": "safe" 或 "caution" 或 "warning" (整體風險評估),
    "reasoning": "簡要說明為何給出此評估（最多100字）"
  },
  "diseaseRisks": [
    {
      "disease": "疾病名稱",
      "risk": "low" 或 "moderate" 或 "high",
      "explanation": "簡要說明此食品對該疾病的影響（最多80字）"
    }
  ],
  "nutritionAlignment": {
    "alignedGoals": ["符合用戶目標的營養方面"],
    "conflictingGoals": ["與用戶目標衝突的營養方面"]
  },
  "actionItems": ["建議1", "建議2", "建議3"],
  "bestForWhom": "描述此食品最適合什麼類型的人。如果不適合目標用戶群，使用null"
}

【重要說明】
- 所有回應都必須使用繁體中文
- 專注於用戶的實際健康問題，而不是一般性建議
- 如果食品對用戶的健康狀況有真實風險，請明確指出
- 避免過度警告，根據科學證據提供平衡的建議
- 只返回JSON，不要其他說明文字`
  };

  return promptTemplates[language as keyof typeof promptTemplates] || promptTemplates["zh-TW"];
};

export const analyzeHealthAlignment = async (
  input: HealthAnalysisInput,
  language: string = "zh-TW"
): Promise<HealthAnalysisResult> => {
  const client = getOpenAIClient();

  try {
    const prompt = buildPrompt(input.foodAnalysis, input.userPreferences, language);

    const systemMessages = {
      "en": "You are an experienced nutritionist and health advisor skilled at providing personalized dietary recommendations based on individual health conditions and goals. RESPOND IN ENGLISH ONLY. All your responses must be in English, not in any other language.",
      "zh-CN": "你是一位经验丰富的营养师和健康顾问，擅长根据个人健康状况和目标提供个性化饮食建议。用简体中文回应。你的所有回应都必须使用简体中文，而不是其他语言。",
      "zh-TW": "你是一位經驗豐富的營養師和健康顧問，擅長根據個人健康狀況和目標提供個人化飲食建議。用繁體中文回應。你的所有回應都必須使用繁體中文，而不是其他語言。"
    };

    const response = await client.chat.completions.create({
      model: "gpt-4o-2024-11-20",
      messages: [
        {
          role: "system",
          content: systemMessages[language as keyof typeof systemMessages] || systemMessages["zh-TW"],
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 2048,
    });

    const responseText = response.choices[0]?.message?.content || "";
    const analysis = parseHealthAnalysisResponse(responseText, language);

    return analysis;
  } catch (error) {
    console.error("Health analysis error:", error);
    const errorMessages = {
      "en": "Health analysis failed. Please try again.",
      "zh-CN": "健康分析失败。请重试。",
      "zh-TW": "健康分析失敗。請重試。"
    };
    throw new Error(errorMessages[language as keyof typeof errorMessages] || errorMessages["zh-TW"]);
  }
};

const parseHealthAnalysisResponse = (content: string, language: string = "zh-TW"): HealthAnalysisResult => {
  try {
    let jsonString = content;

    // Remove markdown code block if present
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonString = codeBlockMatch[1];
    } else {
      // Try to find JSON object
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }
    }

    const analysis: HealthAnalysisResult = JSON.parse(jsonString);
    return analysis;
  } catch (parseError) {
    console.error("Failed to parse health analysis response:", parseError);
    console.error("Raw content:", content);

    // Return default analysis if parsing fails - with multilingual messages
    const errorMessages = {
      "en": {
        advice: "Unable to complete personalized analysis. Please try again later.",
        reasoning: "Analysis service temporarily unavailable"
      },
      "zh-CN": {
        advice: "无法完成个性化分析。请稍后重试。",
        reasoning: "分析服务暂时不可用"
      },
      "zh-TW": {
        advice: "無法完成個人化分析。請稍後重試。",
        reasoning: "分析服務暫時不可用"
      }
    };

    const msg = errorMessages[language as keyof typeof errorMessages] || errorMessages["zh-TW"];

    return {
      personalizedAdvice: msg.advice,
      riskAssessment: {
        overall: "caution",
        reasoning: msg.reasoning,
      },
      diseaseRisks: [],
      nutritionAlignment: {
        alignedGoals: [],
        conflictingGoals: [],
      },
      actionItems: [],
      bestForWhom: null,
    };
  }
};
