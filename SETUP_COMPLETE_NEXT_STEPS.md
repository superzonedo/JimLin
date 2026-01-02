# 設置完成後的步驟

## ✅ 已完成
- 已運行設置腳本
- 已獲取 Client Secret

## 🔧 接下來需要做的步驟

### 步驟 1：在 Firebase Console 設置環境變數

1. **前往 Firebase Console**：
   - 訪問 Firebase Console 的 Functions 配置頁面（請替換為您的實際專案名稱）
   - 或：Firebase Console → 專案設定 → 函式 → 環境變數

2. **添加環境變數**：
   - 點擊「**添加變數**」或「**新增變數**」
   - 添加第一個變數：
     - **名稱**：`GOOGLE_WEB_CLIENT_ID`
     - **值**：請從 Google Cloud Console 複製您的實際 Client ID
   - 點擊「**新增**」或「**儲存**」
   - 添加第二個變數：
     - **名稱**：`GOOGLE_WEB_CLIENT_SECRET`
     - **值**：請從 Google Cloud Console 複製您的實際 Client Secret
   - 點擊「**新增**」或「**儲存**」

3. **確認變數已添加**：
   - 應該看到兩個環境變數在列表中
   - 確認名稱和值都正確

### 步驟 2：重新部署函數

環境變數設置後，需要重新部署函數才能生效：

```bash
cd /Users/superdo/Documents/labelx_backend
firebase deploy --only functions:exchangeGoogleCode
```

**等待部署完成**（通常需要 1-2 分鐘）

### 步驟 3：測試登入

1. **重啟前端開發伺服器**（如果還在運行）：
   ```bash
   cd /Users/superdo/Documents/labelx_backend/labelx
   npm start
   ```

2. **打開 Web 版本**：
   - 在終端按 `w` 鍵
   - 或訪問 `http://localhost:8081`

3. **測試 Google 登入**：
   - 前往「個人檔案」→「登入 / 註冊」
   - 點擊「使用 Google 登入」
   - 查看終端日誌

## 🎯 預期結果

成功時，終端應該顯示：

```
🔵 步驟 4: 通過後端交換 authorization code 為 id token...
   - 後端 API: https://us-central1-lablex-api.cloudfunctions.net/exchangeGoogleCode
🔵 步驟 5: Token 交換回應
   - Status: 200 OK
   - OK: true
🔵 步驟 6: 獲取 ID token
✅ 登入成功!
```

## 🐛 如果仍有錯誤

### 錯誤 1：還是顯示 "配置錯誤"

**可能原因**：
- 環境變數名稱不正確
- 環境變數值有空格或特殊字符
- 函數未重新部署

**解決**：
1. 確認 Firebase Console 中的環境變數名稱完全正確（區分大小寫）
2. 確認值沒有多餘的空格
3. 重新部署函數：
   ```bash
   firebase deploy --only functions:exchangeGoogleCode
   ```
4. 等待部署完成後重試

### 錯誤 2：部署失敗

**檢查**：
- 確認已登入 Firebase：`firebase login`
- 確認專案正確：`firebase use lablex-api`
- 查看部署錯誤信息

## 📋 檢查清單

- [ ] 已在 Firebase Console 添加 `GOOGLE_WEB_CLIENT_ID`
- [ ] 已在 Firebase Console 添加 `GOOGLE_WEB_CLIENT_SECRET`
- [ ] 已重新部署 `exchangeGoogleCode` 函數
- [ ] 部署成功完成
- [ ] 已重啟前端開發伺服器
- [ ] 已測試 Google 登入

## 💡 提示

1. **環境變數設置後必須重新部署**函數才會生效
2. **部署需要時間**，通常 1-2 分鐘
3. **確認變數名稱完全正確**（包括大小寫）


