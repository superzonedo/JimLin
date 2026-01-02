// 成分名稱翻譯工具
// 後端統一返回英文，前端根據用戶語言進行翻譯

import { Language } from './i18n';

// 成分名稱翻譯映射表（從英文到其他語言）
// 後端會返回英文名稱，前端根據用戶選擇的語言進行翻譯
const ingredientTranslationMap: Record<string, Record<Language, string>> = {
  // 澱粉類 (Starch)
  'Potato Starch': { 'zh-TW': '馬鈴薯澱粉', 'zh-CN': '马铃薯淀粉', 'en': 'Potato Starch' },
  'Potato Flour': { 'zh-TW': '馬鈴薯粉', 'zh-CN': '马铃薯粉', 'en': 'Potato Flour' },
  'Tapioca Starch': { 'zh-TW': '樹薯澱粉', 'zh-CN': '树薯淀粉', 'en': 'Tapioca Starch' },
  'Corn Starch': { 'zh-TW': '玉米澱粉', 'zh-CN': '玉米淀粉', 'en': 'Corn Starch' },
  'Wheat Starch': { 'zh-TW': '小麥澱粉', 'zh-CN': '小麦淀粉', 'en': 'Wheat Starch' },
  
  // 油脂類 (Oils)
  'Palm Oil': { 'zh-TW': '棕櫚油', 'zh-CN': '棕榈油', 'en': 'Palm Oil' },
  'Soybean Oil': { 'zh-TW': '大豆油', 'zh-CN': '大豆油', 'en': 'Soybean Oil' },
  'Canola Oil': { 'zh-TW': '菜籽油', 'zh-CN': '菜籽油', 'en': 'Canola Oil' },
  'Sunflower Oil': { 'zh-TW': '葵花油', 'zh-CN': '葵花油', 'en': 'Sunflower Oil' },
  
  // 糖類 (Sugars)
  'Sucrose': { 'zh-TW': '蔗糖', 'zh-CN': '蔗糖', 'en': 'Sucrose' },
  'Sugar': { 'zh-TW': '糖', 'zh-CN': '糖', 'en': 'Sugar' },
  'Glucose': { 'zh-TW': '葡萄糖', 'zh-CN': '葡萄糖', 'en': 'Glucose' },
  'Fructose': { 'zh-TW': '果糖', 'zh-CN': '果糖', 'en': 'Fructose' },
  'Maltodextrin': { 'zh-TW': '麥芽糊精', 'zh-CN': '麦芽糊精', 'en': 'Maltodextrin' },
  
  // 調味料 (Seasonings)
  'Table Salt': { 'zh-TW': '食鹽', 'zh-CN': '食盐', 'en': 'Table Salt' },
  'Salt': { 'zh-TW': '鹽', 'zh-CN': '盐', 'en': 'Salt' },
  'MSG': { 'zh-TW': '味精', 'zh-CN': '味精', 'en': 'MSG' },
  'Monosodium Glutamate': { 'zh-TW': '味精', 'zh-CN': '味精', 'en': 'Monosodium Glutamate' },
  'MSG (Monosodium Glutamate)': { 'zh-TW': '味精', 'zh-CN': '味精', 'en': 'MSG (Monosodium Glutamate)' },
  'L-Sodium Glutamate': { 'zh-TW': 'L-麩酸鈉', 'zh-CN': 'L-麸酸钠', 'en': 'L-Sodium Glutamate' },
  'Disodium 5\'-Inosinate': { 'zh-TW': '5\'-次黃嘌呤核苷磷酸二鈉', 'zh-CN': '5\'-次黄嘌呤核苷磷酸二钠', 'en': 'Disodium 5\'-Inosinate' },
  'Disodium 5\'-Guanylate': { 'zh-TW': '5\'-鳥嘌呤核苷磷酸二鈉', 'zh-CN': '5\'-鸟嘌呤核苷磷酸二钠', 'en': 'Disodium 5\'-Guanylate' },
  'Disodium Inosinate': { 'zh-TW': '次黃嘌呤核苷磷酸二鈉', 'zh-CN': '次黄嘌呤核苷磷酸二钠', 'en': 'Disodium Inosinate' },
  'Disodium Guanylate': { 'zh-TW': '鳥嘌呤核苷磷酸二鈉', 'zh-CN': '鸟嘌呤核苷磷酸二钠', 'en': 'Disodium Guanylate' },
  
  // 香料類 (Spices)
  'Scallion Powder': { 'zh-TW': '青蔥粉', 'zh-CN': '青葱粉', 'en': 'Scallion Powder' },
  'Garlic Powder': { 'zh-TW': '蒜粉', 'zh-CN': '蒜粉', 'en': 'Garlic Powder' },
  'Onion Powder': { 'zh-TW': '洋蔥粉', 'zh-CN': '洋葱粉', 'en': 'Onion Powder' },
  'White Pepper Powder': { 'zh-TW': '白胡椒粉', 'zh-CN': '白胡椒粉', 'en': 'White Pepper Powder' },
  'White Pepper': { 'zh-TW': '白胡椒', 'zh-CN': '白胡椒', 'en': 'White Pepper' },
  'Green Chili Powder': { 'zh-TW': '青辣椒粉', 'zh-CN': '青辣椒粉', 'en': 'Green Chili Powder' },
  'Red Pepper': { 'zh-TW': '紅椒', 'zh-CN': '红椒', 'en': 'Red Pepper' },
  'Chili': { 'zh-TW': '辣椒', 'zh-CN': '辣椒', 'en': 'Chili' },
  'Chili Powder': { 'zh-TW': '辣椒末', 'zh-CN': '辣椒末', 'en': 'Chili Powder' },
  'Spices': { 'zh-TW': '香料', 'zh-CN': '香料', 'en': 'Spices' },
  
  // 乳製品 (Dairy)
  'Cheese': { 'zh-TW': '起司', 'zh-CN': '起司', 'en': 'Cheese' },
  'Cheese Powder': { 'zh-TW': '起司粉', 'zh-CN': '起司粉', 'en': 'Cheese Powder' },
  'Milk Powder': { 'zh-TW': '奶粉', 'zh-CN': '奶粉', 'en': 'Milk Powder' },
  
  // 其他添加劑 (Other Additives)
  'Yeast Extract': { 'zh-TW': '酵母抽出物', 'zh-CN': '酵母抽出物', 'en': 'Yeast Extract' },
  'Vegetable Powder': { 'zh-TW': '蔬菜粉', 'zh-CN': '蔬菜粉', 'en': 'Vegetable Powder' },
  'Flavor Enhancer': { 'zh-TW': '調味劑', 'zh-CN': '调味剂', 'en': 'Flavor Enhancer' },
  'Lactic Acid': { 'zh-TW': '乳酸', 'zh-CN': '乳酸', 'en': 'Lactic Acid' },
  'Citric Acid': { 'zh-TW': '檸檬酸', 'zh-CN': '柠檬酸', 'en': 'Citric Acid' },
  'Sodium Citrate': { 'zh-TW': '檸檬酸鈉', 'zh-CN': '柠檬酸钠', 'en': 'Sodium Citrate' },
  'Silicon Dioxide': { 'zh-TW': '二氧化矽', 'zh-CN': '二氧化硅', 'en': 'Silicon Dioxide' },
  'Disodium Hydrogen Carbonate': { 'zh-TW': '碳酸氫二鈉', 'zh-CN': '碳酸氢二钠', 'en': 'Disodium Hydrogen Carbonate' },
  'Disodium Hydrogen Phosphate': { 'zh-TW': '磷酸氫二鈉', 'zh-CN': '磷酸氢二钠', 'en': 'Disodium Hydrogen Phosphate' },
  'Colorant': { 'zh-TW': '著色劑', 'zh-CN': '着色剂', 'en': 'Colorant' },
  'Curcumin': { 'zh-TW': '薑黃素', 'zh-CN': '姜黄素', 'en': 'Curcumin' },
  'Food Yellow No. 5': { 'zh-TW': '食用黃色五號', 'zh-CN': '食用黄色五号', 'en': 'Food Yellow No. 5' },
  'Caramel Color': { 'zh-TW': '焦糖色素', 'zh-CN': '焦糖色素', 'en': 'Caramel Color' },
  'Emulsifier': { 'zh-TW': '乳化劑', 'zh-CN': '乳化剂', 'en': 'Emulsifier' },
  'Fatty Acid Glycerides': { 'zh-TW': '脂肪酸甘油酯', 'zh-CN': '脂肪酸甘油酯', 'en': 'Fatty Acid Glycerides' },
  'Antioxidant': { 'zh-TW': '抗氧化劑', 'zh-CN': '抗氧化剂', 'en': 'Antioxidant' },
  'Vitamin E': { 'zh-TW': '維生素E', 'zh-CN': '维生素E', 'en': 'Vitamin E' },
  'L-Ascorbyl Palmitate': { 'zh-TW': 'L-抗壞血酸棕櫚酸酯', 'zh-CN': 'L-抗坏血酸棕榈酸酯', 'en': 'L-Ascorbyl Palmitate' },
  
  // 醬料類 (Sauces)
  'Soy Sauce Powder': { 'zh-TW': '醬油粉', 'zh-CN': '酱油粉', 'en': 'Soy Sauce Powder' },
  'Spicy Powder': { 'zh-TW': '香辣粉', 'zh-CN': '香辣粉', 'en': 'Spicy Powder' },
  'Mild Spicy Powder': { 'zh-TW': '小辣粉', 'zh-CN': '小辣粉', 'en': 'Mild Spicy Powder' },
  
  // 其他 (Others)
  'Sodium': { 'zh-TW': '鈉', 'zh-CN': '钠', 'en': 'Sodium' },
  'Calcium Hydroxide': { 'zh-TW': '水酸化鈣', 'zh-CN': '水酸化钙', 'en': 'Calcium Hydroxide' },
  'Konjac Flour': { 'zh-TW': '蒟蒻精粉', 'zh-CN': '蒟蒻精粉', 'en': 'Konjac Flour' },
  'Seaweed Powder': { 'zh-TW': '海藻粉', 'zh-CN': '海藻粉', 'en': 'Seaweed Powder' },
};

