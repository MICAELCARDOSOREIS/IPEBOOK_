import { describe, expect, it } from "vitest";
import { meetingDayOptions, meetingScheduledAt, validateMeetingProposal } from "@/model/validators/meetingValidator";

// Datas no fuso local do processo, para o resultado não mudar entre a máquina e a CI.
const AGORA = new Date(2026, 9, 22, 14, 0, 0);
const PRACA = "Praça da Bandeira (Centro)";

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
});
