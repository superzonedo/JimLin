/**
 * 食品添加物資料庫
 * 包含常見食品添加物的風險等級和扣分標準
 */

export interface AdditiveInfo {
  name: string; // 中文名稱
  englishName: string; // 英文名稱
  eNumber?: string; // E編號
  riskLevel: "high" | "medium" | "low";
  deductionPoints: number; // 扣分數值
  description: string; // 風險說明
  category: string; // 類別（防腐劑、色素、甜味劑等）
  keywords: string[]; // 用於匹配的關鍵字（包含中英文、簡體、常見別名）
}

/**
 * 高風險添加物 (扣 10-30 分)
 * 包括可能致癌、嚴重過敏、或在某些國家被禁用的添加物
 */
export const HIGH_RISK_ADDITIVES: AdditiveInfo[] = [
  {
    name: "亞硝酸鈉",
    englishName: "Sodium Nitrite",
    eNumber: "E250",
    riskLevel: "high",
    deductionPoints: 30,
    description: "可能在高溫下形成致癌物質亞硝胺，常用於加工肉品保色",
    category: "防腐劑",
    keywords: ["亞硝酸鈉", "亚硝酸钠", "sodium nitrite", "e250", "e-250", "硝酸鈉"],
  },
  {
    name: "亞硝酸鉀",
    englishName: "Potassium Nitrite",
    eNumber: "E249",
    riskLevel: "high",
    deductionPoints: 30,
    description: "與亞硝酸鈉類似，可能形成致癌物質",
    category: "防腐劑",
    keywords: ["亞硝酸鉀", "亚硝酸钾", "potassium nitrite", "e249", "e-249"],
  },
  {
    name: "苯甲酸鈉",
    englishName: "Sodium Benzoate",
    eNumber: "E211",
    riskLevel: "high",
    deductionPoints: 25,
    description: "可能引發過敏反應、蕁麻疹，與維生素C結合可能產生苯",
    category: "防腐劑",
    keywords: ["苯甲酸鈉", "苯甲酸钠", "sodium benzoate", "e211", "e-211", "安息香酸鈉"],
  },
  {
    name: "偶氮二甲酰胺",
    englishName: "Azodicarbonamide",
    eNumber: "E927",
    riskLevel: "high",
    deductionPoints: 25,
    description: "可能引發氣喘，在歐盟、澳洲等地被禁用",
    category: "麵粉改良劑",
    keywords: ["偶氮二甲酰胺", "偶氮二甲酰胺", "azodicarbonamide", "e927", "e-927", "發泡劑"],
  },
  {
    name: "紅色40號",
    englishName: "Allura Red",
    eNumber: "E129",
    riskLevel: "high",
    deductionPoints: 20,
    description: "可能影響兒童行為，導致過動和注意力不集中",
    category: "人工色素",
    keywords: ["紅色40號", "红色40号", "allura red", "e129", "e-129", "誘惑紅", "诱惑红", "red 40"],
  },
  {
    name: "黃色5號",
    englishName: "Tartrazine",
    eNumber: "E102",
    riskLevel: "high",
    deductionPoints: 20,
    description: "可能引發過敏、氣喘，影響兒童行為",
    category: "人工色素",
    keywords: ["黃色5號", "黄色5号", "tartrazine", "e102", "e-102", "檸檬黃", "柠檬黄", "yellow 5"],
  },
  {
    name: "黃色6號",
    englishName: "Sunset Yellow",
    eNumber: "E110",
    riskLevel: "high",
    deductionPoints: 20,
    description: "可能引發過敏反應，影響兒童注意力",
    category: "人工色素",
    keywords: ["黃色6號", "黄色6号", "sunset yellow", "e110", "e-110", "日落黃", "日落黄", "yellow 6"],
  },
  {
    name: "溴酸鉀",
    englishName: "Potassium Bromate",
    eNumber: "E924",
    riskLevel: "high",
    deductionPoints: 30,
    description: "可能致癌，在多數國家已禁用，僅少數國家允許",
    category: "麵粉改良劑",
    keywords: ["溴酸鉀", "溴酸钾", "potassium bromate", "e924", "e-924"],
  },
  {
    name: "丁基羥基茴香醚",
    englishName: "BHA (Butylated Hydroxyanisole)",
    eNumber: "E320",
    riskLevel: "high",
    deductionPoints: 15,
    description: "可能干擾內分泌系統，有致癌疑慮",
    category: "抗氧化劑",
    keywords: ["丁基羥基茴香醚", "丁基羟基茴香醚", "bha", "butylated hydroxyanisole", "e320", "e-320"],
  },
  {
    name: "二丁基羥基甲苯",
    englishName: "BHT (Butylated Hydroxytoluene)",
    eNumber: "E321",
    riskLevel: "high",
    deductionPoints: 15,
    description: "可能影響甲狀腺功能，有致癌疑慮",
    category: "抗氧化劑",
    keywords: ["二丁基羥基甲苯", "二丁基羟基甲苯", "bht", "butylated hydroxytoluene", "e321", "e-321"],
  },
  {
    name: "紅色2號",
    englishName: "Amaranth",
    eNumber: "E123",
    riskLevel: "high",
    deductionPoints: 20,
    description: "在美國被禁用，可能致癌",
    category: "人工色素",
    keywords: ["紅色2號", "红色2号", "amaranth", "e123", "e-123", "莧菜紅", "苋菜红", "red 2"],
  },
  {
    name: "藍色1號",
    englishName: "Brilliant Blue",
    eNumber: "E133",
    riskLevel: "high",
    deductionPoints: 18,
    description: "可能引發過敏反應，影響兒童行為",
    category: "人工色素",
    keywords: ["藍色1號", "蓝色1号", "brilliant blue", "e133", "e-133", "亮藍", "亮蓝", "blue 1"],
  },
];

