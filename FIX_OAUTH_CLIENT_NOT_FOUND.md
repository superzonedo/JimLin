# 修復 "The OAuth client was not found" 錯誤

## ❌ 錯誤說明

**錯誤訊息**：
```
Error 400: Token 交換失敗
details: "The OAuth client was not found."
```

**原因**：
- Google 找不到對應的 OAuth client
- 可能的原因：
  1. Client ID 和 Client Secret 不匹配
  2. Client ID 或 Client Secret 錯誤
  3. Client ID 屬於不同的 Google Cloud 專案

## 🔍 診斷步驟

### 步驟 1：確認 Client ID 和 Client Secret 匹配

1. **前往 Google Cloud Console**：
   - 前往 Credentials 頁面（請替換為您的實際專案 ID）

2. **找到您的 Web Client ID**：
   - 請從 Google Cloud Console 複製實際的 Client ID

3. **確認 Client Secret**：
   - 點擊編輯（鉛筆圖示）
   - 查看 Client Secret
   - 複製實際的 Client Secret（請從 Google Cloud Console 獲取）

4. **確認專案 ID**：
   - Client ID 開頭應該與您的 Google Cloud 專案 ID 匹配

### 步驟 2：檢查後端日誌

查看 Firebase Console Logs：
1. 前往 Firebase Console 的 Logs 頁面（請替換為您的實際專案名稱）
2. 選擇「Cloud Functions」
3. 找到 `exchangeGoogleCode` 函數
4. 查看最近的執行記錄
5. 查看日誌中記錄的 `client_id` 是否正確

### 步驟 3：驗證 Secrets 是否正確

```bash
cd /Users/superdo/Documents/labelx_backend

# 檢查 Client ID
firebase functions:secrets:access GOOGLE_WEB_CLIENT_ID

# 檢查 Client Secret（只顯示前幾個字符）
firebase functions:secrets:access GOOGLE_WEB_CLIENT_SECRET | head -c 20
```

應該顯示：
- Client ID: 您的實際 Client ID
- Client Secret 開頭: `GOCSPX-...`（前幾個字符）

## ✅ 解決方案

### 方案 1：重新設置正確的 Secrets

如果 Client Secret 不正確：

1. **從 Google Cloud Console 獲取正確的 Client Secret**

2. **更新 Secret**：
   ```bash
   cd /Users/superdo/Documents/labelx_backend
   echo "正確的 Client Secret" | firebase functions:secrets:set GOOGLE_WEB_CLIENT_SECRET
   ```

3. **重新部署函數**：
   ```bash
   firebase deploy --only functions:exchangeGoogleCode
   ```

### 方案 2：確認 Client ID 和 Secret 屬於同一個 Client

1. **在 Google Cloud Console 中**：
   - 編輯 Client ID
   - 確認 Client Secret 是否正確顯示
   - 如果沒有顯示，點擊「顯示」或「重新生成」

2. **如果重新生成了 Client Secret**：
   - 必須更新 Firebase Secrets
   - 重新部署函數

### 方案 3：檢查專案 ID 是否匹配

確認：
- Google Cloud 專案 ID：您的實際專案 ID
- Client ID 開頭：應該與專案 ID 匹配
- Firebase 專案：您的實際 Firebase 專案名稱

如果專案 ID 不匹配，需要：
1. 使用正確專案的 Client ID 和 Secret
2. 或創建新的 Client ID 在正確的專案中

## 🧪 測試步驟

1. **確認 Secrets 正確**：
   ```bash
   firebase functions:secrets:access GOOGLE_WEB_CLIENT_ID
   firebase functions:secrets:access GOOGLE_WEB_CLIENT_SECRET
   ```

2. **重新部署函數**：
   ```bash
   firebase deploy --only functions:exchangeGoogleCode
   ```

3. **查看後端日誌**：
   - 前往 Firebase Console Logs
   - 查看 `exchangeGoogleCode` 的執行記錄
   - 確認日誌中記錄的 `client_id` 是否正確

4. **測試登入**：
   - 重試 Google 登入
   - 查看是否還有錯誤

## 📋 檢查清單

- [ ] Client ID 和 Client Secret 來自同一個 Google Cloud 專案
- [ ] Client ID 開頭與專案 ID 匹配
- [ ] Client Secret 正確且未過期
- [ ] Firebase Secrets 已正確設置
- [ ] 函數已重新部署
- [ ] 已查看後端日誌確認參數正確

## 🆘 如果仍有問題

請提供：
1. Firebase Console Logs 中的完整錯誤信息
2. 後端日誌中記錄的 `client_id` 值
3. Google Cloud Console 中顯示的 Client ID 和 Secret

這樣可以更準確地診斷問題。


