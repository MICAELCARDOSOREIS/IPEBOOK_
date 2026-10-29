import type { AppNotification } from "@/model/entities/notification";

export interface INotificationDataSource {
  listByUser(userId: string): Promise<AppNotification[]>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  addNotification(notification: AppNotification): Promise<void>;
}
