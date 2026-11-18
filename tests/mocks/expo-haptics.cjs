const impactAsync = jest.fn().mockResolvedValue(undefined);
const notificationAsync = jest.fn().mockResolvedValue(undefined);
const selectionAsync = jest.fn().mockResolvedValue(undefined);

module.exports = {
  ImpactFeedbackStyle: {
    Light: "light",
    Medium: "medium",
    Heavy: "heavy",
  },
  NotificationFeedbackType: {
    Success: "success",
    Warning: "warning",
    Error: "error",
  },
  impactAsync,
  notificationAsync,
  selectionAsync,
};
