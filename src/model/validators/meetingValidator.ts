import { MEETING_MAX_DAYS_AHEAD, MEETING_TIME_SLOTS, type MeetingProposal } from "@/model/entities/meeting";
import { PIRIPIRI_MEETING_POINTS } from "@/model/entities/meetingPoint";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/**
 * Recusa local fora dos pontos seguros, dia fora da janela de amanhã a sete dias e horário fora das
 * faixas de `06.04` (Spec 052, RN-02 e RN-03). Retorna a mensagem do primeiro problema ou `null`.
 */
export function validateMeetingProposal(proposal: MeetingProposal, now: Date = new Date()): string | null {
  if (!PIRIPIRI_MEETING_POINTS.some((point) => point.name === proposal.pointName)) {
    return "Escolha um dos pontos de encontro sugeridos.";
  }
  const scheduled = new Date(proposal.scheduledAt);
  if (Number.isNaN(scheduled.getTime())) {
    return "Escolha o dia e o horário do encontro.";
  }
  const daysAhead = Math.round((startOfDay(scheduled) - startOfDay(now)) / DAY_IN_MS);
  if (daysAhead < 1 || daysAhead > MEETING_MAX_DAYS_AHEAD) {
    return `Escolha um dia entre amanhã e os próximos ${MEETING_MAX_DAYS_AHEAD} dias.`;
  }
  if (!MEETING_TIME_SLOTS.includes(scheduled.getHours()) || scheduled.getMinutes() !== 0) {
    return "Escolha um dos horários sugeridos.";
  }
  return null;
}

/** Próximos dias oferecidos como chips em `06.04`: de amanhã até `MEETING_MAX_DAYS_AHEAD`. */
export function meetingDayOptions(now: Date = new Date()): readonly Date[] {
  return Array.from({ length: MEETING_MAX_DAYS_AHEAD }, (_, index) =>
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + index + 1),
  );
}

/** Data e hora do encontro, no fuso do aparelho, a partir do dia e da faixa escolhidos. */
export function meetingScheduledAt(day: Date, hour: number): string {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour).toISOString();
}
