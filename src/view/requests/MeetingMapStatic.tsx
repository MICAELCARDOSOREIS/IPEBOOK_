import { useMemo, useState } from "react";
import { Image, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { PIRIPIRI_MEETING_POINTS } from "@/model/entities/meetingPoint";
import { buildMeetingMapUrl } from "@/view/meetingMapUrl";
import { useTheme } from "@/view/theme/ThemeProvider";

/** A Static Images API aceita até 1280 px por lado em @2x (640 px de imagem). */
const MAX_SIDE = 640;

export type StaticMeetingMapProps = {
  selectedName: string | null;
  /** Fração da altura coberta pelo painel sobreposto; os pinos ficam enquadrados acima dela. */
  coveredBottom?: number;
};

/**
 * Mapa estático do Mapbox que preenche o contêiner (fundo da tela). É a reserva do mapa interativo da web
 * quando o navegador não tem WebGL (Spec 094, ADR 0072). Sem token ou com falha de rede some em silêncio: a
 * lista de locais continua sendo a forma de escolher.
 */
export function StaticMeetingMap({ selectedName, coveredBottom = 0 }: StaticMeetingMapProps) {
  const { colors, resolvedScheme } = useTheme();
  const [failed, setFailed] = useState(false);
  const [box, setBox] = useState<{ width: number; height: number } | null>(null);
  const token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;

  const uri = useMemo(() => {
    if (!token || !box) return null;
    const scale = MAX_SIDE / Math.max(box.width, box.height);
    const width = Math.max(1, Math.round(box.width * scale));
    const height = Math.max(1, Math.round(box.height * scale));
    return buildMeetingMapUrl({
      points: PIRIPIRI_MEETING_POINTS,
      selectedName,
      token,
      width,
      height,
      dark: resolvedScheme === "dark",
      padding: [64, 56, height * coveredBottom + 48, 56],
    });
  }, [token, box, selectedName, resolvedScheme, coveredBottom]);

  if (!token || failed) return null;
  const selectedNumber = PIRIPIRI_MEETING_POINTS.findIndex((point) => point.name === selectedName) + 1;
  return (
    <View
      style={[StyleSheet.absoluteFill, { backgroundColor: colors.m3.surfaceContainerHigh }]}
      onLayout={(event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setBox((current) => (current && current.width === width && current.height === height ? current : { width, height }));
      }}
    >
      {uri ? (
        <Image
          source={{ uri }}
          resizeMode="cover"
          onError={() => setFailed(true)}
          accessibilityRole="image"
          accessibilityLabel={
            selectedNumber > 0
              ? `Mapa de Piripiri com os pontos de encontro; o ponto ${selectedNumber} está selecionado`
              : "Mapa de Piripiri com os pontos de encontro"
          }
          style={StyleSheet.absoluteFill}
        />
      ) : null}
    </View>
  );
}
