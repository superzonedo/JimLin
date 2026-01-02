# Google 登入功能使用指南

## ✅ 已完成的工作

1. ✅ 後端 API：`verifyGoogleLogin` - 驗證 Google ID token 並創建/獲取 Firebase 使用者
2. ✅ 前端實作：Google 登入按鈕和 OAuth 流程
3. ✅ 已部署後端 API

## 🔧 後端 API

### 端點資訊

- **URL**: `https://us-central1-lablex-api.cloudfunctions.net/verifyGoogleLogin`
- **方法**: `POST`
- **請求格式**:
  ```json
  {
    "idToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### 回應格式

```json
{
  "success": true,
  "customToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "google:123456789",
  "email": "user@gmail.com",
  "displayName": "User Name",
  "photoURL": "https://...",
  "message": "Google 登入驗證成功"
}
```

## 📱 前端配置

### 環境變數設置

在專案根目錄創建或更新 `.env` 文件：

```bash
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-google-web-client-id.apps.googleusercontent.com
```

### 獲取 Google OAuth Client ID

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇或創建專案
3. 啟用 Google+ API
4. 前往「憑證」→「建立憑證」→「OAuth 用戶端 ID」
5. 選擇「網頁應用程式」
6. 設置授權重新導向 URI：
   - `https://auth.expo.io/@your-username/labelx` (Expo Go)
   - `labelx://` (Development Build)
7. 複製生成的 Client ID

## 🧪 測試步驟

### 1. 配置環境變數

```bash
# 在 labelx 目錄下創建 .env 文件
cd /Users/superdo/Documents/labelx_backend/labelx
echo "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com" > .env
```

### 2. 重啟開發伺服器

```bash
# 停止當前伺服器（Ctrl+C），然後重啟
npm start
```

### 3. 測試登入

1. 在應用中前往「個人檔案」頁面
2. 點擊「登入 / 註冊」
3. 點擊「使用 Google 登入」按鈕
4. 選擇 Google 帳戶
5. 授權應用存取
6. 確認登入成功

## 🔐 技術細節

### Google OAuth 流程

1. **前端發起授權請求**：
   - 使用 `expo-auth-session` 創建 OAuth 請求
   - 使用 `useProxy: true` 進行開發測試
   - 請求 `openid`, `profile`, `email` 權限

2. **獲取 ID Token**：
   - Google 返回 `id_token`
   - 前端將 token 發送到後端 API

3. **後端驗證**：
   - 使用 Google OAuth2 API 驗證 token
   - 提取用戶信息（email, name, picture）
   - 創建或獲取 Firebase 使用者
   - 返回 custom token

4. **前端處理**：
   - 更新用戶狀態
   - 顯示登入成功訊息

### 錯誤處理

- **未配置 Client ID**：顯示提示訊息
- **用戶取消登入**：靜默處理，不顯示錯誤
- **驗證失敗**：顯示錯誤訊息
- **網路錯誤**：顯示錯誤訊息

## 📝 注意事項

1. **開發環境**：
   - 使用 `useProxy: true` 進行開發測試
   - 生產環境應使用自定義 redirect URI

2. **跨平台支援**：
   - Google 登入支援 iOS、Android 和 Web
   - 比 Apple 登入更通用

3. **安全性**：
   - ID token 只在後端驗證
   - 不直接在前端使用 token

4. **用戶信息**：
   - Google 每次登入都會提供完整用戶信息
   - 與 Apple 登入不同（Apple 只在首次提供）

## 🚀 部署檢查清單

- [x] 後端 API 已部署
- [x] 前端代碼已實作
- [ ] 配置 Google OAuth Client ID
- [ ] 測試登入流程
- [ ] 確認用戶信息正確保存

## 🐛 常見問題

### Q: Google 登入按鈕點擊沒反應？
A: 檢查：
- 環境變數 `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` 是否正確配置
- 是否重啟了開發伺服器
- 查看 console 是否有錯誤訊息

### Q: 顯示「設定未完成」？
A: 確保：
- `.env` 文件存在且包含正確的 Client ID
- Client ID 不是預設值（不包含 "your-"）
- 已重啟開發伺服器

### Q: 登入後無法獲取用戶信息？
A: 檢查：
- 後端 API 是否正常運作
- 網路連線是否正常
- 查看後端 logs 確認錯誤

## 📚 相關文件

- [Expo Auth Session](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Firebase Auth - Google](https://firebase.google.com/docs/auth/web/google-signin)
