import type { ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useKeyboardHeight } from "@/view/useKeyboardHeight";

/**
 * Raiz que mantém os campos em foco acima do teclado (Spec 088). No SDK 58 o app roda em tela
 * cheia (edge-to-edge) e o `softwareKeyboardLayoutMode: "resize"` deixa de encolher a janela no
 * Android. O `KeyboardAvoidingView` com `behavior="padding"` também não resolve lá, porque calcula
 * o padding pela sobreposição do seu quadro com o quadro do teclado, e nessa conta o resultado sai
 * zero quando a janela nunca encolhe. Aqui o padding de baixo vem direto da geometria reportada
 * pelo evento do teclado (`useKeyboardHeight`), no Android e no iOS. Na web não age, porque o
 * navegador já encolhe a área útil quando o teclado abre.
 */
export function KeyboardAwareRoot({ children }: { children: ReactNode }) {
  const keyboardHeight = useKeyboardHeight();
  const nativo = Platform.OS === "android" || Platform.OS === "ios";

  return (
    <View
      testID="keyboard-aware-root"
      style={[styles.root, nativo && keyboardHeight > 0 && { paddingBottom: keyboardHeight }]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
