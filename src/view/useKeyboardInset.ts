import { useEffect, useRef } from "react";
import { Animated, Keyboard, Platform, useWindowDimensions } from "react-native";
import type { KeyboardEvent } from "react-native";

/** Duração do deslize no Android, onde o evento não traz tempo próprio (teclado já apareceu). */
const DURACAO_ANDROID = 200;

/**
 * Altura que o teclado cobre da janela, a partir do evento nativo (Spec 088).
 *
 * No Android em tela cheia (edge-to-edge, Expo SDK 58) a janela não encolhe, então a altura
 * reportada (`endCoordinates.height`) é exatamente o que cobre a tela. No iOS a janela também não
 * encolhe com o teclado: usamos a fração do quadro que fica abaixo da borda inferior da janela, o
 * que também resolve teclado flutuante, rotação e tela dividida. Na web não há evento nativo.
 */
export function medirInsetoTeclado(event: KeyboardEvent | undefined, windowHeight: number): number {
  const coordinates = event?.endCoordinates;
  if (!coordinates) return 0;
  if (Platform.OS === "ios") {
    const screenY = Number.isFinite(coordinates.screenY) ? coordinates.screenY : 0;
    return Math.max(0, Math.min(coordinates.height, windowHeight - screenY));
  }
  return Math.max(0, coordinates.height);
}

/**
 * Valor animado com a altura do teclado, para o conteúdo deslizar junto com ele em vez de saltar.
 *
 * Alimenta o `paddingBottom` da raiz (`KeyboardAwareRoot`), que é a única fonte de desvio do teclado
 * no app: as telas não precisam mais de `KeyboardAvoidingView` próprios. No iOS a animação acompanha
 * o tempo e a curva do teclado (eventos `will...`); no Android, sem `willShow` nem duração no evento,
 * usamos um deslize curto quando ele aparece. Na web o valor fica em zero, porque o navegador já
 * encolhe a área útil.
 */
export function useAnimatedKeyboardInset(): Animated.Value {
  const { height: windowHeight } = useWindowDimensions();
  // O listener nativo é registrado uma vez; a altura da janela entra por referência.
  const janelaRef = useRef(windowHeight);
  janelaRef.current = windowHeight;

  const inseto = useRef(new Animated.Value(0)).current;
  const animacao = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") return undefined;

    const animarPara = (alvo: number, duracao?: number) => {
      animacao.current?.stop();
      const tempo = duracao && duracao > 0 ? duracao : Platform.OS === "android" ? DURACAO_ANDROID : 0;
      const animation = Animated.timing(inseto, {
        toValue: alvo,
        duration: tempo,
        useNativeDriver: false,
      });
      animacao.current = animation;
      animation.start();
    };

    const aoMostrar = (event?: KeyboardEvent) =>
      animarPara(medirInsetoTeclado(event, janelaRef.current), event?.duration);
    const aoEsconder = (event?: KeyboardEvent) => animarPara(0, event?.duration);

    const assinaturas = [
      Keyboard.addListener("keyboardWillShow", aoMostrar),
      Keyboard.addListener("keyboardDidShow", aoMostrar),
      Keyboard.addListener("keyboardWillChangeFrame", aoMostrar),
      Keyboard.addListener("keyboardWillHide", aoEsconder),
      Keyboard.addListener("keyboardDidHide", aoEsconder),
    ];

    return () => {
      animacao.current?.stop();
      for (const assinatura of assinaturas) assinatura.remove();
    };
  }, [inseto]);

  return inseto;
}
