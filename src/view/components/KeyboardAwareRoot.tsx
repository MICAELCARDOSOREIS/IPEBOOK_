import type { ReactNode } from "react";
import { Animated, StyleSheet } from "react-native";
import { useAnimatedKeyboardInset } from "@/view/useKeyboardInset";
import { useTheme } from "@/view/theme/ThemeProvider";

/**
 * Raiz única que desvia o conteúdo do teclado em todo o app (Spec 088).
 *
 * No Expo SDK 58 o app roda em tela cheia (edge-to-edge) e o `softwareKeyboardLayoutMode: "resize"`
 * deixou de encolher a janela no Android; o `KeyboardAvoidingView` com `behavior="padding"` também
 * falha lá, porque calcula o padding pela sobreposição do seu quadro com o do teclado (sai zero
 * quando a janela nunca encolhe). Aqui o `paddingBottom` vem direto da geometria reportada pelo
 * evento do teclado (`useAnimatedKeyboardInset`) e desliza animado junto com ele — vale para todas
 * as telas de uma vez, no Android e no iOS, então as telas não precisam de `KeyboardAvoidingView`
 * próprios. Na web o navegador já encolhe a área útil e o valor fica em zero.
 */
export function KeyboardAwareRoot({ children }: { children: ReactNode }) {
  const inseto = useAnimatedKeyboardInset();
  const { colors } = useTheme();

  return (
    <Animated.View testID="keyboard-aware-root" style={[styles.root, { paddingBottom: inseto, backgroundColor: colors.m3.surfaceContainer }]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
