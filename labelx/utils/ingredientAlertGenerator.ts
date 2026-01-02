// 通用成分警示說明生成器
// 根據成分名稱、疾病類型和後端數據動態生成說明

import { t } from './i18n';

interface DiseaseInfo {
  name: string;
  nameKey: string;
  keywords: string[];
  generateReason: (ingredientName: string, ingredientData?: any) => string;
}

// 疾病映射表
const diseaseMap: DiseaseInfo[] = [
  {
    name: '高血壓',
    nameKey: 'hypertension',
    keywords: ['hypertension', '高血壓', '血壓'],
    generateReason: (ingredientName: string, ingredientData?: any) => {
      // 優先使用後端返回的說明（後端已根據語言返回對應內容）
      if (ingredientData?.concerns && ingredientData.concerns.trim()) {
        return ingredientData.concerns;
      }
      if (ingredientData?.description && ingredientData.description.trim()) {
        return ingredientData.description;
      }
      if (ingredientData?.potentialHarm && ingredientData.potentialHarm.trim()) {
        return ingredientData.potentialHarm;
      }
      
      // 如果後端沒有返回說明，使用前端翻譯（作為備用）
      const name = ingredientName.toLowerCase();
      if (name.includes('味精') || name.includes('msg') || name.includes('monosodium') || name.includes('麩胺酸')) {
        return t('personalizedAlert.ingredientReasons.msg');
      } else if (name.includes('5\'-次黃嘌呤') || name.includes('次黃嘌呤') || name.includes('inosinate')) {
        return t('personalizedAlert.ingredientReasons.disodiumInosinate');
      } else if (name.includes('5\'-鳥嘌呤') || name.includes('鳥嘌呤') || name.includes('guanylate')) {
        return t('personalizedAlert.ingredientReasons.disodiumGuanylate');
      } else if (name.includes('起司粉') || name.includes('cheese powder') || name.includes('起司')) {
        return t('personalizedAlert.ingredientReasons.cheesePowder');
      } else if (name.includes('食鹽') || name.includes('table salt') || (name.includes('鹽') && !name.includes('鈉'))) {
        return t('personalizedAlert.ingredientReasons.salt');
      } else if (name.includes('鈉') || name.includes('sodium')) {
        return t('personalizedAlert.ingredientReasons.sodium');
      }
      
      // 通用說明模板
      return generateGenericReason(ingredientName, 'hypertension', ingredientData);
    },
  },
  {
    name: '糖尿病',
    nameKey: 'diabetes',
    keywords: ['diabetes', '糖尿病', '血糖'],
    generateReason: (ingredientName: string, ingredientData?: any) => {
      // 優先使用後端返回的說明（後端已根據語言返回對應內容）
      if (ingredientData?.concerns && ingredientData.concerns.trim()) {
        return ingredientData.concerns;
      }
      if (ingredientData?.description && ingredientData.description.trim()) {
        return ingredientData.description;
      }
      if (ingredientData?.potentialHarm && ingredientData.potentialHarm.trim()) {
        return ingredientData.potentialHarm;
      }
      
      // 如果後端沒有返回說明，使用前端翻譯（作為備用）
      const name = ingredientName.toLowerCase();
      if (name.includes('糖') || name.includes('sugar') || name.includes('sucrose') || name.includes('fructose') || name.includes('glucose')) {
        return t('personalizedAlert.ingredientReasons.sugar') || `此成分含有糖分，糖尿病患者需控制攝取量，避免血糖快速上升。建議選擇無糖或低糖替代品。`;
      } else if (name.includes('果糖') || name.includes('fructose') || name.includes('高果糖')) {
        return `高果糖漿會導致血糖快速上升，糖尿病患者應避免或嚴格控制攝取量。`;
      } else if (name.includes('甜味劑') || name.includes('sweetener') || name.includes('阿斯巴甜') || name.includes('aspartame')) {
        return `人工甜味劑可能影響血糖控制，糖尿病患者應謹慎使用，建議諮詢醫師。`;
      }
      
      return generateGenericReason(ingredientName, 'diabetes', ingredientData);
    },
  },
  {
    name: '腎臟病',
    nameKey: 'kidney-disease',
    keywords: ['kidney', '腎臟', '腎'],
    generateReason: (ingredientName: string, ingredientData?: any) => {
      // 優先使用後端返回的說明（後端已根據語言返回對應內容）
      if (ingredientData?.concerns && ingredientData.concerns.trim()) {
        return ingredientData.concerns;
      }
      if (ingredientData?.description && ingredientData.description.trim()) {
        return ingredientData.description;
      }
      if (ingredientData?.potentialHarm && ingredientData.potentialHarm.trim()) {
        return ingredientData.potentialHarm;
      }
      
      // 如果後端沒有返回說明，使用前端翻譯（作為備用）
      const name = ingredientName.toLowerCase();
      if (name.includes('磷') || name.includes('phosphate') || name.includes('phosphorus')) {
        return `此成分含有磷，腎臟病患者應避免高磷食物，以減輕腎臟負擔。建議選擇低磷替代品。`;
      } else if (name.includes('鈉') || name.includes('sodium') || name.includes('鹽')) {
        return `此成分含有鈉，腎臟病患者需嚴格控制鈉攝取量，以減輕腎臟負擔。`;
      } else if (name.includes('蛋白質') || name.includes('protein')) {
        return `此成分含有蛋白質，腎臟病患者需根據醫師建議控制蛋白質攝取量。`;
      }
      
      return generateGenericReason(ingredientName, 'kidney-disease', ingredientData);
    },
  },
];

