# 修復 API 金鑰洩漏問題

## ⚠️ 問題說明

您遇到的錯誤：
```
Gemini API 錯誤: Error: Your API key was reported as leaked. 
Please use another API key.
```

**原因**：API 金鑰被硬編碼在代碼中並上傳到 GitHub，Google 檢測到後將其標記為洩漏並禁用。

## ✅ 已修復的問題

1. ✅ 移除了 `prompt-test.tsx` 中硬編碼的 Gemini API 金鑰
2. ✅ 移除了文檔中硬編碼的 Google Vision API 金鑰示例
3. ✅ 改為空字符串，需要用戶手動輸入或從環境變數讀取

## 🔧 需要立即執行的步驟

### 步驟 1：生成新的 Gemini API 金鑰

1. 前往 [Google AI Studio](https://aistudio.google.com/app/apikey)
2. 點擊 "Create API Key"
3. 選擇您的 Google Cloud 專案
4. 複製新的 API 金鑰

### 步驟 2：在應用中輸入新的 API 金鑰

在 `prompt-test.tsx` 頁面中：
- 找到 "Gemini API Key" 輸入框
- 輸入您剛生成的新 API 金鑰
- API 金鑰不會被保存，僅用於當前測試

### 步驟 3：設置環境變數（推薦用於生產環境）

創建 `.env` 文件（**不要提交到 Git**）：

```bash
# .env (添加到 .gitignore)
EXPO_PUBLIC_GEMINI_API_KEY=您的新API金鑰
```

然後在代碼中讀取：

```typescript
const [apiKey, setApiKey] = useState(
  process.env.EXPO_PUBLIC_GEMINI_API_KEY || ""
);
```

## 🛡️ 安全最佳實踐

### ✅ 應該做的：

1. **使用環境變數**：
   - 將 API 金鑰放在 `.env` 文件中
   - 確保 `.env` 在 `.gitignore` 中

2. **使用 Firebase Secrets**（後端）：
   ```bash
   echo "您的API金鑰" | firebase functions:secrets:set GEMINI_API_KEY
   ```

3. **使用安全存儲**（移動端）：
   - 使用 `expo-secure-store` 或類似庫
   - 不要硬編碼在代碼中

### ❌ 不應該做的：

1. ❌ **不要硬編碼 API 金鑰**在代碼中
2. ❌ **不要將 API 金鑰提交到 Git**
3. ❌ **不要在文檔中寫真實的 API 金鑰**
4. ❌ **不要在前端代碼中暴露 API 金鑰**（如果可能，使用後端代理）

## 📋 檢查清單

- [ ] 已生成新的 Gemini API 金鑰
- [ ] 已從代碼中移除所有硬編碼的 API 金鑰
- [ ] 已從文檔中移除所有真實的 API 金鑰示例
- [ ] 已確認 `.env` 在 `.gitignore` 中
- [ ] 已在應用中測試新的 API 金鑰
- [ ] 已檢查 Git 歷史中是否還有洩漏的 API 金鑰

## 🔍 檢查 Git 歷史中的 API 金鑰

如果 API 金鑰已經被提交到 Git，即使後來刪除，歷史記錄中仍然存在。需要：

1. **檢查歷史記錄**：
   ```bash
   git log --all --full-history -p | grep -i "AIzaSy"
   ```

2. **如果發現洩漏**：
   - 在 Google Cloud Console 中撤銷該 API 金鑰
   - 生成新的 API 金鑰
   - 考慮使用 `git filter-branch` 或 `git filter-repo` 清理歷史（謹慎操作）

## 🚨 緊急處理

如果 API 金鑰已經洩漏：

1. **立即撤銷**：
   - 前往 [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - 找到洩漏的 API 金鑰
   - 點擊 "Delete" 或 "Revoke"

2. **生成新的 API 金鑰**

3. **更新所有使用該金鑰的地方**

4. **檢查是否有未授權使用**：
   - 查看 API 使用日誌
   - 檢查是否有異常請求

## 📚 相關資源

- [Google AI Studio](https://aistudio.google.com/app/apikey)
- [Firebase Secrets 文檔](https://firebase.google.com/docs/functions/config-env)
- [Expo Secure Store](https://docs.expo.dev/versions/latest/sdk/securestore/)

