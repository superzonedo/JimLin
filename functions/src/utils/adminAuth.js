const admin = require("firebase-admin");

/**
 * 驗證後台使用者
 * @param {object} request - Express request 對象
 * @return {Promise<{adminId: string, email: string, isAdmin: boolean}|null>}
 */
async function verifyAdminAuth(request) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const adminId = decodedToken.uid;

    // 檢查 Firestore 中是否存在後台使用者記錄
    const db = admin.firestore();
    const adminDoc = await db.collection("adminUsers").doc(adminId).get();

    if (!adminDoc.exists) {
      return null;
    }

    const adminData = adminDoc.data();
    if (!adminData.isAdmin) {
      return null;
    }

    return {
      adminId: adminId,
      email: adminData.email || decodedToken.email || "",
      isAdmin: true,
      role: adminData.role || "admin",
    };
  } catch (error) {
    console.error("後台使用者 Token 驗證失敗:", error);
    return null;
  }
}

/**
 * 檢查使用者是否為後台使用者
 * @param {string} userId - 使用者 ID
 * @return {Promise<boolean>}
 */
async function isAdminUser(userId) {
  try {
    const db = admin.firestore();
    const adminDoc = await db.collection("adminUsers").doc(userId).get();

    if (!adminDoc.exists) {
      return false;
    }

    const adminData = adminDoc.data();
    return adminData.isAdmin === true;
  } catch (error) {
    console.error("檢查後台使用者失敗:", error);
    return false;
  }
}

module.exports = {verifyAdminAuth, isAdminUser};


