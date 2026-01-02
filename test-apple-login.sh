#!/bin/bash

# Apple 登入測試腳本
# 使用方式：./test-apple-login.sh

# 顏色定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 從 .firebaserc 獲取專案 ID（如果存在）
if [ -f .firebaserc ]; then
  PROJECT_ID=$(grep -o '"default": "[^"]*"' .firebaserc | cut -d'"' -f4)
else
  echo -e "${YELLOW}警告: 找不到 .firebaserc 文件${NC}"
  read -p "請輸入 Firebase 專案 ID: " PROJECT_ID
fi

BASE_URL="https://us-central1-${PROJECT_ID}.cloudfunctions.net"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Apple 登入系統測試${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}注意：此測試需要真實的 Apple identity token${NC}"
echo -e "${YELLOW}要獲取 identity token，請：${NC}"
echo "1. 在前端使用 expo-apple-authentication 登入"
echo "2. 從 credential.identityToken 獲取 token"
echo "3. 將 token 作為參數傳遞給此腳本"
echo ""

read -p "請輸入 Apple identity token (或按 Enter 使用測試 token): " IDENTITY_TOKEN

if [ -z "$IDENTITY_TOKEN" ]; then
  echo -e "${YELLOW}⚠️  未提供 token，無法進行完整測試${NC}"
  echo -e "${YELLOW}要進行完整測試，請：${NC}"
  echo "1. 在 iOS 應用中使用 expo-apple-authentication 登入"
  echo "2. 獲取 credential.identityToken"
  echo "3. 重新執行此腳本並提供 token"
  echo ""
  echo -e "${BLUE}現在將測試 API 端點是否正常運作（會返回錯誤，但可以確認 API 結構）${NC}"
  IDENTITY_TOKEN="test.token.here"
fi

echo ""
echo -e "${YELLOW}步驟 1: 測試 Apple 登入驗證${NC}"
echo ""

# 測試資料
TEST_USER='{
  "email": "test@apple.com",
  "fullName": {
    "givenName": "Test",
    "familyName": "User"
  }
}'

LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/verifyAppleLogin" \
  -H "Content-Type: application/json" \
  -d "{
    \"identityToken\": \"${IDENTITY_TOKEN}\",
    \"user\": ${TEST_USER}
  }")

echo "回應:"
echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

# 檢查是否成功
if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Apple 登入驗證成功！${NC}"
  echo ""
  
  # 提取 customToken
  CUSTOM_TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['customToken'])" 2>/dev/null)
  
  if [ ! -z "$CUSTOM_TOKEN" ]; then
    echo -e "${BLUE}獲取的 Custom Token:${NC}"
    echo "$CUSTOM_TOKEN"
    echo ""
    echo -e "${YELLOW}使用方式：${NC}"
    echo "1. 在前端使用 Firebase SDK 的 signInWithCustomToken() 方法"
    echo "2. 然後使用 getIdToken() 獲取 ID token"
    echo "3. 使用 ID token 作為 Authorization header: Bearer <ID_TOKEN>"
  fi
else
  if echo "$LOGIN_RESPONSE" | grep -q "無效的 token"; then
    if [ "$IDENTITY_TOKEN" = "test.token.here" ]; then
      echo -e "${YELLOW}⚠️  這是預期的（使用了測試 token）${NC}"
      echo -e "${GREEN}✓ API 端點正常運作，錯誤處理正確${NC}"
      echo ""
      echo -e "${YELLOW}要進行完整測試，請使用真實的 Apple identity token：${NC}"
      echo "1. 在 iOS 應用中使用 expo-apple-authentication"
      echo "2. 調用 AppleAuthentication.signInAsync()"
      echo "3. 從 credential.identityToken 獲取 token"
      echo "4. 重新執行此腳本：./test-apple-login.sh"
      echo "5. 貼上真實的 identity token"
    else
      echo -e "${YELLOW}⚠️  Token 格式不正確${NC}"
      echo -e "${YELLOW}請確保這是有效的 Apple identity token（JWT 格式）${NC}"
    fi
  else
    echo -e "${RED}✗ 驗證失敗，請檢查錯誤訊息${NC}"
  fi
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}測試完成！${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}如何獲取真實的 Apple identity token：${NC}"
echo "1. 在 iOS 應用中使用 expo-apple-authentication"
echo "2. 調用 AppleAuthentication.signInAsync()"
echo "3. 從返回的 credential.identityToken 獲取 token"
echo "4. 將 token 發送到此 API 進行驗證"


