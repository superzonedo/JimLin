const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

const db = admin.firestore();

/**
 * 驗證 Firebase Auth Token
 * @param {object} request - Express request 對象
 * @return {Promise<{userId: string}|null>}
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
    };
  } catch (error) {
    console.error("Token 驗證失敗:", error);
    return null;
  }
}

/**
 * 獲取使用者產品列表
 */
const getProducts = onRequest(
    {
      region: "us-central1",
      memory: "256MiB",
      cors: true,
    },
    async (request, response) => {
      // 設置 CORS headers
      response.set("Access-Control-Allow-Origin", "*");
      response.set("Access-Control-Allow-Methods", "GET, OPTIONS");
      response.set("Access-Control-Allow-Headers", "Authorization");

      // 處理 OPTIONS 請求
      if (request.method === "OPTIONS") {
        response.status(204).send("");
        return;
      }

      // 驗證認證
      const authInfo = await verifyAuthToken(request);
      if (!authInfo) {
        response.status(401).json({
          error: "未授權",
          message: "請提供有效的 Firebase Auth Token",
        });
        return;
      }

      const {userId} = authInfo;

      try {
        // 獲取查詢參數
        const {
          limit = 50,
          offset = 0,
          days = null, // 查詢最近 N 天的資料
          maxRiskLevel = null, // 過濾風險等級
          productType = null, // 過濾產品類型
        } = request.query;

        // 構建查詢
        let query = db
            .collection("users")
            .doc(userId)
            .collection("userProducts")
            .orderBy("createdAt", "desc");

        // 添加日期過濾（30 天內）
        if (days) {
          const daysAgo = new Date();
          daysAgo.setDate(daysAgo.getDate() - parseInt(days));
          query = query.where("createdAt", ">=", admin.firestore.Timestamp.fromDate(daysAgo));
        }

        // 添加風險等級過濾
        if (maxRiskLevel) {
          query = query.where("maxRiskLevel", "==", maxRiskLevel);
        }

        // 添加產品類型過濾
        if (productType) {
          query = query.where("productType", "==", productType);
        }

        // 執行查詢
        const snapshot = await query
            .limit(parseInt(limit))
            .offset(parseInt(offset))
            .get();

        const products = [];
        for (const doc of snapshot.docs) {
          const data = doc.data();
          // 獲取完整產品資料
          const productDoc = await db.collection("products").doc(data.productId).get();
          if (productDoc.exists) {
            products.push({
              id: productDoc.id,
              ...productDoc.data(),
            });
          }
        }

        // 獲取總數（用於分頁）
        const totalSnapshot = await db
            .collection("users")
            .doc(userId)
            .collection("userProducts")
            .count()
            .get();
        const total = totalSnapshot.data().count;

        response.status(200).json({
          products,
          pagination: {
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: parseInt(offset) + products.length < total,
          },
        });
      } catch (error) {
        console.error("獲取產品列表失敗:", error);
        response.status(500).json({
          error: "獲取產品列表失敗",
          details: error.message,
        });
      }
    },
);

/**
 * 獲取單個產品詳情
 */
const getProduct = onRequest(
    {
      region: "us-central1",
      memory: "256MiB",
      cors: true,
    },
    async (request, response) => {
      // 設置 CORS headers
      response.set("Access-Control-Allow-Origin", "*");
      response.set("Access-Control-Allow-Methods", "GET, OPTIONS");
      response.set("Access-Control-Allow-Headers", "Authorization");

      // 處理 OPTIONS 請求
      if (request.method === "OPTIONS") {
        response.status(204).send("");
        return;
      }

      // 驗證認證
      const authInfo = await verifyAuthToken(request);
      if (!authInfo) {
        response.status(401).json({
          error: "未授權",
          message: "請提供有效的 Firebase Auth Token",
        });
        return;
      }

      const {userId} = authInfo;
      const productId = request.query.id || request.query.productId;

      if (!productId) {
        response.status(400).json({
          error: "缺少產品 ID",
        });
        return;
      }

      try {
        const productDoc = await db.collection("products").doc(productId).get();

        if (!productDoc.exists) {
          response.status(404).json({
            error: "產品不存在",
          });
          return;
        }

        const productData = productDoc.data();

        // 檢查是否為產品擁有者
        if (productData.creatorId !== userId) {
          response.status(403).json({
            error: "無權限訪問此產品",
          });
          return;
        }

        response.status(200).json({
          id: productDoc.id,
          ...productData,
        });
      } catch (error) {
        console.error("獲取產品詳情失敗:", error);
        response.status(500).json({
          error: "獲取產品詳情失敗",
          details: error.message,
        });
      }
    },
);

module.exports = {getProducts, getProduct};

