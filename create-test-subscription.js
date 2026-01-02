/**
 * 創建測試訂閱的腳本
 * 使用方法：node create-test-subscription.js <userId> <email>
 * 
 * 注意：這需要在本地運行，並且需要 Firebase Admin SDK 的服務帳號憑證
 * 或者使用 Firebase CLI 的模擬器
 */

const admin = require("firebase-admin");

// 初始化 Firebase Admin
if (!admin.apps.length) {
  // 如果在本地運行，可能需要服務帳號憑證
  // admin.initializeApp({
  //   credential: admin.credential.cert(require("./path/to/serviceAccountKey.json"))
  // });
  
  // 或者使用應用程式預設憑證（在 Firebase Functions 環境中）
  admin.initializeApp();
}

const db = admin.firestore();

async function createTestSubscription(userId, email) {
  try {
    // 創建訂閱
    const subscriptionData = {
      userId: userId,
      plan: "premium",
      status: "active",
      startDate: admin.firestore.Timestamp.now(),
      endDate: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 一年後
      ),
      isPaid: true,
      paymentMethod: "test",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const subscriptionRef = await db.collection("subscriptions").add(subscriptionData);
    console.log("✅ 訂閱已創建，ID:", subscriptionRef.id);

    // 創建或更新使用者
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      await userRef.update({
        subscriptionId: subscriptionRef.id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log("✅ 使用者資料已更新");
    } else {
      await userRef.set({
        email: email,
        subscriptionId: subscriptionRef.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        totalScans: 0,
        stats: {
          totalProducts: 0,
          highRiskCount: 0,
          mediumRiskCount: 0,
          lowRiskCount: 0,
        },
      });
      console.log("✅ 使用者資料已創建");
    }

    console.log("\n📋 訂閱資訊：");
    console.log("使用者 ID:", userId);
    console.log("Email:", email);
    console.log("訂閱 ID:", subscriptionRef.id);
    console.log("狀態: active");
    console.log("已付費: true");
    console.log("\n現在可以使用此使用者 ID 測試 API 了！");
  } catch (error) {
    console.error("❌ 創建訂閱失敗:", error);
  }
}

// 從命令行參數獲取 userId 和 email
const userId = process.argv[2];
const email = process.argv[3] || `${userId}@test.com`;

if (!userId) {
  console.log("使用方法：node create-test-subscription.js <userId> [email]");
  console.log("範例：node create-test-subscription.js abc123 user@example.com");
  process.exit(1);
}

createTestSubscription(userId, email).then(() => {
  process.exit(0);
});



















