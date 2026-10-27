import { useEffect, useRef, useState } from "react";
import { Keyboard, Platform, useWindowDimensions } from "react-native";
import type { KeyboardEvent } from "react-native";

/**
 * Altura real do teclado informada pelo próprio sistema (Spec 088).
 *
 * O `KeyboardAvoidingView` com `behavior="padding"` calcula o "padding" pela sobreposição entre o
 * quadro da vista e o quadro do teclado. No Android em modo tela cheia (edge-to-edge, Expo SDK 58)
 * essa conta sai zero, a janela não encolhe e os campos ficam cobertos. Aqui usamos direto a
 * geometria que o evento reporta (`endCoordinates`), que vale para qualquer plataforma com teclado
 * suave. Na web não há evento nativo: o navegador já encolhe a área útil quando o teclado abre,
 * então devolvemos zero.
 */
export function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);
  const { height: windowHeight } = useWindowDimensions();
  // O listener nativo é registrado uma vez só; a altura da janela entra por referência.
  const windowHeightRef = useRef(windowHeight);
  windowHeightRef.current = windowHeight;

  useEffect(() => {
    if (Platform.OS === "web") return undefined;

    const leitura = (event: KeyboardEvent | undefined) => {
      const coordinates = event?.endCoordinates;
      if (!event || !coordinates) {
        setHeight(0);
        return;
      }
      if (Platform.OS === "ios") {
        // No iOS a janela não encolhe com o teclado: o que importa é a parte do quadro que fica
        // abaixo da borda inferior da janela visível (em telas divididas o `screenY` já limita tudo).
        const screenY = Number.isFinite(coordinates.screenY) ? coordinates.screenY : 0;
        const visivelAbaixoDaJanela = windowHeightRef.current - screenY;
        setHeight(Math.max(0, Math.min(coordinates.height, visivelAbaixoDaJanela)));
        return;
      }
      // No Android em tela cheia a janela permanece inteira: a altura reportada é o que cobre a tela.
      setHeight(Math.max(coordinates.height, 0));
    };

    const aoMostrar = Keyboard.addListener("keyboardDidShow", leitura);
    const aoEsconder = Keyboard.addListener("keyboardDidHide", leitura);

    return () => {
      aoMostrar.remove();
      aoEsconder.remove();
    };
  }, []);

  return height;
}
