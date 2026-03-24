import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

const isExpoGo = Constants.appOwnership === "expo";

Notifications.setNotificationHandler({
 handleNotification: async () => ({
  shouldShowAlert: true,
  shouldPlaySound: false,
  shouldSetBadge: false,
  shouldShowBanner: true,
  shouldShowList: true,
 }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
 try {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
 } catch {
  return false;
 }
}

export async function scheduleBookmarkNotification(count: number) {
 try {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  await Notifications.scheduleNotificationAsync({
   content: {
    title: "Nice collection! 📚",
    body: `You've bookmarked ${count} courses. Ready to start learning?`,
   },
   trigger: null,
  });
 } catch {}
}

export async function scheduleReminderNotification() {
 try {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  await Notifications.scheduleNotificationAsync({
   content: {
    title: "Miss you! 👋",
    body: "Come back and continue your learning journey.",
   },
   trigger: {
    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    seconds: 60 * 60 * 24,
    // seconds: 5,
    repeats: false,
   },
  });

  await AsyncStorage.setItem("reminderScheduled", "true");
 } catch {}
}

export async function cancelAllNotifications() {
 try {
  await Notifications.cancelAllScheduledNotificationsAsync();
 } catch {}
}

export async function handleAppOpenNotification() {
 try {
  const lastLogin = await AsyncStorage.getItem("lastLogin");
  if (!lastLogin) return;

  const diff = Date.now() - new Date(lastLogin).getTime();
  const hoursAgo = diff / (1000 * 60 * 60);

  await cancelAllNotifications();
  if (hoursAgo < 23) {
   await scheduleReminderNotification();
  }
  await AsyncStorage.setItem("lastLogin", new Date().toISOString());
 } catch {}
}
