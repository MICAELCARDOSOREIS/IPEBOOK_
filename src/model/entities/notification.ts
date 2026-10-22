export type NotificationType =
  | "request_received"
  | "request_accepted"
  | "safety_tip"
  | "system"
  | "search_alert_match"
  | "meeting_update";

export type AppNotification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
};
