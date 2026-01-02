# Onboarding 問卷流程完成說明

## 概述

已成功實作完整的 Onboarding 問卷流程，包含 7 個步驟的問卷調查。使用者在首次開啟應用程式時必須完成問卷才能進入主應用程式。

## 已實作功能

### 1. **核心組件**

#### OptionChip (`src/components/OptionChip.tsx`)
- 可選擇的選項卡片組件
- 支援單選和多選模式
- 支援 `default` 和 `large` 兩種尺寸變體
- 使用 react-native-reanimated 實作按壓動畫效果

#### QuestionCard (`src/components/QuestionCard.tsx`)
- 問題卡片容器組件
- 顯示圖標、問題標題、副標題
- 自動排列選項（flex-wrap）
- 圓角卡片設計，帶有陰影效果

### 2. **Onboarding 畫面**

#### WelcomeScreen (`src/screens/WelcomeScreen.tsx`)
- 歡迎畫面，顯示 LabelX logo 和應用簡介
- 「開始設定」按鈕導航到問卷頁面
- 顯示「僅需 2 分鐘完成」提示

#### OnboardingQuestionsScreen (`src/screens/OnboardingQuestionsScreen.tsx`)
- 7 步驟問卷調查系統
- 頂部進度條顯示當前進度（步驟 X / 7）
- 底部導航按鈕（上一步、下一步/完成）
- 每個步驟必須回答才能繼續
- 步驟內容：

**步驟 1: 食品安全關注**
- 問題：「我不太在意食品安全？」
- 是/否 兩個大按鈕（large variant）

**步驟 2: 飲食習慣**
- 問題：「您平常對食品標籤的關注程度？」
- 6 個單選選項

**步驟 3: 過敏原**
- 問題：「我沒有過敏原？」
- 多選，包含「是的，我沒有過敏原」和 8 種常見過敏原
- 選擇「沒有過敏原」會清空其他選項

**步驟 4: 健康目標**
- 問題：「您的健康目標是什麼？」
- 多選，7 個健康目標選項

**步驟 5: 健康狀況**
- 問題：「您是否有以下健康狀況？」
- 多選，包含「沒有特殊健康狀況」和 7 種疾病選項
- 選擇「沒有」會清空其他選項

**步驟 6: 家庭成員關注**
- 問題：「您心裡最在意誰的健康？」
- 多選，7 個家庭成員選項
- 選擇「只有自己」會清空其他選項

**步驟 7: 基本資料**
- 兩個問題卡片：
  - 性別（4 個選項）
  - 年齡層（5 個選項）
- 兩者都必須選擇才能完成

#### OnboardingCompleteScreen (`src/screens/OnboardingCompleteScreen.tsx`)
- 完成畫面，顯示成功圖標
- 顯示摘要統計（健康目標、過敏原、關注成員）
- 根據登入狀態顯示不同按鈕：
  - **訪客用戶**：「註冊/登入以儲存設定」和「稍後再說，開始使用」
  - **已登入用戶**：「開始使用 LabelX」
- 自動儲存問卷數據到 userStore

### 3. **導航系統**

#### OnboardingNavigator (`src/navigation/OnboardingNavigator.tsx`)
- Native Stack Navigator
- 包含 3 個畫面：Welcome → Questions → Complete
- 禁用手勢返回功能
- 使用 fade 動畫過渡

### 4. **狀態管理**

#### 更新 UserStore (`src/state/userStore.ts`)
- 新增 `hasCompletedOnboarding` 狀態（預設 false）
- 新增 `onboardingData` 物件儲存問卷答案
- 新增 `completeOnboarding()` 方法：
  - 儲存問卷數據
  - 將過敏原、健康目標、疾病選項映射到 preferences
  - 如果用戶已登入，自動同步到 Supabase
- 更新 `syncFromSupabase()` 以同步問卷數據

#### 型別定義 (`src/types/user.ts`)
- 新增 `OnboardingData` interface：
  ```typescript
  interface OnboardingData {
    careAboutFoodSafety: boolean;
    dietAwareness: string;
    familyMembers: string[];
    gender: string;
    ageGroup: string;
  }
  ```
- 更新 `UserState` interface 加入問卷相關欄位

### 5. **Supabase 整合**

#### 資料庫遷移 (`supabase/migrations/007_add_onboarding_fields.sql`)
新增以下欄位到 `profiles` 表：
- `onboarding_completed` (boolean)
- `care_about_food_safety` (boolean)
- `gender` (text)
- `age_group` (text)
- `diet_awareness` (text)
- `family_members` (text[])

#### Profile Service (`src/api/profile-service.ts`)
- 更新 `syncPreferences()` 函數接受可選的 `onboardingData` 參數
- 更新 `Profile` interface 包含問卷欄位
- 自動同步問卷數據到 Supabase（僅限已登入用戶）

### 6. **應用程式入口**

#### App.tsx
更新導航邏輯：
1. **Loading**: 檢查認證狀態
2. **未完成 Onboarding**: 顯示 OnboardingNavigator
3. **已完成 Onboarding + 未登入**: 顯示 AuthNavigator
4. **已完成 Onboarding + 已登入**: 顯示 TabNavigator

## 用戶流程