/**
 * 中風險添加物 (扣 5-10 分)
 * 包括常見防腐劑、人工甜味劑、磷酸鹽等
 */
export const MEDIUM_RISK_ADDITIVES: AdditiveInfo[] = [
  {
    name: "磷酸鹽",
    englishName: "Phosphates",
    eNumber: "E338-E452",
    riskLevel: "medium",
    deductionPoints: 8,
    description: "過量攝取可能影響鈣質吸收，增加骨質疏鬆風險",
    category: "品質改良劑",
    keywords: ["磷酸鹽", "磷酸盐", "phosphate", "磷酸", "e338", "e339", "e340", "e341", "e450", "e451", "e452", "聚磷酸", "焦磷酸"],
  },
  {
    name: "山梨酸鉀",
    englishName: "Potassium Sorbate",
    eNumber: "E202",
    riskLevel: "medium",
    deductionPoints: 6,
    description: "常見防腐劑，可能引發輕微過敏反應",
    category: "防腐劑",
    keywords: ["山梨酸鉀", "山梨酸钾", "potassium sorbate", "e202", "e-202", "己二烯酸鉀"],
  },
  {
    name: "對羥基苯甲酸酯",
    englishName: "Parabens",
    eNumber: "E214-E219",
    riskLevel: "medium",
    deductionPoints: 8,
    description: "可能干擾內分泌系統，有雌激素效應",
    category: "防腐劑",
    keywords: ["對羥基苯甲酸", "对羟基苯甲酸", "paraben", "e214", "e215", "e216", "e217", "e218", "e219", "尼泊金"],
  },
  {
    name: "二氧化硫",
    englishName: "Sulfur Dioxide",
    eNumber: "E220",
    riskLevel: "medium",
    deductionPoints: 7,
    description: "可能引發氣喘、過敏反應，破壞維生素B1",
    category: "防腐劑",
    keywords: ["二氧化硫", "sulfur dioxide", "e220", "e-220", "亞硫酸", "亚硫酸"],
  },
  {
    name: "阿斯巴甜",
    englishName: "Aspartame",
    eNumber: "E951",
    riskLevel: "medium",
    deductionPoints: 6,
    description: "人工甜味劑，可能引發頭痛，苯酮尿症患者禁用",
    category: "人工甜味劑",
    keywords: ["阿斯巴甜", "aspartame", "e951", "e-951", "代糖"],
  },
  {
    name: "蔗糖素",
    englishName: "Sucralose",
    eNumber: "E955",
    riskLevel: "medium",
    deductionPoints: 5,
    description: "人工甜味劑，長期影響尚不明確",
    category: "人工甜味劑",
    keywords: ["蔗糖素", "sucralose", "e955", "e-955", "三氯蔗糖"],
  },
  {
    name: "醋磺內酯鉀",
    englishName: "Acesulfame K",
    eNumber: "E950",
    riskLevel: "medium",
    deductionPoints: 6,
    description: "人工甜味劑，可能影響胰島素分泌",
    category: "人工甜味劑",
    keywords: ["醋磺內酯鉀", "醋磺内酯钾", "acesulfame", "acesulfame k", "e950", "e-950", "安賽蜜"],
  },
  {
    name: "谷氨酸鈉",
    englishName: "Monosodium Glutamate (MSG)",
    eNumber: "E621",
    riskLevel: "medium",
    deductionPoints: 5,
    description: "味精，部分人群可能產生「中華料理症候群」",
    category: "調味劑",
    keywords: ["谷氨酸鈉", "谷氨酸钠", "msg", "monosodium glutamate", "e621", "e-621", "味精", "麩酸鈉", "麸酸钠"],
  },
  {
    name: "焦糖色素",
    englishName: "Caramel Color",
    eNumber: "E150",
    riskLevel: "medium",
    deductionPoints: 5,
    description: "部分製程可能產生4-甲基咪唑（可能致癌物質）",
    category: "色素",
    keywords: ["焦糖色素", "caramel color", "e150", "e-150", "焦糖"],
  },
  {
    name: "硝酸鈉",
    englishName: "Sodium Nitrate",
    eNumber: "E251",
    riskLevel: "medium",
    deductionPoints: 10,
    description: "可轉化為亞硝酸鹽，有致癌風險",
    category: "防腐劑",
    keywords: ["硝酸鈉", "硝酸钠", "sodium nitrate", "e251", "e-251"],
  },
  {
    name: "硝酸鉀",
    englishName: "Potassium Nitrate",
    eNumber: "E252",
    riskLevel: "medium",
    deductionPoints: 10,
    description: "可轉化為亞硝酸鹽，有健康疑慮",
    category: "防腐劑",
    keywords: ["硝酸鉀", "硝酸钾", "potassium nitrate", "e252", "e-252"],
  },
  {
    name: "苯甲酸",
    englishName: "Benzoic Acid",
    eNumber: "E210",
    riskLevel: "medium",
    deductionPoints: 7,
    description: "可能引發過敏反應，與維生素C可能產生苯",
    category: "防腐劑",
    keywords: ["苯甲酸", "benzoic acid", "e210", "e-210", "安息香酸"],
  },
  {
    name: "丙酸鈣",
    englishName: "Calcium Propionate",
    eNumber: "E282",
    riskLevel: "medium",
    deductionPoints: 5,
    description: "可能影響兒童行為和學習能力",
    category: "防腐劑",
    keywords: ["丙酸鈣", "丙酸钙", "calcium propionate", "e282", "e-282"],
  },
  {
    name: "偶氮玉紅",
    englishName: "Azorubine",
    eNumber: "E122",
    riskLevel: "medium",
    deductionPoints: 8,
    description: "可能引發過敏、氣喘、影響兒童行為",
    category: "人工色素",
    keywords: ["偶氮玉紅", "偶氮玉红", "azorubine", "e122", "e-122", "麗春紅", "丽春红"],
  },
];

