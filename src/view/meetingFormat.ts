const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;
const WEEKDAY_NAMES = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"] as const;

function dayMonth(date: Date): string {
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** Dia curto dos chips de `06.04`: "Sáb, 24/10". */
export function formatMeetingDay(date: Date): string {
  return `${WEEKDAYS[date.getDay()]}, ${dayMonth(date)}`;
}

/** Dia por extenso para leitores de tela: "sábado, 24/10". */
export function spokenMeetingDay(date: Date): string {
  return `${WEEKDAY_NAMES[date.getDay()]}, ${dayMonth(date)}`;
}

/** Resumo de `06.05`: "Sáb, 24/10 · 15h". */
export function formatMeetingWhen(scheduledAt: string): string {
  const date = new Date(scheduledAt);
  return `${formatMeetingDay(date)} · ${date.getHours()}h`;
}
