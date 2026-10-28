// Lógica pura da função `enviar-push` (Spec 096 / ADR 0071, categorias por ADR 0075): sem Deno, banco
// nem rede, para testar no Vitest. O mapa de canais espelha `NOTIFICATION_CHANNEL` de
// `src/model/entities/notification.ts` — os dois precisam concordar com os identificadores.

export type StoredNotification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  action_url: string | null;
};

export type NotificationChannel = "messages" | "reminders" | "updates";

/** Cada tipo de aviso cai num canal com comportamento próprio no aparelho (ADR 0075). */
export const NOTIFICATION_CHANNEL: Record<string, NotificationChannel> = {
  request_received: "messages",
  request_accepted: "messages",
  meeting_update: "reminders",
  search_alert_match: "updates",
  safety_tip: "updates",
  system: "updates",
};

export type PushMessage = {
  to: string;
  title: string;
  body: string;
  sound: "default";
  channelId: NotificationChannel;
  priority: "high" | "default";
  /** Agrupa avisos da mesma negociação/encontro: no Android substitui o anterior já exibido. */
  collapseId?: string;
  tag?: string;
  /** iOS empilha na mesma conversa os avisos com o mesmo `threadId`. */
  threadId?: string;
  data: { url: string | null; type: string; notificationId: string };
};

export type PushTicket = {
  status?: "ok" | "error";
  message?: string;
  details?: { error?: string };
};

const EXPO_TOKEN = /^Expo(nent)?PushToken\[[^\]\s]+\]$/;

/** Só aceita tokens no formato do Expo, para não enviar lixo ao serviço. */
export function isExpoPushToken(value: unknown): value is string {
  return typeof value === "string" && EXPO_TOKEN.test(value);
}

export function channelOf(type: string): NotificationChannel {
  return NOTIFICATION_CHANNEL[type] ?? "updates";
}

/** Conversas e lembretes acordam o usuário (alta prioridade); novidades e avisos do sistema não. */
export function priorityOf(type: string): "high" | "default" {
  return channelOf(type) === "updates" ? "default" : "high";
}

/** O tipo está desativado nas preferências da pessoa (Spec 099)? Ausente/inválido = recebe. */
export function isTypeMuted(type: string, mutedTypes: unknown): boolean {
  return Array.isArray(mutedTypes) && mutedTypes.includes(type);
}

/**
 * Texto do aviso que o celular mostra, mais a rota que o toque abre (CA5). Avisos da mesma
 * negociação partilham `collapseId`/`tag`/`threadId` (a rota), então o novo substitui o anterior
 * em vez de empilhar uma notificação por mensagem, como fazem os apps profissionais.
 */
export function buildPushMessage(notification: StoredNotification, token: string): PushMessage {
  const channel = channelOf(notification.type);
  const group = notification.action_url ?? undefined;
  const message: PushMessage = {
    to: token,
    title: notification.title,
    body: notification.message,
    sound: "default",
    channelId: channel,
    priority: priorityOf(notification.type),
    data: { url: notification.action_url, type: notification.type, notificationId: notification.id },
  };
  if (group) {
    message.collapseId = group;
    message.tag = group;
    message.threadId = group;
  }
  return message;
}

/** O Expo diz que o aparelho não existe mais: o token deve ser apagado (CA6). */
export function isInvalidTokenTicket(ticket: PushTicket | undefined): boolean {
  return ticket?.status === "error" && ticket.details?.error === "DeviceNotRegistered";
}

/** Pega o `id` do corpo da chamada, sem confiar em nada além de um texto não vazio. */
export function parseRequestId(body: unknown): string | null {
  if (typeof body !== "object" || body === null) return null;
  const id = (body as { id?: unknown }).id;
  return typeof id === "string" && id.trim().length > 0 && id.length <= 64 ? id.trim() : null;
}
