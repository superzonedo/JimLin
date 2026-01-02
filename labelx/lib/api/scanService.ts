import { auth } from '@/lib/firebase';
import * as FileSystem from 'expo-file-system/legacy';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 
  'https://us-central1-lablex-api.cloudfunctions.net';

/**
 * 將圖片 URI 轉換為 Base64
 */
async function imageUriToBase64(uri: string): Promise<{ base64: string; mime: string }> {
  try {
    let base64: string;
    let mime = 'image/jpeg';

    // Web 環境：使用 fetch 和 FileReader
    if (uri.startsWith('blob:') || uri.startsWith('http://') || uri.startsWith('https://')) {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          // 移除 data URL 前綴
          const base64Data = result.split(',')[1] || result;
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
      mime = blob.type || 'image/jpeg';
    } else {
      // Native 環境：使用 FileSystem
      if (!FileSystem || !FileSystem.readAsStringAsync) {
        throw new Error('FileSystem.readAsStringAsync 不可用，請確認 expo-file-system 已正確安裝。\n\n請運行：npm install expo-file-system');
      }

      const encodingType = FileSystem.EncodingType?.Base64;
      if (!encodingType) {
        throw new Error('無法獲取 Base64 編碼類型，請確認 expo-file-system 版本正確');
      }

      base64 = await FileSystem.readAsStringAsync(uri, { encoding: encodingType });
      
      // 推斷 MIME 類型
      if (uri.toLowerCase().endsWith('.png')) {
        mime = 'image/png';
      } else if (uri.toLowerCase().endsWith('.jpg') || uri.toLowerCase().endsWith('.jpeg')) {
        mime = 'image/jpeg';
      } else if (uri.toLowerCase().endsWith('.webp')) {
        mime = 'image/webp';
      }
    }

    return { base64, mime };
  } catch (error: any) {
    console.error('圖片轉換 Base64 失敗:', error);
    throw new Error(`圖片轉換失敗: ${error.message || '未知錯誤'}`);
  }
}

/**
 * 上傳並分析圖片
 * @param imageUri 圖片 URI
 * @param onProgress 進度回調函數 (0-100)
 */
export async function uploadAndAnalyzeImage(
  imageUri: string,
  onProgress?: (progress: number) => void,
  language?: string
): Promise<any> {
  try {
    // 步驟 1: 轉換圖片為 Base64 (10%)
    onProgress?.(10);
    const { base64, mime } = await imageUriToBase64(imageUri);
    console.log('✅ 圖片已轉換為 Base64, MIME:', mime);

    // 步驟 2: 獲取 Firebase Auth Token (20%)
    onProgress?.(20);
    const user = auth.currentUser;
    let authToken: string | null = null;

    if (user) {
      try {
        authToken = await user.getIdToken();
        console.log('✅ 已獲取 Firebase Auth Token');
      } catch (tokenError) {
        console.warn('⚠️ 獲取 Auth Token 失敗，將使用開發模式:', tokenError);
      }
    } else {
      console.warn('⚠️ 用戶未登入，將使用開發模式');
    }

    // 步驟 3: 準備請求 (30%)
    onProgress?.(30);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // 如果有 token，添加到 headers
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    // 構建 API URL（如果沒有 token，使用開發模式）
    let apiUrl = `${API_BASE_URL}/uploadImage`;
    if (!authToken) {
      apiUrl += '?devMode=true';
      if (user) {
        apiUrl += `&userId=${user.uid}&email=${encodeURIComponent(user.email || '')}`;
      }
    }

    // 步驟 4: 發送請求到後端 (40%)
    onProgress?.(40);
    console.log('📤 發送圖片分析請求到後端...', {
      url: apiUrl,
      hasToken: !!authToken,
      imageSize: `${Math.round(base64.length / 1024)}KB`,
    });

    // 添加重試機制
    const maxRetries = 3;
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      
      try {
        // 創建帶超時的 fetch 請求
        const controller = new AbortController();
        timeoutId = setTimeout(() => {
          controller.abort();
          console.warn('⏱️ 請求超時（60秒），正在中止...');
        }, 60000) as any; // 60秒超時

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            imageBase64: base64,
            mime: mime,
            language: language || 'en', // 傳遞用戶選擇的語言，後端會根據此參數返回對應語言的內容
          }),
          signal: controller.signal,
        });

        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        // 步驟 5: 處理響應 (80%)
        onProgress?.(80);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || errorData.error || `請求失敗: ${response.status}`;
          console.error('❌ 後端分析失敗:', {
            status: response.status,
            error: errorData,
            attempt,
          });
          
          // 如果是最後一次嘗試，拋出錯誤
          if (attempt === maxRetries) {
            throw new Error(errorMessage);
          }
          
          // 否則等待後重試（使用指數退避：2秒、4秒）
          const waitTime = Math.min(attempt * 2000, 8000); // 最多等待8秒
          console.log(`⚠️ 請求失敗，${waitTime}ms 後重試 (嘗試 ${attempt}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        // 成功獲取響應
        const result = await response.json();
        console.log('✅ 後端分析成功:', {
          documentId: result.documentId,
          productName: result.productName,
          maxRiskLevel: result.maxRiskLevel,
          riskScore: result.riskScore,
          attempt,
        });

        // 步驟 6: 完成 (100%)
        onProgress?.(100);
        return result;
      } catch (error: any) {
        lastError = error;
        
        // 清除超時（如果還沒清除）
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        
        // 判斷是否為網絡錯誤
        const isNetworkError = 
          error.name === 'AbortError' || 
          error.name === 'TypeError' ||
          error.message?.includes('Network request failed') ||
          error.message?.includes('Failed to fetch') ||
          error.message?.includes('NetworkError') ||
          error.message?.includes('timeout') ||
          error.message?.includes('aborted');
        
        console.error(`❌ 請求錯誤 (嘗試 ${attempt}/${maxRetries}):`, {
          name: error.name,
          message: error.message,
          isNetworkError,
        });
        
        if (isNetworkError && attempt < maxRetries) {
          // 使用指數退避策略：2秒、4秒
          const waitTime = Math.min(attempt * 2000, 8000);
          console.warn(`⚠️ 網絡請求失敗 (${error.message || error.name})，${waitTime}ms 後重試 (嘗試 ${attempt + 1}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        // 其他錯誤或已是最後一次嘗試，直接拋出
        if (attempt === maxRetries) {
          // 提供更友好的錯誤訊息
          if (isNetworkError) {
            throw new Error('網絡連接失敗，請檢查您的網絡連接後重試。如果問題持續，可能是服務器暫時無法訪問。');
          }
          throw error;
        }
      }
    }

    // 如果所有重試都失敗
    if (lastError) {
      throw lastError;
    }
    
    throw new Error('請求失敗：未知錯誤');
  } catch (error: any) {
    console.error('❌ 上傳和分析圖片失敗:', error);
    throw error;
  }
}

