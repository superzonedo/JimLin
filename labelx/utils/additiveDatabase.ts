export interface AdditiveInfo {
  name: string;
  riskLevel: 'high' | 'medium' | 'low';
  description: string;
  category: string;
}

const MOCK_ADDITIVES: Record<string, AdditiveInfo> = {
  '阿斯巴甜': {
    name: '阿斯巴甜',
    riskLevel: 'high',
    description: '可能影響代謝，部分研究顯示有潛在風險。',
    category: '甜味劑'
  },
  '人工色素': {
    name: '人工色素',
    riskLevel: 'medium',
    description: '可能引起過敏反應或注意力不集中。',
    category: '色素'
  },
  '反式脂肪': {
    name: '反式脂肪',
    riskLevel: 'high',
    description: '增加心血管疾病風險。',
    category: '脂肪'
  },
  '亞硝酸鹽': {
    name: '亞硝酸鹽',
    riskLevel: 'high',
    description: '加工肉品常見，可能致癌。',
    category: '防腐劑'
  }
};

export const findAdditiveByName = (name: string): AdditiveInfo | null => {
  return MOCK_ADDITIVES[name] || null;
};