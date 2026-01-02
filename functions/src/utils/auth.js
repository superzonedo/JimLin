const admin = require("firebase-admin");

/**
 * 驗證 Firebase Auth Token
 * @param {object} request - Express request 對象
 * @return {Promise<{userId: string, email: string}|null>}
 */
async function verifyAuthToken(request) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return {
      userId: decodedToken.uid,
      email: decodedToken.email || "",
    };
  } catch (error) {
    console.error("Token 驗證失敗:", error);
    return null;
  }
}

module.exports = {verifyAuthToken};


