# ✅ 掃描歷史圖片顯示修復

## 問題診斷

從你的截圖來看，掃描歷史記錄中的產品照片完全沒有顯示。

### 根本原因
1. **本地圖片 URI 失效**：拍照後的本地文件路徑（`file://...`）在 App 重啟後失效
2. **Supabase Storage 路徑未更新**：圖片上傳到 Supabase 後，`scanHistory` 中的 `imageUri` 沒有更新為 Storage 路徑
3. **匿名用戶本地存儲問題**：未登入用戶的照片僅存在本地，重啟後可能無法訪問

---

## 已實施的修復

### 1. 修復 `foodScanStore.ts` - 圖片路徑同步
**文件**: `src/state/foodScanStore.ts`

**修改內容**:
```typescript
// 在 addScanResult 中添加步驟 3-5
// 3. 更新結果物件，將 imageUri 改為 Supabase Storage 路徑
const updatedResult = { ...result, imageUri: imagePath };

// 4. 使用更新後的路徑創建數據庫記錄
await createScanRecord(updatedResult, imagePath);

// 5. 更新本地 state，確保 imageUri 指向 Supabase Storage
set((state) => ({
  scanHistory: state.scanHistory.map((scan) =>
    scan.id === result.id ? updatedResult : scan
  ),
  currentResult: state.currentResult?.id === result.id ? updatedResult : state.currentResult,
}));
```

**效果**:
- ✅ 上傳成功後，`imageUri` 更新為 `{userId}/{scanId}.jpg`
- ✅ HistoryScreen 讀取時會自動轉換為 Supabase signed URL
- ✅ 圖片持久化保存，重啟 App 後仍可訪問

### 2. 增強 `HistoryScreen.tsx` - 圖片載入組件
**文件**: `src/screens/HistoryScreen.tsx`

**修改內容**:
```typescript
// 添加錯誤處理和更詳細的日誌
function ScanImage({ imageUri, style }) {
  const [error, setError] = useState(false);
  
  // 檢查空值
  if (!imageUri) {
    return <PlaceholderImage text="圖片載入失敗" />;
  }
  
  // 添加 onError 處理
  <Image 
    source={{ uri: imageUrl }}
    onError={() => setError(true)}
  />
}
```

**效果**:
- ✅ 空 `imageUri` 顯示佔位符而非空白
- ✅ 圖片載入失敗時顯示錯誤提示
- ✅ 控制台輸出詳細的載入日誌

---

## 測試步驟

### 測試 1: 新掃描（登入用戶）
1. **執行掃描**: 拍攝一張食品標籤
2. **檢查控制台**: 應該看到 "✅ Scan synced successfully to Supabase with image path: {userId}/{scanId}.jpg"
3. **進入歷史**: 圖片應該正常顯示
4. **重啟 App**: 圖片仍然顯示
5. **換設備登入**: 圖片仍然顯示（從 Supabase 同步）

### 測試 2: 新掃描（匿名用戶）
1. **執行掃描**: 拍攝一張食品標籤
2. **進入歷史**: 圖片應該正常顯示（本地文件）
3. **重啟 App**: ⚠️ 圖片可能消失（本地文件限制）
4. **登入後**: 未來的掃描會同步到 Supabase

### 測試 3: 舊記錄修復
**問題**: 你現有的掃描記錄可能仍然使用失效的本地路徑

**解決方案 A - 清除舊記錄**:
```typescript
// 在 HistoryScreen 點擊垃圾桶圖標 → 確認刪除
// 或在 ProfileScreen 開發者工具中執行（如果添加）
```

**解決方案 B - 手動同步**:
如果是登入用戶，可以觸發重新同步：
```typescript
// 在控制台執行
useFoodScanStore.getState().syncFromSupabase();
```

---

## 控制台診斷命令

如果圖片仍然無法顯示，在 React Native Debugger 中執行：

