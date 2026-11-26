import { Platform } from "react-native";

const MODAL_ROUTES = new Set([
  "anunciar",
  "denunciar/[id]",
  "denunciar-pessoa/[userId]",
  "excluir-conta",
]);

const FADE_ROUTES = new Set([
  "index",
  "pesquisa",
  "meus-anuncios",
  "bem-vindo",
  "sobre",
  "entrar",
  "criar-conta",
  "esqueci-senha",
  "redefinir-senha",
  "auth/callback",
  "beta",
]);

export type StackRouteOptions = {
  headerShown: false;
  contentStyle: { backgroundColor: string };
  animation: "none" | "fade" | "slide_from_right" | "slide_from_bottom";
  animationDuration?: number;
  gestureEnabled?: boolean;
  fullScreenGestureEnabled?: boolean;
};

/**
 * Define transições direcionais e gestos interativos de retorno no Stack raiz (Spec 144 / ADR 0120).
 * - Telas hierárquicas (detalhe, conversa, perfil, negociação): deslize lateral com arraste para voltar.
 * - Compositores e fluxos modais (anunciar, editar, denunciar): subida suave de baixo para cima.
 * - Rotas raiz e acesso: fade leve.
 * - Reduzir Movimento ativo ou Web: desativa animação lateral pesada preservando fluidez.
 */
export function getStackScreenOptions(
  routeName: string | undefined,
  backgroundColor: string,
  reduceMotion = false,
): StackRouteOptions {
  const base: Pick<StackRouteOptions, "headerShown" | "contentStyle"> = {
    headerShown: false,
    contentStyle: { backgroundColor },
  };

  if (reduceMotion) {
    return {
      ...base,
      animation: "none",
      gestureEnabled: Platform.OS !== "web",
    };
  }

  if (Platform.OS === "web") {
    return {
      ...base,
      animation: "fade",
      animationDuration: 150,
    };
  }

  if (routeName && MODAL_ROUTES.has(routeName)) {
    return {
      ...base,
      animation: "slide_from_bottom",
      animationDuration: 240,
      gestureEnabled: true,
    };
  }

  if (!routeName || FADE_ROUTES.has(routeName)) {
    const iosBackEnabled = Platform.OS === "ios" && (routeName === "esqueci-senha" || routeName === "sobre");
    return {
      ...base,
      animation: "fade",
      animationDuration: 160,
      gestureEnabled: iosBackEnabled,
      ...(iosBackEnabled ? { fullScreenGestureEnabled: true } : {}),
    };
  }

  return {
    ...base,
    animation: "slide_from_right",
    animationDuration: 220,
    gestureEnabled: true,
    ...(Platform.OS === "ios" ? { fullScreenGestureEnabled: true } : {}),
  };
}
