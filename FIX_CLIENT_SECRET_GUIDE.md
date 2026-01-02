# 修復 "client_secret is missing" 錯誤 - 完整指南

## ✅ 已完成的修改

1. ✅ 創建了新的後端 API：`exchangeGoogleCode`
2. ✅ 修改了前端代碼，使用後端 API 交換 token
3. ✅ 更新了 `functions/index.js` 導出新函數

## 🔧 接下來需要做的步驟

### 步驟 1：獲取 Google Client Secret

1. 前往：https://console.cloud.google.com/apis/credentials?project=347248637554
2. 找到您的 Web Client ID：`347248637554-fns863ln2vilkcsai6ttp17o5tm5lrdi.apps.googleusercontent.com`
3. 點擊編輯（鉛筆圖示）
4. 複製 **Client Secret**（如果沒有顯示，點擊「顯示」按鈕）

### 步驟 2：設置 Firebase Functions 環境變數

有兩種方式設置環境變數：

#### 方式 A：使用 Firebase CLI（推薦）

```bash
cd /Users/superdo/Documents/labelx_backend
firebase functions:secrets:set GOOGLE_WEB_CLIENT_ID
firebase functions:secrets:set GOOGLE_WEB_CLIENT_SECRET
```

當提示時，輸入：
- `GOOGLE_WEB_CLIENT_ID`: `347248637554-fns863ln2vilkcsai6ttp17o5tm5lrdi.apps.googleusercontent.com`
- `GOOGLE_WEB_CLIENT_SECRET`: 您從 Google Cloud Console 複製的 Client Secret

#### 方式 B：使用 `.env` 文件（Firebase Functions v2）

1. 在 `functions` 目錄創建 `.env` 文件：
   ```bash
   cd /Users/superdo/Documents/labelx_backend/functions
   touch .env
   ```

2. 在 `.env` 文件中添加：
   ```
   GOOGLE_WEB_CLIENT_ID=347248637554-fns863ln2vilkcsai6ttp17o5tm5lrdi.apps.googleusercontent.com
   GOOGLE_WEB_CLIENT_SECRET=your-client-secret-here
   ```

3. 確保 `.env` 在 `.gitignore` 中（不要提交到 Git）

### 步驟 3：更新後端代碼以使用環境變數

如果使用 Firebase Functions Secrets，需要更新 `exchangeGoogleCode.js`：

```javascript
// 在函數開始時獲取 secrets
const googleClientId = process.env.GOOGLE_WEB_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_WEB_CLIENT_SECRET;
```

如果使用 `.env` 文件，需要安裝 `dotenv`：

```bash
cd /Users/superdo/Documents/labelx_backend/functions
npm install dotenv
```

然後在 `exchangeGoogleCode.js` 頂部添加：
```javascript
require('dotenv').config();
```

### 步驟 4：部署後端函數

```bash
cd /Users/superdo/Documents/labelx_backend
firebase deploy --only functions:exchangeGoogleCode
```

### 步驟 5：測試

1. 重啟前端開發伺服器：
   ```bash
   cd /Users/superdo/Documents/labelx_backend/labelx
   npm start
   ```

2. 在 Web 版本中測試 Google 登入

3. 查看終端日誌，應該看到：
   ```
   🔵 步驟 4: 通過後端交換 authorization code 為 id token...
   🔵 步驟 5: Token 交換回應
   ✅ 登入成功!
   ```

## 📋 檢查清單

- [ ] 已從 Google Cloud Console 獲取 Client Secret
- [ ] 已設置 Firebase Functions 環境變數
- [ ] 已更新後端代碼（如果需要）
- [ ] 已部署 `exchangeGoogleCode` 函數
- [ ] 已測試登入流程

## 🐛 常見問題

### 問題 1：找不到 Client Secret

**解決**：
- 確認 Client ID 類型是「Web 應用程式」
- 如果沒有顯示，點擊「顯示」按鈕
- 如果還是沒有，可能需要重新創建 Client ID

### 問題 2：環境變數未生效

**檢查**：
- 確認環境變數名稱正確：`GOOGLE_WEB_CLIENT_ID` 和 `GOOGLE_WEB_CLIENT_SECRET`
- 確認已重新部署函數
- 查看 Firebase Console Logs 確認是否有錯誤

### 問題 3：後端 API 返回 500 錯誤

**檢查**：
- 查看 Firebase Console Logs
- 確認環境變數已正確設置
- 確認 Client ID 和 Client Secret 正確

## 💡 安全提醒

✅ **正確做法**：
- Client Secret 存儲在後端環境變數中
- 前端只發送 authorization code 和 code_verifier
- Client Secret 永遠不會暴露在前端

❌ **錯誤做法**：
- 在前端代碼中硬編碼 Client Secret
- 將 Client Secret 提交到 Git 倉庫
- 在環境變數文件中使用 Client Secret（如果會提交到 Git）

## 🎯 預期結果

修復後，登入流程應該是：

1. 前端獲取 authorization code
2. 前端發送 code 和 code_verifier 到後端 API
3. 後端使用 Client Secret 交換 id_token
4. 後端返回 id_token 給前端
5. 前端使用 id_token 驗證並登入

這樣可以保護 Client Secret，符合安全最佳實踐。


