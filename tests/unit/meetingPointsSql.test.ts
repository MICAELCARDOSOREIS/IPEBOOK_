import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PIRIPIRI_MEETING_POINTS } from "@/model/entities/meetingPoint";
import { meetingNotice } from "@/model/entities/meetingNotice";

const sql = readFileSync("supabase/migrations/202610220001_encontros.sql", "utf8");

describe("encontro no banco espelha o código (ADR 0036)", () => {
  it("o check de point_name aceita exatamente PIRIPIRI_MEETING_POINTS", () => {
    const check = sql.slice(sql.indexOf("point_name text not null check"), sql.indexOf("scheduled_at timestamptz"));
    const names = [...check.matchAll(/'([^']+)'/g)].map((match) => match[1]);
    expect(names).toEqual(PIRIPIRI_MEETING_POINTS.map((point) => point.name));
  });

  it("o gatilho usa os mesmos títulos de aviso de meetingNotice", () => {
    for (const change of ["proposed", "rescheduled", "confirmed", "cancelled"] as const) {
      expect(sql).toContain(`'${meetingNotice(change, "X").title}'`);
    }
  });
});
