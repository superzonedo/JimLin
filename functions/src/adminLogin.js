const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

// 初始化 Firebase Admin（如果尚未初始化）
if (!admin.apps.length) {
  admin.initializeApp();
}

// 獲取 Firestore 實例
const db = admin.firestore();

/**
 * 後台使用者登入 API
 * POST /adminLogin
 * Body: { email: string, password: string }
 *
 * 注意：此實作使用簡單的密碼驗證，生產環境建議使用更安全的方式（如 bcrypt）
 */
const adminLogin = onRequest(
    {
      region: "us-central1",
      memory: "256MiB",
      cors: true,
    },
    async (request, response) => {
      // 設置 CORS headers
      response.set("Access-Control-Allow-Origin", "*");
      response.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      response.set("Access-Control-Allow-Headers", "Content-Type");

      // 處理 OPTIONS 請求
      if (request.method === "OPTIONS") {
        response.status(204).send("");
        return;
      }

      if (request.method !== "POST") {
        response.status(405).json({
          error: "方法不允許",
          message: "只接受 POST 請求",
        });
        return;
      }

      const {email, password} = request.body;

      if (!email || !password) {
        response.status(400).json({
          error: "缺少參數",
          message: "請提供 email 和 password",
        });
        return;
      }

      try {
        // 查詢後台使用者
        const adminUsersSnapshot = await db
            .collection("adminUsers")
            .where("email", "==", email)
            .where("isAdmin", "==", true)
            .limit(1)
            .get();

        if (adminUsersSnapshot.empty) {
          response.status(401).json({
            error: "登入失敗",
            message: "無效的 email 或 password",
          });
          return;
        }

        const adminDoc = adminUsersSnapshot.docs[0];
        const adminData = adminDoc.data();
        const adminId = adminDoc.id;

        // 驗證密碼（簡單比對，生產環境應使用 bcrypt）
        if (adminData.password !== password) {
          response.status(401).json({
            error: "登入失敗",
            message: "無效的 email 或 password",
          });
          return;
        }

        // 檢查使用者是否在 Firebase Auth 中存在
        try {
          await admin.auth().getUser(adminId);
        } catch (error) {
          // 如果使用者不存在，創建一個
          await admin.auth().createUser({
            uid: adminId,
            email: email,
            emailVerified: true,
            disabled: false,
          });
        }

        // 創建自定義 token
        const customToken = await admin.auth().createCustomToken(adminId, {
          email: email,
          isAdmin: true,
          role: adminData.role || "admin",
        });

        // 更新最後登入時間
        await db.collection("adminUsers").doc(adminId).update({
          lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        response.status(200).json({
          success: true,
          customToken: customToken,
          adminId: adminId,
          email: email,
          role: adminData.role || "admin",
          message: "登入成功",
          note: "使用 customToken 在前端使用 signInWithCustomToken 轉換為 ID token",
        });
      } catch (error) {
        console.error("後台登入失敗:", error);
        response.status(500).json({
          error: "登入失敗",
          details: error.message,
        });
      }
    },
);

module.exports = {adminLogin};


