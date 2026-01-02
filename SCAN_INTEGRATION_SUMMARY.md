# 掃描功能 Firebase 後端串接完成總結

## ✅ 已完成的工作

### 1. 創建的文件

#### `labelx/lib/firebase.ts`
- Firebase 配置和初始化
- 使用 AsyncStorage 持久化認證狀態
- 支援環境變數配置

#### `labelx/lib/api/scanService.ts`
- 圖片上傳和分析 API 服務
- 圖片壓縮處理（通過 quality 參數）
- Base64 轉換
- Firebase Auth Token 自動獲取
- 完整的錯誤處理和日誌記錄

#### `labelx/app/(tabs)/scan.tsx` (已更新)
- 整合真實 API 調用
- 數據格式轉換（後端 → 前端）
- 進度顯示優化
- 圖片品質設置（quality: 0.8）

#### `labelx/SCAN_INTEGRATION_SETUP.md`
- 完整的設置指南
- 故障排除說明
- 數據結構文檔

## 🔧 功能特點

### 圖片壓縮
- ✅ 拍照時設置 `quality: 0.8` 減少文件大小
- ✅ 選擇圖片時也設置 `quality: 0.8`
- ✅ 可選：安裝 `expo-image-manipulator` 進行更進階壓縮

### 用戶認證
- ✅ 自動檢測用戶登入狀態
- ✅ 已登入：使用 Firebase Auth Token
- ✅ 未登入：自動使用開發模式（`devMode=true`）

### 數據流程
1. ✅ 用戶拍照/選擇圖片
2. ✅ 圖片壓縮（quality: 0.8）
3. ✅ 轉換為 base64
4. ✅ 發送到 Firebase Function (`uploadImage`)
5. ✅ 後端使用 Gemini AI 分析
6. ✅ 保存到 Firestore
7. ✅ 返回分析結果
8. ✅ 前端顯示結果頁面

## 📋 下一步操作

### 1. 安裝依賴

```bash
cd labelx
npm install firebase @react-native-async-storage/async-storage
```

### 2. 配置環境變數

創建 `labelx/.env` 文件：

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=lablex-api.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=lablex-api
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=lablex-api.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
EXPO_PUBLIC_API_BASE_URL=https://us-central1-lablex-api.cloudfunctions.net
```

**獲取 Firebase 配置**：
1. 前往 [Firebase Console](https://console.firebase.google.com/project/lablex-api/settings/general)
2. 在「您的應用程式」區塊找到 Web 應用程式配置
3. 複製對應的值

### 3. 確保用戶已登入

- 使用 Google 帳號登入（或其他登入方式）
- Firebase Auth 會自動處理認證

### 4. 測試掃描功能

1. 啟動開發伺服器：
   ```bash
   npm start
   ```

2. 在應用中測試：
   - 打開掃描頁面
   - 拍照或選擇圖片
   - 等待分析完成（約 5-10 秒）
   - 查看結果頁面

## 🔍 調試提示

### 查看日誌

前端日誌會顯示：
- 📸 開始處理圖片
- 🗜️  壓縮圖片中
- 🔄 轉換圖片為 base64
- 🔐 用戶已登入，獲取 Auth Token
- 📤 發送分析請求到後端
- ✅ 分析完成

### 檢查 Firebase Console

1. **Functions 日誌**：
   - 前往：https://console.firebase.google.com/project/lablex-api/functions/logs
   - 查看 `uploadImage` 函數的執行記錄

2. **Firestore 數據**：
   - 前往：https://console.firebase.google.com/project/lablex-api/firestore
   - 檢查 `products` 集合
   - 檢查 `users/{userId}/userProducts` 子集合

## ⚠️ 注意事項

1. **圖片大小**：建議 < 5MB，已通過 quality: 0.8 控制
2. **網絡連接**：確保設備有穩定的網絡連接
3. **用戶認證**：必須先登入才能使用完整功能
4. **環境變數**：確保 `.env` 文件已正確配置

## 🐛 常見問題

### 問題 1: "用戶未登入" 錯誤
- **解決**：確保已通過 Google 登入
- **檢查**：查看控制台日誌確認 Auth Token 獲取

### 問題 2: 圖片上傳失敗
- **檢查**：圖片大小、網絡連接、API 端點
- **解決**：確認 `.env` 配置正確

### 問題 3: 分析結果格式不匹配
- **檢查**：後端返回的數據結構
- **解決**：查看 `scanService.ts` 中的轉換邏輯

## 📊 數據結構對應

### 後端 → 前端轉換

| 後端字段 | 前端字段 | 說明 |
|---------|---------|------|
| `documentId` | `id` | 產品 ID |
| `imageUrl` | `imageUri` | 圖片 URL |
| `healthScore` | `healthScore` | 健康分數 |
| `maxRiskLevel` | `riskLevel` | 風險等級 |
| `beneficialIngredients` | `ingredients.safe` | 安全成分 |
| `additives` (High) | `ingredients.warning` | 警告成分 |
| `concerningIngredients` | `ingredients.warning` | 需注意成分 |

## ✨ 完成！

現在掃描功能已完全串接到 Firebase 後端。請按照上述步驟進行設置和測試。

如有任何問題，請查看 `SCAN_INTEGRATION_SETUP.md` 獲取詳細說明。

