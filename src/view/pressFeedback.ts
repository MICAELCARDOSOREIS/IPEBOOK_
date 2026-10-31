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

/** Envolve o estilo de um `Pressable` aplicando `expressivePressedStyle` durante o toque e cursor apropriado na web. */
export function withPress(style: StyleProp<ViewStyle>) {
  return ({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> => {
    if (pressed) {
      return webPointerStyle ? [webPointerStyle, style, expressivePressedStyle] : [style, expressivePressedStyle];
    }
    return webPointerStyle ? [webPointerStyle, style] : style;
  };
}
