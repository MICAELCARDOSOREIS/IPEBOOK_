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
  request_rejected: "messages",
  request_cancelled: "messages",
  new_message: "messages",
  rating_received: "updates",
  favorite_update: "updates",
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
  /** Contagem exibida no ícone do app no iOS. Zero limpa o selo. */
  badge?: number;
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
export function buildPushMessage(notification: StoredNotification, token: string, unreadCount?: number): PushMessage {
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
  if (unreadCount !== undefined) message.badge = unreadCount;
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

/** Cabeçalho dedicado enviado pela trigger `v2_push_new_notification()` (Spec 143 / ADR 0119). */
export const PUSH_WEBHOOK_HEADER = "x-push-webhook-secret";

/** Resposta padronizada sem oráculo de existência, token ou preferências (Spec 143 / A2). */
export const PUSH_ACCEPTED_RESPONSE = { processado: true } as const;

/**
 * Comparação em tempo constante (UTF-8) para segredos de webhook, evitando vazamento por timing.
 */
export function constantTimeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  if (aBytes.length === 0 || bBytes.length === 0) return false;
  const maxLen = Math.max(aBytes.length, bBytes.length);
  let diff = aBytes.length ^ bBytes.length;
  for (let i = 0; i < maxLen; i += 1) {
    diff |= aBytes[i % aBytes.length] ^ bBytes[i % bBytes.length];
  }
  return diff === 0;
}

/** Valida o cabeçalho de segredo contra `PUSH_WEBHOOK_SECRET` em tempo constante. */
export function isAuthorizedWebhookSecret(
  provided: string | null | undefined,
  expected: string | null | undefined,
): boolean {
  if (typeof expected !== "string" || expected.trim().length === 0) return false;
  if (typeof provided !== "string" || provided.length === 0) return false;
  return constantTimeEqual(provided, expected);
}

/** Pega o `id` do corpo da chamada, sem confiar em nada além de um texto não vazio. */
export function parseRequestId(body: unknown): string | null {
  if (typeof body !== "object" || body === null) return null;
  const id = (body as { id?: unknown }).id;
  return typeof id === "string" && id.trim().length > 0 && id.length <= 64 ? id.trim() : null;
}
