export type NotificationType =
  | "request_received"
  | "request_accepted"
  | "safety_tip"
  | "system"
  | "search_alert_match"
  | "meeting_update";

/**
 * Categorias de entrega (Spec 099 / ADR 0075): cada tipo cai num canal com comportamento próprio
 * (importância, som e vibração) no Android, como em qualquer app profissional. O app e a Edge
 * Function `enviar-push` precisam concordar com estes identificadores; o servidor mantém a mesma
 * tabela em `supabase/functions/enviar-push/logic.ts`.
 */
export type NotificationChannel = "messages" | "reminders" | "updates";

export const NOTIFICATION_CHANNEL: Record<NotificationType, NotificationChannel> = {
  request_received: "messages",
  request_accepted: "messages",
  meeting_update: "reminders",
  search_alert_match: "updates",
  safety_tip: "updates",
  system: "updates",
};

/** Tipos conhecidos, na ordem exibida nas preferências de notificação. */
export const NOTIFICATION_TYPES = Object.keys(NOTIFICATION_CHANNEL) as NotificationType[];

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
