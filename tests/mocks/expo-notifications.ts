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
export const setNotificationChannelAsync = async (channelId: string, channel: unknown) => {
  __mock.channels.push({ channelId, channel });
};
export const scheduleNotificationAsync = async () => "mock-notification-id";
export const cancelScheduledNotificationAsync = async () => {};
export const setBadgeCountAsync = async (count: number) => {
  __mock.lastBadge = count;
  return true;
};
export const getPermissionsAsync = async () => ({ status: "granted", granted: true });
export const requestPermissionsAsync = async () => ({ status: "granted", granted: true });
export const getExpoPushTokenAsync = async () => ({ data: "ExponentPushToken[mock-token]" });
export const addNotificationReceivedListener = () => ({ remove: () => {} });
// O teste escolhe a resposta do último toque e dispara a escuta, como o sistema faria.
export const __mock = {
  lastResponse: null as unknown,
  listener: undefined as undefined | ((response: unknown) => void),
  removed: 0,
  lastBadge: undefined as number | undefined,
  channels: [] as Array<{ channelId: string; channel: unknown }>,
};
export const addNotificationResponseReceivedListener = (listener: (response: unknown) => void) => {
  __mock.listener = listener;
  return { remove: () => { __mock.removed += 1; } };
};
export const getLastNotificationResponseAsync = async () => __mock.lastResponse;
