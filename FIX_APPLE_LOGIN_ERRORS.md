# 🔧 修復 Apple 登入錯誤

## ✅ 已修復的錯誤

### 錯誤 1: "The displayName field must be a valid string"

**問題原因：**
- 後端在創建 Firebase 用戶時，如果 `displayName` 是 `null`，Firebase Admin SDK 會報錯
- Apple 登入時，如果用戶沒有提供姓名，`displayName` 可能是 `null`

**修復方案：**
1. **後端修復** (`functions/src/verifyAppleLogin.js`)：
   - 確保 `displayName` 永遠是有效的字串（不能是 `null`）
   - 如果沒有姓名，使用空字串 `''` 而不是 `null`
   - 在創建用戶時，使用 `displayName || undefined` 而不是 `displayName`

2. **前端修復** (`app/login.tsx`)：
   - 改善用戶信息準備邏輯，只發送有效的字段
   - 確保 `displayName` 處理邏輯正確

### 錯誤 2: "The action 'GO_BACK' was not handled by any navigator"

**問題原因：**
- 登入成功後使用 `router.back()`，但沒有上一頁可以返回

**修復方案：**
- 已改為使用 `router.replace('/(tabs)/scan')` 直接跳轉到掃描頁面
- 添加了 `useEffect` 監聽登入狀態，自動跳轉

## 📝 修改詳情

### 後端修改 (`functions/src/verifyAppleLogin.js`)

1. **確保 displayName 是有效字串**：
```javascript
// 之前：可能是 null
const displayName = givenName || familyName || null;

// 現在：永遠是有效字串
let displayName = null;
if (givenName && familyName) {
  displayName = `${givenName} ${familyName}`.trim();
} else if (givenName) {
  displayName = givenName.trim();
} else if (familyName) {
  displayName = familyName.trim();
}
if (!displayName) {
  displayName = ''; // 使用空字串而不是 null
}
```

2. **創建用戶時使用 undefined 而不是 null**：
```javascript
const userData = {
  uid: firebaseUid,
  email: email || undefined,
  displayName: displayName || undefined, // 不能是 null
  // ...
};
```

### 前端修改 (`app/login.tsx`)

1. **改善用戶信息準備**：
```typescript
// 只發送有效的字段，避免發送 undefined
const userInfo: any = {};
if (credential.email) {
  userInfo.email = credential.email;
}
if (credential.fullName) {
  userInfo.fullName = {};
  // 只添加存在的字段
}
```

2. **改善 displayName 處理**：
```typescript
// 確保 displayName 永遠是有效的字串
let displayName = data.displayName;
if (!displayName || displayName.trim() === '') {
  // 嘗試多種來源獲取
  // 最後使用默認值 '用戶'
}
```

## 🚀 部署步驟

### 1. 部署後端修復

```bash
cd /Users/superdo/Documents/labelx_backend
firebase deploy --only functions:verifyAppleLogin
```

### 2. 重啟前端開發伺服器

```bash
cd /Users/superdo/Documents/labelx_backend/labelx

# 停止當前伺服器（Ctrl+C）
# 然後重新啟動
npm start
```

## ✅ 測試步驟

1. **測試 Apple 登入（有姓名）**：
   - 使用提供姓名的 Apple 帳戶登入
   - 應該可以成功登入並跳轉到掃描頁面

2. **測試 Apple 登入（無姓名）**：
   - 使用不提供姓名的 Apple 帳戶登入
   - 應該可以成功登入，displayName 會是空字串或默認值

3. **檢查導航**：
   - 登入成功後應該自動跳轉到掃描頁面
   - 不應該出現 "GO_BACK" 錯誤

## 📋 檢查清單

- [x] 後端確保 displayName 永遠是有效字串
- [x] 前端改善用戶信息準備邏輯
- [x] 前端改善 displayName 處理
- [x] 登入成功後使用 router.replace 而不是 router.back()
- [ ] 部署後端修復
- [ ] 測試 Apple 登入功能

## 🐛 如果仍有問題

1. **檢查後端日誌**：
   ```bash
   firebase functions:log --only verifyAppleLogin
   ```

2. **檢查前端控制台**：
   - 查看是否有其他錯誤訊息
   - 確認用戶信息是否正確發送

3. **確認 Firebase 配置**：
   - 確認 Firebase Admin SDK 配置正確
   - 確認 Firestore 規則允許寫入
