import type { INotificationDataSource } from "@/model/datasources/iNotificationDataSource";
import type { AppNotification } from "@/model/entities/notification";
import { DataSourceError } from "@/model/errors";
import type { SupabaseAppClient } from "@/infra/supabaseClient";

type NotificationRow = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: AppNotification["type"];
  read: boolean;
  created_at: string;
  action_url: string | null;
};

function mapNotification(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    type: row.type,
    read: row.read,
    createdAt: row.created_at,
    ...(row.action_url ? { actionUrl: row.action_url } : {}),
  };
}

let channelSeq = 0;

export class SupabaseNotificationDataSource implements INotificationDataSource {
  constructor(private readonly client: SupabaseAppClient) {}

  async listByUser(userId: string): Promise<AppNotification[]> {
    const { data, error } = await this.client
      .from("v2_notifications")
      .select("id,user_id,title,message,type,read,created_at,action_url")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new DataSourceError("Não foi possível carregar as notificações.");
    }
    return (data as NotificationRow[]).map(mapNotification);
  }

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await this.client
      .from("v2_notifications")
      .update({ read: true })
      .eq("id", notificationId);

    if (error) {
      throw new DataSourceError("Não foi possível atualizar a notificação.");
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await this.client
      .from("v2_notifications")
      .update({ read: true })
      .eq("user_id", userId);

    if (error) {
      throw new DataSourceError("Não foi possível marcar as notificações como lidas.");
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await this.client
      .from("v2_notifications")
      .delete()
      .eq("id", notificationId);

    if (error) {
      throw new DataSourceError("Não foi possível excluir a notificação.");
    }
  }

  async clearAll(userId: string): Promise<void> {
    const { error } = await this.client
      .from("v2_notifications")
      .delete()
      .eq("user_id", userId);

    if (error) {
      throw new DataSourceError("Não foi possível limpar as notificações.");
    }
  }

  async clearRead(userId: string): Promise<void> {
    const { error } = await this.client
      .from("v2_notifications")
      .delete()
      .eq("user_id", userId)
      .eq("read", true);

    if (error) {
      throw new DataSourceError("Não foi possível limpar as notificações lidas.");
    }
  }

  subscribeToChanges(userId: string, onChange: () => void): () => void {
    const channel = this.client
      // Nome único por assinatura: reusar o mesmo tópico depois de `subscribe()` lança erro do Realtime
      // (Home, Conversas e a tela de notificações assinam ao mesmo tempo).
      .channel(`notifications:${userId}:${++channelSeq}`)
      .on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table: "v2_notifications", filter: `user_id=eq.${userId}` },
        () => onChange(),
      )
      .subscribe();

    return () => {
      this.client.removeChannel(channel);
    };
  }

  async addNotification(notification: AppNotification): Promise<void> {
    const { error } = await this.client.from("v2_notifications").insert({
      id: notification.id,
      user_id: notification.userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: notification.read,
      action_url: notification.actionUrl ?? null,
    });

    if (error) {
      throw new DataSourceError("Não foi possível criar a notificação.");
    }
  }
}
