const {onRequest} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");
const {GoogleGenAI, Type} = require("@google/genai");
const multer = require("multer");
const admin = require("firebase-admin");

// 初始化 Firebase Admin（如果尚未初始化）
if (!admin.apps.length) {
  admin.initializeApp();
}

// 獲取 Firestore 實例
const db = admin.firestore();

// 導入工具函數
const {uploadImageToStorage} = require("./utils/imageStorage");
const {getOrCreateUser, updateCustomizedUsers} = require("./utils/subscriptionCheck");

// 定義 secret（Firebase Functions v2 的安全方式）
const geminiApiKey = defineSecret("GEMINI_API_KEY");

const MODEL = "gemini-2.0-flash-001";

/**
 * 根據語言生成響應 Schema
 * @param {string} language - 語言代碼
 * @return {object} 響應 Schema
 */
function generateResponseSchema(language = "en") {
  const productNameDescriptions = {
    "zh-TW": "從圖片/包裝識別的完整繁體中文產品名稱（若無中文則譯名+原文）。必須使用繁體中文，不要使用簡體中文或英文。",
    "zh-CN": "从图片/包装识别的完整简体中文产品名称（若无中文则译名+原文）。必须使用简体中文，不要使用繁体中文或英文。",
    "en": "Complete product name in English identified from the image/packaging (if no English, use translation + original). MUST be in English only.",
  };

  return {
    type: Type.OBJECT,
    properties: {
      productName: {
        type: Type.STRING,
        description: productNameDescriptions[language] || productNameDescriptions["en"],
      },
      productEmoji: { type: Type.STRING },
      productType: { type: Type.STRING, description: "產品類型，用於情境規則和豁免機制。可選值：general（一般）| infant_formula（嬰兒配方奶粉）| baby_food（嬰兒食品）| medical_nutrition（醫療營養品）| dietary_supplement（膳食補充劑）| traditional（傳統食品）| child（兒童食品）| beverage（飲料）| snack（零食）| dairy（乳製品）| cereal（穀物）| processed_meat（加工肉品）" },
      markets: { type: Type.ARRAY, description: "標示語言推測的市場/地區（如 AU/NZ, US, EU, CN）。", items: { type: Type.STRING } },
      summary: { type: Type.STRING },
      healthScore: { type: Type.NUMBER, description: "健康分數 (1-100)，根據核心評分演算法計算" },
      verdictHeadline: { type: Type.STRING, description: "一句話總結，用於快速理解產品健康狀況" },
      quickTags: { type: Type.ARRAY, description: "快速標籤陣列，用於UI快速顯示關鍵資訊", items: { type: Type.STRING } },
      healthProsCons: {
        type: Type.OBJECT,
        description: "產品優缺點分析",
        properties: {
          pros: { type: Type.ARRAY, description: "產品優點（1-2個）", items: { type: Type.STRING } },
          cons: { type: Type.ARRAY, description: "產品缺點（1-3個）", items: { type: Type.STRING } },
        },
        required: ["pros", "cons"],
      },
      dataQuality: { type: Type.STRING, enum: ["high", "medium", "low"] },
      missingFields: { type: Type.ARRAY, items: { type: Type.STRING } },
      assumptions: { type: Type.ARRAY, items: { type: Type.STRING } },
      confidence: { type: Type.NUMBER, description: "0-1 對整體判斷的信心。" },
      additives: {
        type: Type.ARRAY,
        description: "食品添加物（E 編碼或法規定義之添加物）。",
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING }, // colorant, preservative, sweetener, flavor enhancer...
            riskLevel: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
            description: { type: Type.STRING },
            potentialHarm: { type: Type.STRING },
            carcinogenicity: { type: Type.STRING, enum: ["Group 1", "2A", "2B", "None", "Unknown"] },
            regulatoryNote: { type: Type.STRING }, // e.g. 'EU limit x mg/kg', 'Restricted in ...'
            positionWeight: { type: Type.NUMBER }, // 0.4~1.0 由成分排序/百分比估算
            contextUse: { type: Type.STRING, enum: ["traditional", "industrial", "unknown"] }, // 發酵/傳統脈絡豁免判斷
          },
          required: ["name", "category", "riskLevel", "description", "potentialHarm", "carcinogenicity", "positionWeight"],
        },
      },
      beneficialIngredients: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            benefits: { type: Type.STRING },
            positionWeight: { type: Type.NUMBER },
          },
          required: ["name", "description", "benefits"],
        },
      },
      concerningIngredients: {
        type: Type.ARRAY,
        description: "非添加劑但具營養/健康疑慮者",
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            riskLevel: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
            description: { type: Type.STRING },
            concerns: { type: Type.STRING },
            positionWeight: { type: Type.NUMBER },
          },
          required: ["name", "riskLevel", "description", "concerns"],
        },
      },
      allIngredients: {
        type: Type.ARRAY,
        description: "完整的成分列表（按標籤上的順序，從多到少）",
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "成分名稱" },
            position: { type: Type.NUMBER, description: "在成分表中的位置（從1開始）" },
            category: { type: Type.STRING, description: "成分類別：additive（添加劑）、beneficial（有益）、concerning（需關注）、neutral（中性/一般成分）" },
            isAdditive: { type: Type.BOOLEAN, description: "是否為添加劑" },
            description: { type: Type.STRING, description: "成分說明（可選）" },
          },
          required: ["name", "position", "category"],
        },
      },
      nutritionPer100: {
        type: Type.OBJECT,
        description: "每100g/100mL 估算，缺資料則填 null。",
        properties: {
          energyKcal: { type: Type.NUMBER },
          sugarG: { type: Type.NUMBER },
          sodiumMg: { type: Type.NUMBER },
          satFatG: { type: Type.NUMBER },
          transFatG: { type: Type.NUMBER },
          fiberG: { type: Type.NUMBER },
          proteinG: { type: Type.NUMBER },
        },
      },
      novaClass: { type: Type.NUMBER, description: "1~4 的 NOVA 加工程度估計。" },
      trafficLights: {
        type: Type.OBJECT,
        description: "紅綠燈：'red'|'amber'|'green'",
        properties: {
          sugar: { type: Type.STRING },
          sodium: { type: Type.STRING },
          satFat: { type: Type.STRING },
          fiber: { type: Type.STRING },
        },
      },
      childSpecificWarnings: { type: Type.ARRAY, items: { type: Type.STRING } },
      // 個人化健康風險評估（新結構 - 僅在用戶有個人化設定時生成）
      personalizedRiskAssessment: {
        type: Type.OBJECT,
        description: "針對用戶健康狀況的整體風險評估",
        properties: {
          overall: { type: Type.STRING, enum: ["safe", "caution", "warning"], description: "整體安全評估：safe（相對安全）、caution（謹慎食用）、warning（建議避免）" },
          reasoning: { type: Type.STRING, description: "評估理由說明，詳細解釋為什麼對用戶的健康狀況、目標和過敏原是安全/有風險的" },
        },
        required: ["overall", "reasoning"],
      },
      diseaseSpecificWarnings: {
        type: Type.ARRAY,
        description: "針對每種疾病/健康目標/過敏原的具體警告",
        items: {
          type: Type.OBJECT,
          properties: {
            disease: { type: Type.STRING, description: "疾病/目標/過敏原名稱" },
            riskLevel: { type: Type.STRING, enum: ["low", "moderate", "high"], description: "風險等級" },
            warning: { type: Type.STRING, description: "具體警告或建議，使用白話文解釋" },
            ingredientsOfConcern: { type: Type.ARRAY, items: { type: Type.STRING }, description: "需注意的成分名稱列表" },
          },
          required: ["disease", "riskLevel", "warning"],
        },
      },
      personalizedRecommendation: {
        type: Type.STRING,
        description: "針對用戶的個人化綜合建議，包含替代方案建議",
      },
    },
    required: [
      "productName", "productEmoji", "summary", "healthScore", "verdictHeadline", "quickTags", "healthProsCons",
      "additives", "beneficialIngredients", "concerningIngredients", "allIngredients",
      "dataQuality", "assumptions", "confidence",
      "nutritionPer100", "trafficLights", "novaClass",
    ],
  };
}

