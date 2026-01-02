# Apple 登入驗證系統使用指南

## 📋 概述

本系統提供了後端驗證 Apple 登入的功能，包括：
- 驗證 Apple identity token
- 創建或獲取 Firebase 使用者
- 返回 Firebase custom token

## 🔧 API 端點

### 驗證 Apple 登入

**端點**: `POST /verifyAppleLogin`

**請求範例**:
```bash
curl -X POST "https://us-central1-<PROJECT_ID>.cloudfunctions.net/verifyAppleLogin" \
  -H "Content-Type: application/json" \
  -d '{
    "identityToken": "eyJraWQiOiJlWGF1...",
    "user": {
      "email": "user@example.com",
      "fullName": {
        "givenName": "John",
        "familyName": "Doe"
      }
    }
  }'
```

**請求參數**:
- `identityToken` (必填): Apple 登入返回的 identity token
- `user` (選填): 使用者資訊物件
  - `email` (選填): 使用者 email
  - `fullName` (選填): 使用者全名
    - `givenName` (選填): 名字
    - `familyName` (選填): 姓氏

**回應範例**:
```json
{
  "success": true,
  "customToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "apple:001234.567890abcdef.1234",
  "email": "user@example.com",
  "displayName": "John Doe",
  "message": "Apple 登入驗證成功",
  "note": "使用 customToken 在前端使用 signInWithCustomToken 轉換為 ID token"
}
```

## 🧪 測試步驟

### 方法 1: 使用測試腳本

```bash
./test-apple-login.sh
```

### 方法 2: 手動測試

#### 步驟 1: 在前端獲取 Apple identity token

在您的 iOS 應用中：

```typescript
import * as AppleAuthentication from 'expo-apple-authentication';

const credential = await AppleAuthentication.signInAsync({
  requestedScopes: [
    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
    AppleAuthentication.AppleAuthenticationScope.EMAIL,
  ],
});

// credential.identityToken 就是我們需要的 token
const identityToken = credential.identityToken;
```

#### 步驟 2: 發送到後端驗證

```bash
curl -X POST "https://us-central1-lablex-api.cloudfunctions.net/verifyAppleLogin" \
  -H "Content-Type: application/json" \
  -d "{
    \"identityToken\": \"${IDENTITY_TOKEN}\",
    \"user\": {
      \"email\": \"${EMAIL}\",
      \"fullName\": {
        \"givenName\": \"${GIVEN_NAME}\",
        \"familyName\": \"${FAMILY_NAME}\"
      }
    }
  }"
```

#### 步驟 3: 在前端使用 Custom Token

獲取 `customToken` 後，在前端應用中使用：

```typescript
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

## 📝 完整的前端整合範例

```typescript
import * as AppleAuthentication from 'expo-apple-authentication';
import { getAuth, signInWithCustomToken } from 'firebase/auth';

async function handleAppleLogin() {
  try {
    // 1. 使用 Apple 登入
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // 2. 發送到後端驗證
    const response = await fetch(
      'https://us-central1-lablex-api.cloudfunctions.net/verifyAppleLogin',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identityToken: credential.identityToken,
          user: {
            email: credential.email || undefined,
            fullName: credential.fullName ? {
              givenName: credential.fullName.givenName,
              familyName: credential.fullName.familyName,
            } : undefined,
          },
        }),
      }
    );

    const data = await response.json();

    if (data.success) {
      // 3. 使用 custom token 登入 Firebase
      const auth = getAuth();
      const userCredential = await signInWithCustomToken(
        auth,
        data.customToken
      );

      // 4. 獲取 ID token（用於後續 API 請求）
      const idToken = await userCredential.user.getIdToken();
      
      console.log('登入成功！', {
        userId: data.userId,
        email: data.email,
        idToken: idToken,
      });

      return userCredential.user;
    } else {
      throw new Error(data.message || 'Apple 登入失敗');
    }
  } catch (error) {
    if (error.code === 'ERR_CANCELED') {
      console.log('使用者取消了登入');
    } else {
      console.error('Apple 登入錯誤:', error);
      throw error;
    }
  }
}
```

## 🔐 安全性說明

### 當前實作

目前的實作使用簡化的 token 解析方法：
- 解析 JWT token 的 payload 獲取用戶信息
- 使用 Apple 用戶 ID 創建 Firebase 使用者
- **注意**：生產環境應該驗證 Apple 的簽名

### 生產環境建議

1. **驗證 Apple 簽名**：
   - 下載 Apple 的公鑰
   - 驗證 JWT token 的簽名
   - 驗證 token 的過期時間和發行者

2. **使用 Firebase Auth 原生支援**：
   - Firebase Auth 已經內建支援 Apple 登入
   - 可以直接使用 `signInWithCredential` 方法
   - 這樣可以自動處理 token 驗證

### 使用 Firebase Auth 原生方法（推薦）

```typescript
import { OAuthProvider, signInWithCredential } from 'firebase/auth';
import * as AppleAuthentication from 'expo-apple-authentication';

async function handleAppleLoginWithFirebase() {
  try {
    // 1. 使用 Apple 登入
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // 2. 創建 Firebase OAuth credential
    const provider = new OAuthProvider('apple.com');
    const firebaseCredential = provider.credential({
      idToken: credential.identityToken!,
      rawNonce: credential.nonce,
    });

    // 3. 直接登入 Firebase
    const auth = getAuth();
    const userCredential = await signInWithCredential(
      auth,
      firebaseCredential
    );

    return userCredential.user;
  } catch (error) {
    console.error('Apple 登入錯誤:', error);
    throw error;
  }
}
```

## 📚 相關文件

- [Expo Apple Authentication](https://docs.expo.dev/versions/latest/sdk/apple-authentication/)
- [Firebase Auth - Sign in with Apple](https://firebase.google.com/docs/auth/ios/apple)
- [Apple Sign In Guidelines](https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple)

## 🚀 部署指令

```bash
# 部署 Function
firebase deploy --only functions:verifyAppleLogin
```

## ⚠️ 注意事項

1. **Token 驗證**：當前實作為簡化版本，生產環境應加入完整的簽名驗證
2. **Apple 配置**：確保在 Apple Developer 中啟用了 Sign In with Apple
3. **測試環境**：Apple 登入需要在真實設備或模擬器上測試，Expo Go 不支援


