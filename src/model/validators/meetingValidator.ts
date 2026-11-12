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
  if (isBusinessDaysOnlyPoint(proposal.pointName)) {
    const dow = scheduled.getDay();
    if (dow === 0 || dow === 6) {
      return "Este local funciona apenas em dias úteis (segunda a sexta-feira).";
    }
    if (scheduled.getHours() < 8 || scheduled.getHours() > 17) {
      return "Este local funciona das 8h às 17h.";
    }
  }
  return null;
}

/** Verifica se o ponto tem restrição de funcionamento apenas em dias úteis (IFPI e Museu). */
export function isBusinessDaysOnlyPoint(pointName: string | null): boolean {
  if (!pointName) return false;
  return pointName.includes("IFPI") || pointName.includes("Museu");
}

/** Verifica se o local está aberto no dia informado. */
export function isMeetingPointOpenOnDay(pointName: string | null, day: Date | null): boolean {
  if (!pointName || !day) return true;
  if (isBusinessDaysOnlyPoint(pointName)) {
    const dow = day.getDay();
    return dow >= 1 && dow <= 5;
  }
  return true;
}

/** Retorna os horários permitidos conforme o local e o dia. */
export function meetingTimeSlotsForPoint(pointName: string | null, day: Date | null): readonly number[] {
  if (pointName && isBusinessDaysOnlyPoint(pointName)) {
    if (day && !isMeetingPointOpenOnDay(pointName, day)) {
      return [];
    }
    return [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
  }
  return MEETING_TIME_SLOTS;
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
