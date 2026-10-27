import type { NegotiationMessage } from "@/model/entities/negotiationMessage";

export type ChatTimelineItem =
  | { kind: "day"; key: string; label: string }
  | {
      kind: "message";
      key: string;
      message: NegotiationMessage;
      /** Segue uma mensagem da mesma pessoa no mesmo dia: a tela aproxima os balões (Spec 089). */
      grouped: boolean;
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

/** Intercala um separador de dia antes da primeira mensagem de cada dia (Spec 082). */
export function buildChatTimeline(messages: readonly NegotiationMessage[], now: Date = new Date()): ChatTimelineItem[] {
  const items: ChatTimelineItem[] = [];
  let lastDay: number | null = null;
  let lastSender: string | null = null;
  for (const message of messages) {
    const day = startOfDay(new Date(message.createdAt));
    const newDay = day !== lastDay;
    if (newDay) {
      items.push({ kind: "day", key: `dia-${day}`, label: formatDayLabel(message.createdAt, now) });
      lastDay = day;
    }
    items.push({ kind: "message", key: message.id, message, grouped: !newDay && message.senderId === lastSender });
    lastSender = message.senderId;
  }
  return items;
}
