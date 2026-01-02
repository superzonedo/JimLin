#!/usr/bin/env node

/**
 * 簡單的腳本來創建 customizedUsers 文檔
 * 使用方式: node create-customized-user.js <userId> <email>
 * 範例: node create-customized-user.js test-user-001 test@example.com
 */

const admin = require("firebase-admin");

// 初始化 Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require("./serviceAccountKey.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function createCustomizedUser(userId, email) {
  try {
    console.log(`🚀 正在為使用者 ${userId} 創建 customizedUsers 文檔...`);

    // 檢查使用者是否存在
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    let preferences = {
      healthGoals: [],
      customHealthGoals: [],
      allergens: [],
      customAllergens: [],
      diseases: [],
      customDiseases: [],
      notificationsEnabled: true,
      allergenAlertsEnabled: false,
      dailyReminderEnabled: true,
      weeklyReportEnabled: true,
      achievementNotificationsEnabled: true,
      language: "zh-TW",
    };

    if (userDoc.exists) {
      const userData = userDoc.data();
      preferences = userData.preferences || preferences;
      console.log("✅ 找到現有使用者，使用其 preferences");
    } else {
      console.log("⚠️  使用者不存在，使用預設 preferences");
    }

    // 檢查是否有客製化
    const hasCustomization =
      (preferences.customHealthGoals && preferences.customHealthGoals.length > 0) ||
      (preferences.customAllergens && preferences.customAllergens.length > 0) ||
      (preferences.customDiseases && preferences.customDiseases.length > 0);

    // 創建 customizedUsers 文檔
    const customizedUserRef = db.collection("customizedUsers").doc(userId);
    await customizedUserRef.set({
      userId: userId,
      email: email,
      hasCustomization: hasCustomization,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      customizationFeatures: hasCustomization ? {
        hasCustomHealthGoals: preferences.customHealthGoals?.length > 0 || false,
        hasCustomAllergens: preferences.customAllergens?.length > 0 || false,
        hasCustomDiseases: preferences.customDiseases?.length > 0 || false,
      } : {
        hasCustomHealthGoals: false,
        hasCustomAllergens: false,
        hasCustomDiseases: false,
      },
    }, {merge: true});

    console.log("✅ customizedUsers 文檔已創建/更新！");
    console.log(`📝 文檔 ID: ${userId}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🎨 有客製化: ${hasCustomization}`);
    console.log("");
    console.log("現在請到 Firebase Console > Firestore Database 查看 customizedUsers 集合");
  } catch (error) {
    console.error("❌ 錯誤:", error.message);
    process.exit(1);
  }
}

// 從命令列參數獲取 userId 和 email
const userId = process.argv[2] || "test-user-001";
const email = process.argv[3] || `${userId}@test.com`;

createCustomizedUser(userId, email)
    .then(() => {
      console.log("✅ 完成！");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ 執行失敗:", error);
      process.exit(1);
    });

















