import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// 設置通知處理器
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * 請求通知權限
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#2CB67D",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
}

/**
 * 檢查通知權限狀態
 */
export async function checkNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}

/**
 * 立即發送通知（用於健康警報）
 */
export async function sendImmediateNotification(
  title: string,
  body: string,
  data?: any
): Promise<void> {
  const hasPermission = await checkNotificationPermissions();
  if (!hasPermission) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null, // 立即發送
  });
}

/**
 * 發送健康警報通知
 */
export async function sendHealthAlertNotification(
  alertType: "allergen" | "disease" | "health-goal",
  itemName: string
): Promise<void> {
  const titles = {
    allergen: "⚠️ Allergen Alert",
    disease: "⚠️ Health Risk Warning",
    "health-goal": "💡 Health Goal Reminder",
  };

  const bodies = {
    allergen: `Allergen detected: ${itemName}`,
    disease: `Unsuitable ingredient detected for you: ${itemName}`,
    "health-goal": `This product may not meet your health goal: ${itemName}`,
  };

  await sendImmediateNotification(titles[alertType], bodies[alertType], {
    type: alertType,
    item: itemName,
  });
}

/**
 * 設置每日提醒通知
 */
export async function scheduleDailyReminder(
  enabled: boolean,
  hour: number = 10, // 預設上午10點
  minute: number = 0
): Promise<void> {
  // 取消現有的每日提醒
  await Notifications.cancelScheduledNotificationAsync("daily-reminder");

  if (!enabled) return;

  const hasPermission = await checkNotificationPermissions();
  if (!hasPermission) return;

  // 設置每日重複通知
  await Notifications.scheduleNotificationAsync({
    identifier: "daily-reminder",
    content: {
      title: "🍎 Healthy Eating Reminder",
      body: "Remember to scan food labels today and track your healthy diet!",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

/**
 * 發送每週報告通知
 */
export async function sendWeeklyReport(stats: {
  totalScans: number;
  averageScore: number;
  healthyPercentage: number;
}): Promise<void> {
  const hasPermission = await checkNotificationPermissions();
  if (!hasPermission) return;

  await sendImmediateNotification(
    "📊 Weekly Health Report",
    `Scanned ${stats.totalScans} items this week, average score ${stats.averageScore}, ${stats.healthyPercentage}% healthy products`,
    { type: "weekly-report", stats }
  );
}

/**
 * 設置每週報告通知（每週日晚上8點）
 */
export async function scheduleWeeklyReport(enabled: boolean): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync("weekly-report");

  if (!enabled) return;

  const hasPermission = await checkNotificationPermissions();
  if (!hasPermission) return;

  // 設置每週日晚上8點的通知
  await Notifications.scheduleNotificationAsync({
    identifier: "weekly-report",
    content: {
      title: "📊 Weekly Health Report Ready",
      body: "Click to view your weekly healthy eating analysis",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      weekday: 1, // 1 = Sunday
      hour: 20,
      minute: 0,
      repeats: true,
    },
  });
}

/**
 * 發送成就解鎖通知
 */
export async function sendAchievementNotification(
  achievementTitle: string,
  achievementDescription: string
): Promise<void> {
  const hasPermission = await checkNotificationPermissions();
  if (!hasPermission) return;

  await sendImmediateNotification(
    `🏆 成就解鎖：${achievementTitle}`,
    achievementDescription,
    { type: "achievement" }
  );
}

/**
 * 取消所有通知
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * 獲取所有待處理的通知
 */
export async function getPendingNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  return await Notifications.getAllScheduledNotificationsAsync();
}
