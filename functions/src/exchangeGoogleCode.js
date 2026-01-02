const {onRequest} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");

// 定義 secrets（Firebase Functions v2 的安全方式）
const googleClientId = defineSecret("GOOGLE_WEB_CLIENT_ID");
const googleClientSecret = defineSecret("GOOGLE_WEB_CLIENT_SECRET");

/**
 * 交換 Google Authorization Code 為 ID Token
 * POST /exchangeGoogleCode
 * Body: { code: string, redirectUri: string, codeVerifier: string }
 *
 * 注意：此 API 用於安全地交換 authorization code，因為需要 client_secret
 */
const exchangeGoogleCode = onRequest(
    {
      region: "us-central1",
      memory: "256MiB",
      cors: true,
      secrets: [googleClientId, googleClientSecret], // 指定需要的 secrets
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

      const {code, redirectUri, codeVerifier} = request.body;

      if (!code || !redirectUri || !codeVerifier) {
        response.status(400).json({
          error: "缺少參數",
          message: "請提供 code, redirectUri 和 codeVerifier",
        });
        return;
      }

      try {
        // 從 secrets 獲取 Google Client ID 和 Client Secret
        // 使用 .value() 來獲取 secret 的值
        // 去除多餘的空白字符（包括換行符）
        const clientId = googleClientId.value().trim();
        const clientSecret = googleClientSecret.value().trim();

        if (!clientId || !clientSecret) {
          console.error("Google Client ID 或 Client Secret 未配置");
          console.error("Client ID 存在:", !!clientId);
          console.error("Client Secret 存在:", !!clientSecret);
          response.status(500).json({
            error: "配置錯誤",
            message: "Google Client ID 或 Client Secret 未在後端配置",
          });
          return;
        }

        // 交換 authorization code 為 id token
        // 記錄用於調試的資訊（不記錄完整 secret）
        console.log("交換 token 請求參數:", {
          code: code.substring(0, 20) + "...",
          client_id: clientId,
          client_secret: clientSecret ? clientSecret.substring(0, 10) + "..." : "未設置",
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
          code_verifier: codeVerifier ? codeVerifier.substring(0, 20) + "..." : "未設置",
        });

        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            code: code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
            code_verifier: codeVerifier,
          }).toString(),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = {error: "未知錯誤", error_description: errorText};
          }
          console.error("Token 交換錯誤:", errorData);
          response.status(400).json({
            error: "Token 交換失敗",
            details: errorData.error_description || errorData.error,
          });
          return;
        }

        const tokenData = await tokenResponse.json();
        const idToken = tokenData.id_token;

        if (!idToken) {
          response.status(400).json({
            error: "無法獲取 ID token",
            message: "Google 回應中沒有 id_token",
          });
          return;
        }

        response.status(200).json({
          success: true,
          idToken: idToken,
          message: "Token 交換成功",
        });
      } catch (error) {
        console.error("交換 Google Code 失敗:", error);
        response.status(500).json({
          error: "交換失敗",
          details: error.message,
        });
      }
    },
);

module.exports = {exchangeGoogleCode};


