// Lógica pura da função `enviar-push` (Spec 096 / ADR 0071): sem Deno, banco nem rede, para testar no Vitest.

export type StoredNotification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  action_url: string | null;
};

export type PushMessage = {
  to: string;
  title: string;
  body: string;
  sound: "default";
  channelId: "default";
  priority: "high";
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

/** Texto do aviso que o celular mostra, mais a rota que o toque abre (CA5). */
export function buildPushMessage(notification: StoredNotification, token: string): PushMessage {
  return {
    to: token,
    title: notification.title,
    body: notification.message,
    sound: "default",
    channelId: "default",
    priority: "high",
    data: { url: notification.action_url, type: notification.type, notificationId: notification.id },
  };
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
