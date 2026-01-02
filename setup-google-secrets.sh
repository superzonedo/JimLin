#!/bin/bash

# 設置 Google OAuth Client ID 和 Client Secret 到 Firebase Functions

echo "🔧 設置 Google OAuth 環境變數..."
echo ""

# 檢查是否已登入 Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ 請先登入 Firebase："
    echo "   firebase login"
    exit 1
fi

# 獲取 Client ID
read -p "請輸入 Google Web Client ID (預設: 347248637554-fns863ln2vilkcsai6ttp17o5tm5lrdi.apps.googleusercontent.com): " CLIENT_ID
CLIENT_ID=${CLIENT_ID:-347248637554-fns863ln2vilkcsai6ttp17o5tm5lrdi.apps.googleusercontent.com}

# 獲取 Client Secret
read -p "請輸入 Google Web Client Secret: " CLIENT_SECRET

if [ -z "$CLIENT_SECRET" ]; then
    echo "❌ Client Secret 不能為空"
    exit 1
fi

echo ""
echo "📋 設置環境變數..."

# 設置環境變數（Firebase Functions v2 使用 secrets）
# 注意：Firebase Functions v2 使用不同的方式設置環境變數
# 我們可以使用 firebase functions:secrets:set 或直接在 Firebase Console 設置

echo ""
echo "✅ 請選擇設置方式："
echo "1. 使用 Firebase Console（推薦）"
echo "2. 使用 .env 文件（僅用於本地開發）"
read -p "請選擇 (1 或 2): " CHOICE

if [ "$CHOICE" = "1" ]; then
    echo ""
    echo "📝 請按照以下步驟在 Firebase Console 設置："
    echo ""
    echo "1. 前往：https://console.firebase.google.com/project/lablex-api/settings/functions/config"
    echo "2. 點擊「添加變數」"
    echo "3. 添加以下環境變數："
    echo "   - 名稱: GOOGLE_WEB_CLIENT_ID"
    echo "     值: $CLIENT_ID"
    echo "   - 名稱: GOOGLE_WEB_CLIENT_SECRET"
    echo "     值: $CLIENT_SECRET"
    echo "4. 點擊「儲存」"
    echo "5. 重新部署函數："
    echo "   firebase deploy --only functions:exchangeGoogleCode"
    echo ""
elif [ "$CHOICE" = "2" ]; then
    echo ""
    echo "📝 創建 .env 文件..."
    
    # 創建 .env 文件
    cat > functions/.env << EOF
GOOGLE_WEB_CLIENT_ID=$CLIENT_ID
GOOGLE_WEB_CLIENT_SECRET=$CLIENT_SECRET
EOF
    
    echo "✅ .env 文件已創建在 functions/.env"
    echo ""
    echo "⚠️  注意："
    echo "   - .env 文件僅用於本地開發"
    echo "   - 確保 functions/.env 在 .gitignore 中"
    echo "   - 生產環境需要在 Firebase Console 設置環境變數"
    echo ""
    echo "📝 如果使用 .env，需要安裝 dotenv："
    echo "   cd functions && npm install dotenv"
    echo ""
    echo "然後在 exchangeGoogleCode.js 頂部添加："
    echo "   require('dotenv').config();"
    echo ""
else
    echo "❌ 無效的選擇"
    exit 1
fi

echo "✅ 設置完成！"


