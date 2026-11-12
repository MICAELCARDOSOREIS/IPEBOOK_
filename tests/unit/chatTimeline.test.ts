import { describe, expect, it } from "vitest";
import type { NegotiationMessage } from "@/model/entities/negotiationMessage";
import {
  buildChatTimeline,
  formatBubbleTime,
  formatDayLabel,
  type ChatEvent,
} from "@/viewmodel/chatTimeline";

const msg = (id: string, createdAt: string, senderId = "a"): NegotiationMessage => ({
  id,
  requestId: "r1",
  senderId,
  content: id,
  createdAt,
});

describe("chatTimeline (Spec 082, Spec 113)", () => {
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
    expect(
      items.map((i) => (i.kind === "day" ? `dia:${i.label}` : i.kind === "message" ? i.message.id : i.event.id)),
    ).toEqual([
      "dia:Ontem",
      "m1",
      "m2",
      "dia:Hoje",
      "m3",
    ]);
  });

  it("marca como agrupada a mensagem seguinte da mesma pessoa no mesmo dia (Spec 089)", () => {
    const items = buildChatTimeline(
      [
        msg("m1", "2026-10-26T09:00:00", "ana"),
        msg("m2", "2026-10-26T09:01:00", "ana"),
        msg("m3", "2026-10-26T09:02:00", "eu"),
        msg("m4", "2026-10-27T08:00:00", "eu"),
      ],
      new Date("2026-10-27T10:00:00"),
    );
    const grouped = items
      .filter((i) => i.kind === "message")
      .map((i) => (i.kind === "message" ? [i.message.id, i.grouped] : []));
    expect(grouped).toEqual([["m1", false], ["m2", true], ["m3", false], ["m4", false]]);
  });

  it("intercala eventos do sistema em ordem cronológica (Spec 113)", () => {
    const events: ChatEvent[] = [
      {
        id: "ev1",
        type: "meeting_proposed",
        description: "Encontro sugerido na Praça da Bandeira",
        timestamp: "2026-10-26T09:30:00",
      },
    ];

    const items = buildChatTimeline(
      [
        msg("m1", "2026-10-26T09:00:00", "ana"),
        msg("m2", "2026-10-26T10:00:00", "ana"),
      ],
      now,
      events,
    );

    expect(items.map((i) => {
      if (i.kind === "day") return `dia:${i.label}`;
      if (i.kind === "event") return `event:${i.event.id}`;
      return i.message.id;
    })).toEqual([
      "dia:Hoje",
      "m1",
      "event:ev1",
      "m2",
    ]);

    // O evento intermediário impede que m2 seja agrupado com m1
    const m2Item = items.find((i) => i.kind === "message" && i.message.id === "m2");
    if (m2Item && m2Item.kind === "message") {
      expect(m2Item.grouped).toBe(false);
    }
  });
});
