import { createElement, useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Map as MapboxMap, Marker as MapboxMarker } from "mapbox-gl";
import { PIRIPIRI_MEETING_POINTS } from "@/model/entities/meetingPoint";
import { meetingMapBounds } from "@/view/meetingMapBounds";
import { StaticMeetingMap } from "@/view/requests/MeetingMapStatic";
import { useTheme } from "@/view/theme/ThemeProvider";
import { elevation, fontFamily, tokens } from "@/view/tokens";

export type MeetingMapProps = {
  selectedName: string | null;
  /** Fração da altura coberta pelo painel sobreposto; os pinos ficam enquadrados acima dela. */
  coveredBottom?: number;
  /** Altura em px do painel sobreposto; pinos, logo e atribuição ficam acima dele. */
  sheetHeight?: number;
  /** Toque no pino escolhe o local. */
  onSelect?: (name: string) => void;
};

const TOP_PADDING = 150;
const SIDE_PADDING = 64;
const SELECTED_ZOOM = 14.5;

type MapboxGl = typeof import("mapbox-gl");

/** Cor e tamanho do pino por estado, no mesmo desenho do mapa do app. */
function paintPin(element: HTMLElement, selected: boolean, colors: { primary: string; onPrimary: string; surface: string }): void {
  const size = selected ? tokens.accessibility.touchTarget : 36;
  Object.assign(element.style, {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: `${tokens.radius.full}px`,
    border: `2px solid ${colors.primary}`,
    background: selected ? colors.primary : colors.surface,
    color: selected ? colors.onPrimary : colors.primary,
    font: `700 18px/1 '${fontFamily.brand}', serif`,
    cursor: "pointer",
    padding: String(tokens.spacing[0]),
    zIndex: selected ? "2" : "1",
    boxShadow: elevation.level2,
  });
  element.setAttribute("aria-pressed", String(selected));
}

/**
 * Mapa interativo do Mapbox na web (`mapbox-gl`): zoom, arraste e toque no pino para escolher o ponto, como no
 * app. Sem token some; sem WebGL ou com falha de carga cai na imagem estática, e a lista continua sendo a forma
 * de escolher (Spec 094, ADR 0072).
 */
export function MeetingMap(props: MeetingMapProps) {
  const token = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
  const [useStatic, setUseStatic] = useState(false);
  if (!token) return null;
  if (useStatic) return <StaticMeetingMap selectedName={props.selectedName} coveredBottom={props.coveredBottom} />;
  return <InteractiveWebMap {...props} token={token} onUnavailable={() => setUseStatic(true)} />;
}

type InteractiveProps = MeetingMapProps & { token: string; onUnavailable: () => void };

function InteractiveWebMap({ selectedName, coveredBottom = 0, sheetHeight = 0, onSelect, token, onUnavailable }: InteractiveProps) {
  const { colors, resolvedScheme } = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const markersRef = useRef<Array<{ marker: MapboxMarker; element: HTMLElement; name: string }>>([]);
  const [ready, setReady] = useState(false);
  const dark = resolvedScheme === "dark";

  // Os mais recentes ficam em refs: o mapa é criado uma vez e os callbacks dos pinos não podem ficar velhos.
  const latest = useRef({ onSelect, selectedName, colors });
  latest.current = { onSelect, selectedName, colors };

  useEffect(() => {
    let cancelled = false;
    let observer: ResizeObserver | undefined;
    void (async () => {
      try {
        const loaded = (await import("mapbox-gl")) as unknown as { default?: MapboxGl } & MapboxGl;
        const mapboxgl: MapboxGl = loaded.default ?? loaded;
        const container = containerRef.current;
        if (cancelled || !container) return;
        mapboxgl.accessToken = token;
        const { ne, sw } = meetingMapBounds(PIRIPIRI_MEETING_POINTS);
        const map = new mapboxgl.Map({
          container,
          style: dark ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/streets-v12",
          bounds: [sw, ne],
          fitBoundsOptions: { padding: { top: TOP_PADDING, bottom: 48, left: SIDE_PADDING, right: SIDE_PADDING }, duration: 0 },
          pitchWithRotate: false,
          dragRotate: false,
          touchPitch: false,
        });
        mapRef.current = map;
        markersRef.current = PIRIPIRI_MEETING_POINTS.map((point, index) => {
          const element = document.createElement("button");
          element.type = "button";
          element.textContent = String(index + 1);
          element.setAttribute("aria-label", `Escolher o local ${index + 1}, ${point.name}`);
          element.addEventListener("click", () => latest.current.onSelect?.(point.name));
          const marker = new mapboxgl.Marker({ element }).setLngLat([point.longitude, point.latitude]).addTo(map);
          return { marker, element, name: point.name };
        });
        if (typeof ResizeObserver !== "undefined") {
          observer = new ResizeObserver(() => map.resize());
          observer.observe(container);
        }
        setReady(true);
      } catch {
        if (!cancelled) onUnavailable();
      }
    })();
    return () => {
      cancelled = true;
      observer?.disconnect();
      for (const { marker } of markersRef.current) marker.remove();
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
      setReady(false);
    };
    // O mapa nasce uma vez; tema, seleção e painel são tratados nos efeitos abaixo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Tema claro ou escuro.
  useEffect(() => {
    if (!ready) return;
    mapRef.current?.setStyle(dark ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/streets-v12");
  }, [ready, dark]);

  // Pino escolhido em destaque e por cima.
  useEffect(() => {
    if (!ready) return;
    for (const { element, name } of markersRef.current) {
      paintPin(element, name === selectedName, { primary: colors.m3.primary, onPrimary: colors.m3.onPrimary, surface: colors.surface });
    }
  }, [ready, selectedName, colors]);

  // Câmera: com local escolhido aproxima dele; sem escolha enquadra todos, sempre acima do painel e abaixo da barra.
  useEffect(() => {
    const map = mapRef.current;
    const container = containerRef.current;
    if (!ready || !map || !container) return;
    const bottom = (sheetHeight > 0 ? sheetHeight : container.clientHeight * coveredBottom) + 48;
    const padding = { top: TOP_PADDING, bottom, left: SIDE_PADDING, right: SIDE_PADDING };
    const point = PIRIPIRI_MEETING_POINTS.find((item) => item.name === selectedName);
    if (point) {
      map.easeTo({ center: [point.longitude, point.latitude], zoom: SELECTED_ZOOM, padding, duration: 600 });
    } else {
      const { ne, sw } = meetingMapBounds(PIRIPIRI_MEETING_POINTS);
      map.fitBounds([sw, ne], { padding, duration: 400 });
    }
  }, [ready, selectedName, sheetHeight, coveredBottom]);

  // Logo e atribuição do Mapbox ficam logo acima do painel, sem escondê-los (termos de uso).
  useEffect(() => {
    const container = containerRef.current;
    if (!ready || !container) return;
    container.querySelectorAll<HTMLElement>(".mapboxgl-ctrl-bottom-left, .mapboxgl-ctrl-bottom-right").forEach((corner) => {
      corner.style.bottom = `${sheetHeight}px`;
    });
  }, [ready, sheetHeight]);

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.m3.surfaceContainerHigh }]}>
      {createElement("div", {
        ref: containerRef,
        role: "region",
        "aria-label": "Mapa de Piripiri com os pontos de encontro",
        style: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
      })}
    </View>
  );
}
