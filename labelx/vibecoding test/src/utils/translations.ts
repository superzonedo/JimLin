/**
 * English translations for the app
 * 應用程式英文翻譯
 */

export const en = {
  // Disease types
  diseases: {
    "kidney-disease": "Kidney Issues",
    "liver-disease": "Fatty Liver",
    "skin-disease": "Acne",
    "diabetes": "Blood Sugar Issues",
    "hypertension": "High Blood Pressure",
    "high-cholesterol": "High Cholesterol",
    "stomach-sensitivity": "Digestive Sensitivity",
    "metabolic-disease": "Metabolic Issues",
  },

  // Score levels
  scoreLabels: {
    excellent: "Health Recommended",
    good: "Moderate Consumption",
    warning: "Avoid if Possible",
  },

  // Risk levels
  riskLevels: {
    safe: "Safety Level: Good",
    moderate: "Safety Level: Moderate",
    high: "Safety Level: High Risk",
    unknown: "Safety Level: Unknown",
  },

  // Result screen sections
  resultScreen: {
    noResult: "No scan result",
    backToScan: "Back to Scan",
    sharePreview: "Share Preview",
    shareTo: "Share to...",
    continueScanning: "Continue Scanning",
    shareReport: "Share Report",
    personalizedHealthAnalysis: "Personalized Health Analysis",
    includeInHealthAnalysis: "Include in Health Analysis",
    includedInHealthAnalysis: "Included in Health Analysis",
  },

  // Ingredients analysis
  ingredients: {
    analysis: "Ingredient Analysis",
    safe: "Safe",
    moderate: "Moderate",
    warning: "Warning",
    safeIngredients: "Safe Ingredients",
    concerningIngredients: "Concerning Ingredients",
    additive: "Additive",
    moreItems: "and {count} more safe ingredient(s)",
  },

  // Health benefits
  health: {
    benefits: "Health Benefits",
    recommendation: "Health Recommendation",
  },

  // Nutrition analysis
  nutrition: {
    dataQuality: "Nutrition Data",
  },

  // Analysis recommendations
  recommendations: {
    safeForCondition: "Ingredients are safe for \"{condition}\", safe to consume.",
    safeAndHealthy: "Ingredients are natural and healthy, suitable for daily consumption.",
    moderateForCondition: "Contains {ingredient}, may slightly affect \"{condition}\", consume in moderation.",
    moderateWithProcessing: "Contains processed ingredients, mild impact on \"{condition}\", occasional consumption.",
    additiveCaution: "Contains {ingredient} and other additives, moderate consumption recommended.",
    processingCaution: "Contains processed ingredients, occasional consumption recommended.",
    highRiskForCondition: "Contains {ingredient}, high risk for \"{condition}\", avoid consumption.",
    unhealthyForCondition: "Ingredients unfriendly to \"{condition}\", avoid consumption.",
    highRiskAdditives: "Contains {ingredient} and other high-risk ingredients, not recommended.",
    highRiskGeneral: "Ingredients pose high risk, consider finding alternatives.",
  },

  // Error messages
  errors: {
    confirmFailed: "Confirmation Failed",
    confirmError: "Unable to confirm purchase, please try again later",
    shareFailed: "Share Failed",
    shareError: "Unable to share report, please try again later",
    generalError: "An error occurred, please try again later",
  },

  // Buttons and actions
  actions: {
    confirmPurchase: "Confirm Purchase",
    share: "Share",
  },

  // Safety labels
  labels: {
    acne: "Acne",
    fattyLiver: "Fatty Liver",
    metabolicIssues: "Metabolic Issues",
    kidneyIssues: "Kidney Issues",
    bloodSugarIssues: "Blood Sugar Issues",
    highBloodPressure: "High Blood Pressure",
    highCholesterol: "High Cholesterol",
    digestiveSensitivity: "Digestive Sensitivity",
  },

  // Product name default
  defaults: {
    foodAnalysisResult: "Food Analysis Result",
  },
};

export type TranslationKeys = typeof en;
