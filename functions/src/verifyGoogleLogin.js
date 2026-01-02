const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

// 初始化 Firebase Admin（如果尚未初始化）
if (!admin.apps.length) {
  admin.initializeApp();
}

// 獲取 Firestore 實例
const db = admin.firestore();

/**
 * 驗證 Google 登入 API
 * POST /verifyGoogleLogin
 * Body: { idToken: string }
 *
 * 注意：此 API 驗證 Google ID token 並創建/獲取 Firebase 使用者
 */
const verifyGoogleLogin = onRequest(
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

      const {idToken} = request.body;

      if (!idToken) {
        response.status(400).json({
          error: "缺少參數",
          message: "請提供 idToken",
        });
        return;
      }

      try {
        // 驗證 Google ID token
        // 使用 Google OAuth2 API 驗證 token
        const googleResponse = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`,
        );

        if (!googleResponse.ok) {
          throw new Error("無法驗證 Google ID token");
        }

        const googleUserInfo = await googleResponse.json();

        // 檢查 Google 回應是否有效
        if (googleUserInfo.error) {
          throw new Error(googleUserInfo.error_description || "Google token 驗證失敗");
        }

        // 從 Google 回應中提取用戶信息
        const googleUserId = googleUserInfo.sub;
        if (!googleUserId) {
          throw new Error("無法從 Google token 中獲取用戶 ID");
        }

        const email = googleUserInfo.email || null;
        const displayName = googleUserInfo.name || null;
        const photoURL = googleUserInfo.picture || null;

        // 使用 Google 用戶 ID 作為 Firebase UID（加上前綴以避免衝突）
        const firebaseUid = `google:${googleUserId}`;

        // 檢查使用者是否已存在
        let firebaseUser;
        try {
          firebaseUser = await admin.auth().getUser(firebaseUid);
        } catch (error) {
          // 使用者不存在，嘗試創建新使用者
          const userData = {
            uid: firebaseUid,
            email: email,
            emailVerified: email ? true : false,
            displayName: displayName,
            photoURL: photoURL,
            disabled: false,
            providerData: [{
              uid: googleUserId,
              providerId: "google.com",
              email: email,
              displayName: displayName,
              photoURL: photoURL,
            }],
          };

          try {
            firebaseUser = await admin.auth().createUser(userData);
          } catch (createError) {
            // 如果創建失敗，可能是因為 email 已被使用
            if (createError.code === "auth/email-already-exists" && email) {
              // 嘗試查找使用該 email 的現有用戶
              try {
                const existingUser = await admin.auth().getUserByEmail(email);
                // 檢查該用戶是否已經有 Google 提供者
                const hasGoogleProvider = existingUser.providerData.some(
                    (provider) => provider.providerId === "google.com",
                );

                if (hasGoogleProvider) {
                  // 用戶已經有 Google 提供者，使用現有用戶
                  firebaseUser = existingUser;
                } else {
                  // 用戶存在但沒有 Google 提供者，返回錯誤
                  response.status(400).json({
                    error: "帳戶衝突",
                    message: `該電子郵件地址已被另一個帳戶使用。請使用其他登入方式，或使用不同的 Google 帳戶。`,
                    details: "該 email 已存在於系統中，但未連結 Google 提供者",
                  });
                  return;
                }
              } catch (emailError) {
                // 無法找到用戶，返回原始錯誤
                throw createError;
              }
            } else {
              // 其他錯誤，直接拋出
              throw createError;
            }
          }
        }

        // 如果使用者已存在但信息有更新，則更新
        if (firebaseUser && (email || displayName || photoURL)) {
          const updateData = {};
          if (email && firebaseUser.email !== email) {
            updateData.email = email;
            updateData.emailVerified = true;
          }
          if (displayName && firebaseUser.displayName !== displayName) {
            updateData.displayName = displayName;
          }
          if (photoURL && firebaseUser.photoURL !== photoURL) {
            updateData.photoURL = photoURL;
          }

          if (Object.keys(updateData).length > 0) {
            await admin.auth().updateUser(firebaseUid, updateData);
            firebaseUser = await admin.auth().getUser(firebaseUid);
          }
        }

        // 創建自定義 token
        const customToken = await admin.auth().createCustomToken(firebaseUid, {
          email: email,
          provider: "google.com",
        });

        // 更新或創建 Firestore 使用者記錄
        const userRef = db.collection("users").doc(firebaseUid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
          await userRef.set({
            email: email,
            displayName: displayName,
            photoURL: photoURL,
            provider: "google.com",
            googleUserId: googleUserId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        } else {
          await userRef.update({
            email: email || userDoc.data().email,
            displayName: displayName || userDoc.data().displayName,
            photoURL: photoURL || userDoc.data().photoURL,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }

        response.status(200).json({
          success: true,
          customToken: customToken,
          userId: firebaseUid,
          email: email,
          displayName: displayName,
          photoURL: photoURL,
          message: "Google 登入驗證成功",
          note: "使用 customToken 在前端使用 signInWithCustomToken 轉換為 ID token",
        });
      } catch (error) {
        console.error("Google 登入驗證失敗:", error);
        response.status(500).json({
          error: "驗證失敗",
          details: error.message,
        });
      }
    },
);

module.exports = {verifyGoogleLogin};


