const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const {verifyAuthToken} = require("./utils/auth");
const {updateCustomizedUsers} = require("./utils/subscriptionCheck");

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

/**
 * 更新使用者偏好設定的 API
 * PUT /updateUserPreferences
 * Headers: Authorization: Bearer <token>
 * Body: { preferences: { ... } }
 */
const updateUserPreferences = onRequest(
    {
      region: "us-central1",
      memory: "256MiB",
      cors: true,
    },
    async (request, response) => {
      response.set("Access-Control-Allow-Origin", "*");
      response.set("Access-Control-Allow-Methods", "PUT, OPTIONS");
      response.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

      if (request.method === "OPTIONS") {
        response.status(204).send("");
        return;
      }

      const authInfo = await verifyAuthToken(request);
      if (!authInfo) {
        response.status(401).json({
          error: "未授權",
          message: "請提供有效的 Firebase Auth Token",
        });
        return;
      }

      const {userId, email} = authInfo;
      const {preferences} = request.body;

      if (!preferences) {
        response.status(400).json({
          error: "缺少參數",
          message: "請提供 preferences 物件",
        });
        return;
      }

      try {
        const userRef = db.collection("users").doc(userId);
        await userRef.update({
          preferences: preferences,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // 更新 customizedUsers 集合
        await updateCustomizedUsers(userId, email, preferences);

        response.status(200).json({
          success: true,
          message: "偏好設定已更新",
        });
      } catch (error) {
        console.error("更新偏好設定失敗:", error);
        response.status(500).json({
          error: "更新偏好設定失敗",
          details: error.message,
        });
      }
    },
);

module.exports = {updateUserPreferences};


