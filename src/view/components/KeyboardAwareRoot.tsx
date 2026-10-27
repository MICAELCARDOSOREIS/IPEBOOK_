import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet } from "react-native";

/**
 * Raiz que mantém o campo em foco acima do teclado no Android (Spec 088). No SDK 58 o app roda em tela cheia
 * (edge-to-edge) e o `softwareKeyboardLayoutMode: "resize"` deixa de encolher a janela: o teclado cobria os
 * campos. O `padding` aqui faz esse papel para todas as telas. No iOS não age, porque cada tela com formulário
 * já usa o próprio `KeyboardAvoidingView`.
 */
export function KeyboardAwareRoot({ children }: { children: ReactNode }) {
  return (
    <KeyboardAvoidingView
      testID="keyboard-aware-root"
      style={styles.root}
      behavior={Platform.OS === "android" ? "padding" : undefined}
      enabled={Platform.OS === "android"}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
