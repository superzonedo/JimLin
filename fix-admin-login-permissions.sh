#!/bin/bash

# 修復後台登入權限問題
# 此腳本會為 Cloud Functions 服務帳號添加創建自定義 token 所需的權限

# 設定 PATH
export PATH=/opt/homebrew/share/google-cloud-sdk/bin:"$PATH"

# 設定專案
PROJECT_ID="lablex-api"
gcloud config set project $PROJECT_ID

# 取得專案編號
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
echo "專案編號: $PROJECT_NUMBER"

# Cloud Functions 服務帳號（用於執行 Functions）
# 格式：PROJECT_NUMBER-compute@developer.gserviceaccount.com
FUNCTIONS_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
echo "Cloud Functions 服務帳號: ${FUNCTIONS_SA}"

# Firebase Admin SDK 服務帳號
FIREBASE_ADMIN_SA="firebase-adminsdk-fbsvc@${PROJECT_ID}.iam.gserviceaccount.com"
echo "Firebase Admin SDK 服務帳號: ${FIREBASE_ADMIN_SA}"

# 授予 Service Account Token Creator 權限（用於創建自定義 token）
echo "正在授予 Service Account Token Creator 權限給 Cloud Functions..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${FUNCTIONS_SA}" \
  --role="roles/iam.serviceAccountTokenCreator" \
  --condition=None

echo "正在授予 Service Account Token Creator 權限給 Firebase Admin SDK..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${FIREBASE_ADMIN_SA}" \
  --role="roles/iam.serviceAccountTokenCreator" \
  --condition=None

# 也授予 Firebase Admin SDK 所需的權限
echo "正在授予 Firebase Admin SDK 權限..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${FUNCTIONS_SA}" \
  --role="roles/firebase.admin" \
  --condition=None

echo ""
echo "✅ 權限設定完成！"
echo ""
echo "現在可以重新測試登入功能："
echo "  ./test-admin-login.sh"


