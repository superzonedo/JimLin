# 檢查 OAuth Client 配置

## 🔍 診斷步驟

### 步驟 1：確認 Client ID 和 Secret 匹配

**在 Google Cloud Console 中確認**：

1. 前往：https://console.cloud.google.com/apis/credentials?project=您的實際專案 ID
2. 找到 Web Client ID：`請從 Google Cloud Console 複製實際的 Client ID`
3. 點擊編輯
4. **確認 Client Secret 是否為**：`請從 Google Cloud Console 複製實際的 Client Secret`

**重要**：
- 如果 Google Cloud Console 中顯示的 Client Secret **不同**，需要使用正確的 Secret
- 如果顯示「已重新生成」，舊的 Secret 已失效，需要使用新的

### 步驟 2：查看 Firebase Console Logs

1. 前往：https://console.firebase.google.com/project/lablex-api/logs
2. 選擇「Cloud Functions」
3. 找到 `exchangeGoogleCode` 函數
4. 查看最近的執行記錄
5. **查找日誌**：`交換 token 請求參數:`
6. **確認**：
   - `client_id` 是否為：`請從 Google Cloud Console 複製實際的 Client ID`
   - `client_secret` 開頭是否為：`GOCSPX-N0g1W...`

### 步驟 3：驗證 Secrets

```bash
cd /Users/superdo/Documents/labelx_backend

# 檢查 Client ID
firebase functions:secrets:access GOOGLE_WEB_CLIENT_ID

# 檢查 Client Secret（只顯示前幾個字符）
firebase functions:secrets:access GOOGLE_WEB_CLIENT_SECRET | head -c 20
```

**應該顯示**：
- Client ID: `請從 Google Cloud Console 複製實際的 Client ID`
- Client Secret 開頭: `GOCSPX-N0g1W...`

## ✅ 如果 Client Secret 不正確

### 更新 Secret

```bash
cd /Users/superdo/Documents/labelx_backend

# 從 Google Cloud Console 複製正確的 Client Secret
echo "正確的 Client Secret" | firebase functions:secrets:set GOOGLE_WEB_CLIENT_SECRET

# 重新部署函數
firebase deploy --only functions:exchangeGoogleCode
```

## 🐛 常見問題

### 問題 1：Client Secret 已重新生成

**症狀**：Google Cloud Console 顯示「已重新生成」或 Secret 不同

**解決**：
1. 複製新的 Client Secret
2. 更新 Firebase Secret
3. 重新部署函數

### 問題 2：Client ID 和 Secret 不匹配

**症狀**：Client ID 和 Secret 來自不同的 OAuth client

**解決**：
1. 確認 Client ID 和 Secret 來自同一個 OAuth client
2. 在 Google Cloud Console 中編輯 Client ID，確認對應的 Secret

### 問題 3：專案 ID 不匹配

**症狀**：Client ID 開頭不是 `您的實際專案 ID`

**解決**：
1. 確認 Google Cloud 專案 ID 是 `您的實際專案 ID`
2. 確認 Client ID 屬於這個專案

## 📋 檢查清單

- [ ] Google Cloud Console 中顯示的 Client Secret 是 `請從 Google Cloud Console 複製實際的 Client Secret`
- [ ] Firebase Secrets 中的 Client Secret 與 Google Cloud Console 一致
- [ ] Client ID 開頭是 `您的實際專案 ID`
- [ ] 函數已重新部署
- [ ] 已查看 Firebase Console Logs 確認參數正確


