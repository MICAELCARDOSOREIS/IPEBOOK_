/** Situação do encontro combinado numa negociação aceita (Spec 052, Figma `06.04`–`06.14`). */
export type MeetingStatus = "proposed" | "confirmed" | "cancelled";

export type Meeting = Readonly<{
  id: string;
  requestId: string;
  /** Nome de um dos `PIRIPIRI_MEETING_POINTS`. */
  pointName: string;
  /** Data e hora do encontro em ISO 8601. */
  scheduledAt: string;
  /** Quem enviou o convite atual (ou o último reagendamento). */
  proposedBy: string;
  status: MeetingStatus;
}>;

/** Local, dia e horário escolhidos no convite ou no reagendamento. */
export type MeetingProposal = Readonly<{
  pointName: string;
  scheduledAt: string;
}>;

/** Horários cheios oferecidos como chips em `06.04`, das 7h às 18h (RN-03). */
export const MEETING_TIME_SLOTS: readonly number[] = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

/** O convite vale de amanhã até sete dias à frente (RN-03). */
export const MEETING_MAX_DAYS_AHEAD = 7;
