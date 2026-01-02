#!/bin/bash

# 設定 PATH
export PATH=/opt/homebrew/share/google-cloud-sdk/bin:"$PATH"

# 設定專案
PROJECT_ID="lablex-api"
gcloud config set project $PROJECT_ID

# 取得專案編號
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
echo "專案編號: $PROJECT_NUMBER"

# Cloud Build 服務帳號
CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"
echo "Cloud Build 服務帳號: $CLOUD_BUILD_SA"

# 授予必要的權限
echo "正在授予 Cloud Functions Developer 權限..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/cloudfunctions.developer"

echo "正在授予 Service Account User 權限..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/iam.serviceAccountUser"

echo "正在授予 Storage Admin 權限..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/storage.admin"

echo "權限設定完成！"
echo "現在可以執行: firebase deploy --only functions"




















