import { describe, expect, it } from "vitest";
import { PIRIPIRI_MEETING_POINTS } from "@/model/entities/meetingPoint";
import { buildMeetingMapUrl } from "@/view/meetingMapUrl";

const base = { points: PIRIPIRI_MEETING_POINTS, token: "pk.teste", width: 560, height: 240, dark: false };

describe("buildMeetingMapUrl (Spec 094)", () => {
  it("numera os quatro pontos e destaca só o selecionado em verde", () => {
    const url = buildMeetingMapUrl({ ...base, selectedName: PIRIPIRI_MEETING_POINTS[1].name });
    expect(url).toContain("pin-l-1+6b7280(-41.7935589,-4.2900535)");
    expect(url).toContain("pin-l-2+2c5e45(-41.7777509,-4.2741994)");
    expect(url.match(/2c5e45/g)).toHaveLength(1);
    expect(url).toContain("/auto/560x240@2x");
  });

  it("sem seleção não destaca nenhum ponto", () => {
    expect(buildMeetingMapUrl({ ...base, selectedName: null })).not.toContain("2c5e45");
  });

  it("no tema escuro os pinos não selecionados são claros", () => {
    expect(buildMeetingMapUrl({ ...base, selectedName: null, dark: true })).toContain("pin-l-1+e5e7eb");
  });

  it("usa o estilo escuro no tema escuro e codifica o token", () => {
    const url = buildMeetingMapUrl({ ...base, selectedName: null, dark: true, token: "pk.a b" });
    expect(url).toContain("/mapbox/dark-v11/");
    expect(url).toContain("access_token=pk.a%20b");
  });

  it("aceita respiro maior na base para o painel sobreposto", () => {
    const url = buildMeetingMapUrl({ ...base, selectedName: null, padding: [64, 56, 300.4, 56] });
    expect(url).toContain("padding=64,56,300,56");
  });

  it("todos os pontos têm coordenadas em Piripiri", () => {
    for (const p of PIRIPIRI_MEETING_POINTS) {
      expect(p.latitude).toBeGreaterThan(-4.4);
      expect(p.latitude).toBeLessThan(-4.2);
      expect(p.longitude).toBeGreaterThan(-41.9);
      expect(p.longitude).toBeLessThan(-41.7);
    }
  });
});
