import { useSyncExternalStore } from "react";
import { Dimensions, Platform } from "react-native";

const subscribe = (onChange: () => void) => {
  const subscription = Dimensions.addEventListener("change", onChange);
  return () => subscription.remove();
};

const getClientWidth = () => Dimensions.get("window").width;
/** No HTML estático não existe janela; 0 mantém o servidor e a primeira renderização do cliente iguais. */
const getServerWidth = () => 0;

/** Largura a partir da qual a web usa o layout de desktop do Figma (1440 px; tablet desce até aqui). */
export const WIDE_WEB_MIN_WIDTH = 960;

/**
 * Largura da janela que só reflete o navegador depois da hidratação (Spec 136).
 * Evita divergência entre o HTML estático e a primeira renderização do cliente nos layouts responsivos.
 */
export function useHydratedWindowWidth(): number {
  return useSyncExternalStore(subscribe, getClientWidth, getServerWidth);
}

/** `true` só na web com janela larga: cabeçalho no topo, grades e telas de acesso em dois painéis. */
export function useIsWideWeb(): boolean {
  const width = useHydratedWindowWidth();
  return Platform.OS === "web" && width >= WIDE_WEB_MIN_WIDTH;
}
