import type { PressableStateCallbackType, StyleProp, ViewStyle } from "react-native";

/**
 * Resposta de toque padrão do Material 3 Expressive (Spec 109 / ADR 0084) para elementos tocáveis
 * que não usam um componente compartilhado: leve compressão e atenuação enquanto pressionado.
 */
export const expressivePressedStyle: ViewStyle = {
  opacity: 0.92,
  transform: [{ scale: 0.97 }],
};

/** Envolve o estilo de um `Pressable` aplicando `expressivePressedStyle` durante o toque. */
export function withPress(style: StyleProp<ViewStyle>) {
  return ({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> =>
    pressed ? [style, expressivePressedStyle] : style;
}
