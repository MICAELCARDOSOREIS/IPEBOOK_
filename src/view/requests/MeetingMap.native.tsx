import { StaticMeetingMap } from "@/view/requests/MeetingMapStatic";

export type MeetingMapProps = {
  selectedName: string | null;
  /** Altura em px do painel sobreposto. */
  sheetHeight?: number;
  /** Usado no fallback estático. */
  coveredBottom?: number;
  compactPadding?: boolean;
  /** Toque no pino escolhe o local (mantido na interface para compatibilidade). */
  onSelect?: (name: string) => void;
};

/**
 * Mapa do app nativo (leve): renderiza a imagem estática dos pontos de encontro em Piripiri
 * sem exigir SDK nativo C++/Kotlin do Mapbox. A escolha do ponto permanece pela lista acessível.
 */
export function MeetingMap({ selectedName, coveredBottom = 0, compactPadding = false }: MeetingMapProps) {
  return <StaticMeetingMap selectedName={selectedName} coveredBottom={coveredBottom} compactPadding={compactPadding} />;
}
