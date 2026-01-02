/**
 * Google Cloud Vision API Service
 * Provides OCR text detection for food labels
 * 
 * API Documentation: https://cloud.google.com/vision/docs/ocr
 */

import {
  VisionAPIRequest,
  VisionAPIResponse,
  OCRResult,
  VisionTextAnnotation,
} from "../types/vision";

const VISION_API_ENDPOINT = "https://vision.googleapis.com/v1/images:annotate";
const REQUEST_TIMEOUT = 15000; // 15 seconds

/**
 * Get Google Cloud Vision API key from environment
 */
const getVisionAPIKey = (): string => {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY;
  if (!apiKey) {
    throw new Error("Google Cloud Vision API key not configured");
  }
  return apiKey;
};

/**
 * Detect text in an image using Google Cloud Vision API
 * 
 * @param base64Image - Base64 encoded image string (without data URI prefix)
 * @returns OCRResult with extracted text and metadata
 * @throws Error if API call fails or no text is detected
 */
export const detectTextWithVision = async (
  base64Image: string
): Promise<OCRResult> => {
  const startTime = Date.now();

  try {
    const apiKey = getVisionAPIKey();

    // Construct Vision API request
    const requestBody: VisionAPIRequest = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: "TEXT_DETECTION", // Use TEXT_DETECTION for general text extraction
              maxResults: 50, // Get up to 50 text annotations
            },
          ],
          imageContext: {
            // Language hints for better accuracy with Chinese/mixed labels
            languageHints: ["zh-TW", "zh-CN", "en", "ja"],
          },
        },
      ],
    };

    // Make API request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    console.log("[Google Vision] Starting OCR request...");

    const response = await fetch(`${VISION_API_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Google Vision] API error:", response.status, errorText);
      throw new Error(`Vision API error: ${response.status} - ${errorText}`);
    }

    const data: VisionAPIResponse = await response.json();
    const ocrTime = Date.now() - startTime;
    console.log(`[Google Vision] OCR completed in ${ocrTime}ms`);

    // Process the response
    return processVisionResponse(data);
  } catch (error: any) {
    console.error("[Google Vision] OCR failed:", error);

    // Handle specific error types
    if (error.name === "AbortError") {
      throw new Error("OCR請求超時，請重試");
    }

    if (error.message?.includes("API key")) {
      throw new Error("Vision API配置錯誤");
    }

    // Re-throw with context
    throw new Error(`OCR失敗: ${error.message || "未知錯誤"}`);
  }
};

/**
 * Process Vision API response and extract OCR results
 * 
 * @param data - Raw Vision API response
 * @returns Processed OCR result
 */
const processVisionResponse = (
  data: VisionAPIResponse
): OCRResult => {
  const response = data.responses?.[0];

  // Check for API errors
  if (response?.error) {
    console.error("[Google Vision] API returned error:", response.error);
    throw new Error(`Vision API error: ${response.error.message}`);
  }

  // Check if text was detected
  const textAnnotations = response?.textAnnotations;
  if (!textAnnotations || textAnnotations.length === 0) {
    console.warn("[Google Vision] No text detected in image");
    throw new Error("未檢測到文字，請確保標籤清晰可見");
  }

  // First annotation contains the full text
  // Subsequent annotations are word/phrase level detections
  const fullTextAnnotation = textAnnotations[0];
  const fullText = fullTextAnnotation.description || "";

  // Extract detected languages from annotations
  const detectedLanguages = extractLanguages(textAnnotations);

  // Calculate confidence based on text length and word count
  const wordCount = textAnnotations.length - 1; // Exclude the first full-text annotation
  const confidence = calculateConfidence(fullText, wordCount);

  console.log(`[Google Vision] Detected ${wordCount} words in languages:`, detectedLanguages);
  console.log(`[Google Vision] Full text preview:`, fullText.substring(0, 100) + "...");

  return {
    fullText,
    detectedLanguages,
    confidence,
    wordCount,
    textAnnotations, // Include raw annotations for debugging
  };
};

/**
 * Extract unique languages detected in the text
 * 
 * @param annotations - Text annotations from Vision API
 * @returns Array of detected language codes
 */
const extractLanguages = (annotations: VisionTextAnnotation[]): string[] => {
  const languages = new Set<string>();

  for (const annotation of annotations) {
    if (annotation.locale) {
      languages.add(annotation.locale);
    }
  }

  // If no language detected, default to Chinese
  if (languages.size === 0) {
    languages.add("zh");
  }

  return Array.from(languages);
};

/**
 * Calculate confidence level based on extracted text quality
 * 
 * @param fullText - Complete extracted text
 * @param wordCount - Number of words detected
 * @returns Confidence level
 */
const calculateConfidence = (
  fullText: string,
  wordCount: number
): "high" | "medium" | "low" => {
  const textLength = fullText.length;

  // High confidence: Good text length and word count
  if (textLength > 50 && wordCount > 10) {
    return "high";
  }

  // Medium confidence: Decent text but may be incomplete
  if (textLength > 20 && wordCount > 5) {
    return "medium";
  }

  // Low confidence: Very little text detected
  return "low";
};

/**
 * Validate if detected text appears to contain ingredient information
 * This is a heuristic check to improve user experience
 * 
 * @param text - Extracted text
 * @returns true if text likely contains ingredients
 */
export const looksLikeIngredientList = (text: string): boolean => {
  // Check for common ingredient-related keywords in Chinese and English
  const ingredientKeywords = [
    "成分", "成份", "原料", "配料", "ingredients",
    "添加", "防腐", "色素", "香料", "甜味",
    "E1", "E2", "E3", "E4", // E-numbers
    "酸", "鈉", "糖", "鹽", "油"
  ];

  const lowerText = text.toLowerCase();
  return ingredientKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
};

/**
 * Test Vision API connectivity
 * Useful for debugging and health checks
 * 
 * @returns true if API is accessible
 */
export const testVisionAPI = async (): Promise<boolean> => {
  try {
    // Test with a simple 1x1 white pixel image
    const testImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
    
    await detectTextWithVision(testImage);
    console.log("[Google Vision] API test successful");
    return true;
  } catch (error) {
    console.error("[Google Vision] API test failed:", error);
    return false;
  }
};
