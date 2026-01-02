# RevenueCat 2-Tier Pricing Update Complete ✅

## 問題原因與解決方案

### 原始問題
**"App entry not found"** 錯誤是因為 `react-native-purchases`（RevenueCat SDK）是一個**原生模組**，無法在 **Expo Go** 中運行。

### 最新更新（當前會話）
✅ **完成新的 2 層訂閱定價結構：**
- **1 個月：$19.99 USD**
- **12 個月：$39.99 USD**（標記為「Most Popular」）

移除了舊的 3 個月和 6 個月訂閱選項。

### 已完成的修改（本次會話）

1. **`src/screens/SubscriptionScreen.tsx`** ✅
   - 更新年度方案價格：$39.99/年（原 ¥99）
   - 計算節省：每月 $3.33，節省 83%
   - 更新按鈕文字：`立即訂閱 $19.99/月` 或 `$39.99/年`
   - 移除舊的 3 個月和 6 個月選項

2. **`src/screens/PaywallScreen.tsx`** ✅
   - 默認選擇改為 `12months`（原為 `6months`）
   - 更新 `formatPrice` 函數：僅支援 1 個月和 12 個月
   - 移除舊的定價卡片：3 個月、6 個月
   - 現在只顯示 2 張卡片：
     - 1 個月（$19.99）
     - 12 個月（$39.99，標記為 MOST POPULAR）
   - 更新帳單週期文字

### 之前完成的修改

1. **`src/api/revenue-cat-service.ts`** - 重寫為條件導入
   - 檢測是否在 Expo Go 中運行
   - 如果在 Expo Go，優雅地跳過 RevenueCat 初始化
   - 所有函數返回安全的默認值
   - 添加清晰的控制台日誌：📱 Running in Expo Go

2. **`src/types/subscription.ts`** - 更新訂閱類型
   - 從 `"3months" | "6months" | "12months"` 改為 `"1month" | "12months"`
   - 配合您要求的新定價方案

3. **`src/state/subscriptionStore.ts`** - 修改類型導入
   - 使用 `any` 類型避免在 Expo Go 中的導入錯誤

4. **`src/screens/PaywallScreen.tsx`** - 修改類型導入
   - 不直接從 `react-native-purchases` 導入
   - 使用本地類型定義

## 現在的行為

### 在 Expo Go 中（當前）
- ✅ 應用程式正常啟動，不會崩潰
- ⚠️  RevenueCat 功能被禁用（付款功能不可用）
- 📱 控制台顯示：「Running in Expo Go - RevenueCat initialization skipped」
- 🎨 UI 仍然正常顯示（Paywall、ProfileScreen 等）
- 💡 可以測試所有非付款相關的功能

### 在 Development Build 中（生產環境）
- ✅ RevenueCat 完全可用
- ✅ 可以進行真實的 IAP 購買測試
- ✅ 可以使用 Sandbox 測試帳號
- ✅ 訂閱狀態正常同步

## 下一步：RevenueCat Dashboard 配置

在 RevenueCat Dashboard 中，您需要配置以下 2 個產品 ID：

### iOS App Store Connect
1. **labelx_1month** - $19.99 USD（月度訂閱）
2. **labelx_12months** - $39.99 USD（年度訂閱，自動續訂）

### RevenueCat Dashboard
- 創建 Offering ID: `default`
- 添加 2 個 Package：
  - Package 1: `1month` → 對應 `labelx_1month`
  - Package 2: `12months` → 對應 `labelx_12months`

## 測試 RevenueCat 功能

要測試完整的 RevenueCat 付款功能，您需要創建 **Development Build**：

### 方法 1：使用 EAS Build（推薦）

```bash
# 安裝 EAS CLI
npm install -g eas-cli

# 登入 Expo 帳號
eas login

# 初始化 EAS 配置
eas build:configure

# 構建 iOS 開發版本（可在模擬器中測試）
eas build --profile development --platform ios

# 構建 Android 開發版本（APK，可安裝到真實設備）
eas build --profile development --platform android
```

### 方法 2：使用本地構建

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

## 當前可以測試的功能

即使在 Expo Go 中，以下功能仍然可以測試：

1. ✅ **掃描限制 UI**
   - HomeScreen 的掃描額度橫幅
   - 掃描 5 次後的限制 Modal
   
2. ✅ **Paywall UI**
   - 導航至 ProfileScreen → 點擊升級卡片
   - 查看 Paywall 設計和佈局
   - 注意：點擊「購買」會顯示錯誤（預期行為）

3. ✅ **Premium UI 狀態**
   - 可以手動設置 `isPremium = true` 測試 UI
   - ProfileScreen 的 PRO 徽章
   - HomeScreen 的會員橫幅

4. ✅ **所有其他應用功能**
   - 食品掃描
   - 歷史記錄
   - 用戶資料
   - 登入/登出

## 手動測試 Premium UI

如果您想在 Expo Go 中查看 Premium 用戶的 UI，可以臨時修改代碼：

```typescript
// 在 src/state/subscriptionStore.ts 的初始 state 中
isPremium: true,  // 改為 true
subscriptionType: "12months",  // 添加這行
```

重新加載應用後，您會看到：
- HomeScreen 顯示 Premium 徽章
- ProfileScreen 顯示 PRO 標籤和會員狀態
- CameraScreen 允許無限掃描

## 控制台日誌說明

現在您會看到更清晰的日誌訊息：

```
✅ RevenueCat loaded successfully          // Development Build 中
📱 Running in Expo Go - ...                // Expo Go 中
⚠️  RevenueCat not available - ...        // 導入失敗時
❌ Failed to initialize RevenueCat: ...   // 初始化錯誤
```

## 總結

✅ **問題已修復** - 應用程式現在可以在 Expo Go 中正常運行  
⚠️  **功能限制** - RevenueCat IAP 需要 Development Build  
🚀 **下一步** - 創建 Development Build 以測試完整付款功能  

---

**應用程式現在應該可以在您的 Vibecode 預覽中正常顯示了！** 🎉

如果仍有問題，請重新加載應用程式（在 Expo Go 中搖動設備 → 點擊 "Reload"）。
