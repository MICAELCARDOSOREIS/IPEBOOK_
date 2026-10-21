import type { AppNotification } from "@/model/entities/notification";

export type NotificationPeriod = "today" | "week" | "earlier";

export type NotificationSection = {
  readonly period: NotificationPeriod;
  readonly title: string;
  readonly data: readonly AppNotification[];
};

const PERIOD_TITLES: Record<NotificationPeriod, string> = {
  today: "Hoje",
  week: "Esta semana",
  earlier: "Antes",
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Período da notificação conforme o agrupamento do Figma `07.04` (Hoje, Esta semana, Antes). */
export function periodOf(createdAt: string, now: Date = new Date()): NotificationPeriod {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return "earlier";

  const todayStart = startOfDay(now);
  const createdStart = startOfDay(created);
  if (createdStart >= todayStart) return "today";
  if (createdStart > todayStart - 7 * DAY_IN_MS) return "week";
  return "earlier";
}

/**
 * Agrupa as notificações por período, preservando a ordem recebida dentro de cada grupo
 * e omitindo seções vazias — como as faixas "Hoje" e "Esta semana" do Figma `07.04`.
 */
export function groupNotificationsByPeriod(
  notifications: readonly AppNotification[],
  now: Date = new Date(),
): readonly NotificationSection[] {
  const buckets: Record<NotificationPeriod, AppNotification[]> = {
    today: [],
    week: [],
    earlier: [],
  };

  for (const notification of notifications) {
    buckets[periodOf(notification.createdAt, now)].push(notification);
  }

  const order: readonly NotificationPeriod[] = ["today", "week", "earlier"];
  return order
    .filter((period) => buckets[period].length > 0)
    .map((period) => ({ period, title: PERIOD_TITLES[period], data: buckets[period] }));
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

/**
 * Horário curto ao lado da notificação, como no Figma `07.04` ("· 10h", "· Seg"):
 * hora cheia no mesmo dia, dia da semana na mesma semana e data curta antes disso.
 */
export function notificationTimeLabel(createdAt: string, now: Date = new Date()): string | null {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return null;
  const period = periodOf(createdAt, now);
  if (period === "today") return `${created.getHours()}h`;
  if (period === "week") return WEEKDAYS[created.getDay()];
  const day = String(created.getDate()).padStart(2, "0");
  const month = String(created.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}