### 首次使用（訪客）
1. 開啟應用程式 → 看到 WelcomeScreen
2. 點擊「開始設定」→ 進入 7 步驟問卷
3. 逐步回答所有問題（每步驟必須回答）
4. 完成後看到 CompleteScreen
5. 選擇「稍後再說，開始使用」→ 進入主應用程式（作為訪客）
6. 或選擇「註冊/登入以儲存設定」→ 進入登入頁面

### 首次使用（已登入）
1. 如果用戶在完成問卷前就已登入
2. 流程相同，但完成後直接顯示「開始使用 LabelX」按鈕
3. 問卷數據自動同步到 Supabase

### 後續使用
- 用戶完成問卷後，`hasCompletedOnboarding` 設為 true
- 下次開啟應用程式直接跳過 Onboarding，根據登入狀態進入相應頁面
- 訪客用戶登入後，本地儲存的問卷數據會自動同步到 Supabase

## 資料儲存

### 本地儲存 (AsyncStorage)
- 使用 Zustand persist 中介軟體
- 所有問卷數據和偏好設定永久保存
- 即使訪客用戶也能保留數據

### 雲端同步 (Supabase)
- 已登入用戶的數據自動同步
- 包含問卷原始答案和映射後的偏好設定
- 訪客登入後自動上傳本地數據

## 設計特點

### 視覺設計
- 使用 LabelX 品牌色：
  - 主色：#2CB67D（綠色）
  - 輔色：#F3D2C1（珊瑚色）
  - 文字色：#001858（深藍）
- 圓角卡片設計（rounded-3xl）
- 柔和陰影效果（shadowOpacity: 0.05）
- 一致的間距和排版

### 互動體驗
- 按壓動畫反饋（scale to 0.95）
- 平滑的步驟轉換動畫
- 進度條視覺指示
- 清晰的選中狀態（綠色背景 + 白色文字）
- 禁用狀態視覺提示（opacity: 0.5）

### 用戶體驗
- 強制完成問卷（無跳過選項）
- 每步驟必須回答才能繼續
- 可返回上一步修改答案
- 互斥選項邏輯（如「沒有過敏」vs 具體過敏原）
- 完成後顯示數據摘要

## 技術特點

- **TypeScript**: 完整的型別定義和型別安全
- **React Native Reanimated**: 流暢的動畫效果
- **Zustand**: 輕量級狀態管理，支援持久化
- **Supabase**: 即時資料同步
- **React Navigation**: 原生導航體驗
- **Safe Area**: 完整支援 iPhone 瀏海和底部安全區域

## 檔案清單

### 新增檔案
- `src/components/OptionChip.tsx`
- `src/components/QuestionCard.tsx`
- `src/screens/WelcomeScreen.tsx`
- `src/screens/OnboardingQuestionsScreen.tsx`
- `src/screens/OnboardingCompleteScreen.tsx`
- `src/navigation/OnboardingNavigator.tsx`
- `supabase/migrations/007_add_onboarding_fields.sql`

### 修改檔案
- `src/types/user.ts` - 新增 OnboardingData interface
- `src/types/navigation.ts` - 新增 OnboardingStackParamList
- `src/state/userStore.ts` - 新增問卷狀態和方法
- `src/api/profile-service.ts` - 支援問卷數據同步
- `App.tsx` - 整合 Onboarding 導航流程

## 下一步建議

### 優化項目
1. **多語言支援**: 實作 i18n，支援繁中/簡中/英文切換
2. **Lottie 動畫**: 在 WelcomeScreen 加入動態插畫
3. **進度保存**: 允許用戶中途退出，下次繼續填寫
4. **分析追蹤**: 記錄用戶在各步驟的停留時間和跳出率

### 功能擴充
1. **編輯問卷**: 允許用戶在設定頁面重新填寫問卷
2. **個人化建議**: 根據問卷答案提供客製化的健康建議
3. **家庭模式**: 為不同家庭成員建立獨立配置檔
4. **智能提醒**: 根據「在意程度」調整警報敏感度

## 測試建議

### 功能測試
- [ ] 首次開啟應用程式顯示 Onboarding
- [ ] 無法跳過任何步驟
- [ ] 每個選項都可正常選擇/取消選擇
- [ ] 互斥選項邏輯正確（「沒有」選項）
- [ ] 進度條正確更新
- [ ] 上一步/下一步按鈕正確顯示和禁用
- [ ] 完成後數據正確保存
- [ ] 訪客和登入用戶看到不同的完成畫面
- [ ] 再次開啟應用程式不顯示 Onboarding

### UI 測試
- [ ] 所有文字清晰可讀
- [ ] 選項卡片尺寸適當，易於點擊
- [ ] 動畫流暢無卡頓
- [ ] 支援 iPhone 各種尺寸（SE, 12, 14 Pro Max）
- [ ] 支援深色模式（如適用）
- [ ] 鍵盤不遮擋內容（如有文字輸入）

### 數據測試
- [ ] 問卷數據正確保存到 AsyncStorage
- [ ] 已登入用戶數據正確同步到 Supabase
- [ ] 訪客登入後本地數據成功上傳
- [ ] 多設備登入數據一致

---

**建立日期**: 2025-10-14  
**版本**: 1.0  
**作者**: Ken (AI Assistant)
