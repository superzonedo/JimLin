# Firestore 資料查看指南

## 📍 如何在 Firebase Console 查看資料

### 1. 查看 `products` 集合（完整產品資料）

1. 前往：https://console.firebase.google.com/project/lablex-api/firestore/data
2. 在左側集合列表中，點擊 **`products`**
3. 點擊任意產品文檔查看詳細資料

**資料結構：**
- `productName`: 產品名稱
- `additives`: 添加劑陣列
- `beneficialIngredients`: 有益成分
- `concerningIngredients`: 關注成分
- `maxRiskLevel`: 最高風險等級（High/Medium/Low）
- `riskScore`: 風險分數（0-100）
- `creatorId`: 創建者 ID
- `imageUrl`: 圖片 URL
- `createdAt`: 創建時間

### 2. 查看 `users` 集合和 `userProducts` 子集合

**步驟：**
1. 在左側點擊 **`users`** 集合
2. 點擊一個使用者文檔（文檔 ID = Firebase Auth UID）
3. 在文檔詳情中，向下滾動找到 **子集合** 區域
4. 點擊 **`userProducts`** 子集合
5. 查看該使用者的產品索引列表

**`userProducts` 子集合結構：**
- `productId`: 指向 products 集合的文檔 ID
- `productName`: 產品名稱（快速顯示）
- `maxRiskLevel`: 風險等級（用於過濾）
- `createdAt`: 創建時間
- `createdAtDate`: 創建日期（YYYY-MM-DD 格式）

### 3. 查看 `subscriptions` 集合

1. 在左側點擊 **`subscriptions`** 集合
2. 查看訂閱文檔

**訂閱資料結構：**
- `userId`: 使用者 ID
- `plan`: 方案（free/basic/premium）
- `status`: 狀態（active/expired/cancelled）
- `isPaid`: 是否已付費（true/false）
- `startDate`: 開始日期
- `endDate`: 結束日期

## 🔧 手動創建測試訂閱（在 Firebase Console）

如果還沒有訂閱資料，可以手動創建：

### 步驟：

1. **前往 Firestore Database**
   - https://console.firebase.google.com/project/lablex-api/firestore/data

2. **創建 `subscriptions` 文檔**
   - 點擊 **`subscriptions`** 集合
   - 點擊 **「開始使用」** 或 **「新增文件」**
   - 文檔 ID：可以自動生成或手動輸入
   - 添加以下欄位：
     ```
     userId: <你的 Firebase Auth UID>
     plan: "premium"
     status: "active"
     isPaid: true
     startDate: <選擇日期類型，選擇今天>
     endDate: <選擇日期類型，選擇一年後>
     createdAt: <選擇時間戳記類型>
     updatedAt: <選擇時間戳記類型>
     ```

3. **創建 `users` 文檔**
   - 點擊 **`users`** 集合
   - 點擊 **「新增文件」**
   - 文檔 ID：輸入你的 Firebase Auth UID
   - 添加以下欄位：
     ```
     email: "your-email@example.com"
     subscriptionId: <剛才創建的訂閱文檔 ID>
     totalScans: 0
     createdAt: <選擇時間戳記類型>
     updatedAt: <選擇時間戳記類型>
     stats: <選擇地圖類型>
       - totalProducts: 0
       - highRiskCount: 0
       - mediumRiskCount: 0
       - lowRiskCount: 0
     ```

## 🧪 測試 API

創建訂閱後，可以使用以下方式測試：

### 1. 獲取 Firebase Auth Token

在前端應用或使用 Firebase CLI：
```bash
firebase login
```

### 2. 調用 API

```bash
POST https://uploadimage-ztxij7jtia-uc.a.run.app
Headers:
  Authorization: Bearer <Firebase Auth Token>
  Content-Type: application/json
Body:
{
  "imageBase64": "...",
  "mime": "image/jpeg"
}
```

## 📊 資料流程說明

當 API 被調用時，資料會保存到：

1. **`products` 集合** - 完整產品分析資料
2. **`users/{userId}/userProducts` 子集合** - 使用者產品索引（用於快速查詢）
3. **`users/{userId}` 文檔** - 更新使用者統計資料

## 🔍 常見問題

### Q: 為什麼看不到資料？
A: 可能的原因：
- 還沒有調用過 API
- 缺少有效的訂閱（API 會檢查訂閱狀態）
- 認證失敗（需要有效的 Firebase Auth Token）

### Q: 如何查看子集合？
A: 
1. 點擊父文檔（例如 `users/{userId}`）
2. 在文檔詳情頁面中，向下滾動找到「子集合」區域
3. 點擊子集合名稱（例如 `userProducts`）

### Q: 資料結構在哪裡定義？
A: 查看 `functions/src/uploadImage.js` 中的資料保存邏輯



















