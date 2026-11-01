import type { NegotiationMessage } from "@/model/entities/negotiationMessage";

export type ChatEventType =
  | "meeting_proposed"
  | "meeting_confirmed"
  | "meeting_rescheduled"
  | "delivery_confirmed";

export type ChatEventIcon = "calendar" | "checkCircle" | "info" | "swap" | "place";

export type ChatEvent = Readonly<{
  id: string;
  type: ChatEventType;
  description: string;
  timestamp: string;
  icon?: ChatEventIcon;
}>;

export type ChatTimelineItem =
  | { kind: "day"; key: string; label: string }
  | {
      kind: "message";
      key: string;
      message: NegotiationMessage;
      /** Segue uma mensagem da mesma pessoa no mesmo dia: a tela aproxima os balões (Spec 089). */
      grouped: boolean;
    }
  | {
      kind: "event";
      key: string;
      event: ChatEvent;
    };

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Horário do balão no padrão do Figma `06.02`: "8h40". */
export function formatBubbleTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getHours()}h${String(date.getMinutes()).padStart(2, "0")}`;
}

/** Separador de dia: "Hoje", "Ontem" ou "sáb, 24 out". */
export function formatDayLabel(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const days = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);
  if (days === 0) return "Hoje";
  if (days === 1) return "Ontem";
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

type TimelineRawItem =
  | { rawKind: "message"; timestamp: number; iso: string; data: NegotiationMessage }
  | { rawKind: "event"; timestamp: number; iso: string; data: ChatEvent };

/**
 * Intercala separadores de dia e marcos da negociação (Spec 082, Spec 113)
 * na linha do tempo do chat.
 */
export function buildChatTimeline(
  messages: readonly NegotiationMessage[],
  now: Date = new Date(),
  events: readonly ChatEvent[] = [],
): ChatTimelineItem[] {
  const rawItems: TimelineRawItem[] = [
    ...messages.map((m) => ({
      rawKind: "message" as const,
      timestamp: new Date(m.createdAt).getTime(),
      iso: m.createdAt,
      data: m,
    })),
    ...events.map((e) => ({
      rawKind: "event" as const,
      timestamp: new Date(e.timestamp).getTime(),
      iso: e.timestamp,
      data: e,
    })),
  ].sort((a, b) => a.timestamp - b.timestamp);

  const items: ChatTimelineItem[] = [];
  let lastDay: number | null = null;
  let lastSender: string | null = null;

  for (const item of rawItems) {
    const day = startOfDay(new Date(item.iso));
    const newDay = day !== lastDay;
    if (newDay) {
      items.push({ kind: "day", key: `dia-${day}`, label: formatDayLabel(item.iso, now) });
      lastDay = day;
      lastSender = null;
    }

    if (item.rawKind === "event") {
      items.push({
        kind: "event",
        key: `event-${item.data.id}`,
        event: item.data,
      });
      lastSender = null;
    } else {
      const message = item.data;
      items.push({
        kind: "message",
        key: message.id,
        message,
        grouped: !newDay && message.senderId === lastSender,
      });
      lastSender = message.senderId;
    }
  }

  return items;
}