/**
 * 檢測字符串是否包含中文字符
 */
function containsChinese(text: string): boolean {
  return /[\u4e00-\u9fa5]/.test(text);
}

/**
 * 從中文反向查找英文（通過遍歷映射表）
 */
function findEnglishFromChinese(chineseName: string): string | null {
  for (const [englishKey, translations] of Object.entries(ingredientTranslationMap)) {
    if (translations['zh-TW'] === chineseName || translations['zh-CN'] === chineseName) {
      return englishKey;
    }
  }
  return null;
}

/**
 * 翻譯成分名稱
 * @param ingredientName 原始成分名稱（可能是英文或中文，取決於後端返回）
 * @param language 目標語言
 * @returns 翻譯後的成分名稱
 */
export function translateIngredientName(ingredientName: string, language: Language): string {
  if (!ingredientName) return ingredientName;
  
  const normalizedName = ingredientName.trim();
  const isChinese = containsChinese(normalizedName);
  
  // 如果輸入是中文，且目標語言是英文，需要反向翻譯
  if (isChinese && language === 'en') {
    // 先嘗試完全匹配
    const englishName = findEnglishFromChinese(normalizedName);
    if (englishName) {
      return englishName;
    }
    
    // 處理包含括號的情況（如 "白胡椒粉(白胡椒、青辣椒粉、樹薯澱粉)"）
    const mainName = normalizedName.split('(')[0].trim();
    const bracketContent = normalizedName.includes('(') ? normalizedName.substring(normalizedName.indexOf('(')) : '';
    
    const englishMain = findEnglishFromChinese(mainName);
    if (englishMain) {
      // 如果有括號內容，保留括號（括號內可能也是中文，暫時不翻譯）
      return englishMain + (bracketContent ? ' ' + bracketContent : '');
    }
    
    // 如果找不到翻譯，返回原始中文名稱（至少比返回空好）
    return ingredientName;
  }
  
  // 如果輸入是中文，且目標語言不是英文，需要先轉成英文再轉成目標語言
  if (isChinese && language !== 'en') {
    const englishName = findEnglishFromChinese(normalizedName);
    if (englishName && ingredientTranslationMap[englishName]) {
      return ingredientTranslationMap[englishName][language] || ingredientName;
    }
    
    // 處理包含括號的情況
    const mainName = normalizedName.split('(')[0].trim();
    const bracketContent = normalizedName.includes('(') ? normalizedName.substring(normalizedName.indexOf('(')) : '';
    
    const englishMain = findEnglishFromChinese(mainName);
    if (englishMain && ingredientTranslationMap[englishMain]) {
      const translatedMain = ingredientTranslationMap[englishMain][language] || mainName;
      return translatedMain + (bracketContent ? ' ' + bracketContent : '');
    }
    
    return ingredientName;
  }
  
  // 如果輸入是英文（或非中文），按原邏輯處理
  // 如果目標語言是英文，直接返回原始名稱
  if (language === 'en') {
    return ingredientName;
  }
  
  // 先嘗試完全匹配（不區分大小寫）
  if (ingredientTranslationMap[normalizedName]) {
    return ingredientTranslationMap[normalizedName][language] || ingredientName;
  }
  
  // 嘗試不區分大小寫匹配
  const lowerName = normalizedName.toLowerCase();
  for (const [key, translations] of Object.entries(ingredientTranslationMap)) {
    if (key.toLowerCase() === lowerName) {
      return translations[language] || ingredientName;
    }
  }
  
  // 嘗試部分匹配（處理包含括號的情況）
  const mainName = normalizedName.split('(')[0].trim();
  if (mainName) {
    // 先嘗試完全匹配
    if (ingredientTranslationMap[mainName]) {
      const translatedMain = ingredientTranslationMap[mainName][language] || mainName;
      const bracketContent = normalizedName.includes('(') ? normalizedName.substring(normalizedName.indexOf('(')) : '';
      return translatedMain + (bracketContent ? ' ' + bracketContent : '');
    }
    
    // 嘗試不區分大小寫匹配主要名稱
    const lowerMainName = mainName.toLowerCase();
    for (const [key, translations] of Object.entries(ingredientTranslationMap)) {
      if (key.toLowerCase() === lowerMainName) {
        const translatedMain = translations[language] || mainName;
        const bracketContent = normalizedName.includes('(') ? normalizedName.substring(normalizedName.indexOf('(')) : '';
        return translatedMain + (bracketContent ? ' ' + bracketContent : '');
      }
    }
  }
  
  // 如果找不到翻譯，返回原始名稱
  return ingredientName;
}

/**
 * 翻譯成分描述（如果描述是中文）
 * 這個函數可以根據需要擴展，目前先返回原始描述
 */
export function translateIngredientDescription(description: string, language: Language): string {
  // 如果描述已經是英文或目標語言，直接返回
  // 這裡可以添加更複雜的翻譯邏輯
  return description;
}

