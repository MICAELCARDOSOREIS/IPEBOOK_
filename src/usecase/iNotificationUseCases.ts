import type { AppNotification } from "@/model/entities/notification";

export interface INotificationUseCases {
  listNotifications(sessionUserId: string | null): Promise<AppNotification[]>;
  markAsRead(sessionUserId: string | null, notificationId: string): Promise<void>;
  markAllAsRead(sessionUserId: string | null): Promise<void>;
  /** Assina mudanças em tempo real das notificações; retorna o cancelamento (Spec 086). */
  subscribe?(sessionUserId: string, onChange: () => void): () => void;
}
