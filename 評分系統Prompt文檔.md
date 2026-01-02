# 營養標籤掃雷 - 評分系統 Prompt 文檔

## 📋 目錄
1. [AI 分析 Prompt](#ai-分析-prompt)
2. [評分邏輯說明](#評分邏輯說明)
3. [評分配置參數](#評分配置參數)
4. [評分流程](#評分流程)
5. [使用範例](#使用範例)

---

## 🤖 AI 分析 Prompt

### 完整 Prompt 內容

```
分析食品標籤，輸出JSON格式。

**產品識別：**
- productName: 中文產品名稱
- productEmoji: 代表產品的emoji
- productType: 判斷產品類型 (child/傳統/一般等)
- markets: 根據標示語言推測市場

**資料品質評估：**
- dataQuality: 根據圖片清晰度、資訊完整性判斷 (high/medium/low)
- missingFields: 缺失的關鍵資訊
- assumptions: 基於不完整資料的假設
- confidence: 整體判斷信心 (0-1)

**成分排序權重 (positionWeight)：**
- 成分表前1-3名: 1.0
- 4-6名: 0.7  
- 7名以後: 0.4
- 有百分比標示: max(0.4, min(1.0, 百分比/15))
- 無資訊: 0.7

**添加劑 (additives) - 只標記人工合成：**
- 致癌物: 亞硝酸鈉(E250)、苯甲酸鈉(E211)、阿斯巴甜(E951)、人工色素(E102/E110/E124) → carcinogenicity: Group 1/2A/2B, riskLevel: High
- 高風險: 反式脂肪、氫化油、人工香精 → riskLevel: High  
- 中等風險: 人工防腐劑、人工甜味劑 → riskLevel: Medium
- 低風險: 天然提取物(維生素C/E)、天然香料 → riskLevel: Low
- contextUse: 判斷是否為傳統/發酵食品中的正常成分

**需關注成分 (concerningIngredients)：**
- 兒童食品: 致癌物/反式脂肪/人工香精任何含量都危險 → High
- 一般食品: 反式脂肪/高果糖漿(>10%) → High, 精製糖(>15%)/高鈉(>600mg) → Medium, 天然糖分(<10%)/適量鈉(<300mg) → Low
- 傳統食品: 醬油/味噌/起司高鈉不扣分

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
- 含咖啡因不建議兒童飲用
- <1歲不宜食用蜂蜜
- 含人工甜味劑對味覺培養的影響

**原則：天然成分不扣分，兒童食品更嚴格，傳統食品考慮文化背景，成分排序影響權重**

輸出純JSON，無額外文字。
```

### JSON Schema 結構

```json
{
  "productName": "產品名稱",
  "productEmoji": "🍪",
  "productType": "general|child|traditional|beverage|snack|dairy|cereal|processed_meat",
  "markets": ["CN", "US"],
  "summary": "產品摘要",
  "dataQuality": "high|medium|low",
  "missingFields": ["營養成分表", "成分表"],
  "assumptions": ["假設1", "假設2"],
  "confidence": 0.85,
  "additives": [
    {
      "name": "添加劑名稱",
      "category": "colorant|preservative|sweetener|flavor enhancer",
      "riskLevel": "High|Medium|Low",
      "description": "描述",
      "potentialHarm": "潛在危害",
      "carcinogenicity": "Group 1|2A|2B|None|Unknown",
      "regulatoryNote": "法規備註",
      "positionWeight": 0.8,
      "contextUse": "traditional|industrial|unknown"
    }
  ],
  "beneficialIngredients": [
    {
      "name": "有益成分名稱",
      "description": "描述",
      "benefits": "益處",
      "positionWeight": 0.7
    }
  ],
  "concerningIngredients": [
    {
      "name": "關注成分名稱",
      "riskLevel": "High|Medium|Low",
      "description": "描述",
      "concerns": "關注點",
      "positionWeight": 0.6
    }
  ],
  "nutritionPer100": {
    "energyKcal": 450,
    "sugarG": 25,
    "sodiumMg": 300,
    "satFatG": 5,
    "transFatG": 0,
    "fiberG": 3,
    "proteinG": 8
  },
  "novaClass": 4,
  "trafficLights": {
    "sugar": "red|amber|green",
    "sodium": "red|amber|green",
    "satFat": "red|amber|green",
    "fiber": "red|amber|green"
  },
  "childSpecificWarnings": ["警告1", "警告2"]
}
```

---

## 🧮 評分邏輯說明

### RELAXED V3 - HEALTHY BOOST 評分系統

#### 評分公式

```
最終分數 = clamp(基礎分數(100) - 添加劑扣分 - 關注成分扣分 - 營養扣分 - NOVA扣分 + 健康加分, 0, 100)
```

#### 扣分上限（Caps）

| 項目 | 上限 |
|------|------|
| 添加劑扣分 | 40分 |
| 關注成分扣分 | 30分 |
| 營養扣分 | 24分 |
| NOVA扣分 | 10分 |
| 健康加分 | 28分（高品質資料）<br>14分（低品質資料） |

---

## ⚙️ 評分配置參數

### 1. 成分排序權重 (Position Weight)

```javascript
{
  min: 0.6,
  max: 1.0,
  rankWeights: [
    {maxRank: 3, w: 1.0},    // 前3名：100%權重
    {maxRank: 6, w: 0.8},    // 4-6名：80%權重
    {maxRank: Infinity, w: 0.6}  // 7名以後：60%權重
  ],
  pctToW: (pct) => Math.max(0.6, Math.min(1.0, pct/15))  // 百分比轉權重
}
```

**計算規則：**
- 有百分比標示：`權重 = max(0.6, min(1.0, 百分比/15))`
- 無百分比：根據排名位置
- 無資訊：預設 0.8

### 2. 添加劑扣分 (Additives)

```javascript
{
  weights: {
    carcinogen: -40,   // 致癌物
    high: -20,         // 高風險
    medium: -10,       // 中等風險
    low: -4            // 低風險
  },
  childExtra: {
    carcinogen: -20,   // 兒童產品額外扣分
    high: -15
  },
  classCapMultiplier: 1.3,        // 同類型添加劑上限倍數
  traditionalDowngrade: true       // 傳統食品風險降一級
}
```

**特殊規則：**
- **傳統食品豁免**：傳統/發酵食品中的添加劑，風險降一級（致癌物除外）
- **兒童產品**：致癌物和高風險添加劑額外扣分
- **類內上限**：同類型添加劑避免堆疊過頭

### 3. 關注成分扣分 (Concerning Ingredients)

```javascript
{
  weights: {
    high: -25,
    medium: -12,
    low: -2
  },
  childExtra: {
    high: -15,
    medium: -8
  },
  traditionalMediumToZero: true  // 傳統食品中等風險→0
}
```

**關注成分類型：**
- 高果糖糖漿
- 氫化油/部分氫化油
- 精製糖
- 加工肉硝酸鹽
- 高鈉（非傳統食品）

### 4. 營養紅綠燈 (Traffic Lights)

#### 閾值設定

| 營養素 | 綠色 | 黃色 | 紅色 |
|--------|------|------|------|
| 糖 (g/100g) | ≤5 | ≤22.5 | >22.5 |
| 鈉 (mg/100g) | ≤120 | ≤600 | >600 |
| 飽和脂肪 (g/100g) | ≤1.5 | ≤5 | >5 |

#### 扣分規則

```javascript
{
  scores: {
    red: -6,           // 紅燈扣6分
    amber: -3,         // 黃燈扣3分
    green: 0,           // 綠燈不扣分
    tripleRedExtra: -6  // 三項全紅額外扣6分
  },
  transFatException: {
    penalty: -10,      // 含氫化油直接扣10分
    childExtra: -5     // 兒童產品額外扣5分
  }
}
```

**特殊規則：**
- **三紅燈**：糖、鈉、飽和脂肪全紅，額外扣6分
- **氫化油檢測**：即使標示0g反式脂肪，若含氫化/部分氫化油，直接扣10分
- **健康油調整**：主要油脂為健康油時，飽和脂肪黃燈可降為綠燈

### 5. NOVA 加工程度扣分

```javascript
{
  n4: -8,              // NOVA 4（超加工）
  n3: -4,              // NOVA 3（加工）
  n2: 0,               // NOVA 2（烹飪配料）
  n1: 0,               // NOVA 1（未加工）
  childN4Extra: -2     // 兒童產品NOVA 4額外扣分
}
```

### 6. 健康加分 (Bonuses)

```javascript
{
  wholeGrain: 6,                    // 全穀≥50%
  fiberHigh: 5,                      // 纖維≥6g/100g
  proteinHigh: 3,                    // 蛋白≥10g/100g
  threeGreens: 4,                    // 糖/鈉/飽和脂肪皆綠
  noAddedSugar: 3,                   // 無添加糖或無甜味劑
  minimalIngredients: 3,              // 成分≤5
  healthyOilsMain: 4,                // EVOO/高油酸葵花/菜籽主要油脂
  omega3Source: 6,                   // 魚油/藻油/亞麻籽/奇亞籽或DHA/EPA強化
  mufaDominant: 2,                   // MUFA / (SFA + Trans) ≥ 2
  naturalAntioxidants: 1,            // E306/E392等天然抗氧化
  micronutrientFortifyMax: 3,        // 維生素/礦物質強化（1~3分）
  probiotics: 3,                     // 益生菌
  probioticsLowSugarExtra: 1,        // 活菌+低糖（≤5/100g）額外+1
  sugarHighFortifyCap: 1             // 糖紅燈時維強化最多+1
}
```

**防洗分機制：**
- 糖紅燈時，維生素強化最多+1分
- 低資料品質時，加分上限減半（28→14分）
- 健康油必須是主要油脂才給分

### 7. 寬鬆保底 (Floors)

```javascript
{
  noAdditives: 82,                   // 無添加劑保底82分
  fewLowAdditives: 65,               // 少量低/中風險添加劑（≤2且位置≤0.8）保底65分
  exceptionLowerFloor: 60            // 三紅或含氫化油時，保底降至60分
}
```

**保底規則：**
- 無添加劑：保底82分（除非三紅或氫化油）
- 少量低風險：保底65分
- 例外情況：三紅燈或含氫化油，保底降至60分

---

## 📊 評分流程

### 步驟 1：AI 分析
1. 上傳食品標籤圖片
2. 使用 Gemini API 分析標籤內容
3. 提取產品資訊、成分、營養數據
4. 判斷添加劑風險等級和致癌性
5. 計算成分排序權重
6. 評估 NOVA 加工程度
7. 生成紅綠燈評級

### 步驟 2：評分計算
1. **添加劑扣分**：根據風險等級、致癌性、位置權重計算
2. **關注成分扣分**：根據風險等級、位置權重計算
3. **營養扣分**：根據紅綠燈評級計算
4. **NOVA扣分**：根據加工程度計算
5. **健康加分**：根據有益成分計算
6. **應用保底**：根據條件應用保底分數

### 步驟 3：結果輸出
1. 最終健康分數（0-100）
- 80-100：優秀
- 60-79：良好
- 40-59：一般
- 0-39：需改善

2. 評分明細（Score Breakdown）
- 基礎分數
- 各項扣分
- 健康加分

3. 風險摘要（Risk Summary）
- 致癌物清單
- 高風險添加劑數量
- 主要關注點

---

## 💡 使用範例

### 範例 1：健康產品（全麥麵包）

**輸入：**
- 全麥麵粉（≥50%）
- 無添加劑
- 糖：3g/100g（綠燈）
- 鈉：200mg/100g（黃燈）
- 飽和脂肪：0.5g/100g（綠燈）
- NOVA 2

**計算：**
- 基礎分數：100
- 添加劑扣分：0
- 關注成分扣分：0
- 營養扣分：-3（鈉黃燈）
- NOVA扣分：0
- 健康加分：+6（全穀）+4（三綠燈）= +10
- **最終分數：107 → 100（上限）**

### 範例 2：高風險產品（超加工零食）

**輸入：**
- 含人工色素（E102，高風險）
- 含防腐劑（E211，中等風險）
- 含氫化油
- 糖：30g/100g（紅燈）
- 鈉：800mg/100g（紅燈）
- 飽和脂肪：8g/100g（紅燈）
- NOVA 4

**計算：**
- 基礎分數：100
- 添加劑扣分：-20（高風險）×1.0 = -20
- 關注成分扣分：-25（氫化油，高風險）×1.0 = -25
- 營養扣分：-6（糖紅）-6（鈉紅）-6（飽和脂肪紅）-6（三紅額外）= -24
- NOVA扣分：-8
- 健康加分：0
- **最終分數：23分**

### 範例 3：兒童產品（含致癌物）

**輸入：**
- 含亞硝酸鈉（E250，致癌物Group 1）
- 含人工香精（高風險）
- 糖：20g/100g（黃燈）
- NOVA 4

**計算：**
- 基礎分數：100
- 添加劑扣分：(-40-20)（致癌物+兒童額外）×1.0 = -60 → -40（上限）
- 關注成分扣分：0
- 營養扣分：-3（糖黃燈）
- NOVA扣分：-8-2（兒童額外）= -10
- 健康加分：0
- **最終分數：47分**

---

## 🔍 關鍵原則

### 1. 防誤判原則
- ✅ 使用位置權重，避免過度懲罰微量成分
- ✅ 傳統食品考慮文化背景，適當豁免
- ✅ 天然成分不扣分
- ✅ 資料品質低時降低加分上限

### 2. 可解釋原則
- ✅ 提供詳細的評分明細
- ✅ 標示致癌物IARC分級
- ✅ 說明風險摘要
- ✅ 顯示紅綠燈評級

### 3. 可擴充原則
- ✅ 支援多種產品類型
- ✅ 支援兒童產品特殊規則
- ✅ 支援傳統食品豁免
- ✅ 支援多市場法規

### 4. 防洗分機制
- ✅ 致癌物、氫化油、三紅燈無法被加分抵銷
- ✅ 糖紅燈時維生素強化最多+1分
- ✅ 健康油必須是主要油脂才給分
- ✅ 低資料品質時加分上限減半

---

## 📝 更新記錄

- **2024-10-08**: 建立 RELAXED V3 - HEALTHY BOOST 評分系統
- **2024-10-08**: 新增寬鬆保底機制
- **2024-10-08**: 新增防洗分機制
- **2024-10-08**: 優化傳統食品豁免規則

---

## 📞 技術支援

如有問題或建議，請聯繫開發團隊。

**文檔版本**: 1.0  
**最後更新**: 2024-10-08
