# 獲取 Firebase Auth Token 的方法

## 方法 1：使用 Firebase CLI（最簡單）

### 步驟：

1. **安裝 Firebase CLI**（如果還沒安裝）：
   ```bash
   npm install -g firebase-tools
   ```

2. **登入 Firebase**：
   ```bash
   firebase login
   ```

3. **獲取 Access Token**：
   ```bash
   firebase login:ci
   ```
   這會返回一個 token，但這個 token 是 CI/CD 用的，不是用戶 token。

### 更好的方法：使用 Firebase Admin SDK 創建自定義 Token

## 方法 2：創建一個獲取 Token 的 API（推薦）

我已經為您創建了一個 `setupTestData` API，現在讓我創建一個獲取測試 Token 的 API。

## 方法 3：在前端應用中獲取（如果有的話）

如果您有前端應用，可以使用：

```javascript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;
if (user) {
  const token = await user.getIdToken();
  console.log('Token:', token);
}
```

## 方法 4：臨時禁用認證（僅用於開發測試）

如果需要快速測試，我可以修改代碼添加一個開發模式選項。



















