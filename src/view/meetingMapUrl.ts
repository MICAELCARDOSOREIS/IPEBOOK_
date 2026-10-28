import type { MeetingPoint } from "@/model/entities/meetingPoint";

export type MeetingMapOptions = {
  points: readonly MeetingPoint[];
  selectedName: string | null;
  token: string;
  width: number;
  height: number;
  dark: boolean;
  /** Respiro em px da imagem (topo, direita, base, esquerda); a base maior mantém os pinos acima do painel. */
  padding?: readonly [number, number, number, number];
};

const SELECTED_COLOR = "2c5e45";
const OTHER_COLOR = "6b7280";
const OTHER_COLOR_DARK = "e5e7eb";

/**
 * URL da Mapbox Static Images API com os pontos de encontro numerados; o ponto escolhido ganha pino
 * maior e verde. `auto` enquadra todos os pinos (Spec 094).
 */
export function buildMeetingMapUrl({ points, selectedName, token, width, height, dark, padding = [48, 48, 48, 48] }: MeetingMapOptions): string {
  const pins = points.map((point, index) => {
    const selected = point.name === selectedName;
    const size = "pin-l";
    const color = selected ? SELECTED_COLOR : dark ? OTHER_COLOR_DARK : OTHER_COLOR;
    return `${size}-${index + 1}+${color}(${point.longitude},${point.latitude})`;
  });
  const style = dark ? "dark-v11" : "streets-v12";
  const w = Math.round(width);
  const h = Math.round(height);
  return `https://api.mapbox.com/styles/v1/mapbox/${style}/static/${pins.join(",")}/auto/${w}x${h}@2x?padding=${padding.map(Math.round).join(",")}&access_token=${encodeURIComponent(token)}`;
}
