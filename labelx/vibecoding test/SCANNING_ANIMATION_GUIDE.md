# 掃描動畫功能 - 快速參考

## 🎯 新增功能概覽

### 1. 視覺動畫
- ✅ 綠色掃描線上下移動
- ✅ 照片框脈衝效果（縮放動畫）
- ✅ 角落邊框旋轉動畫

### 2. 進度指示
- ✅ 實時進度條（0-100%）
- ✅ 百分比數字顯示
- ✅ 平滑增長動畫

### 3. 相機管理
- ✅ 拍照前：顯示相機預覽
- ✅ 分析時：關閉相機，顯示捕獲的照片
- ✅ 取消後：恢復相機預覽

### 4. 用戶控制
- ✅ 可隨時取消分析
- ✅ 清楚的狀態提示
- ✅ 預估時間顯示（5-10秒）

## 📱 用戶操作流程

```
打開相機 → 對準標籤 → 拍照
                        ↓
                   [相機關閉]
                        ↓
    ┌──────────────────────────────┐
    │   [捕獲的照片 - 動畫中]       │
    │   ═══════ 掃描線 ═══════      │
    │                              │
    │   ▓▓▓▓▓▓░░░░░  68%          │
    │                              │
    │   ✨ AI 分析中...            │
    │   正在識別成分和添加物        │
    │   ⏱ 約需 5-10 秒             │
    │                              │
    │   [ 取消分析 ]               │
    └──────────────────────────────┘
                        ↓
                [分析完成 100%]
                        ↓
                [自動跳轉到結果頁]
```

## 🎨 視覺效果說明

### 掃描線動畫
- **顏色**: 綠色 (#2CB67D)
- **高度**: 3px
- **效果**: 發光（陰影）
- **速度**: 2秒完成上下一個循環

### 脈衝動畫
- **範圍**: 1.0x ↔ 1.1x
- **速度**: 1秒一個循環
- **作用**: 照片框輕微放大縮小

### 進度條
- **背景**: 深灰色 (gray-700)
- **前景**: 綠色 (#2CB67D)
- **高度**: 8px
- **樣式**: 圓角

## 🔧 關鍵代碼位置

```typescript
// 文件位置
src/screens/CameraScreen.tsx

// 主要新增狀態
const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);
const [analysisProgress, setAnalysisProgress] = useState(0);

// 動畫共享值
const scanLinePosition = useSharedValue(0);
const pulseScale = useSharedValue(1);
const cornerRotation = useSharedValue(0);

// 取消分析函數
const cancelAnalysis = () => {
  setIsAnalyzing(false);
  setCapturedImageUri(null);
  setAnalysisProgress(0);
};
```

## 📊 進度更新邏輯

```typescript
// 模擬進度（每100ms更新）
0-20%   → 初始讀取
20-40%  → OCR 識別
40-70%  → 成分分析
70-95%  → AI 評估
95%     → 等待實際完成
100%    → 分析完成（實際返回時）
```

## ⚙️ 配置參數

```typescript
// 可調整的參數
const SCAN_LINE_DURATION = 2000;      // 掃描線動畫時長 (ms)
const PULSE_DURATION = 1000;          // 脈衝動畫時長 (ms)
const CORNER_ROTATION_DURATION = 3000; // 角落旋轉時長 (ms)
const PROGRESS_UPDATE_INTERVAL = 100;  // 進度更新間隔 (ms)
const TOTAL_ANALYSIS_DURATION = 8000;  // 預估總時長 (ms)
const COMPLETION_DELAY = 500;          // 完成後延遲 (ms)
```

## 🐛 常見問題排查

### Q: 動畫不流暢？
A: 確保使用 GPU 加速的 Animated.View，而非普通 View

### Q: 相機沒有關閉？
A: 檢查 `capturedImageUri` 狀態是否正確設置

### Q: 進度條卡住？
A: 確認 `simulateProgress` 函數的 timer 正確清理

### Q: 取消後相機不恢復？
A: 檢查 `cancelAnalysis` 是否正確重置所有狀態

## ✅ 測試清單

基本功能：
- [ ] 拍照後相機關閉
- [ ] 顯示捕獲的照片
- [ ] 掃描線動畫運行
- [ ] 進度條正常增長
- [ ] 百分比數字更新

動畫效果：
- [ ] 掃描線平滑移動
- [ ] 脈衝效果可見
- [ ] 角落旋轉正常

用戶操作：
- [ ] 可以取消分析
- [ ] 取消後恢復相機
- [ ] 完成後自動跳轉

性能：
- [ ] 動畫流暢（60fps）
- [ ] 不會卡頓
- [ ] 記憶體正常

## 🎯 效果對比

### Before（舊版）
```
[相機預覽]
    ↓ 拍照
[轉圈圈 loading...]
⏱ 不知道還要多久
📷 相機一直開著
```

### After（新版）
```
[相機預覽]
    ↓ 拍照 → 相機關閉
[照片 + 動畫 + 進度條]
✅ 68% 完成
✅ 約需 5-10 秒
✅ 可隨時取消
```

## 📝 維護說明

### 修改動畫速度
編輯 `useEffect` 中的 `duration` 參數：
```typescript
withTiming(1, { duration: 2000 }) // 改成你想要的時長
```

### 修改進度模擬
編輯 `simulateProgress` 函數：
```typescript
const totalDuration = 8000; // 改成你想要的總時長
```

### 修改視覺樣式
調整 className 或 style 屬性：
```typescript
className="border-4 border-[#2CB67D]" // 改成你想要的顏色
```

---

**版本**: 1.0.0  
**最後更新**: 2025-10-13  
**狀態**: ✅ 已完成並可使用
