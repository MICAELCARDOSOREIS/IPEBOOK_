import { Platform, type PressableStateCallbackType, type StyleProp, type ViewStyle } from "react-native";

/**
 * Resposta de toque padrão do Material 3 Expressive (Spec 109 / ADR 0084) para elementos tocáveis
 * que não usam um componente compartilhado: leve compressão e atenuação enquanto pressionado.
 */
export const expressivePressedStyle: ViewStyle = {
  opacity: 0.92,
  transform: [{ scale: 0.97 }],
};

const webPointerStyle: ViewStyle | null =
  Platform.OS === "web" ? ({ cursor: "pointer", userSelect: "none" } as unknown as ViewStyle) : null;

/**
 * Anel de foco do teclado na web, na cor primária do tema. O React Native Web só marca `focused`
 * na navegação por teclado, então o mouse não mostra o anel. Some no toque, quando o estado
 * pressionado já dá a resposta.
 */
export function webFocusRing(color: string): ViewStyle {
  return { outlineWidth: 2, outlineStyle: "solid", outlineOffset: 2, outlineColor: color } as unknown as ViewStyle;
}

/**
 * Estado do `Pressable` com `focused`, que o React Native Web envia na navegação por teclado mas os
 * tipos do React Native 0.88 ainda não declaram.
 */
type PressableStateWithFocus = PressableStateCallbackType & { focused?: boolean };

/** Envolve o estilo de um `Pressable` aplicando `expressivePressedStyle` durante o toque e cursor apropriado na web. */
export function withPress(style: StyleProp<ViewStyle>, focusColor?: string) {
  return ({ pressed, focused }: PressableStateWithFocus): StyleProp<ViewStyle> => {
    const focus = Platform.OS === "web" && focused && !pressed && focusColor ? webFocusRing(focusColor) : null;
    if (pressed) {
      return webPointerStyle ? [webPointerStyle, style, expressivePressedStyle] : [style, expressivePressedStyle];
    }
    return webPointerStyle ? [webPointerStyle, focus, style] : style;
  };
}
