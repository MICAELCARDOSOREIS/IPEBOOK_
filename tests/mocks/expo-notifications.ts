export const SchedulableTriggerInputTypes = {
  TIME_INTERVAL: "timeInterval",
  CALENDAR: "calendar",
  DAILY: "daily",
  DATE: "date",
} as const;

export const AndroidImportance = {
  HIGH: 4,
  DEFAULT: 3,
  LOW: 2,
} as const;

export const AndroidNotificationPriority = {
  HIGH: "high",
  DEFAULT: "default",
  LOW: "low",
} as const;

export const setNotificationHandler = () => {};
export const setNotificationChannelAsync = async () => {};
export const scheduleNotificationAsync = async () => "mock-notification-id";
export const cancelScheduledNotificationAsync = async () => {};
export const getPermissionsAsync = async () => ({ status: "granted", granted: true });
export const requestPermissionsAsync = async () => ({ status: "granted", granted: true });
export const getExpoPushTokenAsync = async () => ({ data: "ExponentPushToken[mock-token]" });
export const addNotificationReceivedListener = () => ({ remove: () => {} });
export const addNotificationResponseReceivedListener = () => ({ remove: () => {} });
