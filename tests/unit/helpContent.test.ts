import { describe, expect, it } from "vitest";
import { FAQ_ITEMS } from "@/model/helpContent";
import { PIRIPIRI_MEETING_POINTS } from "@/model/entities/meetingPoint";

describe("conteúdo da Ajuda (Spec 043, RN-13)", () => {
  it("a resposta sobre entregas cita os mesmos pontos que a negociação sugere", () => {
    const answer = FAQ_ITEMS.find((item) => item.id === "faq-3")?.answer ?? "";
    for (const point of PIRIPIRI_MEETING_POINTS) {
      expect(answer).toContain(point.name);
    }
    expect(answer).not.toMatch(/Memorial Espedito Resende|Estação Ferroviária/);
  });
});
