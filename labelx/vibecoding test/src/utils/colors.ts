/**
 * 應用主題顏色配置
 * 統一管理所有顏色常量
 */

export const Colors = {
  // 主要背景色
  background: {
    main: "#F1EFE7",      // 主背景色（米白色）
    card: "#FFFFFF",       // 卡片背景
    overlay: "#F3F4F6",    // 疊加層背景
  },

  // 主題色
  primary: {
    main: "#2CB67D",       // 主綠色
    dark: "#249C6A",       // 深綠色
    light: "#7FD3AE",      // 淺綠色
  },

  // 文字顏色
  text: {
    primary: "#001858",    // 主要文字（深藍）
    secondary: "#6B7280",  // 次要文字（灰色）
    light: "#9CA3AF",      // 淺色文字
    white: "#FFFFFF",      // 白色文字
  },

  // 狀態顏色
  status: {
    success: "#10B981",    // 成功（綠色）
    warning: "#F59E0B",    // 警告（黃色）
    error: "#EF4444",      // 錯誤（紅色）
    info: "#3B82F6",       // 資訊（藍色）
  },

  // 健康分數顏色
  score: {
    high: "#10B981",       // 高分（綠色）71+
    medium: "#F59E0B",     // 中等（黃色）31-70
    low: "#EF4444",        // 低分（紅色）0-30
  },

  // 功能顏色
  functional: {
    allergen: "#EF4444",   // 過敏原（紅色）
    disease: "#EF4444",    // 疾病（紅色）
    healthGoal: "#2CB67D", // 健康目標（綠色）
    notification: "#F59E0B", // 通知（黃色）
    achievement: "#F59E0B",  // 成就（金色）
    premium: "#F59E0B",      // 高級功能（金色）
  },

  // 邊框和分隔線
  border: {
    light: "#E5E7EB",      // 淺色邊框
    medium: "#D1D5DB",     // 中等邊框
    dark: "#9CA3AF",       // 深色邊框
  },

  // 陰影
  shadow: {
    light: "rgba(0, 0, 0, 0.05)",
    medium: "rgba(0, 0, 0, 0.1)",
    dark: "rgba(0, 0, 0, 0.2)",
  },
} as const;

// 導出類型
export type ColorTheme = typeof Colors;
