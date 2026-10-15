import type { INotificationDataSource } from "@/model/datasources/iNotificationDataSource";
import type { AppNotification } from "@/model/entities/notification";

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-001",
    userId: "user-1",
    title: "Dica de Segurança em Piripiri",
    message: "Ao marcar entregas de livros, priorize locais públicos e movimentados como o IFPI ou a Praça da Bandeira.",
    type: "safety_tip",
    read: false,
    createdAt: "2026-10-15T10:00:00.000Z",
    actionUrl: "/ajuda",
  },
  {
    id: "notif-002",
    userId: "user-1",
    title: "Novo pedido para seu livro!",
    message: "Um leitor solicitou um exemplar do seu catálogo de doações.",
    type: "request_received",
    read: false,
    createdAt: "2026-10-14T14:30:00.000Z",
    actionUrl: "/pedidos-recebidos",
  },
  {
    id: "notif-003",
    userId: "user-1",
    title: "Pedido aceito!",
    message: "Sua solicitação de livro foi aceita. Veja as orientações de encontro.",
    type: "request_accepted",
    read: true,
    createdAt: "2026-10-13T09:15:00.000Z",
    actionUrl: "/meus-pedidos",
  },
];

export class MemoryNotificationDataSource implements INotificationDataSource {
  private notifications: AppNotification[];

  constructor(initial: AppNotification[] = INITIAL_NOTIFICATIONS) {
    this.notifications = [...initial];
  }

  async listByUser(userId: string): Promise<AppNotification[]> {
    return this.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async markAsRead(notificationId: string): Promise<void> {
    const item = this.notifications.find((n) => n.id === notificationId);
    if (item) {
      item.read = true;
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    for (const item of this.notifications) {
      if (item.userId === userId) {
        item.read = true;
      }
    }
  }

  async addNotification(notification: AppNotification): Promise<void> {
    this.notifications.unshift({ ...notification });
  }
}
