#!/bin/bash

# 後台使用者登入測試腳本
# 使用方式：./test-admin-login.sh

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
echo -e "${BLUE}後台使用者登入系統測試${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 測試資料
TEST_EMAIL="admin@labelx.com"
TEST_PASSWORD="admin123"
TEST_ROLE="admin"

echo -e "${YELLOW}步驟 1: 創建後台使用者${NC}"
echo "Email: ${TEST_EMAIL}"
echo "Password: ${TEST_PASSWORD}"
echo ""

CREATE_RESPONSE=$(curl -s -X POST "${BASE_URL}/createAdminUser" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\",
    \"role\": \"${TEST_ROLE}\"
  }")

echo "回應:"
echo "$CREATE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CREATE_RESPONSE"
echo ""

# 檢查是否創建成功
if echo "$CREATE_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ 後台使用者創建成功${NC}"
else
  if echo "$CREATE_RESPONSE" | grep -q "email 已存在"; then
    echo -e "${YELLOW}⚠ 後台使用者已存在，繼續測試登入...${NC}"
  else
    echo -e "${RED}✗ 創建失敗，請檢查錯誤訊息${NC}"
    exit 1
  fi
fi

echo ""
echo -e "${YELLOW}步驟 2: 測試後台使用者登入${NC}"
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/adminLogin" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\"
  }")

echo "回應:"
echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

# 檢查是否登入成功
if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ 登入成功！${NC}"
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
  echo -e "${RED}✗ 登入失敗，請檢查錯誤訊息${NC}"
  exit 1
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}測試完成！${NC}"
echo -e "${BLUE}========================================${NC}"


