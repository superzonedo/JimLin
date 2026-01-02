#!/bin/bash

# 設定 Gemini API Key 為 Firebase Secret
# 使用方法: ./setup-gemini-secret.sh YOUR_API_KEY

if [ -z "$1" ]; then
  echo "錯誤: 請提供 Gemini API Key"
  echo "使用方法: ./setup-gemini-secret.sh YOUR_API_KEY"
  echo ""
  echo "如果您還沒有 API Key，請到以下網址申請:"
  echo "https://aistudio.google.com/app/apikey"
  exit 1
fi

API_KEY="$1"

echo "正在設定 GEMINI_API_KEY secret..."
echo "$API_KEY" | firebase functions:secrets:set GEMINI_API_KEY

if [ $? -eq 0 ]; then
  echo "✅ Secret 設定成功！"
  echo "現在可以執行: firebase deploy --only functions"
else
  echo "❌ Secret 設定失敗，請檢查錯誤訊息"
  exit 1
fi




















