import type { AppNotification } from "@/model/entities/notification";

export interface INotificationDataSource {
  listByUser(userId: string): Promise<AppNotification[]>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  addNotification(notification: AppNotification): Promise<void>;
  /** Avisa em tempo real quando as notificações da pessoa mudam; retorna o cancelamento (Spec 086). */
  subscribeToChanges?(userId: string, onChange: () => void): () => void;
}
