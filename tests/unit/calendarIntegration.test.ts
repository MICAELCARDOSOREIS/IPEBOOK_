import { beforeEach, describe, expect, it, vi } from "vitest";
import * as Linking from "expo-linking";
import {
  addMeetingToCalendar,
  buildGoogleCalendarUrl,
  formatToGoogleCalendarDate,
} from "@/view/calendarIntegration";

vi.mock("expo-linking", () => ({
  canOpenURL: vi.fn(),
  openURL: vi.fn(),
}));

describe("calendarIntegration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("formata data para padrão UTC do Google Calendar", () => {
    const date = new Date("2026-11-10T14:30:00.000Z");
    const formatted = formatToGoogleCalendarDate(date);
    expect(formatted).toBe("20261110T143000Z");
  });

  it("monta url do Google Calendar com parâmetros esperados", () => {
    const url = buildGoogleCalendarUrl({
      title: "Entrega do livro: Dom Casmurro",
      details: "Encontro combinado com Maria para entrega do livro.",
      location: "Praça da Bandeira, Centro, Piripiri - PI",
      scheduledAt: "2026-11-10T14:30:00.000Z",
      durationMinutes: 45,
    });

    expect(url).toContain("https://calendar.google.com/calendar/render?");
    expect(url).toContain("action=TEMPLATE");
    expect(url).toContain("text=Entrega+do+livro%3A+Dom+Casmurro");
    expect(url).toContain("dates=20261110T143000Z%2F20261110T151500Z");
    expect(url).toContain("location=Pra%C3%A7a+da+Bandeira%2C+Centro%2C+Piripiri+-+PI");
    expect(url).toContain("details=Encontro+combinado+com+Maria");
  });

  it("adiciona evento abrindo link externo via Linking", async () => {
    vi.mocked(Linking.openURL).mockResolvedValue(undefined as never);

    const success = await addMeetingToCalendar({
      title: "Encontro IpêBook",
      scheduledAt: new Date("2026-11-10T14:30:00.000Z"),
    });

    expect(success).toBe(true);
    expect(Linking.openURL).toHaveBeenCalled();
  });

  it("trata falha ao abrir link retornando false", async () => {
    vi.mocked(Linking.openURL).mockRejectedValue(new Error("falha"));

    const success = await addMeetingToCalendar({
      title: "Encontro IpêBook",
      scheduledAt: new Date("2026-11-10T14:30:00.000Z"),
    });

    expect(success).toBe(false);
  });
});