```javascript
// 1. 檢查掃描歷史中的 imageUri
const history = useFoodScanStore.getState().scanHistory;
console.log('Scan History Image URIs:');
history.forEach((scan, index) => {
  console.log(`  ${index + 1}. ID: ${scan.id}`);
  console.log(`     imageUri: ${scan.imageUri}`);
  console.log(`     timestamp: ${scan.timestamp}`);
});

// 2. 檢查當前用戶狀態
const user = await supabase.auth.getUser();
console.log('Current user:', user.data.user?.id || 'Anonymous');

// 3. 測試 Supabase Storage 連接
import { getImageSignedUrl } from './src/api/scan-service';
const testPath = history[0]?.imageUri;
if (testPath) {
  try {
    const url = await getImageSignedUrl(testPath);
    console.log('✅ Signed URL generated:', url);
  } catch (error) {
    console.error('❌ Failed to get signed URL:', error);
  }
}
```

---

## 未來改進建議

### 1. 圖片快取機制
**目標**: 減少 Supabase API 調用，提升載入速度

**實現**:
```typescript
// 使用 react-native-mmkv 或 AsyncStorage 快取 signed URLs
const imageCache = new Map<string, { url: string; expiresAt: number }>();

function getCachedImageUrl(path: string): string | null {
  const cached = imageCache.get(path);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }
  return null;
}
```

### 2. 離線圖片支持
**目標**: 匿名用戶的圖片持久化

**實現**:
```typescript
// 使用 expo-file-system 將照片複製到 App 的文檔目錄
const permanentPath = `${FileSystem.documentDirectory}scans/${scanId}.jpg`;
await FileSystem.copyAsync({
  from: photo.uri,
  to: permanentPath,
});
```

### 3. 圖片壓縮優化
**目標**: 減少上傳時間和存儲空間

**當前**: 壓縮到 1200px，JPEG 70% 質量  
**優化**: 添加漸進式 JPEG、WebP 格式支持

### 4. 重試機制
**目標**: 上傳失敗時自動重試

**實現**:
```typescript
async function uploadWithRetry(uri: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await uploadScanImage(uri, userId, scanId);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 5. 圖片預載入
**目標**: 進入 HistoryScreen 前預載入圖片

**實現**:
```typescript
useEffect(() => {
  // Prefetch first 5 images
  scanHistory.slice(0, 5).forEach(scan => {
    Image.prefetch(scan.imageUri);
  });
}, [scanHistory]);
```

---

## 常見問題排查

### Q: 圖片顯示為灰色佔位符，帶「圖片載入失敗」文字
**可能原因**:
1. Supabase Storage 未正確配置
2. `scan-images` bucket 不存在或權限錯誤
3. Signed URL 已過期（超過 1 小時）

**解決**:
```sql
-- 在 Supabase Dashboard → Storage 檢查
-- 確保 scan-images bucket 存在
-- 設定 RLS 政策：
CREATE POLICY "Users can view own images"
ON storage.objects FOR SELECT
USING (bucket_id = 'scan-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'scan-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### Q: 圖片在新安裝的 App 中消失
**原因**: AsyncStorage 被清空

**解決**: 登入帳號後自動從 Supabase 同步

### Q: 控制台顯示 "Error loading image: 404"
**原因**: 圖片上傳失敗或路徑錯誤

**檢查**:
1. Supabase Dashboard → Storage → scan-images
2. 確認文件存在於 `{userId}/{scanId}.jpg`
3. 檢查文件權限

### Q: 圖片載入非常慢
**原因**: 
1. 網路連接差
2. 圖片文件過大
3. Supabase 區域距離遠

**優化**:
- 調整圖片壓縮參數（降低質量或尺寸）
- 使用 CDN 加速
- 實施圖片快取

---

## 驗證修復成功的標誌

✅ **控制台日誌**:
```
Compressing image...
Uploading image to: {userId}/{scanId}.jpg
Image uploaded successfully: {userId}/{scanId}.jpg
✅ Scan synced successfully to Supabase with image path: {userId}/{scanId}.jpg
```

✅ **HistoryScreen 行為**:
- 每張圖片都正常顯示（非灰色佔位符）
- 載入時有短暫的 spinner 動畫
- 重啟 App 後圖片仍然存在

✅ **Supabase Dashboard**:
- Storage → scan-images → 可以看到上傳的圖片
- 文件命名格式: `{userId}/{timestamp}.jpg`

---

## 狀態

**修復完成**: ✅  
**測試狀態**: 待用戶驗證  
**後續行動**: 執行新掃描並檢查圖片是否正常顯示

如果問題仍然存在，請提供：
1. 控制台錯誤日誌
2. 掃描記錄的 `imageUri` 值
3. Supabase Storage 截圖
