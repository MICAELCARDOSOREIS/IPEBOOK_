import { describe, expect, it } from "vitest";
import { describeMeetingCountdown } from "@/view/meetingFormat";

const now = new Date(2026, 9, 26, 10, 0);
const at = (d: number, h: number) => new Date(2026, 9, d, h, 0).toISOString();

describe("describeMeetingCountdown", () => {
  it("diz Hoje, Amanhã ou Em n dias conforme o dia do calendário", () => {
    expect(describeMeetingCountdown(at(26, 15), now)).toEqual({ label: "Hoje", past: false });
    expect(describeMeetingCountdown(at(27, 8), now)).toEqual({ label: "Amanhã", past: false });
    expect(describeMeetingCountdown(at(29, 9), now)).toEqual({ label: "Em 3 dias", past: false });
  });

  it("marca como passado quando o horário já foi", () => {
    expect(describeMeetingCountdown(at(26, 9), now)).toEqual({ label: "Horário já passou", past: true });
    expect(describeMeetingCountdown(at(20, 15), now).past).toBe(true);
  });
});
