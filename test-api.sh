#!/bin/bash

# Firebase Functions API 測試腳本
# 使用方法: ./test-api.sh <圖片路徑>

FUNCTION_URL="https://uploadimage-ztxij7jtia-uc.a.run.app"

if [ -z "$1" ]; then
  echo "使用方法: ./test-api.sh <圖片路徑>"
  echo "範例: ./test-api.sh ~/Desktop/food-label.png"
  exit 1
fi

IMAGE_PATH="$1"

if [ ! -f "$IMAGE_PATH" ]; then
  echo "錯誤: 找不到圖片文件: $IMAGE_PATH"
  exit 1
fi

echo "正在讀取圖片: $IMAGE_PATH"
echo "正在轉換為 base64..."

# 轉換圖片為 base64
BASE64=$(base64 -i "$IMAGE_PATH" | tr -d '\n')

# 根據文件擴展名判斷 MIME 類型
EXTENSION="${IMAGE_PATH##*.}"
case "$EXTENSION" in
  png|PNG)
    MIME="image/png"
    ;;
  jpg|jpeg|JPG|JPEG)
    MIME="image/jpeg"
    ;;
  webp|WEBP)
    MIME="image/webp"
    ;;
  gif|GIF)
    MIME="image/gif"
    ;;
  *)
    MIME="image/jpeg"
    echo "警告: 無法識別圖片類型，使用預設值 image/jpeg"
    ;;
esac

echo "圖片類型: $MIME"
echo "Base64 長度: ${#BASE64} 字元"
echo ""
echo "正在發送請求到 API..."
echo ""

# 發送請求
curl -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"imageBase64\": \"$BASE64\",
    \"mime\": \"$MIME\"
  }" | python3 -m json.tool 2>/dev/null || cat

echo ""
echo ""
echo "測試完成！"

