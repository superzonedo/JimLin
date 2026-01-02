# 設置 Firebase Secrets - 正確方式

## ❌ 問題

錯誤訊息：`Google Client ID 或 Client Secret 未在後端配置`

**原因**：Firebase Functions v2 需要使用 `defineSecret` 和 `firebase functions:secrets:set` 來設置 secrets，而不是直接在 Firebase Console 設置環境變數。

## ✅ 正確的設置方式

### 步驟 1：使用 Firebase CLI 設置 Secrets

```bash
cd /Users/superdo/Documents/labelx_backend

# 設置 GOOGLE_WEB_CLIENT_ID
echo "YOUR_CLIENT_ID_HERE" | firebase functions:secrets:set GOOGLE_WEB_CLIENT_ID

# 設置 GOOGLE_WEB_CLIENT_SECRET
echo "YOUR_CLIENT_SECRET_HERE" | firebase functions:secrets:set GOOGLE_WEB_CLIENT_SECRET
```

**或者手動輸入**：

```bash
# 設置 Client ID
firebase functions:secrets:set GOOGLE_WEB_CLIENT_ID
# 當提示時，輸入您的實際 Client ID

# 設置 Client Secret
firebase functions:secrets:set GOOGLE_WEB_CLIENT_SECRET
# 當提示時，輸入您的實際 Client Secret
```

### 步驟 2：確認 Secrets 已設置

```bash
firebase functions:secrets:access GOOGLE_WEB_CLIENT_ID
firebase functions:secrets:access GOOGLE_WEB_CLIENT_SECRET
```

應該會顯示對應的值。

### 步驟 3：重新部署函數

**重要**：設置 secrets 後，必須重新部署函數：

```bash
cd /Users/superdo/Documents/labelx_backend
firebase deploy --only functions:exchangeGoogleCode
```

### 步驟 4：測試

1. 重啟前端開發伺服器
2. 測試 Google 登入
3. 應該可以正常運作

## 🔍 驗證 Secrets 是否正確設置

### 方法 1：使用 Firebase CLI

```bash
firebase functions:secrets:access GOOGLE_WEB_CLIENT_ID
firebase functions:secrets:access GOOGLE_WEB_CLIENT_SECRET
```

### 方法 2：查看 Firebase Console

1. 前往 Firebase Console 的 Secrets 頁面（請替換為您的實際專案名稱）
2. 應該看到兩個 secrets：
   - `GOOGLE_WEB_CLIENT_ID`
   - `GOOGLE_WEB_CLIENT_SECRET`

## 📋 檢查清單

- [ ] 已使用 `firebase functions:secrets:set` 設置 secrets
- [ ] 已確認 secrets 可以訪問
- [ ] 已重新部署 `exchangeGoogleCode` 函數
- [ ] 已測試登入

## 💡 重要區別

### Firebase Functions v2 Secrets vs 環境變數

- **Secrets**：使用 `defineSecret` + `firebase functions:secrets:set`
  - 用於敏感信息（如 Client Secret）
  - 更安全，不會在日誌中暴露
  - 需要在函數配置中指定 `secrets: [...]`

- **環境變數**：使用 `process.env` + Firebase Console
  - 用於非敏感配置
  - 可以在 Firebase Console 直接設置

對於 Client Secret，應該使用 **Secrets**。

## 🐛 如果仍有問題

1. **確認 secrets 名稱正確**：
   - `GOOGLE_WEB_CLIENT_ID`（不是 `GOOGLE_CLIENT_ID`）
   - `GOOGLE_WEB_CLIENT_SECRET`（不是 `GOOGLE_CLIENT_SECRET`）

2. **確認函數已重新部署**：
   - Secrets 設置後必須重新部署才會生效

3. **查看 Firebase Console Logs**：
   - 前往 Firebase Console 的 Logs 頁面（請替換為您的實際專案名稱）
   - 查看 `exchangeGoogleCode` 的執行記錄