/**
 * 生成通用說明（當沒有特定匹配時）
 */
function generateGenericReason(
  ingredientName: string,
  diseaseType: string,
  ingredientData?: any
): string {
  // 優先使用後端返回的說明（後端已根據語言返回對應內容）
  if (ingredientData?.concerns && ingredientData.concerns.trim()) {
    return ingredientData.concerns;
  }
  if (ingredientData?.description && ingredientData.description.trim()) {
    return ingredientData.description;
  }
  if (ingredientData?.potentialHarm && ingredientData.potentialHarm.trim()) {
    return ingredientData.potentialHarm;
  }
  
  // 如果後端沒有返回說明，使用前端翻譯（作為備用）
  const diseaseName = diseaseMap.find(d => d.nameKey === diseaseType)?.name || '相關疾病';
  
  return `此成分可能不適合${diseaseName}患者，建議諮詢醫師或營養師後再決定是否攝取。`;
}

/**
 * 根據成分和疾病生成警示說明
 */
export function generateIngredientAlertReason(
  ingredientName: string,
  disease: string,
  ingredientData?: any
): string {
  const diseaseLower = disease.toLowerCase();
  
  // 查找匹配的疾病
  const matchedDisease = diseaseMap.find(d =>
    d.keywords.some(keyword => diseaseLower.includes(keyword.toLowerCase()))
  );
  
  if (matchedDisease) {
    return matchedDisease.generateReason(ingredientName, ingredientData);
  }
  
  // 如果沒有匹配的疾病，使用通用說明
  return generateGenericReason(ingredientName, diseaseLower, ingredientData);
}

/**
 * 檢查成分是否與疾病相關
 */
export function checkIngredientDiseaseMatch(
  ingredientName: string,
  disease: string,
  ingredientData?: any
): boolean {
  const name = ingredientName.toLowerCase();
  const diseaseLower = disease.toLowerCase();
  
  const matchedDisease = diseaseMap.find(d =>
    d.keywords.some(keyword => diseaseLower.includes(keyword.toLowerCase()))
  );
  
  if (!matchedDisease) return false;
  
  // 根據疾病類型檢查成分關鍵字
  if (matchedDisease.nameKey === 'hypertension') {
    return name.includes('鈉') || name.includes('sodium') || name.includes('鹽') || 
           name.includes('salt') || name.includes('味精') || name.includes('msg') ||
           name.includes('monosodium') || name.includes('nitrite');
  } else if (matchedDisease.nameKey === 'diabetes') {
    return name.includes('糖') || name.includes('sugar') || name.includes('sucrose') ||
           name.includes('fructose') || name.includes('glucose') || name.includes('甜味劑') ||
           name.includes('sweetener');
  } else if (matchedDisease.nameKey === 'kidney-disease') {
    return name.includes('磷') || name.includes('phosphate') || name.includes('phosphorus') ||
           name.includes('鈉') || name.includes('sodium') || name.includes('蛋白質') ||
           name.includes('protein');
  }
  
  return false;
}
