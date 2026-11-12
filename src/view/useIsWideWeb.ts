import { Platform, useWindowDimensions } from "react-native";

/** Largura a partir da qual a web usa o layout de desktop do Figma (1440 px; tablet desce até aqui). */
export const WIDE_WEB_MIN_WIDTH = 960;

/** `true` só na web com janela larga: cabeçalho no topo, grades e telas de acesso em dois painéis. */
export function useIsWideWeb(): boolean {
  const { width } = useWindowDimensions();
  return Platform.OS === "web" && width >= WIDE_WEB_MIN_WIDTH;
}
