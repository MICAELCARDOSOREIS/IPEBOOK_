const SchedulableTriggerInputTypes = {
  TIME_INTERVAL: "timeInterval",
  CALENDAR: "calendar",
  DAILY: "daily",
  DATE: "date",
};

const AndroidImportance = {
  HIGH: 4,
  DEFAULT: 3,
  LOW: 2,
};

const AndroidNotificationPriority = {
  HIGH: "high",
  DEFAULT: "default",
  LOW: "low",
};

module.exports = {
  SchedulableTriggerInputTypes,
  AndroidImportance,
  AndroidNotificationPriority,
  setNotificationHandler: () => {},
  setNotificationChannelAsync: async () => {},
  scheduleNotificationAsync: async () => "mock-notification-id",
  cancelScheduledNotificationAsync: async () => {},
  getPermissionsAsync: async () => ({ status: "granted", granted: true }),
  requestPermissionsAsync: async () => ({ status: "granted", granted: true }),
  getExpoPushTokenAsync: async () => ({ data: "ExponentPushToken[mock-token]" }),
  addNotificationReceivedListener: () => ({ remove: () => {} }),
  addNotificationResponseReceivedListener: () => ({ remove: () => {} }),
};
