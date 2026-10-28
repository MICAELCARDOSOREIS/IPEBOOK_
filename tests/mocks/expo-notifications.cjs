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

const __mock = { lastResponse: null, listener: undefined, removed: 0 };

module.exports = {
  __mock,
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
  addNotificationResponseReceivedListener: (listener) => {
    __mock.listener = listener;
    return { remove: () => { __mock.removed += 1; } };
  },
  getLastNotificationResponseAsync: async () => __mock.lastResponse,
};
