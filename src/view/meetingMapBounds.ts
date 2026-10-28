import type { MeetingPoint } from "@/model/entities/meetingPoint";

export type MeetingMapBounds = { ne: [number, number]; sw: [number, number] };

/** Caixa [longitude, latitude] que enquadra todos os pontos de encontro (Spec 094). */
export function meetingMapBounds(points: readonly MeetingPoint[]): MeetingMapBounds {
  const lats = points.map((point) => point.latitude);
  const lons = points.map((point) => point.longitude);
  return { ne: [Math.max(...lons), Math.max(...lats)], sw: [Math.min(...lons), Math.min(...lats)] };
}
