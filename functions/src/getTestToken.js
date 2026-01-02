const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

/**
 * 獲取測試 Token 的 API（僅用於開發測試）
 * GET /getTestToken?userId=<userId>&email=<email>
 *
 * 這個 API 會創建一個自定義 token，可以用於測試
 */
const getTestToken = onRequest(
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
          example: "/getTestToken?userId=test-user-001&email=test@example.com",
        });
        return;
      }

      try {
        const userEmail = email || `${userId}@test.com`;

        // 創建自定義 token
        const customToken = await admin.auth().createCustomToken(userId, {
          email: userEmail,
        });

        response.status(200).json({
          success: true,
          customToken: customToken,
          userId: userId,
          email: userEmail,
          note: "這是一個自定義 token，需要在前端使用 signInWithCustomToken 轉換為 ID token",
          instructions: {
            step1: "使用這個 customToken 在前端登入",
            step2: "然後使用 getIdToken() 獲取 ID token",
            step3: "使用 ID token 作為 Authorization header",
          },
        });
      } catch (error) {
        console.error("創建 token 失敗:", error);
        response.status(500).json({
          error: "創建 token 失敗",
          details: error.message,
        });
      }
    },
);

module.exports = {getTestToken};

