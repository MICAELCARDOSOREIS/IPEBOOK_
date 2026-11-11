import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

/**
 * Hook utilitário para detectar visibilidade do teclado de software.
 * Usado para ocultar barras de ações fixas ou elementos flutuantes enquanto o usuário digita,
 * evitando que o teclado cubra os campos de texto no mobile.
 */
export function useKeyboardVisible(): boolean {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const show = () => setKeyboardVisible(true);
    const hide = () => setKeyboardVisible(false);

    const sub1 = Keyboard.addListener("keyboardWillShow", show);
    const sub2 = Keyboard.addListener("keyboardDidShow", show);
    const sub3 = Keyboard.addListener("keyboardWillHide", hide);
    const sub4 = Keyboard.addListener("keyboardDidHide", hide);

    return () => {
      sub1.remove();
      sub2.remove();
      sub3.remove();
      sub4.remove();
    };
  }, []);

  return isKeyboardVisible;
}
