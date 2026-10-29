import type { INotificationDataSource } from "@/model/datasources/iNotificationDataSource";
import type { AppNotification } from "@/model/entities/notification";
import { AuthError, ValidationError } from "@/model/errors";
import type { INotificationUseCases } from "@/usecase/iNotificationUseCases";

export class NotificationUseCases implements INotificationUseCases {
  constructor(private readonly dataSource: INotificationDataSource) {}

  async listNotifications(sessionUserId: string | null): Promise<AppNotification[]> {
    if (!sessionUserId) {
      throw new AuthError("É necessário estar autenticado para acessar as notificações.");
    }
    return this.dataSource.listByUser(sessionUserId);
  }

  async markAsRead(sessionUserId: string | null, notificationId: string): Promise<void> {
    if (!sessionUserId) {
      throw new AuthError("É necessário estar autenticado para atualizar notificações.");
    }
    if (!notificationId.trim()) {
      throw new ValidationError("Identificador da notificação é obrigatório.");
    }
    await this.dataSource.markAsRead(notificationId);
  }

  async markAllAsRead(sessionUserId: string | null): Promise<void> {
    if (!sessionUserId) {
      throw new AuthError("É necessário estar autenticado para atualizar notificações.");
    }
    await this.dataSource.markAllAsRead(sessionUserId);
  }
}
