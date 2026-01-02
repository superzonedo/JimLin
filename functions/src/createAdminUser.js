const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

// 初始化 Firebase Admin（如果尚未初始化）
if (!admin.apps.length) {
  admin.initializeApp();
}

// 獲取 Firestore 實例
const db = admin.firestore();

/**
 * 創建後台使用者 API
 * POST /createAdminUser
 * Body: { email: string, password: string, role?: string }
 *
 * 注意：此 API 應該在生產環境中加上額外的安全保護（如只有超級管理員可以創建）
 */
const createAdminUser = onRequest(
    {
      region: "us-central1",
      memory: "256MiB",
      cors: true,
    },
    async (request, response) => {
      // 設置 CORS headers
      response.set("Access-Control-Allow-Origin", "*");
      response.set("Access-Control-Allow-Methods", "POST, OPTIONS");
      response.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

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

      const {email, password, role} = request.body;

      if (!email || !password) {
        response.status(400).json({
          error: "缺少參數",
          message: "請提供 email 和 password",
        });
        return;
      }

      // 驗證 email 格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        response.status(400).json({
          error: "無效的 email",
          message: "請提供有效的 email 格式",
        });
        return;
      }

      // 驗證密碼長度
      if (password.length < 6) {
        response.status(400).json({
          error: "密碼太短",
          message: "密碼長度至少需要 6 個字元",
        });
        return;
      }

      try {
        // 檢查 email 是否已存在
        const existingAdmin = await db
            .collection("adminUsers")
            .where("email", "==", email)
            .limit(1)
            .get();

        if (!existingAdmin.empty) {
          response.status(409).json({
            error: "email 已存在",
            message: "此 email 已經註冊為後台使用者",
          });
          return;
        }

        // 創建 Firebase Auth 使用者
        const firebaseUser = await admin.auth().createUser({
          email: email,
          emailVerified: true,
          disabled: false,
        });

        const adminId = firebaseUser.uid;

        // 創建 Firestore 後台使用者記錄
        const adminUserData = {
          email: email,
          password: password, // 注意：生產環境應使用 bcrypt 加密
          isAdmin: true,
          role: role || "admin",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection("adminUsers").doc(adminId).set(adminUserData);

        response.status(201).json({
          success: true,
          message: "後台使用者創建成功",
          adminId: adminId,
          email: email,
          role: adminUserData.role,
        });
      } catch (error) {
        console.error("創建後台使用者失敗:", error);
        response.status(500).json({
          error: "創建失敗",
          details: error.message,
        });
      }
    },
);

module.exports = {createAdminUser};