/**
 * 低風險添加物 (扣 1-3 分)
 * 包括天然來源、普遍安全的添加物
 */
export const LOW_RISK_ADDITIVES: AdditiveInfo[] = [
  {
    name: "檸檬酸",
    englishName: "Citric Acid",
    eNumber: "E330",
    riskLevel: "low",
    deductionPoints: 2,
    description: "天然酸味劑，一般安全，但大量攝取可能影響牙齒琺瑯質",
    category: "酸味劑",
    keywords: ["檸檬酸", "柠檬酸", "citric acid", "e330", "e-330"],
  },
  {
    name: "抗壞血酸",
    englishName: "Ascorbic Acid (Vitamin C)",
    eNumber: "E300",
    riskLevel: "low",
    deductionPoints: 1,
    description: "維生素C，抗氧化劑，一般認為安全",
    category: "抗氧化劑",
    keywords: ["抗壞血酸", "抗坏血酸", "ascorbic acid", "e300", "e-300", "維生素c", "维生素c", "vitamin c"],
  },
  {
    name: "卵磷脂",
    englishName: "Lecithin",
    eNumber: "E322",
    riskLevel: "low",
    deductionPoints: 1,
    description: "天然乳化劑，通常來自大豆或蛋黃，一般安全",
    category: "乳化劑",
    keywords: ["卵磷脂", "lecithin", "e322", "e-322", "大豆卵磷脂"],
  },
  {
    name: "瓜爾膠",
    englishName: "Guar Gum",
    eNumber: "E412",
    riskLevel: "low",
    deductionPoints: 2,
    description: "天然增稠劑，可能引起輕微腸胃不適",
    category: "增稠劑",
    keywords: ["瓜爾膠", "瓜尔胶", "guar gum", "e412", "e-412"],
  },
  {
    name: "黃原膠",
    englishName: "Xanthan Gum",
    eNumber: "E415",
    riskLevel: "low",
    deductionPoints: 2,
    description: "天然增稠劑，一般安全，大量攝取可能影響消化",
    category: "增稠劑",
    keywords: ["黃原膠", "黄原胶", "xanthan gum", "e415", "e-415", "三仙膠"],
  },
  {
    name: "果膠",
    englishName: "Pectin",
    eNumber: "E440",
    riskLevel: "low",
    deductionPoints: 1,
    description: "天然增稠劑，來自水果，對健康有益",
    category: "增稠劑",
    keywords: ["果膠", "果胶", "pectin", "e440", "e-440"],
  },
  {
    name: "碳酸氫鈉",
    englishName: "Sodium Bicarbonate",
    eNumber: "E500",
    riskLevel: "low",
    deductionPoints: 2,
    description: "小蘇打，一般安全，過量可能影響電解質平衡",
    category: "膨脹劑",
    keywords: ["碳酸氫鈉", "碳酸氢钠", "sodium bicarbonate", "e500", "e-500", "小蘇打", "小苏打", "baking soda"],
  },
  {
    name: "乳酸",
    englishName: "Lactic Acid",
    eNumber: "E270",
    riskLevel: "low",
    deductionPoints: 2,
    description: "天然酸味劑，存在於發酵食品中，一般安全",
    category: "酸味劑",
    keywords: ["乳酸", "lactic acid", "e270", "e-270"],
  },
  {
    name: "天然香料",
    englishName: "Natural Flavors",
    eNumber: undefined,
    riskLevel: "low",
    deductionPoints: 3,
    description: "來源不明確，可能含有過敏原，建議注意",
    category: "香料",
    keywords: ["天然香料", "natural flavor", "natural flavour", "香料"],
  },
  {
    name: "β-胡蘿蔔素",
    englishName: "Beta-Carotene",
    eNumber: "E160a",
    riskLevel: "low",
    deductionPoints: 1,
    description: "天然色素，維生素A前驅物，對健康有益",
    category: "色素",
    keywords: ["β-胡蘿蔔素", "beta-carotene", "e160a", "e160", "胡萝卜素", "胡蘿蔔素"],
  },
  {
    name: "碳酸鈣",
    englishName: "Calcium Carbonate",
    eNumber: "E170",
    riskLevel: "low",
    deductionPoints: 1,
    description: "鈣質補充劑，一般安全",
    category: "營養強化劑",
    keywords: ["碳酸鈣", "碳酸钙", "calcium carbonate", "e170", "e-170"],
  },
  {
    name: "蘋果酸",
    englishName: "Malic Acid",
    eNumber: "E296",
    riskLevel: "low",
    deductionPoints: 2,
    description: "天然酸味劑，存在於蘋果中，一般安全",
    category: "酸味劑",
    keywords: ["蘋果酸", "苹果酸", "malic acid", "e296", "e-296"],
  },
  {
    name: "三仙膠",
    englishName: "Gellan Gum",
    eNumber: "E418",
    riskLevel: "low",
    deductionPoints: 2,
    description: "天然增稠劑，一般安全",
    category: "增稠劑",
    keywords: ["三仙膠", "三仙胶", "gellan gum", "e418", "e-418", "結冷膠"],
  },
  {
    name: "脂肪酸甘油酯",
    englishName: "Mono- and Diglycerides",
    eNumber: "E471",
    riskLevel: "low",
    deductionPoints: 2,
    description: "常見乳化劑，一般安全，但可能含反式脂肪",
    category: "乳化劑",
    keywords: ["脂肪酸甘油酯", "mono- and diglycerides", "e471", "e-471", "單甘油酯", "单甘油酯"],
  },
];

