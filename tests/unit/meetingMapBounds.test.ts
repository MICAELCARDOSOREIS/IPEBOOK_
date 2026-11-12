import { describe, expect, it } from "vitest";
import { PIRIPIRI_MEETING_POINTS } from "@/model/entities/meetingPoint";
import { meetingMapBounds } from "@/view/meetingMapBounds";

describe("meetingMapBounds (Spec 094)", () => {
  it("enquadra todos os pontos em [longitude, latitude]", () => {
    const { ne, sw } = meetingMapBounds(PIRIPIRI_MEETING_POINTS);
    for (const p of PIRIPIRI_MEETING_POINTS) {
      expect(p.longitude).toBeLessThanOrEqual(ne[0]);
      expect(p.longitude).toBeGreaterThanOrEqual(sw[0]);
      expect(p.latitude).toBeLessThanOrEqual(ne[1]);
      expect(p.latitude).toBeGreaterThanOrEqual(sw[1]);
    }
    expect(ne).toEqual([-41.7771022, -4.2737597]);
    expect(sw).toEqual([-41.7935589, -4.2900535]);
  });
});
