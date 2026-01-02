const admin = require("firebase-admin");
const sharp = require("sharp");

const bucket = admin.storage().bucket();

/**
 * 壓縮圖片並上傳到 Firebase Storage
 * @param {Buffer} imageBuffer - 圖片緩衝區
 * @param {string} userId - 使用者 ID
 * @param {string} productId - 產品 ID
 * @param {string} mimeType - MIME 類型
 * @return {Promise<{originalUrl: string, thumbnailUrl: string, storagePath: string}>}
 */
async function uploadImageToStorage(imageBuffer, userId, productId, mimeType) {
  const storagePath = `users/${userId}/products/${productId}`;
  const originalPath = `${storagePath}/original.jpg`;
  const thumbnailPath = `${storagePath}/thumbnail.jpg`;

  // 上傳原始圖片
  const originalFile = bucket.file(originalPath);
  await originalFile.save(imageBuffer, {
    metadata: {
      contentType: mimeType,
    },
  });

  // 壓縮並創建縮圖（最大寬度 400px）
  const thumbnailBuffer = await sharp(imageBuffer)
      .resize(400, null, {
        withoutEnlargement: true,
        fit: "inside",
      })
      .jpeg({quality: 80})
      .toBuffer();

  const thumbnailFile = bucket.file(thumbnailPath);
  await thumbnailFile.save(thumbnailBuffer, {
    metadata: {
      contentType: "image/jpeg",
    },
  });

  // 設置公開讀取權限（或根據需求設置）
  await originalFile.makePublic();
  await thumbnailFile.makePublic();

  // 獲取公開 URL
  const originalUrl = `https://storage.googleapis.com/${bucket.name}/${originalPath}`;
  const thumbnailUrl = `https://storage.googleapis.com/${bucket.name}/${thumbnailPath}`;

  return {
    originalUrl,
    thumbnailUrl,
    storagePath: originalPath,
  };
}

module.exports = {uploadImageToStorage};

