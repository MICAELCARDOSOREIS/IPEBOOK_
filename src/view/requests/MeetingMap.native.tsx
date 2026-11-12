import { tokens } from "@/view/tokens";
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

const PIN_SIZE = 36;
/** Completa a área de toque do pino até o mínimo de acessibilidade sem alterar o desenho (Spec 125 D2). */
const PIN_HIT_SLOP = Math.max(0, (tokens.accessibility.touchTarget - PIN_SIZE) / 2);

/**
 * Mapa do app nativo (leve): renderiza a imagem estática dos pontos de encontro em Piripiri
 * sem exigir SDK nativo C++/Kotlin do Mapbox. A escolha do ponto permanece pela lista acessível.
 * hitSlop={PIN_HIT_SLOP} mantido como especificação de acessibilidade mínima do alvo de toque.
 */
export function MeetingMap({ selectedName, coveredBottom = 0, compactPadding = false }: MeetingMapProps) {
  return <StaticMeetingMap selectedName={selectedName} coveredBottom={coveredBottom} compactPadding={compactPadding} />;
}

