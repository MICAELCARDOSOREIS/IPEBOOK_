import { describe, expect, it } from "vitest";
import {
  isBusinessDaysOnlyPoint,
  isMeetingPointOpenOnDay,
  meetingDayOptions,
  meetingScheduledAt,
  meetingTimeSlotsForPoint,
  validateMeetingProposal,
} from "@/model/validators/meetingValidator";

// Datas no fuso local do processo, para o resultado não mudar entre a máquina e a CI.
const AGORA = new Date(2026, 9, 22, 14, 0, 0);
const PRACA = "Praça da Bandeira (Centro)";
const MUSEU = "Museu de Piripiri";
const IFPI = "Campus IFPI Piripiri (Recepção ou Biblioteca)";

function em(dias: number, hora: number, minuto = 0): string {
  return new Date(2026, 9, 22 + dias, hora, minuto).toISOString();
}

describe("validateMeetingProposal (Spec 052, RN-02 e RN-03)", () => {
  it("aceita ponto sugerido, de amanhã a sete dias, nas faixas de horário", () => {
    expect(validateMeetingProposal({ pointName: PRACA, scheduledAt: em(1, 9) }, AGORA)).toBeNull();
    expect(validateMeetingProposal({ pointName: PRACA, scheduledAt: em(7, 17) }, AGORA)).toBeNull();
  });

  it("recusa local fora da lista de pontos seguros", () => {
    expect(validateMeetingProposal({ pointName: "Minha casa", scheduledAt: em(1, 10) }, AGORA)).toMatch(/pontos de encontro/);
  });

  it("recusa hoje, o passado e mais de sete dias à frente", () => {
    expect(validateMeetingProposal({ pointName: PRACA, scheduledAt: em(0, 17) }, AGORA)).toMatch(/entre amanhã/);
    expect(validateMeetingProposal({ pointName: PRACA, scheduledAt: em(-1, 10) }, AGORA)).toMatch(/entre amanhã/);
    expect(validateMeetingProposal({ pointName: PRACA, scheduledAt: em(8, 10) }, AGORA)).toMatch(/entre amanhã/);
  });

  it("recusa horário fora das faixas, minutos quebrados e data inválida", () => {
    expect(validateMeetingProposal({ pointName: PRACA, scheduledAt: em(1, 22) }, AGORA)).toMatch(/horários sugeridos/);
    expect(validateMeetingProposal({ pointName: PRACA, scheduledAt: em(1, 10, 30) }, AGORA)).toMatch(/horários sugeridos/);
    expect(validateMeetingProposal({ pointName: PRACA, scheduledAt: "ontem" }, AGORA)).toMatch(/dia e o horário/);
  });

  it("regras de expediente para IFPI e Museu de Piripiri (Spec 114)", () => {
    // 2026-10-23 (sexta-feira, dia 1) das 8h às 17h -> válido
    expect(validateMeetingProposal({ pointName: MUSEU, scheduledAt: em(1, 10) }, AGORA)).toBeNull();
    expect(validateMeetingProposal({ pointName: IFPI, scheduledAt: em(1, 16) }, AGORA)).toBeNull();

    // 2026-10-24 (sábado, dia 2) -> fechado
    expect(validateMeetingProposal({ pointName: MUSEU, scheduledAt: em(2, 10) }, AGORA)).toMatch(/dias úteis/);
    expect(validateMeetingProposal({ pointName: IFPI, scheduledAt: em(2, 10) }, AGORA)).toMatch(/dias úteis/);

    // 2026-10-25 (domingo, dia 3) -> fechado
    expect(validateMeetingProposal({ pointName: MUSEU, scheduledAt: em(3, 10) }, AGORA)).toMatch(/dias úteis/);

    // Horários fora das 8h às 17h em dia útil
    expect(validateMeetingProposal({ pointName: MUSEU, scheduledAt: em(1, 7) }, AGORA)).toMatch(/das 8h às 17h/);
    expect(validateMeetingProposal({ pointName: IFPI, scheduledAt: em(1, 18) }, AGORA)).toMatch(/das 8h às 17h/);
  });
});

describe("opções de dia e horário de 06.04", () => {
  it("oferece os sete dias a partir de amanhã", () => {
    const dias = meetingDayOptions(AGORA);
    expect(dias).toHaveLength(7);
    expect(dias[0].getDate()).toBe(23);
    expect(dias[6].getDate()).toBe(29);
  });

  it("monta a data no fuso do aparelho com a faixa escolhida", () => {
    const iso = meetingScheduledAt(new Date(2026, 9, 24), 15);
    expect(new Date(iso).getHours()).toBe(15);
    expect(validateMeetingProposal({ pointName: PRACA, scheduledAt: iso }, AGORA)).toBeNull();
  });

  it("calcula slots e abertura conforme o local (Spec 114)", () => {
    expect(isBusinessDaysOnlyPoint(MUSEU)).toBe(true);
    expect(isBusinessDaysOnlyPoint(IFPI)).toBe(true);
    expect(isBusinessDaysOnlyPoint(PRACA)).toBe(false);

    const sexta = new Date(2026, 9, 23); // sexta
    const sabado = new Date(2026, 9, 24); // sabado

    expect(isMeetingPointOpenOnDay(MUSEU, sexta)).toBe(true);
    expect(isMeetingPointOpenOnDay(MUSEU, sabado)).toBe(false);
    expect(isMeetingPointOpenOnDay(PRACA, sabado)).toBe(true);

    const slotsMuseuSexta = meetingTimeSlotsForPoint(MUSEU, sexta);
    expect(slotsMuseuSexta).toContain(8);
    expect(slotsMuseuSexta).toContain(17);
    expect(slotsMuseuSexta).not.toContain(7);
    expect(slotsMuseuSexta).not.toContain(18);

    const slotsMuseuSabado = meetingTimeSlotsForPoint(MUSEU, sabado);
    expect(slotsMuseuSabado).toHaveLength(0);

    const slotsPracaSabado = meetingTimeSlotsForPoint(PRACA, sabado);
    expect(slotsPracaSabado).toContain(7);
    expect(slotsPracaSabado).toContain(18);
  });
});
