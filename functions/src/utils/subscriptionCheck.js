const admin = require("firebase-admin");
const db = admin.firestore();

/**
 * 獲取或創建使用者資料
 * @param {string} userId - 使用者 ID
 * @param {string} email - 使用者 Email
 * @return {Promise<object>}
 */
async function getOrCreateUser(userId, email) {
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();

  let userData;

  if (userDoc.exists) {
    userData = userDoc.data();
    // 確保使用者有 preferences 欄位
    if (!userData.preferences) {
      userData.preferences = {
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
      await userRef.update({
        preferences: userData.preferences,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    // 即使使用者已存在，也確保 customizedUsers 文檔存在
    await updateCustomizedUsers(userId, email, userData.preferences);
  } else {
    // 創建新使用者，包含預設的 preferences
    userData = {
      email: email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      totalScans: 0,
      stats: {
        totalProducts: 0,
        highRiskCount: 0,
        mediumRiskCount: 0,
        lowRiskCount: 0,
      },
      preferences: {
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
      },
    };

    await userRef.set(userData);

    // 立即初始化 customizedUsers 集合，確保集合在 Firebase Console 可見
    await updateCustomizedUsers(userId, email, userData.preferences);
  }

  return userData;
}

/**
 * 更新使用者的客製化狀態到 customizedUsers 集合
 * @param {string} userId - 使用者 ID
 * @param {string} email - 使用者 Email
 * @param {object} preferences - 使用者偏好設定
 */
async function updateCustomizedUsers(userId, email, preferences) {
  const hasCustomization =
    (preferences.customHealthGoals && preferences.customHealthGoals.length > 0) ||
    (preferences.customAllergens && preferences.customAllergens.length > 0) ||
    (preferences.customDiseases && preferences.customDiseases.length > 0);

  if (hasCustomization) {
    const customizedUserRef = db.collection("customizedUsers").doc(userId);
    await customizedUserRef.set({
      userId: userId,
      email: email,
      hasCustomization: true,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      customizationFeatures: {
        hasCustomHealthGoals: preferences.customHealthGoals?.length > 0 || false,
        hasCustomAllergens: preferences.customAllergens?.length > 0 || false,
        hasCustomDiseases: preferences.customDiseases?.length > 0 || false,
      },
    }, {merge: true});
  } else {
    const customizedUserRef = db.collection("customizedUsers").doc(userId);
    await customizedUserRef.set({
      userId: userId,
      email: email,
      hasCustomization: false,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    }, {merge: true});
  }
}

module.exports = {getOrCreateUser, updateCustomizedUsers};

