import * as Application from 'expo-application';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

export interface UpdateInfo {
  hasUpdate: boolean;
  latestVersion: string;
  currentVersion: string;
  updateUrl?: string;
  releaseNotes?: string;
  isForceUpdate?: boolean;
}

/**
 * Compare two semantic version strings
 * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;

    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }

  return 0;
}

/**
 * Check for app updates from a remote server
 * In production, replace this with your actual API endpoint
 */
export async function checkForUpdates(): Promise<UpdateInfo> {
  try {
    const currentVersion = Application.nativeApplicationVersion || '1.0.0';

    // Simulate API call to check for updates
    // In production, replace this with actual API endpoint
    const response = await simulateUpdateCheck();

    const hasUpdate = compareVersions(response.latestVersion, currentVersion) > 0;

    return {
      hasUpdate,
      latestVersion: response.latestVersion,
      currentVersion,
      updateUrl: response.updateUrl,
      releaseNotes: response.releaseNotes,
      isForceUpdate: response.isForceUpdate,
    };
  } catch (error) {
    console.error('Failed to check for updates:', error);
    throw new Error('無法檢查更新，請稍後再試');
  }
}

/**
 * Simulate update check (replace with actual API in production)
 * This returns mock data for demonstration
 */
async function simulateUpdateCheck(): Promise<{
  latestVersion: string;
  updateUrl: string;
  releaseNotes: string;
  isForceUpdate: boolean;
}> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock response - in production, fetch from your server
  // Example: const response = await fetch('https://api.yourdomain.com/app/version');
  
  return {
    latestVersion: '1.0.0', // Change to '1.0.1' or '1.1.0' to simulate update available
    updateUrl: Platform.select({
      ios: 'https://apps.apple.com/app/labelx/id123456789',
      android: 'https://play.google.com/store/apps/details?id=com.labelx.app',
      default: 'https://labelx.app/download',
    }),
    releaseNotes: `
🎉 新功能
• 新增食品添加劑風險評分系統
• 掃描動畫優化，體驗更流暢
• 成分詳情頁面，深度了解每種添加劑

🐛 錯誤修復
• 修復相機在某些設備上的閃退問題
• 優化分享卡片的生成速度
• 改善暗色模式下的顯示效果

⚡ 性能提升
• 減少 30% 的應用體積
• 提升掃描速度
• 優化內存使用
    `.trim(),
    isForceUpdate: false, // Set to true to force users to update
  };
}

/**
 * Open app store for update
 */
export async function openUpdateLink(updateUrl: string): Promise<void> {
  try {
    const supported = await Linking.canOpenURL(updateUrl);
    if (supported) {
      await Linking.openURL(updateUrl);
    } else {
      throw new Error('無法打開更新鏈接');
    }
  } catch (error) {
    console.error('Failed to open update link:', error);
    throw error;
  }
}

/**
 * Get current app version
 */
export function getCurrentVersion(): string {
  return Application.nativeApplicationVersion || '1.0.0';
}

/**
 * Get build number
 */
export function getBuildNumber(): string {
  return Application.nativeBuildVersion || '1';
}
