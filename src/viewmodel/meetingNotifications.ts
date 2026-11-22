import type { Meeting } from "@/model/entities/meeting";
import type { AppNotification } from "@/model/entities/notification";
import type { NotificationFilter } from "@/viewmodel/useNotificationsViewModel";

type NotificationRow = {
  item: AppNotification;
  requestId?: string;
  history?: readonly AppNotification[];
  historical?: boolean;
};

export function meetingNotificationRequestId(item: AppNotification): string | undefined {
  if (item.type !== "meeting_update") return undefined;
  return /^\/?negociacao\/([\w-]+)(?:\/encontro)?\/?$/.exec(item.actionUrl?.trim() ?? "")?.[1];
}

export function notificationRows(
  notifications: readonly AppNotification[],
  filter: NotificationFilter,
): readonly NotificationRow[] {
  const rows: NotificationRow[] = [];
  const meetingRows = new Map<string, { item: AppNotification; requestId: string; history: AppNotification[] }>();
  for (const item of [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
    const requestId = meetingNotificationRequestId(item);
    if (!requestId) {
      if (filter === "all" || !item.read) rows.push({ item });
      continue;
    }
    const latest = meetingRows.get(requestId);
    if (latest) {
      if (filter === "all" || !item.read) latest.history.push(item);
    } else {
      const row = { item, requestId, history: [] };
      meetingRows.set(requestId, row);
      rows.push(row);
    }
  }
  return rows.filter(({ item, history }) => filter === "all" || !item.read || Boolean(history?.length));
}

const notificationDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
});

export function notificationDateSections(
  rows: readonly NotificationRow[],
  expanded: ReadonlySet<string>,
  now = new Date(),
) {
  const sections = new Map<string, { key: string; title: string; data: NotificationRow[] }>();
  for (const row of rows) {
    const date = new Date(row.item.createdAt);
    const valid = Number.isFinite(date.getTime());
    const key = valid ? date.toDateString() : "sem-data";
    const title = !valid ? "Sem data" : key === now.toDateString() ? "Hoje"
      : date.getFullYear() === now.getFullYear() ? notificationDateFormatter.format(date)
      : `${notificationDateFormatter.format(date)} de ${date.getFullYear()}`;
    let section = sections.get(key);
    if (!section) {
      section = { key, title, data: [] };
      sections.set(key, section);
    }
    section.data.push(row);
    if (row.requestId && row.history && expanded.has(row.requestId)) {
      for (const item of row.history) section.data.push({ item, requestId: row.requestId, historical: true });
    }
  }
  return [...sections.values()];
}

export function meetingNotificationDisplay(
  meeting: Meeting | undefined,
  sessionUserId: string | null,
  now = Date.now(),
): { title: string; action: string } | undefined {
  if (!meeting) return undefined;
  if (meeting.status === "confirmed") return { title: "Encontro confirmado", action: "Ver encontro" };
  if (meeting.status === "cancelled") return { title: "Encontro cancelado", action: "Ver conversa" };
  if (Date.parse(meeting.scheduledAt) <= now) return { title: "Horário expirado", action: "Ver proposta expirada" };
  if (meeting.proposedBy === sessionUserId) return { title: "Aguardando confirmação", action: "Ver proposta" };
  return { title: "Proposta de encontro", action: "Revisar proposta" };
}
