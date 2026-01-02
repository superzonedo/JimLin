# GitHub 上傳指南

## 步驟 1: 在 GitHub 上創建新倉庫

1. 登入您的 GitHub 帳號
2. 點擊右上角的 "+" 按鈕，選擇 "New repository"
3. 填寫倉庫資訊：
   - **Repository name**: `labelx_backend` (或您喜歡的名稱)
   - **Description**: LabelX Backend Project
   - **Visibility**: 選擇 Public（公開）或 Private（私有）
   - **不要**勾選 "Initialize this repository with a README"（因為我們已經有代碼了）
4. 點擊 "Create repository"

## 步驟 2: 連接本地倉庫到 GitHub

在終端機中執行以下命令（將 `YOUR_USERNAME` 替換為您的 GitHub 用戶名）：

```bash
cd /Users/superdo/Documents/labelx_backend

# 添加遠端倉庫（替換 YOUR_USERNAME 和 REPO_NAME）
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# 或者使用 SSH（如果您已設置 SSH 金鑰）
# git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git

# 推送代碼到 GitHub
git branch -M main
git push -u origin main
```

## 步驟 3: 分享給其他使用 Cursor 的開發者

### 方法 1: 直接分享 GitHub 連結

1. 複製您的倉庫 URL（例如：`https://github.com/YOUR_USERNAME/labelx_backend`）
2. 分享給其他開發者

### 方法 2: 其他開發者如何克隆倉庫

其他開發者可以在 Cursor 中：

1. 打開 Cursor
2. 使用命令面板（Cmd/Ctrl + Shift + P）
3. 選擇 "Git: Clone"
4. 輸入您的 GitHub 倉庫 URL
5. 選擇本地保存位置
6. 打開克隆的項目

或者直接在終端機執行：

```bash
git clone https://github.com/YOUR_USERNAME/REPO_NAME.git
cd REPO_NAME
```

## 注意事項

⚠️ **重要提醒**：
- 確保 `.env` 文件和敏感資訊已在 `.gitignore` 中（已完成）
- 不要將 Firebase 私鑰、API 金鑰等敏感資訊上傳到公開倉庫
- 如果倉庫是公開的，建議使用環境變數或 GitHub Secrets 來管理敏感資訊

## 後續更新

當您有新的更改時，可以使用以下命令推送：

```bash
git add .
git commit -m "您的提交訊息"
git push
```

## 協作開發

如果其他人需要貢獻代碼：

1. 他們可以 Fork 您的倉庫
2. 創建新的分支進行開發
3. 提交 Pull Request 給您審核
4. 您審核後合併到主分支

