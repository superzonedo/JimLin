import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";

/**
 * 分享掃描結果
 * @param viewRef 要截圖的組件 ref
 * @param productName 產品名稱
 * @param t 翻譯對象 (可選)
 * @returns 是否分享成功
 */
export async function shareResult(
  viewRef: any,
  productName: string,
  t?: any
): Promise<boolean> {
  try {
    // 檢查是否支持分享
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      console.log("Sharing is not available on this device");
      return false;
    }

    // 截圖
    const uri = await captureRef(viewRef, {
      format: "png",
      quality: 1,
      width: 375,
      height: undefined,
    });

    // 創建臨時文件路徑
    const timestamp = Date.now();
    const fileName = `LabelX_${productName.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "_")}_${timestamp}.png`;
    const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

    // 複製到臨時目錄
    await FileSystem.copyAsync({
      from: uri,
      to: fileUri,
    });

    // 分享
    const shareTitle = t?.results?.shareResults
      ? `${t.results.shareResults} ${productName} ${t.results.healthAnalysis}`
      : `分享 ${productName} 的健康分析報告`;

    await Sharing.shareAsync(fileUri, {
      mimeType: "image/png",
      dialogTitle: shareTitle,
      UTI: "public.png",
    });

    return true;
  } catch (error) {
    console.error("Error sharing result:", error);
    return false;
  }
}

/**
 * 從掃描結果提取產品名稱
 * @param summary AI 摘要文字
 * @returns 產品名稱或預設值
 */
export function extractProductName(summary: string, t?: any): string {
  // 嘗試從摘要中提取產品名稱
  // 通常 AI 會在開頭提到產品名稱

  // 方法1: 查找引號內的內容
  const quotedMatch = summary.match(/[「『""]([^」』""]+)[」』""]/);
  if (quotedMatch) {
    return quotedMatch[1];
  }

  // 方法2: 查找「此產品」之前的描述
  const productMatch = summary.match(/^(.+?)是|^(.+?)為|^(.+?)含有/);
  if (productMatch) {
    const name = productMatch[1] || productMatch[2] || productMatch[3];
    if (name && name.length < 30) {
      return name.trim();
    }
  }

  // 方法3: 使用前 15 個字元作為產品名稱
  const truncated = summary.substring(0, 15).trim();
  if (truncated) {
    return truncated + (summary.length > 15 ? "..." : "");
  }

  // 預設值 - use translation if available, otherwise fallback to Chinese
  return t?.home?.labelInspection || "掃描的食品";
}
