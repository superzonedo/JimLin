# Google 和 Apple 登入設置指南

## ✅ 已完成

### 1. 安裝套件
- ✅ `expo-apple-authentication` - Apple 登入
- ✅ `expo-auth-session` - Google OAuth (已預先安裝)
- ✅ `expo-web-browser` - OAuth 流程 (已預先安裝)

### 2. UI 實作
- ✅ Apple 登入按鈕（黑色，僅在 iOS 顯示）
- ✅ Google 登入按鈕（白色，跨平台）
- ✅ 優雅的分隔線設計
- ✅ 錯誤處理
- ✅ 載入狀態

### 3. 功能實作
- ✅ Apple Authentication 整合
- ✅ Google OAuth 整合
- ✅ 自動登入處理
- ✅ 用戶取消處理
- ✅ 錯誤提示 Modal

---

## 🔧 需要用戶完成的設置

### Google OAuth 設置

#### 1. 創建 Google Cloud 專案
訪問：https://console.cloud.google.com/

1. 點擊「建立專案」
2. 輸入專案名稱（例如：LabelX）
3. 點擊「建立」

#### 2. 啟用 Google+ API
1. 在側邊欄選擇「API 和服務」→「資料庫」
2. 搜尋「Google+ API」
3. 點擊「啟用」

#### 3. 創建 OAuth 2.0 憑證
1. 前往「API 和服務」→「憑證」
2. 點擊「建立憑證」→「OAuth 用戶端 ID」

**iOS 憑證：**
- 應用程式類型：iOS
- 套件 ID：`com.labelx.app`
- 複製生成的 Client ID

**Android 憑證：**
- 應用程式類型：Android
- 套件名稱：`com.labelx.app`
- SHA-1 憑證指紋：（使用 `keytool` 獲取）
- 複製生成的 Client ID

**Web 憑證：**
- 應用程式類型：網頁應用程式
- 授權重新導向 URI：
  - `https://auth.expo.io/@your-username/labelx`
- 複製生成的 Client ID

#### 4. 更新 .env 文件
將獲得的 Client IDs 填入 `.env` 文件：

```bash
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-actual-ios-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-actual-android-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-actual-web-id.apps.googleusercontent.com
```

#### 5. 重啟開發伺服器
```bash
# 停止當前伺服器（Ctrl+C），然後重啟
bun start
```

---

### Apple Sign In 設置

#### 1. Apple Developer 帳號要求
- 需要付費的 Apple Developer Program 會員資格（$99/年）
- 個人或企業帳號都可以

#### 2. 配置 App ID
訪問：https://developer.apple.com/account/

1. 前往「Certificates, Identifiers & Profiles」
2. 選擇「Identifiers」→「App IDs」
3. 找到或創建 `com.labelx.app`
4. 啟用「Sign In with Apple」功能
5. 保存更改

#### 3. app.json 已配置
✅ 已自動添加 `"usesAppleSignIn": true` 到 iOS 配置

#### 4. 測試要求
- **模擬器**：支援測試（iOS 13+）
- **真機**：需要開發者簽名的 build
- **Expo Go**：⚠️ 不支援，需要 Development Build

---

## 📱 使用說明

### Apple 登入（僅 iOS）
1. 點擊黑色「使用 Apple 登入」按鈕
2. Face ID / Touch ID 驗證
3. 選擇分享的信息（姓名、Email）
4. 自動登入成功

### Google 登入（跨平台）
1. 點擊白色「使用 Google 登入」按鈕
2. 瀏覽器彈出 Google 登入頁面
3. 選擇 Google 帳戶
4. 授權應用存取
5. 自動返回 app 並登入

---

## 🎨 設計細節

### Apple 按鈕
- 背景色：`#000000`（黑色，符合 Apple 品牌指南）
- 圖示：Apple logo
- 文字：白色
- 僅在 iOS 且設備支援時顯示

### Google 按鈕
- 背景色：`#FFFFFF`（白色）
- 邊框：`#E5E7EB`（淺灰）
- 圖示：Google logo（彩色）
- 文字：深藍色（`#001858`）
- 跨平台顯示

### 分隔線
- 優雅的「或使用電子郵件」分隔設計
- 符合整體 Warm Coral-Teal 配色

---

## 🔐 安全性建議

### 生產環境最佳實踐

1. **後端驗證**
   - ⚠️ 當前實作為前端模擬
   - 生產環境必須將 token 發送到後端驗證
   - 後端應驗證 Apple/Google token 的有效性

2. **Token 處理**
```typescript
// Apple
const credential = await AppleAuthentication.signInAsync({...});
// 發送 credential.identityToken 到後端

// Google
const { authentication } = response;
// 發送 authentication.accessToken 到後端
```

3. **用戶資料**
   - 首次登入時儲存用戶資料
   - 後續登入只需驗證 token
   - Apple 只在首次提供完整資料（姓名、Email）

---

## 🧪 測試流程

### 開發環境測試
1. 使用 Expo Development Build（非 Expo Go）
2. 或使用 iOS 模擬器/Android 模擬器
3. Google 登入可在所有環境測試
4. Apple 登入需要 iOS 13+ 設備

### 測試清單
- [ ] Apple 登入（iOS 模擬器）
- [ ] Google 登入（iOS）
- [ ] Google 登入（Android）
- [ ] 取消登入流程
- [ ] 錯誤處理
- [ ] 登入後狀態持久化

---

## ❓ 常見問題

### Q: Google 登入按鈕點擊沒反應？
A: 檢查 `.env` 文件中的 Client IDs 是否正確填寫

### Q: Apple 登入在 Expo Go 不工作？
A: Apple Sign In 需要 Development Build，不支援 Expo Go

### Q: 如何獲取 Android SHA-1 指紋？
A: 使用命令：
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### Q: 登入成功但沒有跳轉？
A: 檢查 `userStore.isLoggedIn` 狀態是否正確更新

---

## 📚 參考文檔

- [Expo Apple Authentication](https://docs.expo.dev/versions/latest/sdk/apple-authentication/)
- [Expo Auth Session](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In Guidelines](https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple)

---

## 🚀 快速測試（無需設置）

如果你想快速測試 UI 而不設置 OAuth：
- Apple 按鈕會顯示在 iOS 設備上
- Google 按鈕在所有平台顯示（但點擊會因缺少 Client ID 而無法完成）
- 可以繼續使用 Email/密碼登入測試其他功能

需要完整功能請按照上述步驟設置 Google OAuth Client IDs！
