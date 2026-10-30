import { useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Mapbox from "@rnmapbox/maps";
import { PIRIPIRI_MEETING_POINTS } from "@/model/entities/meetingPoint";
import { meetingMapBounds } from "@/view/meetingMapBounds";
import { fontFamily, tokens } from "@/view/tokens";
import { useTheme } from "@/view/theme/ThemeProvider";

import { withPress } from "@/view/pressFeedback";
type MeetingMapProps = {
  selectedName: string | null;
  /** Altura em px do painel sobreposto; pinos, logo e atribuição ficam acima dele. */
  sheetHeight?: number;
  /** Só o mapa web usa. */
  coveredBottom?: number;
  /** Toque no pino escolhe o local. */
  onSelect?: (name: string) => void;
};

const token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
if (token) void Mapbox.setAccessToken(token);

/**
 * Mapa interativo do Mapbox (app nativo): zoom, arraste e toque no pino para escolher o ponto. Sem token não
 * renderiza; a lista de locais continua sendo a forma de escolher (Spec 094, ADR 0068).
 */
export function MeetingMap({ selectedName, sheetHeight = 0, onSelect }: MeetingMapProps) {
  const { colors, resolvedScheme } = useTheme();
  const cameraRef = useRef<Mapbox.Camera>(null);
  const paddingBottom = sheetHeight + 48;

  // Ao escolher um local (pela lista ou pelo pino), aproxima o mapa dele, acima do painel.
  useEffect(() => {
    const point = PIRIPIRI_MEETING_POINTS.find((item) => item.name === selectedName);
    if (!point) {
      // Sem escolha, enquadra todos os pinos na área visível (acima do painel e abaixo da barra).
      const { ne, sw } = meetingMapBounds(PIRIPIRI_MEETING_POINTS);
      if (sheetHeight > 0) cameraRef.current?.fitBounds(ne, sw, [150, 64, paddingBottom, 64], 400);
      return;
    }
      cameraRef.current?.setCamera({
        centerCoordinate: [point.longitude, point.latitude],
        zoomLevel: 14.5,
        padding: { paddingTop: tokens.spacing[150], paddingBottom, paddingLeft: tokens.spacing[64], paddingRight: tokens.spacing[64] },
        animationDuration: 600,
        animationMode: "easeTo",
      });
    }, [selectedName, paddingBottom, sheetHeight]);

    if (!token) return null;

    const { ne, sw } = meetingMapBounds(PIRIPIRI_MEETING_POINTS);
    return (
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.m3.surfaceContainerHigh }]}>
        <Mapbox.MapView
          style={StyleSheet.absoluteFill}
          styleURL={resolvedScheme === "dark" ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/streets-v12"}
          scaleBarEnabled={false}
          logoPosition={{ bottom: sheetHeight + 4, left: 4 }}
          attributionPosition={{ bottom: sheetHeight + 4, right: 4 }}
          pitchEnabled={false}
          rotateEnabled={false}
          accessibilityLabel="Mapa de Piripiri com os pontos de encontro"
        >
          <Mapbox.Camera
            ref={cameraRef}
            defaultSettings={{
              bounds: {
                ne,
                sw,
                paddingTop: tokens.spacing[150],
                paddingRight: tokens.spacing[64],
                paddingLeft: tokens.spacing[64],
                paddingBottom,
              },
            }}
          />
        {PIRIPIRI_MEETING_POINTS.map((point, index) => ({ point, index }))
          .sort((a, b) => Number(a.point.name === selectedName) - Number(b.point.name === selectedName))
          .map(({ point, index }) => {
          const selected = point.name === selectedName;
          return (
            <Mapbox.MarkerView
              key={point.name}
              id={`ponto-${index + 1}`}
              coordinate={[point.longitude, point.latitude]}
              allowOverlap
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Escolher o local ${index + 1}, ${point.name}`}
                accessibilityState={{ selected }}
                onPress={() => onSelect?.(point.name)}
                style={withPress([
                  styles.pin,
                  { backgroundColor: selected ? colors.m3.primary : colors.surface, borderColor: colors.m3.primary },
                  selected && styles.pinSelected,
                ])}
              >
                <Text style={[styles.pinText, { color: selected ? colors.m3.onPrimary : colors.m3.primary }]}>{index + 1}</Text>
              </Pressable>
            </Mapbox.MarkerView>
          );
        })}
      </Mapbox.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: 36,
    height: 36,
    borderRadius: tokens.radius.full,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  pinSelected: { width: 48, height: 48 },
  pinText: { ...tokens.typography.titleMedium, fontFamily: fontFamily.brand },
});
