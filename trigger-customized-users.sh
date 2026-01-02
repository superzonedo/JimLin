#!/bin/bash

# 簡單觸發 customizedUsers 集合建立的腳本
# 使用方式: ./trigger-customized-users.sh [userId] [email]
# 範例: ./trigger-customized-users.sh test-user-001 test@example.com

echo "🚀 觸發 customizedUsers 集合建立..."

# 使用線上部署的 Function URL
FUNCTION_URL="https://setuptestdata-ztxij7jtia-uc.a.run.app"

# 從參數獲取 userId 和 email，或使用預設值
USER_ID="${1:-test-user-001}"
EMAIL="${2:-${USER_ID}@test.com}"

echo "📡 調用 API: ${FUNCTION_URL}?userId=${USER_ID}&email=${EMAIL}"
echo ""

curl -X GET "${FUNCTION_URL}?userId=${USER_ID}&email=${EMAIL}" \
  -H "Content-Type: application/json" \
  | jq '.'

echo ""
echo "✅ 完成！"
echo ""
echo "📋 下一步："
echo "   1. 前往 Firebase Console: https://console.firebase.google.com/project/lablex-api/firestore"
echo "   2. 在左側選單中找到 'customizedUsers' 集合"
echo "   3. 如果沒看到，請重新整理頁面（F5 或 Cmd+R）"
echo ""
echo "💡 提示：如果還是看不到，可能是因為："
echo "   - 需要等待幾秒讓資料同步"
echo "   - 瀏覽器快取問題，請嘗試清除快取或使用無痕模式"