/**
 * 根據語言和用戶偏好生成分析提示詞
 * @param {string} language - 語言代碼: 'zh-TW', 'zh-CN', 'en'
 * @param {object|null} userPreferences - 用戶個人化健康偏好設定
 * @return {string} 分析提示詞
 */
function generateAnalysisPrompt(language = "en", userPreferences = null) {
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

  const basePrompt = `你是「食品安全與營養學專家（最高級證照持有者）」，請分析圖片中的食品標籤，輸出JSON格式。

${languageInstructions[language] || languageInstructions["en"]}

**核心評分演算法 (HealthScore - 總分 100)：**
請嚴格執行以下扣分邏輯得出 \`healthScore\`：
- **基礎分**：100分
- **加工等級 (NOVA)**：NOVA 4 (超加工) 扣 20分；NOVA 3 扣 10分；NOVA 2 和 NOVA 1 不扣分
- **營養紅綠燈**：每出現一個「紅燈」扣 10分（糖、鈉、飽和脂肪、纖維四個指標中，每個紅燈扣10分）
- **添加劑風險**：每個 High Risk 扣 10分；Medium Risk 扣 5分；Low Risk 不扣分
- **個人化衝突**：若含有用戶過敏原或疾病禁忌成分，該項直接標示警告，並額外扣 15分（僅在用戶有個人化設定時）
- **最低分**：1分（確保分數客觀且具備跨產品的可比性）
- **計算方式**：healthScore = max(1, 100 - NOVA扣分 - 紅綠燈扣分 - 添加劑扣分 - 個人化衝突扣分)

**🍼 特殊食品類別豁免機制（非常重要）：**
以下食品類別需要使用**調整後的評分標準**，不能用一般加工食品的標準來評判：

1. **嬰兒配方奶粉 / 嬰兒食品 (productType: infant_formula, baby_food)**
   - **NOVA 豁免**：嬰兒配方奶粉雖技術上屬 NOVA 4，但因其是專門設計的營養完整食品，NOVA 扣分減半（扣 10 分而非 20 分）
   - **必要營養強化成分不扣分**：維生素（A、D、E、K、C、B群）、礦物質（鈣、鐵、鋅）、DHA、AA、益生菌、益生元、核苷酸等，這些是模擬母乳的必要成分
   - **必要乳化劑/穩定劑不扣分**：大豆卵磷脂、單雙甘油脂肪酸酯等，這些是確保配方穩定性的必要成分
   - **乳糖特別處理**：嬰兒配方奶粉中的乳糖是主要碳水化合物來源，不應列為「高糖」扣分
   - **評分基準調整**：嬰兒配方奶粉符合國家標準且無有害添加劑時，基礎分應為 85-95 分

2. **醫療用特殊營養品 (productType: medical_nutrition)**
   - 這類產品是為特定健康需求設計的，NOVA 扣分豁免
   - 必要的營養強化成分不扣分

3. **膳食補充劑 / 保健食品 (productType: dietary_supplement)**
   - 維生素、礦物質等補充劑不應按一般食品標準評分
   - 重點評估是否含有有害成分，而非加工程度

4. **傳統食品 (productType: traditional)**
   - 醬油、味噌、起司、發酵食品等傳統高鈉食品：鈉含量紅燈不扣分（但仍需提醒）
   - 傳統發酵工藝使用的菌種和酵素不視為「添加劑」

**判斷 productType 的關鍵字：**
- infant_formula：嬰兒配方奶粉、嬰幼兒配方、初生嬰兒奶粉、較大嬰兒配方、幼兒成長配方
- baby_food：嬰兒米糊、嬰兒副食品、寶寶粥、嬰兒果泥
- medical_nutrition：營養補充液、腸道營養配方、特殊醫學用途配方
- dietary_supplement：維生素、礦物質補充劑、魚油、益生菌膠囊
- traditional：醬油、味噌、納豆、泡菜、起司、酸奶、紅酒醋

**輸出 JSON 結構優化（必須精準生成以下欄位以利 UI 呈現）：**
- **healthScore**: 數字 (1-100)，根據上述評分演算法計算
- **verdictHeadline**: 一句話總結（${languageName}），例如：「高鈉超加工零食，高血壓患者請避開」或「天然全穀物，營養豐富可放心食用」
- **quickTags**: 陣列（${languageName}），例如：["高鈉", "含致癌色素", "超加工", "含過敏原"] 或 ["全穀物", "高纖維", "無添加糖"]
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

**添加劑 (additives) - 只標記人工合成：**
- **添加劑判定（嚴格識別）**：
  * 嚴格識別「E 編碼」與常見化學名稱（如：5'-次黃嘌呤核苷磷酸二鈉、焦糖色素、羧甲基纖維素鈉）
  * 區分「天然提取」與「人工合成」，人工合成應給予較高風險評估
  * 對於複合調味料中的添加劑，必須單獨識別並列出
- 致癌物: 亞硝酸鈉(E250)、苯甲酸鈉(E211)、阿斯巴甜(E951)、人工色素(E102/E110/E124) → carcinogenicity: Group 1/2A/2B, riskLevel: High
- 高風險: 反式脂肪、氫化油、人工香精 → riskLevel: High  
- 中等風險: 人工防腐劑、人工甜味劑 → riskLevel: Medium
- 低風險: 天然提取物(維生素C/E)、天然香料 → riskLevel: Low
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
  * 高糖成分：糖、蔗糖、果糖、葡萄糖、高果糖玉米糖漿、精製糖等（過量攝取需注意）
  * 高鈉成分：鹽、食鹽、氯化鈉、鈉含量高的調味料等（過量攝取需注意）
  * 高飽和脂肪：棕櫚油、椰子油、氫化油、反式脂肪等（過量攝取需注意）
  * 精製碳水化合物：白麵粉、精製澱粉等（過量攝取需注意）
- 風險等級判斷：
  * 兒童食品: 致癌物/反式脂肪/人工香精任何含量都危險 → High
  * 一般食品: 反式脂肪/高果糖漿(>10%) → High, 精製糖(>15%)/高鈉(>600mg) → Medium, 天然糖分(<10%)/適量鈉(<300mg) → Low
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

**NOVA加工程度 (novaClass)：**
- 1: 未加工/最少加工
- 2: 烹飪配料  
- 3: 加工食品
- 4: 超加工食品

**紅綠燈 (trafficLights)：**
- 糖: 固體>22.5g=紅, 飲料>11g=紅, 中間=黃, 低=綠
- 鈉: >600mg=紅, >120mg=黃, 否則綠
- 飽和脂肪: >5g=紅, >1.5g=黃
- 纖維: <3g=紅, <6g=黃, ≥6g=綠

**兒童特別警告 (childSpecificWarnings)：**
- 含咖啡因不建議兒童飲用（${languageName}）
- <1歲不宜食用蜂蜜（${languageName}）
- 含人工甜味劑對味覺培養的影響（${languageName}）

**原則：天然成分不扣分，兒童食品更嚴格，傳統食品考慮文化背景，成分排序影響權重**

**記住：所有文字內容都必須使用 ${languageName}。**

**最後提醒：**
- healthScore 必須根據上述評分演算法嚴格計算，確保客觀且具備跨產品的可比性
- verdictHeadline 必須是一句話總結，讓用戶在1秒內就能抓到重點
- quickTags 必須精準反映產品的關鍵健康特徵（優點和缺點）
- healthProsCons 必須客觀列出產品的優缺點，幫助用戶快速決策
- 所有個人化建議必須使用白話文，避免過多專業術語

輸出純JSON，無額外文字。`;

  // 添加個人化健康設定指引（僅在用戶有設定時）
  let personalizedSection = "";

  if (userPreferences) {
    const diseases = [
      ...(userPreferences.diseases || []),
      ...(userPreferences.customDiseases || []),
    ];
    const healthGoals = [
      ...(userPreferences.healthGoals || []),
      ...(userPreferences.customHealthGoals || []),
    ];
    const allergens = [
      ...(userPreferences.allergens || []),
      ...(userPreferences.customAllergens || []),
    ];

    // 檢查是否有任何設定
    if (diseases.length > 0 || healthGoals.length > 0 || allergens.length > 0) {
      const personalizedInstructions = {
        "zh-TW": `

**【個人化健康設定 - 重要】**
${diseases.length > 0 ? `用戶健康狀況：${diseases.join("、")}` : "無特定健康狀況"}
${healthGoals.length > 0 ? `用戶健康目標：${healthGoals.join("、")}` : "無特定健康目標"}
${allergens.length > 0 ? `用戶過敏原/避免食物：${allergens.join("、")}` : "無已知過敏原"}

**分析中必須包含：**
1. **personalizedRiskAssessment** (物件): 個人化風險評估
   - overall: "safe" | "caution" | "warning" - 對此用戶的整體安全性
   - reasoning: 詳細說明為什麼此食品對用戶的健康狀況、目標和過敏原是安全/有風險的，使用白話文
2. **diseaseSpecificWarnings** (陣列): 針對每種疾病/健康目標/過敏原的具體警告
   - disease: 疾病/目標/過敏原名稱
   - riskLevel: "low" | "moderate" | "high"
   - warning: 具體警告或建議，使用白話文
   - ingredientsOfConcern: 有問題的成分名稱陣列
3. **personalizedRecommendation** (字串): 針對此用戶的個人化綜合建議，包含替代方案

**根據用戶設定的分析要求：**
${diseases.length > 0 ? `
針對用戶的健康狀況（${diseases.join("、")}），特別注意：
- 可能加重這些狀況的成分
- 與疾病管理衝突的營養數值
- 提供具體的攝入建議或避免建議
- 使用白話文解釋風險，例如：「這會讓你的血壓難以控制」而不是「影響滲透壓」
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
- 如含有過敏原，標記為 high 風險
- 在 summary 開頭明確警告過敏原存在
` : ""}

**重要：所有個人化建議必須使用白話文，避免過多專業術語，讓用戶能立即理解並採取行動。**
`,
        "zh-CN": `

**【个人化健康设定 - 重要】**
${diseases.length > 0 ? `用户健康状况：${diseases.join("、")}` : "无特定健康状况"}
${healthGoals.length > 0 ? `用户健康目标：${healthGoals.join("、")}` : "无特定健康目标"}
${allergens.length > 0 ? `用户过敏原/避免食物：${allergens.join("、")}` : "无已知过敏原"}

**分析中必须包含：**
1. **personalizedRiskAssessment** (对象): 个人化风险评估
   - overall: "safe" | "caution" | "warning" - 对此用户的整体安全性
   - reasoning: 详细说明为什么此食品对用户的健康状况、目标和过敏原是安全/有风险的，使用白话文
2. **diseaseSpecificWarnings** (数组): 针对每种疾病/健康目标/过敏原的具体警告
   - disease: 疾病/目标/过敏原名称
   - riskLevel: "low" | "moderate" | "high"
   - warning: 具体警告或建议，使用白话文
   - ingredientsOfConcern: 有问题的成分名称数组
3. **personalizedRecommendation** (字符串): 针对此用户的个人化综合建议，包含替代方案

**根据用户设定的分析要求：**
${diseases.length > 0 ? `
针对用户的健康状况（${diseases.join("、")}），特别注意：
- 可能加重这些状况的成分
- 与疾病管理冲突的营养数值
- 提供具体的摄入建议或避免建议
- 使用白话文解释风险，例如：「这会让你的血压难以控制」而不是「影响渗透压」
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
- 如含有过敏原，标记为 high 风险
- 在 summary 开头明确警告过敏原存在
` : ""}

**重要：所有个人化建议必须使用白话文，避免过多专业术语，让用户能立即理解并采取行动。**
`,
        "en": `

**【PERSONALIZED HEALTH SETTINGS - IMPORTANT】**
${diseases.length > 0 ? `User's health conditions: ${diseases.join(", ")}` : "No specific health conditions"}
${healthGoals.length > 0 ? `User's health goals: ${healthGoals.join(", ")}` : "No specific health goals"}
${allergens.length > 0 ? `User's allergens/foods to avoid: ${allergens.join(", ")}` : "No known allergens"}

**MUST include in analysis:**
1. **personalizedRiskAssessment** (object): Personalized risk assessment
   - overall: "safe" | "caution" | "warning" - Overall safety for this user
   - reasoning: Detailed explanation of why this food is safe/risky for the user's conditions, goals, and allergens, using plain language
2. **diseaseSpecificWarnings** (array): Specific warnings for each disease/health goal/allergen
   - disease: Disease/goal/allergen name
   - riskLevel: "low" | "moderate" | "high"
   - warning: Specific warning or advice, using plain language
   - ingredientsOfConcern: Array of ingredient names that are problematic
3. **personalizedRecommendation** (string): Personalized comprehensive recommendation for this user, including alternatives

**Analysis requirements based on user settings:**
${diseases.length > 0 ? `
For user's health conditions (${diseases.join(", ")}), pay special attention to:
- Ingredients that may worsen these conditions
- Nutritional values that conflict with disease management
- Provide specific intake recommendations or avoidance advice
- Use plain language to explain risks, e.g., "this will make your blood pressure hard to control" instead of "affects osmotic pressure"
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
- Mark as HIGH risk if allergen is present
- Clearly warn about allergen presence at beginning of summary
` : ""}

**IMPORTANT: All personalized recommendations must use plain language, avoid excessive technical terms, so users can immediately understand and take action.**
`,
      };

      personalizedSection = personalizedInstructions[language] || personalizedInstructions["en"];
    }
  }

  return basePrompt + personalizedSection;
}

// 配置 multer 使用內存存儲
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB 限制
  },
});

/**
 * 使用 multer 解析 form-data 格式的請求，提取上傳的文件並轉換為 base64
 * @param {Object} request Express 請求對象
 * @param {Object} response Express 響應對象
 * @return {Promise<{imageBase64: string, mimeType: string}>} 包含 base64 圖片和 MIME 類型的對象
 */
function parseFormData(request, response) {
  return new Promise((resolve, reject) => {
    // 使用 multer 的 any 方法處理任意字段名的文件上傳
    const uploadAny = upload.any();

    uploadAny(request, response, (err) => {
      if (err) {
        reject(new Error(`文件上傳錯誤: ${err.message}`));
        return;
      }

      // 檢查是否有文件上傳
      // multer.any() 會將所有文件放在 request.files 數組中
      const files = request.files || [];
      if (files.length === 0) {
        reject(new Error("未找到上傳的文件，請確保在 form-data 中包含文件字段"));
        return;
      }

      // 使用第一個上傳的文件
      const file = files[0];
      if (!file) {
        reject(new Error("文件對象無效"));
        return;
      }

      // 將文件緩衝區轉換為 base64
      const base64 = file.buffer.toString("base64");
      const mimeType = file.mimetype || "image/jpeg";

      resolve({
        imageBase64: base64,
        mimeType: mimeType,
      });
    });
  });
}

/**
 * 驗證 Firebase Auth Token
 * @param {object} request - Express request 對象
 * @return {Promise<{userId: string, email: string}|null>}
 */
async function verifyAuthToken(request) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return {
      userId: decodedToken.uid,
      email: decodedToken.email || "",
    };
  } catch (error) {
    console.error("Token 驗證失敗:", error);
    return null;
  }
}

/**
 * 計算最高風險等級和風險分數
 * @param {object} productData - 產品數據
 * @return {{maxRiskLevel: string, riskScore: number}}
 */
function calculateRiskMetrics(productData) {
  let maxRiskLevel = "Low";
  let riskScore = 0;

  // 檢查添加劑
  if (productData.additives && productData.additives.length > 0) {
    for (const additive of productData.additives) {
      if (additive.riskLevel === "High") {
        maxRiskLevel = "High";
        riskScore += 30 * (additive.positionWeight || 0.5);
      } else if (additive.riskLevel === "Medium" && maxRiskLevel !== "High") {
        maxRiskLevel = "Medium";
        riskScore += 15 * (additive.positionWeight || 0.5);
      } else {
        riskScore += 5 * (additive.positionWeight || 0.5);
      }
    }
  }

  // 檢查關注成分
  if (productData.concerningIngredients && productData.concerningIngredients.length > 0) {
    for (const ingredient of productData.concerningIngredients) {
      if (ingredient.riskLevel === "High") {
        maxRiskLevel = "High";
        riskScore += 25 * (ingredient.positionWeight || 0.5);
      } else if (ingredient.riskLevel === "Medium" && maxRiskLevel !== "High") {
        maxRiskLevel = "Medium";
        riskScore += 12 * (ingredient.positionWeight || 0.5);
      }
    }
  }

  // 限制風險分數在 0-100 之間
  riskScore = Math.min(100, Math.max(0, riskScore));

  return {maxRiskLevel, riskScore};
}

const uploadImage = onRequest(
    {
      region: "us-central1",
      memory: "1GiB", // 增加記憶體以處理圖片
      secrets: [geminiApiKey], // 指定需要使用的 secrets
      cors: true, // 啟用 CORS
    },
    async (request, response) => {
      // 設置 CORS headers
      response.set("Access-Control-Allow-Origin", "*");
      response.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      response.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

      // 處理 OPTIONS 請求
      if (request.method === "OPTIONS") {
        response.status(204).send("");
        return;
      }

      // 開發模式：允許通過查詢參數跳過認證（僅用於測試）
      const devMode = request.query.devMode === "true";
      let userId;
      let email;

      if (devMode) {
        // 開發模式：使用查詢參數中的 userId
        userId = request.query.userId || "test-user-001";
        email = request.query.email || `${userId}@test.com`;
        console.log("⚠️  開發模式啟用，跳過認證檢查，使用 userId:", userId);
      } else {
        // 正常模式：驗證認證
        const authInfo = await verifyAuthToken(request);
        if (!authInfo) {
          response.status(401).json({
            error: "未授權",
            message: "請提供有效的 Firebase Auth Token",
            hint: "開發測試可以使用 ?devMode=true&userId=test-user-001 參數",
          });
          return;
        }
        userId = authInfo.userId;
        email = authInfo.email;
      }

      // 獲取或創建使用者
      const userData = await getOrCreateUser(userId, email);

      // 更新 customizedUsers 集合（如果使用者有偏好設定）
      if (userData.preferences) {
        await updateCustomizedUsers(userId, email, userData.preferences);
      }

      let imageBase64;
      let mimeType;
      let imageBuffer;
      let language = "en"; // 默認語言

      // 檢查 Content-Type 來決定處理方式
      const contentType = request.headers["content-type"] || "";

      if (contentType.includes("multipart/form-data")) {
        // 處理 form-data 格式（文件上傳）
        try {
          const formData = await parseFormData(request, response);
          imageBase64 = formData.imageBase64;
          mimeType = formData.mimeType;
          // 從 form-data 中獲取 language（如果有的話）
          if (request.body && request.body.language) {
            language = request.body.language;
          }
          // 將 base64 轉換為 Buffer
          imageBuffer = Buffer.from(imageBase64, "base64");
        } catch (err) {
          response.status(400).json({
            error: "解析 form-data 失敗",
            details: err.message,
          });
          return;
        }
      } else {
        // 處理 JSON 格式
        if (!request.body) {
          response.status(400).json({
            error: "請求體為空",
            received: "無請求體",
            expected: "包含 imageBase64 和 mime 的 JSON 物件，或使用 form-data 上傳文件",
          });
          return;
        }

        const {imageBase64: jsonImageBase64, mime, language: bodyLanguage} = request.body;

        // 驗證必要參數
        if (!jsonImageBase64) {
          response.status(400).json({
            error: "缺少 imageBase64 參數",
            received: JSON.stringify(request.body),
            expected: {
              imageBase64: "base64 編碼的圖片字串",
              mime: "圖片 MIME 類型（可選，如 image/png, image/jpeg）",
              language: "語言代碼（可選，如 'zh-TW', 'zh-CN', 'en'，默認為 'en'）",
            },
            note: "或使用 form-data 格式直接上傳圖片文件",
          });
          return;
        }

        imageBase64 = jsonImageBase64;
        mimeType = mime;
        if (bodyLanguage) {
          language = bodyLanguage;
        }
      }

      // 處理 mimeType：如果未提供，嘗試從 base64 推斷或使用預設值
      if (!mimeType || mimeType.trim() === "") {
        // 嘗試從 base64 數據推斷 MIME 類型
        if (imageBase64.startsWith("data:")) {
          // 如果是 data URL 格式：data:image/png;base64,...
          const match = imageBase64.match(/^data:([^;]+);base64,/);
          if (match) {
            mimeType = match[1];
          }
        }

        // 如果還是無法確定，使用預設值
        if (!mimeType || mimeType.trim() === "") {
          mimeType = "image/jpeg"; // 預設為 JPEG
        }
      }

      // 清理 base64 數據（移除 data URL 前綴如果存在）
      let cleanBase64 = imageBase64;
      if (imageBase64.startsWith("data:")) {
        const base64Match = imageBase64.match(/^data:[^;]+;base64,(.+)$/);
        if (base64Match) {
          cleanBase64 = base64Match[1];
        }
      }

      // 將 base64 轉換為 Buffer（用於 Storage 上傳）
      if (!imageBuffer) {
        imageBuffer = Buffer.from(cleanBase64, "base64");
      }

      try {
        // 驗證語言參數（已在上面獲取）
        const validLanguages = ["zh-TW", "zh-CN", "en"];
        const selectedLanguage = validLanguages.includes(language) ? language : "en";

        console.log(`🌐 使用語言: ${selectedLanguage}`);

        // 獲取用戶偏好設定（檢查是否有任何個人化設定）
        const userPreferences = userData.preferences && (
          (userData.preferences.diseases && userData.preferences.diseases.length > 0) ||
          (userData.preferences.customDiseases && userData.preferences.customDiseases.length > 0) ||
          (userData.preferences.healthGoals && userData.preferences.healthGoals.length > 0) ||
          (userData.preferences.customHealthGoals && userData.preferences.customHealthGoals.length > 0) ||
          (userData.preferences.allergens && userData.preferences.allergens.length > 0) ||
          (userData.preferences.customAllergens && userData.preferences.customAllergens.length > 0)
        ) ? userData.preferences : null;

        if (userPreferences) {
          console.log(`👤 檢測到用戶個人化設定:`, {
            diseases: [...(userPreferences.diseases || []), ...(userPreferences.customDiseases || [])],
            healthGoals: [...(userPreferences.healthGoals || []), ...(userPreferences.customHealthGoals || [])],
            allergens: [...(userPreferences.allergens || []), ...(userPreferences.customAllergens || [])],
          });
        } else {
          console.log(`👤 用戶無個人化設定，使用預設分析模式`);
        }

        // 在函數內部初始化 GoogleGenAI，確保可以訪問 secret
        const ai = new GoogleGenAI({
          apiKey: geminiApiKey.value(),
          vertexai: false, // 明確指定不使用 Vertex AI，使用 API Key 模式
        });

        // 根據語言和用戶偏好生成動態 prompt 和 schema
        const dynamicPrompt = generateAnalysisPrompt(selectedLanguage, userPreferences);
        const dynamicSchema = generateResponseSchema(selectedLanguage);

        // #region agent log
        fetch("http://127.0.0.1:7242/ingest/6bc14386-27b1-4e76-a5da-311d10b83d04", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({location: "uploadImage.js:849", message: "Schema validation - checking required fields", data: {requiredFields: dynamicSchema.required, hasHealthScore: !!dynamicSchema.properties.healthScore, hasVerdictHeadline: !!dynamicSchema.properties.verdictHeadline, hasQuickTags: !!dynamicSchema.properties.quickTags, hasHealthProsCons: !!dynamicSchema.properties.healthProsCons}, timestamp: Date.now(), sessionId: "debug-session", runId: "run1", hypothesisId: "A"})}).catch(()=>{});
        // #endregion

        const config = {
          responseMimeType: "application/json",
          responseSchema: dynamicSchema,
          systemInstruction: [{
            text: dynamicPrompt,
          }],
        };
        const contents = [{
          role: "user",
          parts: [
            {inlineData: {data: cleanBase64, mimeType: mimeType}},
            {text: "請識別這張圖片"},
          ],
        }];
        // #region agent log
        fetch("http://127.0.0.1:7242/ingest/6bc14386-27b1-4e76-a5da-311d10b83d04", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({location: "uploadImage.js:865", message: "Before AI API call", data: {model: MODEL, hasSchema: !!config.responseSchema, requiredFieldsCount: config.responseSchema?.required?.length}, timestamp: Date.now(), sessionId: "debug-session", runId: "run1", hypothesisId: "B"})}).catch(()=>{});
        // #endregion

        let result;
        try {
          result = await ai.models.generateContent({
            model: MODEL,
            config,
            contents,
          });
        } catch (apiError) {
          // #region agent log
          fetch("http://127.0.0.1:7242/ingest/6bc14386-27b1-4e76-a5da-311d10b83d04", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({location: "uploadImage.js:875", message: "AI API call failed", data: {error: apiError.message, errorCode: apiError.code, errorDetails: JSON.stringify(apiError)}, timestamp: Date.now(), sessionId: "debug-session", runId: "run1", hypothesisId: "C"})}).catch(()=>{});
          // #endregion
          throw apiError;
        }

        const resultText = result.candidates?.[0]?.content?.parts?.[0]?.text ??
            "{}";

        // #region agent log
        fetch("http://127.0.0.1:7242/ingest/6bc14386-27b1-4e76-a5da-311d10b83d04", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({location: "uploadImage.js:881", message: "AI response received", data: {resultTextLength: resultText.length, hasHealthScore: resultText.includes("healthScore"), hasVerdictHeadline: resultText.includes("verdictHeadline"), hasQuickTags: resultText.includes("quickTags"), hasHealthProsCons: resultText.includes("healthProsCons")}, timestamp: Date.now(), sessionId: "debug-session", runId: "run1", hypothesisId: "D"})}).catch(()=>{});
        // #endregion

        let resultParsed;
        try {
          resultParsed = JSON.parse(resultText);

          // #region agent log
          fetch("http://127.0.0.1:7242/ingest/6bc14386-27b1-4e76-a5da-311d10b83d04", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({location: "uploadImage.js:888", message: "JSON parsed successfully", data: {hasHealthScore: !!resultParsed.healthScore, hasVerdictHeadline: !!resultParsed.verdictHeadline, hasQuickTags: !!resultParsed.quickTags, hasHealthProsCons: !!resultParsed.healthProsCons, healthScoreValue: resultParsed.healthScore}, timestamp: Date.now(), sessionId: "debug-session", runId: "run1", hypothesisId: "E"})}).catch(()=>{});
          // #endregion
        } catch (parseError) {
          // #region agent log
          fetch("http://127.0.0.1:7242/ingest/6bc14386-27b1-4e76-a5da-311d10b83d04", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({location: "uploadImage.js:892", message: "JSON parse failed", data: {error: parseError.message, resultTextPreview: resultText.substring(0, 200)}, timestamp: Date.now(), sessionId: "debug-session", runId: "run1", hypothesisId: "F"})}).catch(()=>{});
          // #endregion
          throw parseError;
        }

        // 計算風險指標
        const {maxRiskLevel, riskScore} = calculateRiskMetrics(resultParsed);

        // 上傳圖片到 Storage
        let imageUrls = {
          originalUrl: "",
          thumbnailUrl: "",
          storagePath: "",
        };

        try {
          // 生成產品 ID
          const productId = db.collection("products").doc().id;
          imageUrls = await uploadImageToStorage(
              imageBuffer,
              userId,
              productId,
              mimeType,
          );
        } catch (storageError) {
          console.error("上傳圖片到 Storage 失敗:", storageError);
          // 繼續處理，但不保存圖片 URL
        }

        // 準備保存到 Firestore 的數據
        const now = admin.firestore.Timestamp.now();
        const createdAtDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

        const productData = {
          ...resultParsed,
          // 圖片資訊
          imageUrl: imageUrls.originalUrl,
          imageThumbnailUrl: imageUrls.thumbnailUrl,
          imageStoragePath: imageUrls.storagePath,
          // 風險評估（用於快速搜尋）
          maxRiskLevel: maxRiskLevel,
          riskScore: riskScore,
          // 使用者關聯
          creatorId: userId,
          creatorEmail: email,
          // 時間戳記
          createdAt: now,
          updatedAt: now,
          // 索引欄位
          createdAtDate: createdAtDate,
          riskLevelIndex: `${maxRiskLevel}_${createdAtDate}`,
        };

        // 保存到 products 集合
        let productDocRef;
        try {
          productDocRef = db.collection("products").doc();
          await productDocRef.set(productData);
          console.log("產品數據已保存到 Firestore，文檔 ID:", productDocRef.id);
        } catch (firestoreError) {
          console.error("保存到 Firestore 失敗:", firestoreError);
          response.status(500).json({
            error: "保存數據失敗",
            details: firestoreError.message,
          });
          return;
        }

        // 創建 userProducts 索引（子集合）
        try {
          const userProductData = {
            productId: productDocRef.id,
            createdAt: now,
            createdAtDate: createdAtDate,
            maxRiskLevel: maxRiskLevel,
            productType: resultParsed.productType || "",
            // 只存必要欄位，減少讀取成本
            productName: resultParsed.productName || "",
            productEmoji: resultParsed.productEmoji || "",
            imageThumbnailUrl: imageUrls.thumbnailUrl,
          };

          await db
              .collection("users")
              .doc(userId)
              .collection("userProducts")
              .doc(productDocRef.id)
              .set(userProductData);

          // 更新使用者統計
          const userRef = db.collection("users").doc(userId);
          const updateData = {
            "totalScans": admin.firestore.FieldValue.increment(1),
            "lastScanAt": now,
            "stats.totalProducts": admin.firestore.FieldValue.increment(1),
            [`stats.${maxRiskLevel.toLowerCase()}RiskCount`]:
              admin.firestore.FieldValue.increment(1),
            "updatedAt": admin.firestore.FieldValue.serverTimestamp(),
          };
          await userRef.update(updateData);
        } catch (indexError) {
          console.error("創建 userProducts 索引失敗:", indexError);
          // 不影響主流程，繼續執行
        }

        // 在返回的 JSON 中添加文檔 ID
        resultParsed.documentId = productDocRef.id;
        resultParsed.imageUrl = imageUrls.originalUrl;
        resultParsed.imageThumbnailUrl = imageUrls.thumbnailUrl;
        resultParsed.maxRiskLevel = maxRiskLevel;
        resultParsed.riskScore = riskScore;

        response.status(200).json(resultParsed);
      } catch (err) {
        console.error("Error processing image:", err);
        response.status(500).json({error: err.message});
      }
    },
);

module.exports = {uploadImage};
