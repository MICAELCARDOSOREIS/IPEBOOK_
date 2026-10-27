import { describe, expect, it } from "vitest";
import type { NegotiationMessage } from "@/model/entities/negotiationMessage";
import { buildChatTimeline, formatBubbleTime, formatDayLabel } from "@/viewmodel/chatTimeline";

const msg = (id: string, createdAt: string): NegotiationMessage => ({
  id,
  requestId: "r1",
  senderId: "a",
  content: id,
  createdAt,
});

describe("chatTimeline (Spec 082, CA1)", () => {
  const now = new Date("2026-10-26T15:00:00");

  it("formata o horário do balão como no Figma", () => {
    expect(formatBubbleTime("2026-10-26T08:40:00")).toBe("8h40");
    expect(formatBubbleTime("2026-10-26T21:05:00")).toBe("21h05");
    expect(formatBubbleTime("data inválida")).toBe("");
  });

  it("rotula o dia como Hoje, Ontem ou dia da semana com data", () => {
    expect(formatDayLabel("2026-10-26T09:00:00", now)).toBe("Hoje");
    expect(formatDayLabel("2026-10-25T23:59:00", now)).toBe("Ontem");
    expect(formatDayLabel("2026-10-24T10:00:00", now)).toBe("sáb, 24 out");
  });

  it("intercala um separador a cada mudança de dia, em ordem", () => {
    const items = buildChatTimeline(
      [msg("m1", "2026-10-25T10:00:00"), msg("m2", "2026-10-25T11:00:00"), msg("m3", "2026-10-26T09:00:00")],
      now,
    );
    expect(items.map((i) => (i.kind === "day" ? `dia:${i.label}` : i.message.id))).toEqual([
      "dia:Ontem",
      "m1",
      "m2",
      "dia:Hoje",
      "m3",
    ]);
  });
});