/**
 * 獲取所有添加物資料
 */
export function getAllAdditives(): AdditiveInfo[] {
  return [...HIGH_RISK_ADDITIVES, ...MEDIUM_RISK_ADDITIVES, ...LOW_RISK_ADDITIVES];
}

/**
 * 根據成分名稱查找匹配的添加物
 * 使用模糊匹配，檢查關鍵字是否出現在成分名稱中
 */
export function findAdditiveByName(ingredientName: string): AdditiveInfo | null {
  const lowerName = ingredientName.toLowerCase().trim();
  
  // 優先匹配高風險添加物
  for (const additive of HIGH_RISK_ADDITIVES) {
    if (matchesAdditive(lowerName, additive.keywords)) {
      return additive;
    }
  }
  
  // 再匹配中風險添加物
  for (const additive of MEDIUM_RISK_ADDITIVES) {
    if (matchesAdditive(lowerName, additive.keywords)) {
      return additive;
    }
  }
  
  // 最後匹配低風險添加物
  for (const additive of LOW_RISK_ADDITIVES) {
    if (matchesAdditive(lowerName, additive.keywords)) {
      return additive;
    }
  }
  
  return null;
}

/**
 * 檢查成分名稱是否匹配添加物的關鍵字
 */
function matchesAdditive(ingredientName: string, keywords: string[]): boolean {
  for (const keyword of keywords) {
    if (ingredientName.includes(keyword.toLowerCase())) {
      return true;
    }
  }
  return false;
}

/**
 * 獲取添加物的完整顯示名稱（含E編號）
 */
export function getAdditiveDisplayName(additive: AdditiveInfo): string {
  if (additive.eNumber) {
    return `${additive.name} (${additive.eNumber})`;
  }
  return additive.name;
}
