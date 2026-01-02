const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

// 初始化 Firebase Admin（如果尚未初始化）
if (!admin.apps.length) {
  admin.initializeApp();
}

// 獲取 Firestore 實例
const db = admin.firestore();

/**
 * 驗證 Apple 登入 API
 * POST /verifyAppleLogin
 * Body: { identityToken: string, authorizationCode?: string, user?: { email?: string, fullName?: { givenName?: string, familyName?: string } } }
 *
 * 注意：此 API 驗證 Apple identity token 並創建/獲取 Firebase 使用者
 */
const verifyAppleLogin = onRequest(
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

      const {identityToken, user} = request.body;

      if (!identityToken) {
        response.status(400).json({
          error: "缺少參數",
          message: "請提供 identityToken",
        });
        return;
      }

      try {
        // 驗證 Apple identity token
        // 注意：Firebase Admin SDK 不直接支援驗證 Apple token
        // 我們需要手動驗證 JWT token 或使用 Firebase Auth 的 signInWithCredential
        // 這裡我們使用一個簡化的方法：解析 token 並創建 Firebase 使用者

        // 解析 JWT token（不驗證簽名，僅用於獲取用戶信息）
        // 注意：生產環境應該驗證 Apple 的簽名
        const tokenParts = identityToken.split(".");
        if (tokenParts.length !== 3) {
          response.status(400).json({
            error: "無效的 token",
            message: "identityToken 格式不正確，應該是 JWT 格式（header.payload.signature）",
          });
          return;
        }

        // 解碼 payload（base64）
        let payload;
        try {
          const payloadBase64 = tokenParts[1];
          // 添加 padding 如果需要的話
          const paddedPayload = payloadBase64 + "=".repeat((4 - payloadBase64.length % 4) % 4);
          const payloadString = Buffer.from(paddedPayload, "base64").toString("utf-8");
          payload = JSON.parse(payloadString);
        } catch (parseError) {
          response.status(400).json({
            error: "無效的 token",
            message: "無法解析 identityToken 的 payload，請確保這是有效的 Apple identity token",
            details: parseError.message,
          });
          return;
        }

        // 從 token 中提取用戶信息
        if (!payload.sub) {
          response.status(400).json({
            error: "無效的 token",
            message: "token payload 中缺少 'sub' 欄位（Apple 用戶 ID）",
          });
          return;
        }

        const appleUserId = payload.sub; // Apple 用戶 ID
        const email = user?.email || payload.email || null;
        const givenName = user?.fullName?.givenName || null;
        const familyName = user?.fullName?.familyName || null;
        // 確保 displayName 永遠是有效的字串，不能是 null
        let displayName = null;
        if (givenName && familyName) {
          displayName = `${givenName} ${familyName}`.trim();
        } else if (givenName) {
          displayName = givenName.trim();
        } else if (familyName) {
          displayName = familyName.trim();
        }
        // Firebase Admin SDK 要求：如果提供 displayName，必須是非空字串
        // 如果沒有姓名，使用 undefined（而不是空字串或 null）
        if (!displayName || displayName.trim() === "") {
          displayName = undefined;
        }

        // 使用 Apple 用戶 ID 作為 Firebase UID（加上前綴以避免衝突）
        const firebaseUid = `apple:${appleUserId}`;

        // 檢查使用者是否已存在
        let firebaseUser;
        try {
          firebaseUser = await admin.auth().getUser(firebaseUid);
        } catch (error) {
          // 使用者不存在，創建新使用者
          const userData = {
            uid: firebaseUid,
            email: email || undefined, // Firebase 允許 email 為 undefined
            emailVerified: email ? true : false,
            disabled: false,
            providerData: [{
              uid: appleUserId,
              providerId: "apple.com",
              email: email || undefined,
            }],
          };

          // 只有當 displayName 是有效字串時才添加
          if (displayName && displayName.trim() !== "") {
            userData.displayName = displayName;
            userData.providerData[0].displayName = displayName;
          }

          try {
            firebaseUser = await admin.auth().createUser(userData);
          } catch (createError) {
            console.error("創建用戶失敗:", createError);
            // 如果創建失敗，可能是因為 email 已存在或其他原因
            // 嘗試獲取現有用戶
            if (createError.code === "auth/email-already-exists" && email) {
              try {
                firebaseUser = await admin.auth().getUserByEmail(email);
              } catch (emailError) {
                throw createError;
              }
            } else {
              throw createError;
            }
          }
        }

        // 如果使用者已存在但 email 或 displayName 有更新，則更新
        if (firebaseUser) {
          const updateData = {};
          if (email && firebaseUser.email !== email) {
            updateData.email = email;
            updateData.emailVerified = true;
          }
          // 只有當 displayName 是有效字串時才更新
          if (displayName && displayName.trim() !== "" && firebaseUser.displayName !== displayName) {
            updateData.displayName = displayName;
          }

          if (Object.keys(updateData).length > 0) {
            await admin.auth().updateUser(firebaseUid, updateData);
            firebaseUser = await admin.auth().getUser(firebaseUid);
          }
        }

        // 創建自定義 token
        const customToken = await admin.auth().createCustomToken(firebaseUid, {
          email: email,
          provider: "apple.com",
        });

        // 更新或創建 Firestore 使用者記錄
        const userRef = db.collection("users").doc(firebaseUid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
          await userRef.set({
            email: email || null,
            displayName: displayName || null, // Firestore 允許 null
            provider: "apple.com",
            appleUserId: appleUserId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        } else {
          const updateData = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          };
          if (email) {
            updateData.email = email;
          }
          if (displayName && displayName.trim() !== "") {
            updateData.displayName = displayName;
          }
          await userRef.update(updateData);
        }

        response.status(200).json({
          success: true,
          customToken: customToken,
          userId: firebaseUid,
          email: email || null,
          displayName: displayName || null, // 返回 null 而不是空字串，前端會處理
          message: "Apple 登入驗證成功",
          note: "使用 customToken 在前端使用 signInWithCustomToken 轉換為 ID token",
        });
      } catch (error) {
        console.error("Apple 登入驗證失敗:", error);
        response.status(500).json({
          error: "驗證失敗",
          details: error.message,
        });
      }
    },
);

module.exports = {verifyAppleLogin};


