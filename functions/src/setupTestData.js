const {onRequest} = require("firebase-functions/v2/https");
const {getOrCreateUser} = require("./utils/subscriptionCheck");

/**
 * 設置測試資料的 API（僅用於開發測試）
 * GET /setupTestData?userId=<userId>&email=<email>
 */
const setupTestData = onRequest(
    {
      region: "us-central1",
      memory: "256MiB",
      cors: true,
    },
    async (request, response) => {
      // 設置 CORS headers
      response.set("Access-Control-Allow-Origin", "*");
      response.set("Access-Control-Allow-Methods", "GET, OPTIONS");
      response.set("Access-Control-Allow-Headers", "Content-Type");

      // 處理 OPTIONS 請求
      if (request.method === "OPTIONS") {
        response.status(204).send("");
        return;
      }

      const {userId, email} = request.query;

      if (!userId) {
        response.status(400).json({
          error: "缺少參數",
          message: "請提供 userId 參數",
          example: "/setupTestData?userId=test-user-001&email=test@example.com",
        });
        return;
      }

      try {
        const userEmail = email || `${userId}@test.com`;

        // 使用 getOrCreateUser 函數創建或獲取使用者（會自動初始化 customizedUsers）
        const userData = await getOrCreateUser(userId, userEmail);
        console.log("✅ 使用者資料已創建/更新，customizedUsers 已初始化");

        response.status(200).json({
          success: true,
          message: "測試資料已創建",
          data: {
            userId: userId,
            email: userData.email || userEmail,
            user: userData,
          },
          note: "現在可以使用此 userId 測試 API 了！customizedUsers 集合已自動初始化。",
        });
      } catch (error) {
        console.error("創建測試資料失敗:", error);
        response.status(500).json({
          error: "創建測試資料失敗",
          details: error.message,
        });
      }
    },
);

module.exports = {setupTestData};

