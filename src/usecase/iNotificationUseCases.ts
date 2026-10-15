import type { AppNotification } from "@/model/entities/notification";

export interface INotificationUseCases {
  listNotifications(sessionUserId: string | null): Promise<AppNotification[]>;
  markAsRead(sessionUserId: string | null, notificationId: string): Promise<void>;
  markAllAsRead(sessionUserId: string | null): Promise<void>;
}
