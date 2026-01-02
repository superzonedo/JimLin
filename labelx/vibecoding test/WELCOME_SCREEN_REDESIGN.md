# Onboarding Welcome Screen 重新設計完成

## 概述

已成功將 Welcome Screen 重新設計為現代化的多頁面 Onboarding 體驗，包含啟動畫面、功能介紹和行動呼籲頁面。

## 新增功能

### 1. **三頁式 Onboarding 流程**

#### 第 1 頁：Splash 啟動畫面
- **檔案**: `src/components/SplashOnboardingScreen.tsx`
- **設計**:
  - 綠色漸層背景 (#2CB67D → #1E8A5A)
  - 居中顯示 "LabelX" 大型 Logo
  - "Label Inspection" 副標題
  - 底部載入動畫（ActivityIndicator）
  - 2 秒後自動切換到下一頁

#### 第 2 頁：功能介紹
- **使用提供的照片**: `assets/onboarding/hero-scanning.jpg`
- **設計**:
  - 全螢幕背景照片（女性使用手機掃描食品）
  - 頂部: 小型 "LabelX" Logo
  - 底部: 深色漸層遮罩
  - 大標題: "智慧掃描\n健康選擇"
  - 副標題: "即時分析食品成分，做出更明智的飲食決定"
  - 可左右滑動換頁

#### 第 3 頁：開始使用
- **使用相同照片** 作為背景
- **設計**:
  - 標題: "開始您的\n健康之旅"
  - 副標題: "讓我們快速了解您的健康需求"
  - **綠色大按鈕**: "開始設定" → 導航到問卷頁面
  - **登入連結**: "已經有帳號了？登入" → 導航到登入頁面
  - 白色文字配深色漸層背景

### 2. **新組件**

#### OnboardingSlide 組件
- **檔案**: `src/components/OnboardingSlide.tsx`
- **功能**:
  - 可重複使用的滑動頁面組件
  - 支援背景圖片或純色背景
  - 頂部 Logo 顯示
  - 底部內容區域（標題、副標題、按鈕）
  - 深色漸層遮罩增強文字可讀性
  - 支援按鈕和登入連結

#### SplashOnboardingScreen 組件
- **檔案**: `src/components/SplashOnboardingScreen.tsx`
- **功能**:
  - 品牌啟動畫面
  - 綠色漸層背景
  - 大型 Logo 展示
  - 自動計時器（2 秒後觸發 onComplete 回調）
  - SafeAreaView 處理 iPhone 瀏海和 Home Indicator

### 3. **重新設計的 WelcomeScreen**

- **檔案**: `src/screens/WelcomeScreen.tsx`（已覆寫）
- **功能**:
  - 使用 FlatList 實現水平滑動
  - 3 個滑動頁面
  - 頁面指示器（白色小圓點，當前頁面為長條形）
  - Splash 畫面不可滑動（禁用手勢）
  - 自動從 Splash 過渡到第一個內容頁面
  - 手動滑動第 2-3 頁
  - "開始設定" 按鈕 → 導航到問卷頁面
  - "登入" 連結 → 導航重置到認證頁面

## 資源文件

### 新增資源
- **照片**: `assets/onboarding/hero-scanning.jpg`
  - 尺寸: 103KB
  - 來源: 用戶提供的 Onboarding 照片
  - 用途: 第 2 和第 3 頁的背景圖片

### 使用的套件
- `expo-linear-gradient`: 漸層背景效果
- `react-native-safe-area-context`: 安全區域處理
- `@react-navigation/native`: 頁面導航

## 使用流程

### 用戶體驗流程
1. **開啟 App** → 看到綠色 Splash 畫面（2 秒）
2. **自動切換** → 第 2 頁功能介紹
3. **左右滑動** → 瀏覽功能介紹
4. **第 3 頁** → 看到 "開始設定" 按鈕
5. **點擊按鈕** → 進入 7 步驟問卷調查
6. **或點擊登入** → 進入登入頁面（已有帳號用戶）

### 導航邏輯
```
App 啟動
  ↓
hasCompletedOnboarding === false
  ↓
OnboardingNavigator
  ↓
WelcomeScreen (3 個滑動頁面)
  ├─ Splash (自動切換)
  ├─ 功能介紹 (手動滑動)
  └─ 開始使用
      ├─ "開始設定" → OnboardingQuestionsScreen
      └─ "登入" → AuthNavigator (reset)
```

## 視覺設計

### 顏色配置
- **Splash 背景**: 綠色漸層 (#2CB67D → #249C6A → #1E8A5A)
- **Logo 文字**: 白色 (#FFFFFF)
- **標題文字**: 白色，大字體 (40pt)
- **副標題**: 半透明白色 (rgba(255, 255, 255, 0.9))
- **按鈕**: 品牌綠 (#2CB67D)，白色文字
- **登入連結**: 半透明白色，"登入" 文字為品牌綠

### 排版
- **Logo (Splash)**: 56pt, 粗體, 白色
- **Logo (頁面頂部)**: 28pt, 粗體, 白色
- **標題**: 40pt, 粗體, 白色, 行高 48pt
- **副標題**: 16pt, 常規, 白色, 行高 24pt
- **按鈕文字**: 18pt, 粗體, 大寫, 白色
- **登入連結**: 15pt, 常規/粗體混合, 白色/綠色

### 動畫效果
- **Splash 過渡**: 2 秒後自動 scrollToIndex
- **滑動動畫**: FlatList 原生水平滑動動畫
- **頁面指示器**: 當前頁面為長條形，其他為圓點

## 技術細節

### 自動切換實現
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    onComplete();
  }, 2000);
  
  return () => clearTimeout(timer); // 清理計時器
}, [onComplete]);
```

### 滑動控制
```typescript
scrollEnabled={currentIndex > 0} // Splash 時禁用滑動
```

### 頁面追蹤
```typescript
onViewableItemsChanged={onViewableItemsChanged}
viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
```

## 已知限制與改進建議

### 當前限制
1. **第 2 和第 3 頁使用相同照片**: 因只提供一張照片，兩個內容頁使用相同背景
2. **登入導航**: "登入" 連結目前重置導航，實際應導航到 AuthNavigator

### 建議改進
1. **新增第二張照片**: 為第 3 頁準備不同的背景圖片（建議：健康食品、營養成分展示等）
2. **修復登入導航**: 更新 App.tsx 以正確處理從 Onboarding 到 Auth 的導航
3. **新增滑動動畫**: 為頁面過渡添加更流暢的動畫效果
4. **響應式設計**: 針對不同螢幕尺寸優化排版
5. **無障礙支援**: 新增螢幕閱讀器標籤和無障礙功能

## 測試清單

- [ ] Splash 畫面正確顯示綠色漸層和 Logo
- [ ] 2 秒後自動切換到第 2 頁
- [ ] 可手動左右滑動第 2-3 頁
- [ ] 頁面指示器正確顯示當前頁面
- [ ] 照片正確載入並顯示
- [ ] 文字在深色遮罩上清晰可讀
- [ ] "開始設定" 按鈕導航到問卷頁面
- [ ] "登入" 連結可點擊（目前導航可能需修正）
- [ ] SafeArea 在各種 iPhone 型號上正確顯示
- [ ] 不會在 Splash 畫面時滑動

## 檔案清單

### 新增檔案
- ✅ `src/components/SplashOnboardingScreen.tsx` - Splash 啟動畫面組件
- ✅ `src/components/OnboardingSlide.tsx` - 可重複使用的滑動頁面組件
- ✅ `assets/onboarding/hero-scanning.jpg` - Onboarding 背景照片 (103KB)

### 修改檔案
- ✅ `src/screens/WelcomeScreen.tsx` - 重新設計為多頁面滑動體驗

### 未修改檔案
- `src/navigation/OnboardingNavigator.tsx` - 保持不變
- `src/screens/OnboardingQuestionsScreen.tsx` - 保持不變
- `App.tsx` - 保持不變

---

**更新日期**: 2025-10-14  
**版本**: 2.0  
**設計風格**: 現代多頁面 Onboarding 體驗
