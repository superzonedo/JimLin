# 後台使用者登入系統使用指南

## 📋 概述

本系統提供了完整的後台使用者登入功能，包括：
- 創建後台使用者
- 後台使用者登入
- 後台使用者驗證工具

## 🗄️ 資料庫結構

### Firestore Collection: `adminUsers`

每個後台使用者文檔包含以下欄位：

```javascript
{
  email: string,              // 後台使用者 email
  password: string,           // 密碼（目前為明文，生產環境應使用 bcrypt）
  isAdmin: boolean,          // 是否為後台使用者（固定為 true）
  role: string,              // 角色（如 "admin", "super_admin"）
  createdAt: Timestamp,      // 創建時間
  updatedAt: Timestamp,      // 更新時間
  lastLoginAt: Timestamp     // 最後登入時間
}
```

## 🔧 API 端點

### 1. 創建後台使用者

**端點**: `POST /createAdminUser`

**請求範例**:
```bash
curl -X POST "https://us-central1-<PROJECT_ID>.cloudfunctions.net/createAdminUser" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@labelx.com",
    "password": "admin123",
    "role": "admin"
  }'
```

**回應範例**:
```json
{
  "success": true,
  "message": "後台使用者創建成功",
  "adminId": "firebase-user-id",
  "email": "admin@labelx.com",
  "role": "admin"
}
```

### 2. 後台使用者登入

**端點**: `POST /adminLogin`

**請求範例**:
```bash
curl -X POST "https://us-central1-<PROJECT_ID>.cloudfunctions.net/adminLogin" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@labelx.com",
    "password": "admin123"
  }'
```

**回應範例**:
```json
{
  "success": true,
  "customToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "adminId": "firebase-user-id",
  "email": "admin@labelx.com",
  "role": "admin",
  "message": "登入成功",
  "note": "使用 customToken 在前端使用 signInWithCustomToken 轉換為 ID token"
}
```

## 🧪 測試步驟

### 方法 1: 使用測試腳本（推薦）

```bash
./test-admin-login.sh
```

這個腳本會自動：
1. 創建一個測試後台使用者
2. 測試登入功能
3. 顯示獲取的 customToken

### 方法 2: 手動測試

#### 步驟 1: 創建後台使用者

```bash
curl -X POST "https://us-central1-lablex-api.cloudfunctions.net/createAdminUser" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@labelx.com",
    "password": "admin123",
    "role": "admin"
  }'
```

#### 步驟 2: 測試登入

```bash
curl -X POST "https://us-central1-lablex-api.cloudfunctions.net/adminLogin" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@labelx.com",
    "password": "admin123"
  }'
```

#### 步驟 3: 在前端使用 Token

獲取 `customToken` 後，在前端應用中使用：

```javascript
import { getAuth, signInWithCustomToken } from 'firebase/auth';

const auth = getAuth();
const customToken = 'your-custom-token-here';

signInWithCustomToken(auth, customToken)
  .then((userCredential) => {
    // 登入成功
    return userCredential.user.getIdToken();
  })
  .then((idToken) => {
    // 使用 idToken 作為 Authorization header
    console.log('ID Token:', idToken);
  })
  .catch((error) => {
    console.error('登入失敗:', error);
  });
```

## 🔐 在 API 中使用後台驗證

如果您的 API 需要驗證後台使用者，可以使用 `verifyAdminAuth` 工具函數：

```javascript
const { verifyAdminAuth } = require('./utils/adminAuth');

// 在您的 API 中
const adminInfo = await verifyAdminAuth(request);
if (!adminInfo) {
  response.status(401).json({
    error: "未授權",
    message: "請提供有效的後台使用者 Token"
  });
  return;
}

// adminInfo 包含：
// {
//   adminId: string,
//   email: string,
//   isAdmin: true,
//   role: string
// }
```

## 📝 注意事項

1. **安全性**: 
   - 目前密碼以明文儲存，**生產環境請使用 bcrypt 加密**
   - 建議在 `createAdminUser` API 中加入額外的權限檢查（如只有超級管理員可以創建）

2. **Firestore 規則**:
   - 已更新 `firestore.rules` 以允許後台使用者讀取自己的資料
   - 後台使用者的創建/更新只能通過 Cloud Functions（會繞過規則）

3. **部署**:
   - 部署前請確保已更新 Firestore 規則：`firebase deploy --only firestore:rules`
   - 部署 Functions：`firebase deploy --only functions`

## 🚀 部署指令

```bash
# 部署 Firestore 規則
firebase deploy --only firestore:rules

# 部署 Functions
cd functions
npm install  # 確保依賴已安裝
cd ..
firebase deploy --only functions:adminLogin,functions:createAdminUser
```

## 📚 相關文件

- Firebase Auth 文檔: https://firebase.google.com/docs/auth
- Firestore 規則文檔: https://firebase.google.com/docs/firestore/security/get-started


