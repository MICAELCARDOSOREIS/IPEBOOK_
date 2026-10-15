export type NotificationType =
  | "request_received"
  | "request_accepted"
  | "safety_tip"
  | "system";

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
