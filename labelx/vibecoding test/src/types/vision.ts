/**
 * Google Cloud Vision API Type Definitions
 * For OCR text detection and analysis
 */

/**
 * Vertex position in the image
 */
export interface Vertex {
  x?: number;
  y?: number;
}

/**
 * Bounding polygon around detected text
 */
export interface BoundingPoly {
  vertices: Vertex[];
}

/**
 * Individual text annotation from Vision API
 * First annotation contains full text, subsequent ones are word-level
 */
export interface VisionTextAnnotation {
  locale?: string; // Detected language (e.g., "zh", "en", "ja")
  description: string; // The detected text
  boundingPoly?: BoundingPoly;
}

/**
 * Full text annotation with detailed structure
 */
export interface FullTextAnnotation {
  text: string;
  pages?: Array<{
    blocks?: Array<{
      blockType?: string;
      paragraphs?: Array<{
        words?: Array<{
          symbols?: Array<{
            text?: string;
          }>;
        }>;
      }>;
    }>;
  }>;
}

/**
 * Error response from Vision API
 */
export interface VisionError {
  code: number;
  message: string;
  status?: string;
}

/**
 * Single response from Vision API (part of batch response)
 */
export interface VisionOCRResponse {
  textAnnotations?: VisionTextAnnotation[];
  fullTextAnnotation?: FullTextAnnotation;
  error?: VisionError;
}

/**
 * Complete Vision API response structure
 */
export interface VisionAPIResponse {
  responses: VisionOCRResponse[];
}

/**
 * Vision API request structure
 */
export interface VisionAPIRequest {
  requests: Array<{
    image: {
      content: string; // Base64 encoded image
    };
    features: Array<{
      type: string; // "TEXT_DETECTION" or "DOCUMENT_TEXT_DETECTION"
      maxResults?: number;
    }>;
    imageContext?: {
      languageHints?: string[]; // e.g., ["zh-TW", "zh-CN", "en"]
    };
  }>;
}

/**
 * Processed OCR result ready for analysis
 */
export interface OCRResult {
  fullText: string; // Complete extracted text
  detectedLanguages: string[]; // List of detected language codes
  confidence: "high" | "medium" | "low"; // Detection confidence level
  wordCount: number; // Number of words detected
  textAnnotations?: VisionTextAnnotation[]; // Raw annotations (optional, for debugging)
  error?: string; // Error message if OCR partially failed
}

/**
 * OCR method used for tracking/analytics
 */
export type OCRMethod = "google-vision" | "openai-vision" | "fallback";

/**
 * OCR performance metrics
 */
export interface OCRMetrics {
  method: OCRMethod;
  ocrTimeMs: number; // Time spent on OCR
  analysisTimeMs: number; // Time spent on ingredient analysis
  totalTimeMs: number; // Total processing time
  success: boolean;
  errorMessage?: string;
}
